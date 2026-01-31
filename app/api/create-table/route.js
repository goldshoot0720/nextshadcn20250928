import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

// Table schemas definition
const TABLE_SCHEMAS = {
  commonaccount: {
    name: "commonaccount",
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      ...Array.from({ length: 37 }, (_, i) => ({
        key: `site${(i + 1).toString().padStart(2, '0')}`,
        type: 'string',
        size: 100,
        required: false
      })),
      ...Array.from({ length: 37 }, (_, i) => ({
        key: `note${(i + 1).toString().padStart(2, '0')}`,
        type: 'string',
        size: 100,
        required: false
      }))
    ]
  },
  bank: {
    name: "bank",
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'deposit', type: 'integer', required: false },
      { key: 'site', type: 'url', required: false },
      { key: 'address', type: 'string', size: 100, required: false },
      { key: 'withdrawals', type: 'integer', required: false },
      { key: 'transfer', type: 'integer', required: false },
      { key: 'activity', type: 'url', required: false },
      { key: 'card', type: 'string', size: 100, required: false },
      { key: 'account', type: 'string', size: 100, required: false }
    ]
  },
  article: {
    name: "article",
    attributes: [
      { key: 'title', type: 'string', size: 255, required: false },
      { key: 'content', type: 'string', size: 10000, required: false },
      { key: 'newDate', type: 'string', size: 100, required: false },
      { key: 'url1', type: 'url', required: false },
      { key: 'url2', type: 'url', required: false },
      { key: 'url3', type: 'url', required: false },
      { key: 'file1', type: 'string', size: 500, required: false },
      { key: 'file1type', type: 'string', size: 50, required: false },
      { key: 'file2', type: 'string', size: 500, required: false },
      { key: 'file2type', type: 'string', size: 50, required: false },
      { key: 'file3', type: 'string', size: 500, required: false },
      { key: 'file3type', type: 'string', size: 50, required: false }
    ]
  },
  food: {
    name: "food",
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'amount', type: 'integer', required: false },
      { key: 'todate', type: 'string', size: 100, required: false },
      { key: 'photo', type: 'url', required: false }
    ]
  },
  subscription: {
    name: "subscription",
    attributes: [
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'site', type: 'url', required: false },
      { key: 'price', type: 'integer', required: false },
      { key: 'nextdate', type: 'string', size: 100, required: false }
    ]
  }
};

// POST /api/create-table
export async function POST(request) {
  try {
    const { tableName } = await request.json();

    // Check if table schema is defined
    const schema = TABLE_SCHEMAS[tableName];
    if (!schema) {
      return NextResponse.json(
        { success: false, error: `Unknown table: ${tableName}` },
        { status: 400 }
      );
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !databaseId || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing Appwrite configuration" },
        { status: 500 }
      );
    }

    const client = new sdk.Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new sdk.Databases(client);

    // Check if collection exists
    try {
      await databases.getCollection(databaseId, tableName);
      return NextResponse.json(
        { success: false, error: `${tableName} table already exists` },
        { status: 400 }
      );
    } catch (err) {
      if (err.code !== 404) throw err;
    }

    // Create collection (let Appwrite generate ID)
    const collection = await databases.createCollection(
      databaseId,
      sdk.ID.unique(),
      tableName,
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );

    const collectionId = collection.$id;

    // Create attributes based on type
    for (const attr of schema.attributes) {
      try {
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              databaseId,
              collectionId,
              attr.key,
              attr.size,
              attr.required
            );
            break;
          case 'integer':
            await databases.createIntegerAttribute(
              databaseId,
              collectionId,
              attr.key,
              attr.required
            );
            break;
          case 'url':
            await databases.createUrlAttribute(
              databaseId,
              collectionId,
              attr.key,
              attr.required
            );
            break;
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        if (err.code !== 409) {
          console.error(`Failed to create ${attr.key}:`, err.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${tableName} table created with ${schema.attributes.length} columns`,
      collectionId
    });

  } catch (err) {
    console.error("POST /api/create-table error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
