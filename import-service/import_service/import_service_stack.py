from aws_cdk import (
    # Duration,
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_s3_notifications as s3not,
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

        import_products_file_function = _lambda.Function(
            self,
            "importProductsFileHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "importProductsFile.handler", # Points to the 'importProductsFile' file in the lambda directory
            environment = {
                "BUCKET": BUCKET_NAME,
                "REGION": self.region},
        )

        import_file_parser_function = _lambda.Function(
            self,
            "importFileParserHandler",
            runtime = _lambda.Runtime.NODEJS_20_X, # Choose any supported Node.js runtime
            code = _lambda.Code.from_asset("lambdaF"), # Points to the lambdaF directory
            handler = "importFileParser.handler", # Points to the 'importProductsFile' file in the lambda directory
            environment = {
                "BUCKET": BUCKET_NAME,
                "REGION": self.region},
        )

        bucket.grant_put(import_products_file_function)
        bucket.grant_read_write(import_products_file_function)

        bucket.grant_put(import_file_parser_function)
        bucket.grant_read_write(import_file_parser_function)
        bucket.grant_delete(import_file_parser_function)

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
        products_resource.add_method("GET", apigateway.LambdaIntegration(import_products_file_function))

        notification = s3not.LambdaDestination(import_file_parser_function)

        bucket.add_event_notification( s3.EventType.OBJECT_CREATED, notification, s3.NotificationKeyFilter(prefix="uploaded/"))

