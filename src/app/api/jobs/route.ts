import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Jobs";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return NextResponse.json({ jobs: response.Items || [] });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const id = body.id || `J-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const item = {
      id,
      title: body.title || "New Job",
      client: body.client || "Unknown Client",
      date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: body.status || "Lead", // Lead, Scheduled, Completed
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Job created", job: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "set #s = :status",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":status": status },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return NextResponse.json({ message: "Job updated", job: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}
