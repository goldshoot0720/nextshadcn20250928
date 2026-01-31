import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";

export const dynamic = 'force-dynamic';

function createAppwrite() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.APPWRITE_DATABASE_ID;

  if (!endpoint || !projectId || !databaseId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const databases = new Databases(client);

  return { databases, databaseId };
}

// GET /api/database-stats
export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    
    // 定義所有 collections 和它們的欄位數量
    const collections = [
      { name: "article", columns: ["title", "content", "newDate", "url1", "url2", "url3", "file1", "file1type", "file2", "file2type", "file3", "file3type"] },
      { name: "bank", columns: ["name", "deposit", "site", "address", "withdrawals", "transfer", "activity", "card", "account"] },
      { name: "commonaccount", columns: ["name", "site01", "site02", "site03", "site04", "site05", "site06", "site07", "site08", "site09", "site10", "site11", "site12", "site13", "site14", "site15", "note01", "note02", "note03", "note04", "note05", "note06", "note07", "note08", "note09", "note10", "note11", "note12", "note13", "note14", "note15"] },
      { name: "food", columns: ["name", "amount", "todate", "photo"] },
      { name: "subscription", columns: ["name", "site", "price", "nextdate"] },
    ];

    // 計算總欄位數
    const totalColumns = collections.reduce((sum, col) => sum + col.columns.length, 0);
    
    // 取得各 collection 的文件數量
    const collectionsWithCounts = await Promise.all(
      collections.map(async (col) => {
        try {
          const docs = await databases.listDocuments(databaseId, col.name);
          return {
            name: col.name,
            columnCount: col.columns.length,
            documentCount: docs.total
          };
        } catch (err) {
          return {
            name: col.name,
            columnCount: col.columns.length,
            documentCount: 0,
            error: true
          };
        }
      })
    );

    return NextResponse.json({
      totalColumns,
      totalCollections: collections.length,
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
