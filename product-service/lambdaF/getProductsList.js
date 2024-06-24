const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async(event, context, callback) => {
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

  products = []

  const products_list = new ScanCommand({
    TableName: 'products',
  });

  const stocks_list = new ScanCommand({
    TableName: 'stocks',
  });

  const response1 = await docClient.send(products_list);
  const response2 = await docClient.send(stocks_list);
  for (const item of response1.Items) {
    stock_item = response2.Items.find((element) => element["product_id"] == item['id']);
    product = {'id': item['id'],
      'title': item['title'],
      'title': item['title'],
      'description': item['description'],
      'price': item['price'],
      'count': stock_item['count']
    };
    products.push(product);
  }

    return {
      statusCode: 200,
      body: JSON.stringify(products),
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET"
    },
  };
  }