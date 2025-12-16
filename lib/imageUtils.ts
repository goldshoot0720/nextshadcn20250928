// 圖片相關工具函數

/**
 * 格式化檔案大小
 * @param bytes 檔案大小（位元組）
 * @returns 格式化後的字串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 格式化日期
 * @param dateString 日期字串
 * @returns 格式化後的日期字串
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * 格式化短日期
 * @param dateString 日期字串
 * @returns 格式化後的短日期字串
 */
export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("zh-TW", {
    month: "short",
    day: "numeric"
  });
}

/**
 * 格式化數字日期
 * @param dateString 日期字串
 * @returns 格式化後的數字日期字串
 */
export function formatNumericDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("zh-TW", {
    month: "numeric",
    day: "numeric"
  });
}
