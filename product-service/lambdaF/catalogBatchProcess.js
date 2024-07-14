const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const client = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({ region: process.env.REGION });

exports.handler = async (event) => {
    for (const record of event.Records) {
        const body = JSON.parse(record.body);
        const { title, description, price, count } = body;

        if (!title || !description || !price || count === undefined || count < 0) {
            console.error('Missing or invalid required fields');
            continue;
        }

        const productId = body.id || require('crypto').randomUUID();

        const newProduct = {
            id: productId,
            title,
            description,
            price,
        };

        const paramsProduct = {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: newProduct,
        };

        const paramsStock = {
            TableName: process.env.STOCKS_TABLE_NAME,
            Item: {
                product_id: productId,
                count: count,
            },
        };

        try {
            await ddbDocClient.send(new PutCommand(paramsProduct));
            await ddbDocClient.send(new PutCommand(paramsStock));

            const productResponse = {
                id: productId,
                count: count,
                price: price,
                title: title,
                description: description,
            };
            console.log("Sns_Arn: ", process.env.SNS_ARN);
            const messageParams = {
                TopicArn: process.env.SNS_ARN,
                Message: JSON.stringify(productResponse),
            };
            await snsClient.send(new PublishCommand(messageParams));

            console.log('Product created and message sent to SNS:', productResponse);
        } catch (error) {
            console.error('Creating product or sending SNS message were failed:', error);
        }
    }
};