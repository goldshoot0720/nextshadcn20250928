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

// Table definitions with expected columns
const TABLE_DEFINITIONS = {
  article: ["title", "content", "newDate", "url1", "url2", "url3", "file1", "file1type", "file2", "file2type", "file3", "file3type"],
  bank: ["name", "deposit", "site", "address", "withdrawals", "transfer", "activity", "card", "account"],
  commonaccount: ["name", ...Array.from({length: 37}, (_, i) => `site${(i + 1).toString().padStart(2, '0')}`), ...Array.from({length: 37}, (_, i) => `note${(i + 1).toString().padStart(2, '0')}`)],
  food: ["name", "amount", "price", "shop", "todate", "photo", "photohash"],
  subscription: ["name", "site", "price", "nextdate", "note", "account"],
  image: ["name", "file", "note", "ref", "category", "hash", "cover"],
  video: ["name", "file", "note", "ref", "category", "hash", "cover"],
  music: ["name", "file", "lyrics", "note", "ref", "category", "hash", "language", "cover"]
};

// GET /api/database-stats
export async function GET() {
  try {
    const { databases, databaseId } = createAppwrite();
    
    // List all collections in the database
    const allCollections = await databases.listCollections(databaseId);
    
    // Create a map of collection name -> collection ID
    const collectionMap = {};
    allCollections.collections.forEach(col => {
      collectionMap[col.name] = col.$id;
    });
    
    // Define expected tables
    const tableNames = ["article", "bank", "commonaccount", "food", "subscription", "image", "video", "music"];
    
    // Calculate total columns
    const totalColumns = tableNames.reduce((sum, name) => sum + TABLE_DEFINITIONS[name].length, 0);
    
    // Get each collection's document count
    const collectionsWithCounts = await Promise.all(
      tableNames.map(async (name) => {
        const collectionId = collectionMap[name];
        const columns = TABLE_DEFINITIONS[name];
        
        if (!collectionId) {
          // Collection doesn't exist
          return {
            name,
            columnCount: columns.length,
            documentCount: 0,
            error: true
          };
        }
        
        try {
          const docs = await databases.listDocuments(databaseId, collectionId);
          return {
            name,
            columnCount: columns.length,
            documentCount: docs.total
          };
        } catch (err) {
          return {
            name,
            columnCount: columns.length,
            documentCount: 0,
            error: true
          };
        }
      })
    );

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
