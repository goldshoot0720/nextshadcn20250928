import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "appwrite";

export const dynamic = 'force-dynamic';

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = "697e0069000b8b938103"; // bank collection ID

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId, collectionId };
}

// 取得全部銀行資料
export async function GET() {
  try {
    const { databases, databaseId, collectionId } = createAppwrite();
    const res = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.limit(100),
      ]
    );
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /bank error:", err);
    const message = err instanceof Error ? err.message : "Fetch failed";
    // 如果是 collection not found，返回 404
    if (message.includes('not found') || message.includes('could not be found') || (err.code === 404) || (err.type === 'collection_not_found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 新增銀行資料
export async function POST(req) {
  try {
    const body = await req.json();

    // 驗證必填欄位 (name 是必須的，其他可選)
    const { 
      name, 
      deposit, 
      site, 
      address,
      withdrawals,
      transfer,
      activity,
      card,
      account
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name field" }, { status: 400 });
    }

    const { databases, databaseId, collectionId } = createAppwrite();

    const payload = {
      name,
      deposit: deposit ? parseInt(deposit, 10) : 0,
      site: site || null,
      address: address || null,
      withdrawals: withdrawals ? parseInt(withdrawals, 10) : 0,
      transfer: transfer ? parseInt(transfer, 10) : 0,
      activity: activity || null,
      card: card || null,
      account: account || null
    };

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      payload
    );

    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /bank error:", err);
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
