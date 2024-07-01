from aws_cdk import (
    # Duration,
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_iam as iam,
    aws_s3 as s3,
    # aws_sqs as sqs,
)

from constructs import Construct

BUCKET_NAME = "import-service-bucket-for-shop-csv"
BUCKET_ARN = "arn:aws:s3:::import-service-bucket-for-shop-csv"

class ImportServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        bucket = s3.Bucket.from_bucket_name(self, "ImportBucket", BUCKET_NAME)
        # bucket.add_to_resource_policy(iam.PolicyStatement(
        #     effect = iam.Effect.ALLOW,
        #     actions = ['s3:PutObject'],
        #     resources = ["${BUCKET_NAME}/uploaded/*"]
        # ))
        

        get_products_list_function = _lambda.Function(
            self,
            "importProductsFileHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "importProductsFile.handler", # Points to the 'importProductsFile' file in the lambda directory
            # initial_policy = {
            #     "effect" : iam.Effect.ALLOW,
            #     "actions" : ["s3:PutObject"],
            #     "resources" : [f"${BUCKET_NAME}/uploaded/*"]},
            environment = {
                "BUCKET": BUCKET_NAME,
                "REGION": self.region},
        )

        bucket.grant_put(get_products_list_function)
        bucket.grant_read_write(get_products_list_function)

        api = apigateway.RestApi(self, 
                                 "ImportServiceApi", 
                                 rest_api_name = "Import Service",
                                 default_cors_preflight_options = apigateway.CorsOptions(
                                     allow_origins = apigateway.Cors.ALL_ORIGINS,
                                     allow_methods = apigateway.Cors.ALL_METHODS,
                                     allow_headers = [
                                         "Content-Type",
                                         "X-Amz-Date",
                                         "Authorization",
                                         "X-Api-Key",
                                         "X-Amz-Security-Token",]))
        
        products_resource = api.root.add_resource("import")
        products_resource.add_method("GET", apigateway.LambdaIntegration(get_products_list_function))

        # The code that defines your stack goes here

        # example resource
        # queue = sqs.Queue(
        #     self, "ImportServiceQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
