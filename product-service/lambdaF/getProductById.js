exports.handler = async (event) => {
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
          }}
          else {
            return {
              statusCode: 200,
              body: JSON.stringify(product),
  };
  }
  }