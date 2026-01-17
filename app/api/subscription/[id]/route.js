import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_SUBSCRIPTION_COLLECTION_ID;

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// 更新訂閱
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ await params
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { databases, databaseId, collectionId } = createAppwrite();

    // 確保 price 是整數
    const bodyData = {
      ...body,
      price: body.price ? parseInt(body.price, 10) : 0,
    };

    const res = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      bodyData
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("PUT /subscription/[id] error:", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 刪除訂閱
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { databases, databaseId, collectionId } = createAppwrite();

    await databases.deleteDocument(databaseId, collectionId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /subscription/[id] error:", err);
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
