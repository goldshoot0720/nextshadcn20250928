"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import EnhancedDashboard from "@/components/modules/EnhancedDashboard";
import VideoIntroduction from "@/components/modules/VideoIntroduction";
import { Package, CreditCard, Home, Settings, BarChart3, Info, Phone, Play } from "lucide-react";

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("dashboard");

  // 選單項目配置
  const menuItems = [
    {
      id: "home",
      label: "首頁",
      icon: <Home size={18} />,
    },
    {
      id: "dashboard",
      label: "儀表板",
      icon: <BarChart3 size={18} />,
    },
    {
      id: "subscription",
      label: "訂閱管理",
      icon: <CreditCard size={18} />,
    },
    {
      id: "food",
      label: "食品管理",
      icon: <Package size={18} />,
    },
    {
      id: "videos",
      label: "影片介紹",
      icon: <Play size={18} />,
    },
    {
      id: "about",
      label: "關於我們",
      icon: <Info size={18} />,
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
        return <EnhancedDashboard onNavigate={setCurrentModule} />;
      case "videos":
        return <VideoIntroduction />;
      case "home":
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">儀表板</h1>
              <p className="text-gray-500 mt-1">歡迎回到智能管理平台</p>
            </div>
            
            {/* 快速統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">食品項目</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Package size={32} className="text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">訂閱服務</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <CreditCard size={32} className="text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg shadow-yellow-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">即將過期</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <div className="text-yellow-200">⚠️</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">月費總計</p>
                    <p className="text-2xl font-bold">NT$ 2,580</p>
                  </div>
                  <div className="text-purple-200">💰</div>
                </div>
              </div>
            </div>

            {/* 功能模組卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setCurrentModule("food")}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">食品管理</h3>
                    <p className="text-gray-500 text-sm mb-3">管理食品庫存和有效期限，避免食物浪費</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">9 項正常</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">3 項即將過期</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    →
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setCurrentModule("subscription")}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <CreditCard className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">訂閱管理</h3>
                    <p className="text-gray-500 text-sm mb-3">追蹤訂閱服務和付款日期，控制支出</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">6 項正常</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">2 項即將到期</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    →
                  </div>
                </div>
              </div>
            </div>

            {/* 最近活動 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">新增食品：有機牛奶</span>
                  <span className="text-xs text-gray-400 ml-auto">2 小時前</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">更新訂閱：Netflix 月費</span>
                  <span className="text-xs text-gray-400 ml-auto">1 天前</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">提醒：麵包將於明天過期</span>
                  <span className="text-xs text-gray-400 ml-auto">2 天前</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">關於我們</h1>
              <p className="text-gray-500 mt-1">了解智能管理平台的使命與願景</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                {/* 公司標誌與介紹 */}
                <div className="text-center mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-white font-bold text-3xl">鋒塗</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">鋒兄塗哥公關資訊</h2>
                  <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                    我們是專業的公關團隊，致力於為客戶提供最優質的公關服務和智能管理解決方案。
                    透過創新技術和專業服務，幫助企業和個人實現更高效的管理目標。
                  </p>
                </div>

                {/* 團隊成員 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">鋒</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">鋒兄</h3>
                    <p className="text-blue-600 font-medium mb-3">技術總監 & 創新領袖</p>
                    <p className="text-gray-600 text-sm">
                      專精於系統架構設計與技術創新，擁有豐富的軟體開發經驗，
                      致力於打造用戶友好的智能管理解決方案。
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">塗</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">塗哥</h3>
                    <p className="text-purple-600 font-medium mb-3">公關總監 & 策略專家</p>
                    <p className="text-gray-600 text-sm">
                      擅長品牌策略規劃與公關活動執行，具備敏銳的市場洞察力，
                      專注於建立企業與客戶之間的良好關係。
                    </p>
                  </div>
                </div>

                {/* 服務特色 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="text-white" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">智能管理</h3>
                    <p className="text-gray-600 text-sm">提供全方位的智能管理解決方案，讓生活更有序</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="text-white" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">數據洞察</h3>
                    <p className="text-gray-600 text-sm">深度數據分析，提供精準的決策支援</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Info className="text-white" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">專業服務</h3>
                    <p className="text-gray-600 text-sm">24/7 專業客服支援，確保最佳使用體驗</p>
                  </div>
                </div>

                {/* 聯絡資訊 */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">聯絡我們</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Phone className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">業務洽詢</p>
                          <p className="text-gray-600">+886-2-1234-5678</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm">📧</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">電子郵件</p>
                          <p className="text-gray-600">contact@fengtuge.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm">🌐</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">官方網站</p>
                          <p className="text-gray-600">www.fengtuge.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm">📍</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">公司地址</p>
                          <p className="text-gray-600">台北市信義區信義路五段7號</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 版權資訊 */}
                <div className="text-center border-t border-gray-200 pt-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <h3 className="text-2xl font-bold mb-4">智能管理平台</h3>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p className="text-lg font-medium">鋒兄塗哥公關資訊有限公司</p>
                    <p className="flex items-center justify-center gap-2">
                      <span className="text-xl">©</span>
                      <span className="font-medium">2025 ～ 2125</span>
                      <span>版權所有</span>
                    </p>
                    <p className="text-sm">Feng & Tu Public Relations Information Co., Ltd.</p>
                    <p className="text-sm">All Rights Reserved</p>
                  </div>
                  
                  <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500">
                    <span>智能管理平台 v2.0.0</span>
                    <span>•</span>
                    <span>Next.js + TypeScript</span>
                    <span>•</span>
                    <span>Made with ❤️ in Taiwan</span>
                  </div>
                </div>
              </div>
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
