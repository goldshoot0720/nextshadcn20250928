"use client";

import { useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import EnhancedDashboard from "@/components/modules/EnhancedDashboard";
import VideoIntroduction from "@/components/modules/VideoIntroduction";
import ImageGallery from "@/components/modules/ImageGallery";
import AboutUs from "@/components/modules/AboutUs";
import MusicLyrics from "@/components/modules/MusicLyrics";
import { Package, CreditCard, Home, BarChart3, Info, Play, Music } from "lucide-react";
import { MenuItem } from "@/types";

// 選單項目配置
const MENU_ITEMS: MenuItem[] = [
  { id: "home", label: "首頁", icon: <Home size={18} /> },
  { id: "dashboard", label: "儀表板", icon: <BarChart3 size={18} /> },
  { id: "subscription", label: "訂閱管理", icon: <CreditCard size={18} /> },
  { id: "food", label: "食品管理", icon: <Package size={18} /> },
  { id: "videos", label: "影片介紹", icon: <Play size={18} /> },
  { id: "music", label: "鋒兄音樂歌詞", icon: <Music size={18} /> },
  { id: "bank-stats", label: "銀行統計", icon: <BarChart3 size={18} /> },
  { id: "about", label: "關於我們", icon: <Info size={18} /> },
];

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("home");

  const handleModuleChange = useCallback((moduleId: string) => {
    setCurrentModule(moduleId);
  }, []);

  // 渲染當前模組內容
  const currentContent = useMemo(() => {
    switch (currentModule) {
      case "home":
        return <ImageGallery />;
      case "dashboard":
        return <EnhancedDashboard onNavigate={handleModuleChange} />;
      case "subscription":
        return <SubscriptionManagement />;
      case "food":
        return <FoodManagement />;
      case "videos":
        return <VideoIntroduction />;
      case "music":
        return <MusicLyrics />;
      case "bank-stats":
        return <BankStatistics />;
      case "about":
        return <AboutUs />;
      default:
        return <NotFoundModule />;
    }
  }, [currentModule, handleModuleChange]);

  return (
    <DashboardLayout
      currentModule={currentModule}
      onModuleChange={handleModuleChange}
      menuItems={MENU_ITEMS}
    >
      {currentContent}
    </DashboardLayout>
  );
}

// 銀行統計模組
function BankStatistics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">銀行統計</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          這裡將顯示銀行相關統計資訊。後續可以在此擴充詳細報表與圖表。
        </p>
      </div>
    </div>
  );
}

// 404 模組
function NotFoundModule() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">頁面未找到</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">請選擇有效的功能模組</p>
      </div>
    </div>
  );
}
