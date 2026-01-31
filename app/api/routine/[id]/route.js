import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

function createAppwrite(searchParams) {
  const endpoint = searchParams?.get('_endpoint') || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams?.get('_project') || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams?.get('_database') || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get('_key') || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;

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

async function getCollectionId(databases, databaseId, name) {
  const allCollections = await databases.listCollections(databaseId);
  const col = allCollections.collections.find(c => c.name === name);
  if (!col) throw new Error(`Collection ${name} not found`);
  return col.$id;
}

// PUT /api/routine/[id]
export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, note, lastdate1, lastdate2, lastdate3, link, photo } = body;

    const { searchParams } = new URL(req.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, 'routine');

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (note !== undefined) payload.note = note;
    if (lastdate1 !== undefined) payload.lastdate1 = lastdate1 || null;
    if (lastdate2 !== undefined) payload.lastdate2 = lastdate2 || null;
    if (lastdate3 !== undefined) payload.lastdate3 = lastdate3 || null;
    if (link !== undefined) payload.link = link;
    if (photo !== undefined) payload.photo = photo;

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      payload
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("PUT /api/routine/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/routine/[id]
export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, 'routine');

    await databases.deleteDocument(databaseId, collectionId, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/routine/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
