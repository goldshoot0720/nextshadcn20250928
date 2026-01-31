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

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);
  return { databases, databaseId };
}

// GET /api/food
export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "food");
    
    const response = await databases.listDocuments(databaseId, collectionId, [
      sdk.Query.limit(100),
      sdk.Query.orderAsc('todate'),
    ]);
    return NextResponse.json(response.documents);
  } catch (err) {
    console.error("GET /api/food error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/food
export async function POST(req) {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "food");
    
    const body = await req.json();
    const { name, amount, todate, photo, price, shop, photohash } = body;

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      {
        name,
        amount: amount ? parseInt(amount, 10) : 0,
        todate,
        photo,
        price: price ? parseInt(price, 10) : 0,
        shop,
        photohash
      }
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("POST /api/food error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
