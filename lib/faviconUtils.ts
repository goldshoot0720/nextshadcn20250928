/**
 * Favicon 工具函數
 */

/**
 * 從 URL 獲取 favicon URL（直接從網站獲取）
 * @param siteUrl 網站 URL
 * @returns favicon URL 陣列
 */
export function getFaviconUrlsOrdered(siteUrl: string): string[] {
  if (!siteUrl) return [];
  
  try {
    const url = new URL(siteUrl);
    const origin = url.origin;
    
    // 直接從網站獲取 favicon.ico
    return [
      `${origin}/favicon.ico`,
    ];
  } catch {
    return [];
  }
}
