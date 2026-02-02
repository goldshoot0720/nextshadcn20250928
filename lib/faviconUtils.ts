/**
 * Favicon 工具函數
 */

// 已知網站的 favicon URL 映射（從 <link rel="icon"> 標籤獲取）
const KNOWN_FAVICON_URLS: Record<string, string> = {
  'github.com': 'https://github.githubassets.com/favicons/favicon.svg',
  'gmail.com': 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  'mail.google.com': 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
  'outlook.com': 'https://outlook.live.com/favicon.ico',
  'outlook.live.com': 'https://outlook.live.com/favicon.ico',
  'suno.com': 'https://suno.com/favicon.ico',
  'sora.com': 'https://sora.com/favicon.ico',
  'qoder.com': 'https://qoder.com/favicon.ico',
};

/**
 * 從 URL 獲取 favicon URL（直接從網站獲取）
 * @param siteUrl 網站 URL
 * @returns favicon URL 陣列
 */
export function getFaviconUrlsOrdered(siteUrl: string): string[] {
  if (!siteUrl) return [];
  
  try {
    const url = new URL(siteUrl);
    const hostname = url.hostname;
    const origin = url.origin;
    
    // 檢查是否有已知的 favicon URL
    const knownFavicon = KNOWN_FAVICON_URLS[hostname] || KNOWN_FAVICON_URLS[hostname.replace('www.', '')];
    
    if (knownFavicon) {
      return [
        knownFavicon,
        `${origin}/favicon.ico`, // fallback
      ];
    }
    
    // 預設：直接從網站獲取 favicon.ico
    return [
      `${origin}/favicon.ico`,
    ];
  } catch {
    return [];
  }
}
