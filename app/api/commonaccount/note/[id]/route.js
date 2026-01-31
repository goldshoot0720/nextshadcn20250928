import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

export const dynamic = 'force-dynamic';

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_COMMON_ACCOUNT_NOTE_COLLECTION_ID || "commonaccountnote";

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// 更新 Note
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { databases, databaseId, collectionId } = createAppwrite();

    const res = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      body
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("PUT /api/common-account/note/[id] error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: err.code || 500 }
    );
  }
}

// 刪除 Note
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { databases, databaseId, collectionId } = createAppwrite();

    await databases.deleteDocument(databaseId, collectionId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/common-account/note/[id] error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: err.code || 500 }
    );
  }
}
