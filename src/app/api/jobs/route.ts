import { NextResponse } from "next/server";
import { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/aws";

const TABLE_NAME = "TerraCRM_Jobs";
const CLIENTS_TABLE = "TerraCRM_Clients";

/**
 * Sync a client's status based on their project statuses.
 * Priority: Scheduled → "Active", Lead → "Lead", All Completed → "Inactive"
 */
async function syncClientStatus(clientName: string) {
  if (!clientName) return;

  try {
    // 1. Find all jobs for this client
    const jobsRes = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const clientJobs = (jobsRes.Items || []).filter((j: any) => j.client === clientName);

    // 2. Determine the derived status
    let derivedStatus: string;
    if (clientJobs.length === 0) {
      // No projects — don't change anything
      return;
    }

    const hasScheduled = clientJobs.some((j: any) => j.status === "Scheduled");
    const hasLead = clientJobs.some((j: any) => j.status === "Lead" || j.status === "Leads");
    const allCompleted = clientJobs.every((j: any) => j.status === "Completed");

    if (hasScheduled) {
      derivedStatus = "Active";
    } else if (hasLead) {
      derivedStatus = "Lead";
    } else if (allCompleted) {
      derivedStatus = "Inactive";
    } else {
      return; // Unknown state, don't change
    }

    // 3. Find the client record by name
    const clientsRes = await docClient.send(new ScanCommand({ TableName: CLIENTS_TABLE }));
    const clientRecord = (clientsRes.Items || []).find((c: any) => c.name === clientName);

    if (!clientRecord) return;

    // 4. Update the client status if it changed
    if (clientRecord.status !== derivedStatus) {
      await docClient.send(new UpdateCommand({
        TableName: CLIENTS_TABLE,
        Key: { id: clientRecord.id },
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":s": derivedStatus },
      }));
    }
  } catch (err) {
    console.error("syncClientStatus error:", err);
  }
}

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
      assignee: body.assignee || "",
      budget: body.budget || "",
      progress: body.progress || 0,
      date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dueDate: body.dueDate || "",
      status: body.status || "Lead",
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);

    // Sync client status after creating a project
    await syncClientStatus(item.client);

    return NextResponse.json({ message: "Job created", job: item }, { status: 201 });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, client, status, dueDate, assignee, budget, progress } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    let updateExpr = "set";
    const exprAttrNames: any = {};
    const exprAttrValues: any = {};

    if (title !== undefined) { updateExpr += " #t = :t,"; exprAttrNames["#t"] = "title"; exprAttrValues[":t"] = title; }
    if (client !== undefined) { updateExpr += " #c = :c,"; exprAttrNames["#c"] = "client"; exprAttrValues[":c"] = client; }
    if (status !== undefined) { updateExpr += " #s = :s,"; exprAttrNames["#s"] = "status"; exprAttrValues[":s"] = status; }
    if (dueDate !== undefined) { updateExpr += " #d = :d,"; exprAttrNames["#d"] = "dueDate"; exprAttrValues[":d"] = dueDate; }
    if (assignee !== undefined) { updateExpr += " #a = :a,"; exprAttrNames["#a"] = "assignee"; exprAttrValues[":a"] = assignee; }
    if (budget !== undefined) { updateExpr += " #b = :b,"; exprAttrNames["#b"] = "budget"; exprAttrValues[":b"] = budget; }
    if (progress !== undefined) { updateExpr += " #p = :p,"; exprAttrNames["#p"] = "progress"; exprAttrValues[":p"] = progress; }

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

    // Sync client status after updating a project
    const updatedJob = response.Attributes;
    if (updatedJob?.client) {
      await syncClientStatus(updatedJob.client);
    }
    // If the client name was changed, also sync the old client
    if (client !== undefined && updatedJob?.client !== client) {
      // The old client name might need to be looked up from the previous state
      // but since we already have the new state, we handle the new client above
    }

    return NextResponse.json({ message: "Job updated", job: response.Attributes });
  } catch (error) {
    console.error("DynamoDB PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Look up the job first to get the client name for syncing
    const allJobs = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const jobToDelete = (allJobs.Items || []).find((j: any) => j.id === id);
    const clientName = jobToDelete?.client;

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(command);

    // Sync client status after deleting a project
    if (clientName) {
      await syncClientStatus(clientName);
    }

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("DynamoDB DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
