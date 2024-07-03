const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.handler = async(event, context, callback) => {
   
    console.log("My region: ",process.env.REGION);
    console.log("My Bucket name: ",process.env.BUCKET);
    

    const file_name = event["queryStringParameters"]["name"];
    console.log("GET /import request. Parameters: ", file_name);
    
    const client = new S3Client({region: process.env.REGION});

    const myBucket = "import-service-bucket-for-shop-csv";
    const myKey = "uploaded/" + file_name;
    
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET,
        Key: myKey,
        ContentType: 'text/csv',
      });

    console.log("My Command: ", command);  

    const url = await getSignedUrl(client, command, { expiresIn: 300 });
    console.log("My url: ", url);
    
    return {
        statusCode: 200,
        body: url,
        headers: {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE,OPTIONS",
        },
      };
}