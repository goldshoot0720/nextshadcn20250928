/**
 * Favicon 工具函數
 */

/**
 * 從 URL 獲取 favicon URL
 * @param siteUrl 網站 URL
 * @returns favicon URL
 */
export function getFaviconUrl(siteUrl: string): string {
  if (!siteUrl) return '';
  
  try {
    const url = new URL(siteUrl);
    const domain = url.hostname;
    
    // 使用 Google 的 favicon 服務作為備選方案
    // sz 參數可以設定大小，但最大支援 128
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

/**
 * 檢查 favicon 是否可用
 * @param faviconUrl favicon URL
 * @returns Promise<boolean>
 */
export async function isFaviconAvailable(faviconUrl: string): Promise<boolean> {
  if (!faviconUrl) return false;
  
  try {
    const response = await fetch(faviconUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 獲取多個可能的 favicon URL
 * @param siteUrl 網站 URL
 * @returns favicon URL 陣列
 */
export function getFaviconUrls(siteUrl: string): string[] {
  if (!siteUrl) return [];
  
  try {
    const url = new URL(siteUrl);
    const domain = url.hostname;
    const origin = url.origin;
    
    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/apple-touch-icon.png`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    ];
  } catch {
    return [];
  }
}