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
  const databaseId = searchParams?.get('_database') || process.env.APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get('_key') || process.env.APPWRITE_API_KEY;

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);
  return { databases, databaseId };
}

// GET /api/food
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    
    // 嘗試取得 collection ID
    let collectionId;
    try {
      collectionId = await getCollectionId(databases, databaseId, "food");
    } catch (collectionErr) {
      console.error("Collection not found:", collectionErr.message);
      return NextResponse.json(
        { error: "Table food 不存在，請至「鋒兄設定」中初始化。" }, 
        { status: 404 }
      );
    }
    
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
    const { searchParams } = new URL(req.url);
    const { databases, databaseId } = createAppwrite(searchParams);
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
