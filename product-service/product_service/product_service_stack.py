from aws_cdk import (
    # Duration,
    CfnOutput,
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    RemovalPolicy as policy,
    aws_dynamodb as dynamodb,
    # aws_sqs as sqs,
)
from aws_cdk.aws_dynamodb import(
    Table,
    TableAttributes,
    AttributeType,
    TableEncryption,
)

from constructs import Construct
from product_service.populate_table import write_items

class ProductServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # The code that defines your stack goes here

        products_table_name = 'products'
        stocks_table_name = 'stocks'

        products_table = dynamodb.Table.from_table_name(self, 'ProductsTable', products_table_name)
                               
        stocks_table = dynamodb.Table.from_table_name(self, 'StocksTable', stocks_table_name)

        environment = { 'PRODUCTS_TABLE_NAME': products_table_name,
                        'STOCKS_TABLE_NAME': stocks_table_name}

        get_products_list_function = _lambda.Function(
            self,
            "GetProductsListHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "getProductsList.handler", # Points to the 'getProductList' file in the lambda directory
            environment = environment,
        )

        get_product_by_id_function = _lambda.Function(
            self,
            "GetProductByIdHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "getProductById.handler", # Points to the 'getProductList' file in the lambda directory
            environment = environment,
        )

        create_product_function = _lambda.Function(
            self,
            "CreateProductHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "createProduct.handler", # Points to the 'getProductList' file in the lambda directory
            environment = environment,
        )
        
        #write_items()
        

        CfnOutput(self, "GetProductsListFunctionName", value=get_products_list_function.function_name)
        CfnOutput(self, "GetProductByIdFunctionName", value=get_product_by_id_function.function_name)

        api = apigateway.RestApi(self, 
                                 "ProductServiceApi", 
                                 rest_api_name = "Product Service",
                                 default_cors_preflight_options = apigateway.CorsOptions(
                                     allow_origins = apigateway.Cors.ALL_ORIGINS,
                                     allow_methods = apigateway.Cors.ALL_METHODS))
        
        products_resource = api.root.add_resource("products")
        products_resource.add_method("GET", apigateway.LambdaIntegration(get_products_list_function))
        products_resource.add_method("POST", apigateway.LambdaIntegration(create_product_function))
        
        product_by_id_resource = products_resource.add_resource("{productId}")
        product_by_id_resource.add_method("GET", apigateway.LambdaIntegration(get_product_by_id_function))

        products_table.grant_read_write_data(get_products_list_function)
        products_table.grant_read_write_data(get_product_by_id_function)
        products_table.grant_read_write_data(create_product_function)
        stocks_table.grant_read_write_data(create_product_function)
        stocks_table.grant_read_write_data(get_products_list_function)
        stocks_table.grant_read_write_data(get_product_by_id_function)

        # example resource
        # queue = sqs.Queue(
        #     self, "ProductServiceQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
