import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Appwrite 動態配置
export function getAppwriteConfig() {
  if (typeof window === 'undefined') {
    // Server-side: use environment variables
    return {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
      databaseId: process.env.APPWRITE_DATABASE_ID || '',
      bucketId: process.env.APPWRITE_BUCKET_ID || '',
      apiKey: process.env.APPWRITE_API_KEY || '',
    };
  }

  // Client-side: check localStorage first, fallback to environment
  // 注意：process.env 在 Next.js 中會在構建時被替換成字面值
  const endpoint = localStorage.getItem('NEXT_PUBLIC_APPWRITE_ENDPOINT');
  const projectId = localStorage.getItem('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  const databaseId = localStorage.getItem('APPWRITE_DATABASE_ID');
  const bucketId = localStorage.getItem('APPWRITE_BUCKET_ID');
  const apiKey = localStorage.getItem('APPWRITE_API_KEY');
  
  return {
    endpoint: endpoint || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    projectId: projectId || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: databaseId || process.env.APPWRITE_DATABASE_ID || '',
    bucketId: bucketId || process.env.APPWRITE_BUCKET_ID || '',
    apiKey: apiKey || process.env.APPWRITE_API_KEY || '',
  };
}

// 獲取上傳用的 headers（包含 Appwrite 配置）
export function getAppwriteHeaders() {
  const config = getAppwriteConfig();
  return {
    'x-appwrite-endpoint': config.endpoint,
    'x-appwrite-project': config.projectId,
    'x-appwrite-bucket': config.bucketId,
    'x-appwrite-key': config.apiKey,
  };
}

// 清除所有快取（用於 Appwrite 帳號切換）
export function clearAllCaches() {
  if (typeof window === 'undefined') return;
  
  // 1. 清除 localStorage 中的 CRUD refresh keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('crud_') && key.includes('_refresh_key')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // 2. 清除 useCrud 的內存快取
  if ((window as any).__crudCache) {
    (window as any).__crudCache.clear();
  }
  
  // 3. 清除其他 hooks 的模組級快取（透過觸發重新載入）
  // 設定一個特殊的 refresh key 來強制所有 hooks 重新載入
  localStorage.setItem('appwrite_account_switched', Date.now().toString());
}
