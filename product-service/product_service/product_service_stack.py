from aws_cdk import (
    # Duration,
    CfnOutput,
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    # aws_sqs as sqs,
)
from constructs import Construct

class ProductServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # The code that defines your stack goes here

        get_products_list_function = _lambda.Function(
            self,
            "GetProductsListHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "getProductsList.handler", # Points to the 'getProductList' file in the lambda directory
        )

        get_product_by_id_function = _lambda.Function(
            self,
            "GetProductByIdHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "getProductById.handler", # Points to the 'getProductList' file in the lambda directory
        )

        CfnOutput(self, "GetProductsListFunctionName", value=get_products_list_function.function_name)
        CfnOutput(self, "GetProductByIdFunctionName", value=get_product_by_id_function.function_name)

        api = apigateway.RestApi(self, 
                                 "ProductServiceApi", 
                                 rest_api_name = "Product Service",
                                 default_cors_preflight_options = apigateway.CorsOptions(
                                     allow_origins=apigateway.Cors.ALL_ORIGINS,
                                     allow_methods=apigateway.Cors.ALL_METHODS,
                                     allow_credentials=True,
                                     allow_headers=apigateway.Cors.ALL_ORIGINS))
        
        products_resource = api.root.add_resource("products")
        products_resource.add_method("GET", apigateway.LambdaIntegration(get_products_list_function))
        
        product_by_id_resource = products_resource.add_resource("{productId}")
        product_by_id_resource.add_method("GET", apigateway.LambdaIntegration(get_product_by_id_function))

        # example resource
        # queue = sqs.Queue(
        #     self, "ProductServiceQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
