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
  // 從 URL 參數讀取配置（優先），否則使用 .env
  const endpoint = searchParams?.get('_endpoint') || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams?.get('_project') || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams?.get('_database') || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get('_key') || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
  const bucketId = searchParams?.get('_bucket') || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);
  const storage = new sdk.Storage(client);
  return { databases, storage, databaseId, bucketId };
}

// Extract file ID from Appwrite storage URL
function extractFileIdFromUrl(photoUrl) {
  if (!photoUrl) return null;
  // URL format: .../storage/buckets/{bucketId}/files/{fileId}/view?...
  const match = photoUrl.match(/\/files\/([^\/]+)\/view/);
  return match ? match[1] : null;
}

// PUT /api/food/[id]
export async function PUT(req, context) {
  try {
    const { searchParams } = new URL(req.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, "food");
    
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();
    const { name, amount, todate, photo, price, shop, photohash } = body;

    // Build document data, only include defined values
    const docData = {
      name: name || '',
      amount: amount ? parseInt(amount, 10) : 0,
      todate: todate || '',
      price: price ? parseInt(price, 10) : 0,
    };
    
    // Only add optional fields if they have values
    if (photo !== undefined) docData.photo = photo || '';
    if (shop !== undefined) docData.shop = shop || '';
    if (photohash !== undefined) docData.photohash = photohash || '';

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      docData
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
    const { searchParams } = new URL(req.url);
    const { databases, storage, databaseId, bucketId } = createAppwrite(searchParams);
    const collectionId = await getCollectionId(databases, databaseId, "food");
    
    const { params } = context;
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // First, get the document to retrieve photo URL
    const doc = await databases.getDocument(databaseId, collectionId, id);
    
    // If there's a photo, try to delete it from storage
    if (doc.photo && bucketId) {
      const fileId = extractFileIdFromUrl(doc.photo);
      if (fileId) {
        try {
          await storage.deleteFile(bucketId, fileId);
          console.log(`Deleted image file: ${fileId}`);
        } catch (imgErr) {
          // Log but don't fail if image deletion fails (might be external URL)
          console.warn(`Failed to delete image file ${fileId}:`, imgErr.message);
        }
      }
    }

    // Delete the document
    await databases.deleteDocument(databaseId, collectionId, id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/food/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
