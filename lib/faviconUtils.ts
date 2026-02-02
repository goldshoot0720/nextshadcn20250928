/**
 * Favicon 工具函數
 */

/**
 * 從 URL 獲取多個可能的 favicon URL（按優先順序）
 * @param siteUrl 網站 URL
 * @returns favicon URL 陣列
 */
export function getFaviconUrlsOrdered(siteUrl: string): string[] {
  if (!siteUrl) return [];
  
  try {
    const url = new URL(siteUrl);
    const domain = url.hostname;
    const origin = url.origin;
    
    // 優先順序：
    // 1. 直接從網站獲取 favicon.ico
    // 2. DuckDuckGo favicon 服務
    // 3. Google favicon 服務
    return [
      `${origin}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    ];
  } catch {
    return [];
  }
}

/**
 * 從 URL 獲取 favicon URL（預設使用 DuckDuckGo）
 * @param siteUrl 網站 URL
 * @returns favicon URL
 */
export function getFaviconUrl(siteUrl: string): string {
  if (!siteUrl) return '';
  
  try {
    const url = new URL(siteUrl);
    const domain = url.hostname;
    
    // 使用 DuckDuckGo 的 favicon 服務（更可靠）
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return '';
  }
}

/**
 * 獲取 Google favicon URL
 * @param siteUrl 網站 URL
 * @returns favicon URL
 */
export function getGoogleFaviconUrl(siteUrl: string): string {
  if (!siteUrl) return '';
  
  try {
    const url = new URL(siteUrl);
    const domain = url.hostname;
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