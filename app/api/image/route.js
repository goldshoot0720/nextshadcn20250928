import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

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

// GET /api/image - List all images
export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const imageCollection = allCollections.collections.find(col => col.name === 'image');
    
    if (!imageCollection) {
      return NextResponse.json({ error: "Image collection not found" }, { status: 404 });
    }
    
    const collectionId = imageCollection.$id;
    const response = await databases.listDocuments(databaseId, collectionId);
    
    return NextResponse.json(response.documents);
  } catch (err) {
    console.error("GET /api/image error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/image - Create new image
export async function POST(request) {
  try {
    const { databases, databaseId } = createAppwrite();
    const body = await request.json();
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const imageCollection = allCollections.collections.find(col => col.name === 'image');
    
    if (!imageCollection) {
      return NextResponse.json({ error: "Image collection not found" }, { status: 404 });
    }
    
    const collectionId = imageCollection.$id;
    
    const document = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      {
        name: body.name,
        file: body.file || '',
        note: body.note || '',
        ref: body.ref || '',
        category: body.category || '',
        hash: body.hash || ''
      }
    );
    
    return NextResponse.json(document);
  } catch (err) {
    console.error("POST /api/image error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
