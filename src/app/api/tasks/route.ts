import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Tasks";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return NextResponse.json({ tasks: response.Items || [] });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const id = body.id || `T-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const item = {
      id,
      title: body.title || "Untitled Task",
      assignee: body.assignee || "Unassigned",
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      status: body.status || "Pending",
      jobId: body.jobId || "",
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Task created", task: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, assignee, dueDate, status, jobId } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let updateExpr = "set";
    const exprAttrNames: any = {};
    const exprAttrValues: any = {};

    if (title !== undefined) { updateExpr += " #t = :t,"; exprAttrNames["#t"] = "title"; exprAttrValues[":t"] = title; }
    if (assignee !== undefined) { updateExpr += " #a = :a,"; exprAttrNames["#a"] = "assignee"; exprAttrValues[":a"] = assignee; }
    if (dueDate !== undefined) { updateExpr += " #d = :d,"; exprAttrNames["#d"] = "dueDate"; exprAttrValues[":d"] = dueDate; }
    if (status !== undefined) { updateExpr += " #s = :s,"; exprAttrNames["#s"] = "status"; exprAttrValues[":s"] = status; }
    if (jobId !== undefined) { updateExpr += " #j = :j,"; exprAttrNames["#j"] = "jobId"; exprAttrValues[":j"] = jobId; }

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
    return NextResponse.json({ message: "Task updated", task: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
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
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DynamoDB DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
