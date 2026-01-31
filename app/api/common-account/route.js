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
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

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

export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "commonaccount");
    
    const res = await databases.listDocuments(databaseId, collectionId, [
      sdk.Query.limit(100)
    ]);
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /api/common-account error:", err);
    const message = err instanceof Error ? err.message : "Fetch failed";
    // 如果是 collection not found，返回 404
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json(
      { error: message }, 
      { status: err.code || 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "commonaccount");
    
    const body = await req.json();

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      body
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /api/common-account error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: err.code || 500 }
    );
  }
}
