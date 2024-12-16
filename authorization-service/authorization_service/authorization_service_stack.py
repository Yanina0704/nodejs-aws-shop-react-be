from aws_cdk import (
    aws_lambda as _lambda,
    Stack,
    # aws_sqs as sqs,
)
import dotenv
import os
from constructs import Construct

class AuthorizationServiceStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        dotenv.load_dotenv()
        login='Yanina0704'
        SECRET_KEY = os.getenv(login)

        _lambda.Function(
            self, 'BasicAuthorizerLambda',
            runtime=_lambda.Runtime.NODEJS_20_X,
            handler="basicAuthorizer.handler",
            code=_lambda.Code.from_asset('lambdaF'),
            environment={
                login: SECRET_KEY
            },
            function_name='AuthFunction'
        )

        # The code that defines your stack goes here

        # example resource
        # queue = sqs.Queue(
        #     self, "AuthorizationServiceQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
