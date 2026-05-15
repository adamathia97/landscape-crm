import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function run() {
  console.log("Provisioning TerraCRM_Team...");
  try {
    await client.send(
      new CreateTableCommand({
        TableName: "TerraCRM_Team",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
      })
    );
    console.log("TerraCRM_Team created successfully.");
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("Table already exists.");
    } else {
      console.error(err);
    }
  }
}
run();
