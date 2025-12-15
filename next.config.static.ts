import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 啟用靜態網站生成
  output: 'export',
  
  // 禁用圖片優化 (靜態導出不支援)
  images: {
    unoptimized: true
  },
  
  // 設定基礎路徑 (如果需要部署到子目錄)
  // basePath: '/your-app-name',
  
  // 設定資產前綴 (用於 CDN 或子目錄部署)
  // assetPrefix: '/your-app-name',
  
  // 禁用伺服器端功能
  trailingSlash: true,
  
  // 跳過 API 路由的構建
  skipTrailingSlashRedirect: true,
  
  // 實驗性功能
  experimental: {
    // 跳過中間件
  }
};

export default nextConfig;