const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
  try{
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const products_list = new ScanCommand({
      TableName: 'products',
    });

    const stocks_list = new ScanCommand({
      TableName: 'stocks',
    });
    productId = event['pathParameters']['productId'];
    const response1 = await docClient.send(products_list);
    const response2 = await docClient.send(stocks_list);
    product_item = response1.Items.find((element) => element["id"] == productId);
    stock_item = response2.Items.find((element) => element["product_id"] == productId);
    
    if (!product_item){
      return {
            statusCode: 404,
            body: JSON.stringify({title: "Product doesn't found!"}),
            headers: {
              "Access-Control-Allow-Headers" : "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET"
          },
          }}
          else {
            product = {'id': product_item['id'],
              'title': product_item['title'],
              'title': product_item['title'],
              'description': product_item['description'],
              'price': product_item['price'],
              'count': stock_item['count']};
            return {
              statusCode: 200,
              body: JSON.stringify(product),
              headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET"
            },
            };}
          }
          catch(error)
          {
            return{
              statusCode: 500,
              body: JSON.stringify(error.message),
              headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET"
            },};
          }
        }