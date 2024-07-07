const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
  
  exports.handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    console.log("Bucket:", bucket);
    const key = event.Records[0].s3.object.key;
    console.log("Key:", key);

    const s3 = new S3Client({ region: process.env.REGION });
    const catalogItemsQueueUrl = process.env.CATALOG_ITEMS_QUEUE_URL;
  
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: "text/csv",
    };
  
    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command);
  
    if (Body instanceof Readable) {
      await new Promise((resolve, reject) => {
        Body.pipe(csvParser())
        .on("data", async(data) => {
            console.log("Record: ", data);
            const messageParams = {
              QueueUrl: catalogItemsQueueUrl,
              MessageBody: JSON.stringify(data),
            };
            await sqs.sendMessage(messageParams).promise();
            console.log("Message sent to SQS:", data);
          })
          .on("end", async () => {
            console.log("CSV file was processed successfully.");
  
            try {
              const newKey = key.replace("uploaded/", "parsed/");
  
              const copyParams = {
                Bucket: bucket,
                CopySource: `${bucket}/${key}`,
                Key: newKey,
                ContentType: "text/csv",
              };
              const copyCommand = new CopyObjectCommand(copyParams);
              await s3.send(copyCommand);
  
              const deleteParams = {
                Bucket: bucket,
                Key: key,
                ContentType: "text/csv",
              };
              const deleteCommand = new DeleteObjectCommand(deleteParams);
              await s3.send(deleteCommand);
  
              console.log(`File was copied to ${newKey} and deleted from ${key}`);
              resolve();
            } catch (error) {
              console.error("Error during file coping or deleting:", error);
              reject(error);
            }
          })
          .on("error", (err) => {
            console.error("Error processing CSV file:", err);
            reject(err);
          });
      });
    } else {
      console.error("Body is not a Readable stream");
    }
  };