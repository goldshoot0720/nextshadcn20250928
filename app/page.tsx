"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import EnhancedDashboard from "@/components/modules/EnhancedDashboard";
import VideoIntroduction from "@/components/modules/VideoIntroduction";
import ImageGallery from "@/components/modules/ImageGallery";
import AboutUs from "@/components/modules/AboutUs";
import { Package, CreditCard, Home, BarChart3, Info, Play } from "lucide-react";

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("home");

  // 選單項目配置
  const menuItems = [
    { id: "home", label: "首頁", icon: <Home size={18} /> },
    { id: "dashboard", label: "儀表板", icon: <BarChart3 size={18} /> },
    { id: "subscription", label: "訂閱管理", icon: <CreditCard size={18} /> },
    { id: "food", label: "食品管理", icon: <Package size={18} /> },
    { id: "videos", label: "影片介紹", icon: <Play size={18} /> },
    { id: "about", label: "關於我們", icon: <Info size={18} /> },
  ];

  // 渲染當前模組內容
  const renderCurrentModule = () => {
    switch (currentModule) {
      case "home":
        return <ImageGallery />;
      case "dashboard":
        return <EnhancedDashboard onNavigate={setCurrentModule} />;
      case "subscription":
        return <SubscriptionManagement />;
      case "food":
        return <FoodManagement />;
      case "videos":
        return <VideoIntroduction />;
      case "about":
        return <AboutUs />;
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">頁面未找到</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">請選擇有效的功能模組</p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      currentModule={currentModule}
      onModuleChange={setCurrentModule}
      menuItems={menuItems}
    >
      {renderCurrentModule()}
    </DashboardLayout>
  );
}
