import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 預設為動態模式，支援 API 路由
  // 如需靜態導出，請使用 next.config.static.ts
  
  // 圖片優化設定
  images: {
    // 在靜態模式下會被覆蓋為 unoptimized: true
    domains: [],
  },
  
  // 其他配置
  experimental: {
    // 實驗性功能
  }
};

export default nextConfig;
