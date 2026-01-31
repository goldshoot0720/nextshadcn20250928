// Script to create commonaccount collection in Appwrite with 75 columns
// Run with: node scripts/create-commonaccount.js
//
// IMPORTANT: You need an Appwrite API Key to run this script.
// 1. Go to Appwrite Console > Project Settings > API Keys
// 2. Create a new API key with 'databases' scope
// 3. Add APPWRITE_API_KEY=your_key to your .env file
// 4. Run: node scripts/create-commonaccount.js

const sdk = require('node-appwrite');
require('dotenv').config();

const COLLECTION_ID = 'commonaccount';

async function createCommonAccountCollection() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID;
  const apiKey = process.env.NEXT_PUBLIC_APPWRITE_API_KEY || process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId) {
    console.error('Missing Appwrite configuration in .env');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('');
    console.error('ERROR: APPWRITE_API_KEY is required!');
    console.error('');
    console.error('To get an API key:');
    console.error('1. Go to Appwrite Console > Project Settings > API Keys');
    console.error('2. Create a new API key with "databases" scope');
    console.error('3. Add to .env: APPWRITE_API_KEY=your_key_here');
    console.error('4. Run this script again');
    console.error('');
    process.exit(1);
  }

  console.log('Appwrite Configuration:');
  console.log('  Endpoint:', endpoint);
  console.log('  Project ID:', projectId);
  console.log('  Database ID:', databaseId);
  console.log('  API Key:', apiKey.substring(0, 10) + '...');
  console.log('');

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);

  try {
    // Check if collection exists
    let collectionExists = false;
    try {
      await databases.getCollection(databaseId, COLLECTION_ID);
      collectionExists = true;
      console.log(`Collection '${COLLECTION_ID}' already exists, will add missing attributes.`);
    } catch (err) {
      if (err.code !== 404) throw err;
      console.log(`Collection '${COLLECTION_ID}' not found, creating...`);
    }

    // Create collection if it doesn't exist
    if (!collectionExists) {
      await databases.createCollection(
        databaseId,
        COLLECTION_ID,
        COLLECTION_ID,
        [
          sdk.Permission.read(sdk.Role.any()),
          sdk.Permission.create(sdk.Role.any()),
          sdk.Permission.update(sdk.Role.any()),
          sdk.Permission.delete(sdk.Role.any()),
        ]
      );
      console.log(`✓ Collection '${COLLECTION_ID}' created`);
    }

    // Define all attributes
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

    console.log(`Creating ${attributes.length} attributes...`);

    for (const attr of attributes) {
      try {
        await databases.createStringAttribute(
          databaseId,
          COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`  ✓ ${attr.key} (size: ${attr.size}, required: ${attr.required})`);
        
        // Delay to avoid rate limiting and allow attribute processing
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        if (err.code === 409) {
          console.log(`  - ${attr.key} already exists`);
        } else {
          console.error(`  ✗ Failed to create ${attr.key}:`, err.message);
        }
      }
    }

    console.log('');
    console.log('✓ Done! commonaccount collection created with 75 columns.');
    console.log('');
    console.log('Note: Attributes may take a moment to become available in Appwrite.');
    console.log('Refresh your Appwrite Console to see the new table.');

  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === 401) {
      console.error('API Key is invalid or expired. Please check your APPWRITE_API_KEY.');
    }
    process.exit(1);
  }
}

createCommonAccountCollection();
