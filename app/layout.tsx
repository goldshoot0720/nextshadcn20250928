import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "智能管理平台 - 食品與訂閱管理系統",
  description: "一個現代化的管理平台，幫助您輕鬆管理食品庫存和訂閱服務，避免浪費並控制支出。",
  keywords: "食品管理, 訂閱管理, 庫存管理, 過期提醒, 支出控制",
  authors: [{ name: "管理系統團隊" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#3b82f6",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="智能管理平台" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased safe-area-inset`}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
}
