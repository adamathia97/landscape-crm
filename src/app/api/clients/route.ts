import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, address, phone, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let updateExpr = "set";
    const exprAttrNames: any = {};
    const exprAttrValues: any = {};

    if (name !== undefined) { updateExpr += " #n = :n,"; exprAttrNames["#n"] = "name"; exprAttrValues[":n"] = name; }
    if (address !== undefined) { updateExpr += " #a = :a,"; exprAttrNames["#a"] = "address"; exprAttrValues[":a"] = address; }
    if (phone !== undefined) { updateExpr += " #p = :p,"; exprAttrNames["#p"] = "phone"; exprAttrValues[":p"] = phone; }
    if (status !== undefined) { updateExpr += " #s = :s,"; exprAttrNames["#s"] = "status"; exprAttrValues[":s"] = status; }

    updateExpr = updateExpr.slice(0, -1); // Remove trailing comma

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return NextResponse.json({ message: "Client updated", client: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
