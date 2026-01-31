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

// 取得全部訂閱，依 nextdate 排序
export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "subscription");
    
    const res = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        sdk.Query.limit(100),
        sdk.Query.orderAsc('nextdate')
      ]
    );
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /subscription error:", err);
    const message = err instanceof Error ? err.message : "Fetch failed";
    // 如果是 collection not found，返回 404
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 新增訂閱
export async function POST(req) {
  try {
    const { databases, databaseId } = createAppwrite();
    const collectionId = await getCollectionId(databases, databaseId, "subscription");
    
    const body = await req.json();

    // 驗證必填欄位（site 和 nextdate 為可選）
    const { name, site, price, nextdate, note, account, currency } = body;
    if (!name || price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 強制 price 為整數
    const payload = {
      name,
      price: parseInt(price, 10),
    };

    // 只有在提供值時才添加可選欄位
    if (nextdate) payload.nextdate = nextdate;
    if (site) payload.site = site;
    if (note) payload.note = note;
    if (account) payload.account = account;
    if (currency) payload.currency = currency;

    const res = await databases.createDocument(
      databaseId,
      collectionId,
      sdk.ID.unique(),
      payload
    );

    return NextResponse.json(res);
  } catch (err) {
    console.error("POST /subscription error:", err);
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
