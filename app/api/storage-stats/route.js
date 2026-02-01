import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

function createAppwrite(config) {
  const endpoint = config?.endpoint || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = config?.projectId || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = config?.apiKey || process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
  const bucketId = config?.bucketId || process.env.APPWRITE_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  const databaseId = config?.databaseId || process.env.APPWRITE_DATABASE_ID;

  if (!endpoint || !projectId || !apiKey || !bucketId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const storage = new sdk.Storage(client);
  const databases = new sdk.Databases(client);

  return { storage, databases, bucketId, databaseId };
}

// Helper function to get all files from storage
async function getAllStorageFiles(storage, bucketId) {
  let allFiles = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await storage.listFiles(bucketId, [
      sdk.Query.limit(limit),
      sdk.Query.offset(offset)
    ]);

    allFiles = allFiles.concat(response.files);

    if (response.files.length < limit) {
      break;
    }

    offset += limit;
  }

  return allFiles;
}

// Helper function to get all referenced file IDs from database
async function getAllReferencedFileIds(databases, databaseId) {
  // 所有可能使用檔案的集合
  // bank, commonaccount, subscription 不會使用到 storage 檔案
  const collections = [
    'article',      // 筆記 - 可能有圖片
    'food',         // 食物 - 可能有圖片
    'music',        // 音樂 - audio, cover
    'podcast',      // 播客 - audio, cover
    'commondocument', // 文件 - file
    'routine',      // 行程 - 可能有附件
    'video',        // 影片 - video, cover
    'image'         // 圖片 - file
  ];
  const fileIdSet = new Set();

  for (const collectionName of collections) {
    try {
      let offset = 0;
      const limit = 100;

      while (true) {
        const response = await databases.listDocuments(databaseId, collectionName, [
          sdk.Query.limit(limit),
          sdk.Query.offset(offset)
        ]);

        response.documents.forEach(doc => {
          // Extract file IDs from various fields
          if (doc.cover) fileIdSet.add(doc.cover);      // 封面圖
          if (doc.file) fileIdSet.add(doc.file);        // 檔案
          if (doc.audio) fileIdSet.add(doc.audio);      // 音訊檔
          if (doc.video) fileIdSet.add(doc.video);      // 影片檔
          if (doc.image) fileIdSet.add(doc.image);      // 圖片檔
          if (doc.attachment) fileIdSet.add(doc.attachment); // 附件
        });

        if (response.documents.length < limit) {
          break;
        }

        offset += limit;
      }
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error.message);
    }
  }

  return fileIdSet;
}

// Count orphaned files
async function countOrphanedFiles(appwriteConfig) {
  try {
    const { storage, databases, bucketId, databaseId } = createAppwrite(appwriteConfig);

    // Get all storage files
    const allFiles = await getAllStorageFiles(storage, bucketId);

    // Get all referenced file IDs
    const referencedIds = await getAllReferencedFileIds(databases, databaseId);

    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => !referencedIds.has(file.$id));

    // Categorize orphaned files by type
    const orphanedByType = {
      images: 0,
      videos: 0,
      music: 0,
      documents: 0,
      podcasts: 0,
      other: 0
    };

    orphanedFiles.forEach(file => {
      const mimeType = file.mimeType || '';
      if (mimeType.startsWith('image/')) {
        orphanedByType.images++;
      } else if (mimeType.startsWith('video/')) {
        orphanedByType.videos++;
      } else if (mimeType.startsWith('audio/')) {
        orphanedByType.music++;
        orphanedByType.podcasts++; // Audio files could be music or podcasts
      } else if (
        mimeType === 'application/pdf' ||
        mimeType === 'text/plain' ||
        mimeType === 'text/markdown' ||
        mimeType.includes('document') ||
        mimeType.includes('spreadsheet')
      ) {
        orphanedByType.documents++;
      } else {
        orphanedByType.other++;
      }
    });

    return NextResponse.json({
      success: true,
      totalFiles: allFiles.length,
      referencedFiles: referencedIds.size,
      orphanedFiles: orphanedFiles.length,
      orphanedByType,
      orphanedFileIds: orphanedFiles.map(f => f.$id)
    });
  } catch (error) {
    console.error('Count orphaned files error:', error);
    return NextResponse.json({
      error: error.message || '統計失敗',
      totalFiles: 0,
      referencedFiles: 0,
      orphanedFiles: 0,
      orphanedByType: {
        images: 0,
        videos: 0,
        music: 0,
        documents: 0,
        podcasts: 0
      }
    }, { status: 500 });
  }
}

// POST handler for deleting orphaned files
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action !== 'delete') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const appwriteConfig = {
      endpoint: searchParams.get('_endpoint'),
      projectId: searchParams.get('_project'),
      databaseId: searchParams.get('_database'),
      apiKey: searchParams.get('_key'),
      bucketId: searchParams.get('_bucket'),
    };

    const { storage, databases, bucketId, databaseId } = createAppwrite(appwriteConfig);

    // Get all storage files
    const allFiles = await getAllStorageFiles(storage, bucketId);

    // Get all referenced file IDs
    const referencedIds = await getAllReferencedFileIds(databases, databaseId);

    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => !referencedIds.has(file.$id));

    // Delete orphaned files
    let deletedCount = 0;
    let failedCount = 0;

    for (const file of orphanedFiles) {
      try {
        await storage.deleteFile(bucketId, file.$id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete file ${file.$id}:`, error.message);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      failedCount,
      totalOrphaned: orphanedFiles.length
    });
  } catch (error) {
    console.error('Delete orphaned files error:', error);
    return NextResponse.json({
      error: error.message || '刪除失敗',
      deletedCount: 0,
      failedCount: 0
    }, { status: 500 });
  }
}

// GET /api/storage-stats - Get storage statistics from Appwrite Storage
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    const appwriteConfig = {
      endpoint: searchParams.get('_endpoint'),
      projectId: searchParams.get('_project'),
      databaseId: searchParams.get('_database'),
      apiKey: searchParams.get('_key'),
      bucketId: searchParams.get('_bucket'),
    };

    const { storage, bucketId } = createAppwrite(appwriteConfig);

    // If action is 'count', find orphaned files
    if (action === 'count') {
      return await countOrphanedFiles(appwriteConfig);
    }

    // Get all files from the bucket
    let allFiles = [];
    let offset = 0;
    const limit = 100; // Max items per request

    while (true) {
      const response = await storage.listFiles(bucketId, [
        sdk.Query.limit(limit),
        sdk.Query.offset(offset)
      ]);

      allFiles = allFiles.concat(response.files);

      if (response.files.length < limit) {
        break; // No more files to fetch
      }

      offset += limit;
    }

    // Calculate statistics by file type
    let imagesSize = 0;
    let videosSize = 0;
    let musicSize = 0;
    let documentsSize = 0;
    let otherSize = 0;
    
    let imagesCount = 0;
    let videosCount = 0;
    let musicCount = 0;
    let documentsCount = 0;
    let otherCount = 0;

    allFiles.forEach(file => {
      const mimeType = file.mimeType || '';
      const size = file.sizeOriginal || 0;

      if (mimeType.startsWith('image/')) {
        imagesSize += size;
        imagesCount++;
      } else if (mimeType.startsWith('video/')) {
        videosSize += size;
        videosCount++;
      } else if (mimeType.startsWith('audio/')) {
        musicSize += size;
        musicCount++;
      } else if (
        mimeType === 'application/pdf' ||
        mimeType === 'text/plain' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        documentsSize += size;
        documentsCount++;
      } else {
        otherSize += size;
        otherCount++;
      }
    });

    const totalSize = imagesSize + videosSize + musicSize + documentsSize + otherSize;
    const totalCount = allFiles.length;

    // Get bucket information (note: bucket details might not include size limit via API)
    // For now, we'll use a default limit or make it configurable
    const storageLimit = 2 * 1024 * 1024 * 1024; // 2GB default
    const usagePercentage = storageLimit > 0 ? (totalSize / storageLimit) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalFiles: totalCount,
        totalSize,
        storageLimit,
        usagePercentage,
        images: {
          count: imagesCount,
          size: imagesSize,
        },
        videos: {
          count: videosCount,
          size: videosSize,
        },
        music: {
          count: musicCount,
          size: musicSize,
        },
        documents: {
          count: documentsCount,
          size: documentsSize,
        },
        other: {
          count: otherCount,
          size: otherSize,
        }
      }
    });

  } catch (err) {
    console.error("GET /api/storage-stats error:", err);
    return NextResponse.json({ 
      error: err.message || '獲取儲存統計失敗',
      stats: {
        totalFiles: 0,
        totalSize: 0,
        storageLimit: 2 * 1024 * 1024 * 1024,
        usagePercentage: 0,
        images: { count: 0, size: 0 },
        videos: { count: 0, size: 0 },
        music: { count: 0, size: 0 },
        documents: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      }
    }, { status: 500 });
  }
}
