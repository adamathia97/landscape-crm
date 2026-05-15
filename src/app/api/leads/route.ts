import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Leads";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return NextResponse.json({ leads: response.Items || [] });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const id = body.id || `L-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const item = {
      id,
      name: body.name || "Unknown Lead",
      email: body.email || "",
      phone: body.phone || "",
      source: body.source || "Website",
      status: body.status || "New",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Lead created", lead: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, source, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let updateExpr = "set";
    const exprAttrNames: any = {};
    const exprAttrValues: any = {};

    if (name !== undefined) { updateExpr += " #n = :n,"; exprAttrNames["#n"] = "name"; exprAttrValues[":n"] = name; }
    if (email !== undefined) { updateExpr += " #e = :e,"; exprAttrNames["#e"] = "email"; exprAttrValues[":e"] = email; }
    if (phone !== undefined) { updateExpr += " #p = :p,"; exprAttrNames["#p"] = "phone"; exprAttrValues[":p"] = phone; }
    if (source !== undefined) { updateExpr += " #src = :src,"; exprAttrNames["#src"] = "source"; exprAttrValues[":src"] = source; }
    if (status !== undefined) { updateExpr += " #s = :s,"; exprAttrNames["#s"] = "status"; exprAttrValues[":s"] = status; }
    if (notes !== undefined) { updateExpr += " #nt = :nt,"; exprAttrNames["#nt"] = "notes"; exprAttrValues[":nt"] = notes; }

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
    return NextResponse.json({ message: "Lead updated", lead: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("DynamoDB DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
