import { NextResponse } from "next/server";
import { Client, Databases, ID } from "appwrite";

export const dynamic = 'force-dynamic';

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_COMMON_ACCOUNT_SITE_COLLECTION_ID || "commonaccount";

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

export async function GET() {
  try {
    const { databases, databaseId, collectionId } = createAppwrite();
    const res = await databases.listDocuments(databaseId, collectionId);
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /api/common-account/site error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: err.code || 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { databases, databaseId, collectionId } = createAppwrite();

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      body
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /api/common-account/site error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: err.code || 500 }
    );
  }
}
