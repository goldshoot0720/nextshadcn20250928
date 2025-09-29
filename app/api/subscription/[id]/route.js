import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_SUBSCRIPTION_COLLECTION_ID;

// 更新訂閱
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ await params
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

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
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 刪除訂閱
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await databases.deleteDocument(databaseId, collectionId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /subscription/[id] error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
