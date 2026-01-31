import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

function createAppwrite(searchParams) {
  // 優先使用 URL 參數（使用者輸入），其次使用環境變數（支援新舊兩種變數名）
  const endpoint = searchParams?.get('_endpoint') || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = searchParams?.get('_project') || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = searchParams?.get('_database') || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const apiKey = searchParams?.get('_key') || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;

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

// Table definitions with expected columns
const TABLE_DEFINITIONS = {
  article: ["title", "content", "newDate", "url1", "url2", "url3", "file1", "file1type", "file2", "file2type", "file3", "file3type"],
  bank: ["name", "deposit", "site", "address", "withdrawals", "transfer", "activity", "card", "account"],
  commonaccount: ["name", ...Array.from({length: 37}, (_, i) => `site${(i + 1).toString().padStart(2, '0')}`), ...Array.from({length: 37}, (_, i) => `note${(i + 1).toString().padStart(2, '0')}`)],
  food: ["name", "amount", "price", "shop", "todate", "photo", "photohash"],
  subscription: ["name", "site", "price", "nextdate", "note", "account", "currency"],
  image: ["name", "file", "note", "ref", "category", "hash", "cover"],
  video: ["name", "file", "note", "ref", "category", "hash", "cover"],
  music: ["name", "file", "lyrics", "note", "ref", "category", "hash", "language", "cover"],
  routine: ["name", "note", "lastdate1", "lastdate2", "lastdate3", "link", "photo"]
};

// GET /api/database-stats
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { databases, databaseId } = createAppwrite(searchParams);
    
    // List all collections in the database
    const allCollections = await databases.listCollections(databaseId);
    
    // Create a map of collection name -> collection object
    const collectionMap = {};
    allCollections.collections.forEach(col => {
      collectionMap[col.name] = col;
    });
    
    // Define expected tables
    const tableNames = ["article", "bank", "commonaccount", "food", "image", "music", "routine", "subscription", "video"];
    
    // Get each collection's column count and document count dynamically
    const collectionsWithCounts = await Promise.all(
      tableNames.map(async (name) => {
        const collection = collectionMap[name];
        
        if (!collection) {
          // Collection doesn't exist - use fallback from TABLE_DEFINITIONS
          const fallbackColumns = TABLE_DEFINITIONS[name];
          return {
            name,
            columnCount: fallbackColumns ? fallbackColumns.length : 0,
            documentCount: 0,
            error: true
          };
        }
        
        try {
          // 動態計算：從 collection.attributes 取得實際欄位數
          const columnCount = collection.attributes ? collection.attributes.length : 0;
          
          // Get document count
          const docs = await databases.listDocuments(databaseId, collection.$id);
          
          return {
            name,
            columnCount,
            documentCount: docs.total
          };
        } catch (err) {
          // 如果查詢失敗，使用 collection.attributes.length 作為 fallback
          const columnCount = collection.attributes ? collection.attributes.length : 0;
          return {
            name,
            columnCount,
            documentCount: 0,
            error: true
          };
        }
      })
    );

    // 動態計算總欄位數
    const totalColumns = collectionsWithCounts.reduce((sum, col) => sum + col.columnCount, 0);

    return NextResponse.json({
      totalColumns,
      totalCollections: tableNames.length,
      collections: collectionsWithCounts,
      databaseId
    });
  } catch (err) {
    console.error("GET /api/database-stats error:", err);
    return NextResponse.json(
      { error: err.message }, 
      { status: 500 }
    );
  }
}
