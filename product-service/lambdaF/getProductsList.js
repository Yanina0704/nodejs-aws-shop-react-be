exports.handler = async(event, context, callback) => {
    return {
      statusCode: 200,
      body: JSON.stringify([
      {
        id: "1",
        title: "Milk Chocolate",
        price: 10,
      },
      {
        id: "2",
        title: "Book Story",
        price: 123,
      }]),
  };
  }