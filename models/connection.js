const dynamoose = require('dynamoose');

// Create new DynamoDB instance
const ddb = new dynamoose.aws.ddb.DynamoDB({
  "accessKeyId": process.env.DDB_ACCESS_KEY,
  "secretAccessKey": DDB_SECRET,
  "region": "us-east-1"
});

// Set DynamoDB instance to the Dynamoose DDB instance
dynamoose.aws.ddb.set(ddb);

module.exports = dynamoose;