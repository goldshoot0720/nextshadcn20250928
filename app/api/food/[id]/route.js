import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || "";
const collectionId = "food";

// PUT /api/food/[id]
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, amount, todate, photo } = body;

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      {
        name,
        amount: amount ? parseInt(amount, 10) : 0,
        todate,
        photo,
      }
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("PUT /api/food/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/food/[id]
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await databases.deleteDocument(databaseId, collectionId, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/food/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
