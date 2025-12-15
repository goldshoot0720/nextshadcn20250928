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

  // 選單項目配置 - 重新排序
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
    {
      id: "contact",
      label: "聯絡我們",
      icon: <Phone size={18} />,
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
              <div className="max-w-3xl mx-auto text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">M</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">智能管理平台</h2>
                <p className="text-gray-600 text-lg mb-8">
                  我們致力於為用戶提供最優質的生活管理解決方案，幫助您更好地管理食品庫存和訂閱服務，
                  讓生活更加井然有序，避免不必要的浪費。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">智能提醒</h3>
                    <p className="text-gray-600 text-sm">及時提醒食品過期和訂閱到期</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="text-green-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">數據分析</h3>
                    <p className="text-gray-600 text-sm">詳細的統計報告和趨勢分析</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Settings className="text-purple-600" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">個性化</h3>
                    <p className="text-gray-600 text-sm">可自定義的設定和偏好</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">版本資訊</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>智能管理平台 v1.0.0</p>
                    <p>© 2024 管理系統團隊</p>
                    <p>使用 Next.js + TypeScript 構建</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">聯絡我們</h1>
              <p className="text-gray-500 mt-1">有任何問題或建議，歡迎與我們聯繫</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">聯絡資訊</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Phone className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">客服電話</p>
                      <p className="text-gray-600">0800-123-456</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600">📧</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">電子郵件</p>
                      <p className="text-gray-600">support@management-platform.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600">🕒</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">服務時間</p>
                      <p className="text-gray-600">週一至週五 09:00-18:00</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">意見回饋</h2>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="請輸入您的姓名"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
                    <input
                      type="email"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="請輸入您的電子郵件"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">訊息內容</label>
                    <textarea
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="請輸入您的訊息或建議"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    發送訊息
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">系統設定</h1>
              <p className="text-gray-500 mt-1">個人化您的管理體驗</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* 通知設定 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600">🔔</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">通知設定</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">食品過期提醒</span>
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">訂閱到期提醒</span>
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">每日摘要</span>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 顯示設定 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600">🎨</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">顯示設定</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">主題模式</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm">淺色</button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm">深色</button>
                      <button className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm">自動</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">語言</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                      <option>繁體中文</option>
                      <option>English</option>
                      <option>日本語</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 資料管理 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600">💾</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">資料管理</h2>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                    匯出資料
                  </button>
                  <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                    匯入資料
                  </button>
                  <button className="w-full p-3 text-left bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm transition-colors">
                    清除所有資料
                  </button>
                </div>
              </div>

              {/* 備份與還原 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-orange-600">🔄</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">備份與還原</h2>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                    自動備份設定
                  </button>
                  <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                    手動建立備份
                  </button>
                  <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                    從備份還原
                  </button>
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
