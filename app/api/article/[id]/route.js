import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

async function getCollectionId(databases, databaseId, name) {
  const allCollections = await databases.listCollections(databaseId);
  const col = allCollections.collections.find(c => c.name === name);
  if (!col) throw new Error(`Collection ${name} not found`);
  return col.$id;
}

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = process.env.NEXT_PUBLIC_APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);

  return { databases, databaseId };
}

// 更新文章
export async function PUT(req, context) {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "article");
    
    const { params } = context;
    const { id } = await params;
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const res = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      body
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("PUT /article/[id] error:", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 刪除文章
export async function DELETE(req, context) {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "article");
    
    const { params } = context;
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await databases.deleteDocument(databaseId, collectionId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /article/[id] error:", err);
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
