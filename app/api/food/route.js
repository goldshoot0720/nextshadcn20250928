import { NextResponse } from "next/server";
import { Client, Databases, ID } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_FOOD_COLLECTION_ID;

// GET
export async function GET() {
  try {
    const response = await databases.listDocuments(databaseId, collectionId);
    return NextResponse.json(response.documents);
  } catch (err) {
    console.error("GET /api/food error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, amount, todate, photo } = body;

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        name,
        amount: parseInt(amount, 10),
        todate,
        photo,
      }
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("POST /api/food error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
