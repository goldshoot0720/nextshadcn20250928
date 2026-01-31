import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = "bank";

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// PUT /api/bank/[id]
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();
    const { 
      name, 
      deposit, 
      site, 
      address,
      withdrawals,
      transfer,
      activity,
      card,
      account
    } = body;

    const { databases, databaseId, collectionId } = createAppwrite();

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (deposit !== undefined) payload.deposit = parseInt(deposit, 10);
    if (site !== undefined) payload.site = site;
    if (address !== undefined) payload.address = address;
    if (withdrawals !== undefined) payload.withdrawals = parseInt(withdrawals, 10);
    if (transfer !== undefined) payload.transfer = parseInt(transfer, 10);
    if (activity !== undefined) payload.activity = activity;
    if (card !== undefined) payload.card = card;
    if (account !== undefined) payload.account = account;

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      payload
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("PUT /api/bank/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/bank/[id]
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { databases, databaseId, collectionId } = createAppwrite();

    await databases.deleteDocument(databaseId, collectionId, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/bank/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
