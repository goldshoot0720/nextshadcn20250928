import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 動態模式配置 - 支援 API 路由和伺服器端功能
  
  // 圖片優化設定
  images: {
    domains: [],
  },
  
  // 其他配置
  experimental: {
    // 實驗性功能
  }
};

export default nextConfig;