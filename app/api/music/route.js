import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

function createAppwrite(searchParams) {
  // 從 URL 參數讀取配置（優先），否則使用 .env
  const endpoint = searchParams?.get('_endpoint') || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams?.get('_project') || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams?.get('_database') || process.env.APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get('_key') || process.env.APPWRITE_API_KEY;

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

// GET /api/music - List all music
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const musicCollection = allCollections.collections.find(col => col.name === 'music');
    
    if (!musicCollection) {
      return NextResponse.json({ error: "Table music 不存在，請至「鋒兄設定」中初始化。" }, { status: 404 });
    }
    
    const collectionId = musicCollection.$id;
    const response = await databases.listDocuments(databaseId, collectionId);
    
    return NextResponse.json(response.documents);
  } catch (err) {
    console.error("GET /api/music error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/music - Create new music
export async function POST(request) {
  try {
    const { databases, databaseId } = createAppwrite();
    const body = await request.json();
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const musicCollection = allCollections.collections.find(col => col.name === 'music');
    
    if (!musicCollection) {
      return NextResponse.json({ error: "Music collection not found" }, { status: 404 });
    }
    
    const collectionId = musicCollection.$id;
    
    const document = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      {
        name: body.name,
        file: body.file || '',
        lyrics: body.lyrics || '',
        note: body.note || '',
        ref: body.ref || '',
        category: body.category || '',
        hash: body.hash || '',
        language: body.language || '',
        cover: body.cover || ''
      }
    );
    
    return NextResponse.json(document);
  } catch (err) {
    console.error("POST /api/music error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
