exports.handler = async (event) => {
  try{
    products = [
      {
        id: "1",
        title: "Milk Chocolate",
        price: 10,
      },
      {
        id: "2",
        title: "Book Story",
        price: 123,
      }];
      productId = event['pathParameters']['productId'];
      product = products.find((element) => element["id"] == productId);
      if (!product)
        {
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