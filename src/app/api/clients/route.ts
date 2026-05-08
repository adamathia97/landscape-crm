import { NextResponse } from "next/server";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Clients";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return NextResponse.json({ clients: response.Items || [] });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate a simple ID if none provided
    const id = body.id || `C-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const item = {
      id,
      name: body.name || "Unknown Client",
      address: body.address || "",
      phone: body.phone || "",
      status: body.status || "Active",
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Client created", client: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
