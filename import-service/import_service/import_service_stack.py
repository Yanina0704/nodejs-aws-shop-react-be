from aws_cdk import (
    # Duration,
    Stack,
    # aws_sqs as sqs,
)
from constructs import Construct


class ImportServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        bucket_name = "import-service-bucket-for-shop-csv"
        bucket_arn = "arn:aws:s3:::import-service-bucket-for-shop-csv"

        # The code that defines your stack goes here

        # example resource
        # queue = sqs.Queue(
        #     self, "ImportServiceQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
