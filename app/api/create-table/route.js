import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

// POST /api/create-table
export async function POST(request) {
  try {
    const { tableName } = await request.json();
    
    // Only support creating commonaccount table programmatically
    if (tableName !== "commonaccount") {
      return NextResponse.json(
        { success: false, error: `${tableName} must be created manually in Appwrite Console` },
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
      await databases.getCollection(databaseId, "commonaccount");
      return NextResponse.json(
        { success: false, error: "commonaccount table already exists" },
        { status: 400 }
      );
    } catch (err) {
      if (err.code !== 404) throw err;
    }

    // Create collection
    await databases.createCollection(
      databaseId,
      "commonaccount",
      "commonaccount",
      [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.any()),
        sdk.Permission.update(sdk.Role.any()),
        sdk.Permission.delete(sdk.Role.any()),
      ]
    );

    // Create attributes
    const attributes = [
      { key: 'name', size: 100, required: true },
    ];

    // Add site01 ~ site37
    for (let i = 1; i <= 37; i++) {
      const key = `site${i.toString().padStart(2, '0')}`;
      attributes.push({ key, size: 100, required: false });
    }

    // Add note01 ~ note37
    for (let i = 1; i <= 37; i++) {
      const key = `note${i.toString().padStart(2, '0')}`;
      attributes.push({ key, size: 100, required: false });
    }

    for (const attr of attributes) {
      try {
        await databases.createStringAttribute(
          databaseId,
          "commonaccount",
          attr.key,
          attr.size,
          attr.required
        );
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        if (err.code !== 409) {
          console.error(`Failed to create ${attr.key}:`, err.message);
        }
      }
    }

    return NextResponse.json({ success: true, message: "commonaccount table created with 75 columns" });

  } catch (err) {
    console.error("POST /api/create-table error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
