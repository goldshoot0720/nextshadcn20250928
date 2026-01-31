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

// GET /api/video/[id] - Get video by ID
export async function GET(request, { params }) {
  try {
    const { databases, databaseId } = createAppwrite();
    const { id } = params;
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const videoCollection = allCollections.collections.find(col => col.name === 'video');
    
    if (!videoCollection) {
      return NextResponse.json({ error: "Video collection not found" }, { status: 404 });
    }
    
    const collectionId = videoCollection.$id;
    const document = await databases.getDocument(databaseId, collectionId, id);
    
    return NextResponse.json(document);
  } catch (err) {
    console.error("GET /api/video/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/video/[id] - Update video
export async function PUT(request, { params }) {
  try {
    const { databases, databaseId } = createAppwrite();
    const { id } = params;
    const body = await request.json();
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const videoCollection = allCollections.collections.find(col => col.name === 'video');
    
    if (!videoCollection) {
      return NextResponse.json({ error: "Video collection not found" }, { status: 404 });
    }
    
    const collectionId = videoCollection.$id;
    
    const document = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      {
        name: body.name,
        file: body.file || '',
        note: body.note || '',
        ref: body.ref || '',
        category: body.category || '',
        hash: body.hash || '',
        cover: !!body.cover
      }
    );
    
    return NextResponse.json(document);
  } catch (err) {
    console.error("PUT /api/video/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/video/[id] - Delete video
export async function DELETE(request, { params }) {
  try {
    const { databases, databaseId } = createAppwrite();
    const { id } = params;
    
    // Get collection ID by name
    const allCollections = await databases.listCollections(databaseId);
    const videoCollection = allCollections.collections.find(col => col.name === 'video');
    
    if (!videoCollection) {
      return NextResponse.json({ error: "Video collection not found" }, { status: 404 });
    }
    
    const collectionId = videoCollection.$id;
    await databases.deleteDocument(databaseId, collectionId, id);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/video/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
