import { NextResponse } from "next/server";
import { Client, Databases, ID } from "appwrite";

export const dynamic = 'force-dynamic';

// 初始化 Appwrite Client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_SUBSCRIPTION_COLLECTION_ID;

// 取得全部訂閱，依 nextdate 排序
export async function GET() {
  try {
    const res = await databases.listDocuments(
      databaseId,
      collectionId,
      [], // filters
      100, // limit
      0, // offset
      "nextdate", // orderField
      "ASC" // orderType: "ASC" 或 "DESC"
    );
    return NextResponse.json(res.documents);
  } catch (err) {
    console.error("GET /subscription error:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
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
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
