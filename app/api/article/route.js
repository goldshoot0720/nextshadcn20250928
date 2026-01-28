import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_ARTICLE_COLLECTION_ID;

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// 獲取所有文章
export async function GET() {
  try {
    const { databases, databaseId, collectionId } = createAppwrite();
    const res = await databases.listDocuments(databaseId, collectionId);
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /article error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 新增文章
export async function POST(req) {
  try {
    const body = await req.json();
    const { databases, databaseId, collectionId } = createAppwrite();

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      "unique()",
      body
    );
    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /article error:", err);
    const message = err instanceof Error ? err.message : "Failed to create article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
