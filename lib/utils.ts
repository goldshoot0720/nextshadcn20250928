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

  // Client-side: 檢查是否已經儲存過自定義配置
  const hasCustomConfig = localStorage.getItem('appwrite_custom_config_saved');
  
  if (hasCustomConfig === 'true') {
    // 如果已經儲存過，只使用 localStorage 的配置，不 fallback 到 .env
    const endpoint = localStorage.getItem('NEXT_PUBLIC_APPWRITE_ENDPOINT') || '';
    const projectId = localStorage.getItem('NEXT_PUBLIC_APPWRITE_PROJECT_ID') || '';
    const databaseId = localStorage.getItem('APPWRITE_DATABASE_ID') || '';
    const bucketId = localStorage.getItem('APPWRITE_BUCKET_ID') || '';
    const apiKey = localStorage.getItem('APPWRITE_API_KEY') || '';
    
    return {
      endpoint,
      projectId,
      databaseId,
      bucketId,
      apiKey,
    };
  }
  
  // 如果沒有儲存過，使用 .env 的預設配置
  return {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || '',
    bucketId: process.env.APPWRITE_BUCKET_ID || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
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
  
  console.log('[clearAllCaches] 清除所有快取...');
  
  // 1. 清除 localStorage 中的所有快取相關 key
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('_refresh_key') || 
      key.includes('crud_') ||
      key === 'appwrite_account_switched'
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => {
    console.log(`[clearAllCaches] 清除 localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
  
  // 2. 清除 useCrud 的內存快取
  if ((window as any).__crudCache) {
    console.log(`[clearAllCaches] 清除 __crudCache (${(window as any).__crudCache.size} 個項目)`);
    (window as any).__crudCache.clear();
  }
  
  // 3. 強制清除模組級快取（透過設定特殊 flag）
  const timestamp = Date.now().toString();
  localStorage.setItem('appwrite_account_switched', timestamp);
  console.log(`[clearAllCaches] 設定 appwrite_account_switched: ${timestamp}`);
  
  // 4. 強制所有 hooks 重新載入（設定 refresh keys）
  const modules = [
    'subscriptions',
    'foods', 
    'banks',
    'articles',
    'images',
    'music',
    'videos',
    'dashboard'
  ];
  
  modules.forEach(module => {
    const key = `${module}_refresh_key`;
    localStorage.setItem(key, timestamp);
    console.log(`[clearAllCaches] 設定 ${key}: ${timestamp}`);
  });
  
  console.log('[clearAllCaches] 快取清除完成，所有模組將在下次載入時重新取得資料');
}
