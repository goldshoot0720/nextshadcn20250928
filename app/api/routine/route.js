import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

async function getCollectionId(databases, databaseId, name) {
  const allCollections = await databases.listCollections(databaseId);
  const col = allCollections.collections.find(c => c.name === name);
  if (!col) throw new Error(`Collection ${name} not found`);
  return col.$id;
}

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

// GET /api/routine
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, 'routine');

    const res = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        sdk.Query.limit(100),
      ]
    );
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /api/routine error:", err);
    if (err.message.includes('not found')) {
      return NextResponse.json(
        { error: "Table routine 不存在，請至「鋒兄設定」中初始化。" }, 
        { status: 404 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/routine
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, note, lastdate1, lastdate2, lastdate3, link, photo } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, 'routine');

    const payload = {
      name,
      note: note || "",
      lastdate1: lastdate1 || null,
      lastdate2: lastdate2 || null,
      lastdate3: lastdate3 || null,
      link: link || "",
      photo: photo || "",
    };

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      payload
    );

    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /api/routine error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
