import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Clients";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return NextResponse.json({ contacts: response.Items || [] });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = `C-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const item = {
      id,
      name: body.name || "Unknown Client",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || "",
      source: body.source || "",
      notes: body.notes || "",
      status: body.status || "Active",
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Contact created", contact: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, address, source, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let updateExpr = "set";
    const exprAttrNames: Record<string, string> = {};
    const exprAttrValues: Record<string, string> = {};

    if (name !== undefined) { updateExpr += " #n = :n,"; exprAttrNames["#n"] = "name"; exprAttrValues[":n"] = name; }
    if (email !== undefined) { updateExpr += " #e = :e,"; exprAttrNames["#e"] = "email"; exprAttrValues[":e"] = email; }
    if (phone !== undefined) { updateExpr += " #p = :p,"; exprAttrNames["#p"] = "phone"; exprAttrValues[":p"] = phone; }
    if (address !== undefined) { updateExpr += " #a = :a,"; exprAttrNames["#a"] = "address"; exprAttrValues[":a"] = address; }
    if (source !== undefined) { updateExpr += " #src = :src,"; exprAttrNames["#src"] = "source"; exprAttrValues[":src"] = source; }
    if (notes !== undefined) { updateExpr += " #nt = :nt,"; exprAttrNames["#nt"] = "notes"; exprAttrValues[":nt"] = notes; }
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
    return NextResponse.json({ message: "Contact updated", contact: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
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
    return NextResponse.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("DynamoDB DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
