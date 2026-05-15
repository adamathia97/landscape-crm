import { NextResponse } from "next/server";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/lib/aws";
import { v4 as uuidv4 } from "uuid";

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "TerraCRM_Team";

export async function GET() {
  try {
    const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    return NextResponse.json({ team: data.Items || [] });
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newMember = {
      id: uuidv4(),
      name: body.name || "Unnamed Agent",
      email: body.email || "",
      role: body.role || "Agent",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: newMember,
      })
    );

    return NextResponse.json({ member: newMember }, { status: 201 });
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/team error:", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
