import { NextResponse } from "next/server";

const sdk = require('node-appwrite');

export const dynamic = 'force-dynamic';

function createAppwrite(config) {
  const endpoint = config?.endpoint || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = config?.projectId || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
  const bucketId = config?.bucketId || process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

  if (!endpoint || !projectId || !apiKey || !bucketId) {
    throw new Error("Appwrite configuration is missing");
  }

  const client = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const storage = new sdk.Storage(client);

  return { storage, bucketId };
}

// GET /api/storage-stats - Get storage statistics from Appwrite Storage
export async function GET(request) {
  try {
    const appwriteConfig = {
      endpoint: request.headers.get('x-appwrite-endpoint'),
      projectId: request.headers.get('x-appwrite-project'),
      apiKey: request.headers.get('x-appwrite-key'),
      bucketId: request.headers.get('x-appwrite-bucket'),
    };

    const { storage, bucketId } = createAppwrite(appwriteConfig);

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
