exports.handler = async(event, context, callback) => {
    return {
        statusCode: 200,
        body: 'File is uploaded',
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"
        },
      };
}