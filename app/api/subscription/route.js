import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "appwrite";

export const dynamic = 'force-dynamic';

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_SUBSCRIPTION_COLLECTION_ID;

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// 取得全部訂閱，依 nextdate 排序
export async function GET() {
  try {
    const { databases, databaseId, collectionId } = createAppwrite();
    const res = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.limit(100),
        Query.orderAsc('nextdate')
      ]
    );
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /subscription error:", err);
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 新增訂閱
export async function POST(req) {
  try {
    const body = await req.json();

    // 驗證必填欄位
    const { name, site, price, nextdate } = body;
    if (!name || !site || price == null || !nextdate) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { databases, databaseId, collectionId } = createAppwrite();

    // 強制 price 為整數
    const payload = {
      name,
      site,
      price: parseInt(price, 10),
      nextdate,
    };

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      payload
    );

    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /subscription error:", err);
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
