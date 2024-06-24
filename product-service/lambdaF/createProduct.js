const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { randomUUID } = require('crypto');
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
//const { v4: uuidv4 } = require("uuid");

exports.handler = async(event, context, callback) => {
    try{

        headers = {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        };

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        const body = JSON.parse(event.body || "{}");
        if(!body)
          {
              return {
                  statusCode: 400,
                  body: 'Validation Error: title is required; price and count should be a NUMBER',
                  headers: {
                      "Access-Control-Allow-Headers" : "Content-Type",
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "*"
                  },
                };
          }
        const { title, description, price, count } = body;
        console.log('Validated data:', { title, description, price, count });
        if(!title || typeof price != 'number' || typeof count != 'number')
            {
                return {
                    statusCode: 400,
                    body: 'Validation Error: title is required; price and count should be a NUMBER',
                    headers: {
                        "Access-Control-Allow-Headers" : "Content-Type",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "*"
                    },
                  };
            }
        const id = randomUUID();//uuidv4();
        const command1 = new PutCommand({
            TableName: "products",
            Item: {
              'id': id,
              'title': title,
              'description': description,
              'price': price,
            },
          });
        
          const response1 = await docClient.send(command1);
          console.log(response1);
          const command2 = new PutCommand({
            TableName: "stocks",
            Item: {
              'product_id': id,
              'count': count,
            },
          });
        
          const response2 = await docClient.send(command2);
          console.log(response2);
          return {
            statusCode: 200,
            body: JSON.stringify(`Product: ${id} CREATED!`),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*"
            },
          };
    }
    catch(error){
        return{
            statusCode: 500,
            body: JSON.stringify(error.message),
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*"
            },};
        }
    }