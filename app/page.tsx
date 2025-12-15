"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import { Package, CreditCard, Home, Settings } from "lucide-react";

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("food");

  // 選單項目配置
  const menuItems = [
    {
      id: "dashboard",
      label: "儀表板",
      icon: <Home size={18} />,
    },
    {
      id: "food",
      label: "食品管理",
      icon: <Package size={18} />,
    },
    {
      id: "subscription",
      label: "訂閱管理",
      icon: <CreditCard size={18} />,
    },
    {
      id: "settings",
      label: "系統設定",
      icon: <Settings size={18} />,
    },
  ];

  // 渲染當前模組內容
  const renderCurrentModule = () => {
    switch (currentModule) {
      case "food":
        return <FoodManagement />;
      case "subscription":
        return <SubscriptionManagement />;
      case "dashboard":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-500" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">食品管理</h3>
                    <p className="text-sm text-gray-500">管理食品庫存和有效期限</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-green-500" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">訂閱管理</h3>
                    <p className="text-sm text-gray-500">追蹤訂閱服務和付款日期</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">系統設定功能開發中...</p>
            </div>
          </div>
        );
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
