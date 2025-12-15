"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import EnhancedDashboard from "@/components/modules/EnhancedDashboard";
import VideoIntroduction from "@/components/modules/VideoIntroduction";
// 移除靜態圖片導入，改回使用 API
import { Package, CreditCard, Home, BarChart3, Info, Play, Image as ImageIcon, Download, Eye, Calendar, Phone } from "lucide-react";

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("home");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // 載入圖片列表
  useEffect(() => {
    if (currentModule === "home") {
      loadImagesData();
    }
  }, [currentModule]);

  const loadImagesData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/images");
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error("載入圖片失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
            {/* 標題區域 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">圖片展示</h1>
                <p className="text-gray-500 mt-1">
                  {loading ? "載入中..." : `共 ${images.length} 張圖片`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadImagesData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  <ImageIcon size={18} />
                  重新載入
                </button>
              </div>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-blue-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs lg:text-sm">總圖片數</p>
                    <p className="text-xl lg:text-2xl font-bold">{images.length}</p>
                  </div>
                  <ImageIcon size={24} className="text-blue-200 lg:w-8 lg:h-8" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-green-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs lg:text-sm">JPG/JPEG</p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {images.filter(img => ['.jpg', '.jpeg'].includes(img.extension)).length}
                    </p>
                  </div>
                  <div className="text-green-200 text-xl lg:text-2xl">📷</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-purple-500/25">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs lg:text-sm">PNG</p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {images.filter(img => img.extension === '.png').length}
                    </p>
                  </div>
                  <div className="text-purple-200 text-xl lg:text-2xl">🖼️</div>
                </div>
              </div>
            </div>

            {/* 圖片網格 */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">載入圖片中...</p>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500">沒有找到圖片</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                {/* 響應式圖片網格 */}
                <div className="grid gap-3 sm:gap-4 lg:gap-6 
                  grid-cols-2 
                  sm:grid-cols-3 
                  md:grid-cols-4 
                  lg:grid-cols-5 
                  xl:grid-cols-6 
                  2xl:grid-cols-8">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200"
                    >
                      {/* 響應式圖片容器 */}
                      <div className="relative overflow-hidden rounded-t-xl aspect-square">
                        <img
                          src={image.path}
                          alt={image.name}
                          className="w-full h-full object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onClick={() => setSelectedImage(image)}
                        />
                        
                        {/* 漸變遮罩 - 提升按鈕可見性 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        
                        {/* 操作按鈕 - 響應式尺寸 */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(image);
                              }}
                              className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-sm rounded-lg hover:bg-black/90 transition-colors touch-manipulation"
                              title="查看大圖"
                            >
                              <Eye className="text-white" size={12} />
                            </button>
                            <a
                              href={image.path}
                              download={image.name}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-sm rounded-lg hover:bg-black/90 transition-colors touch-manipulation"
                              title="下載圖片"
                            >
                              <Download className="text-white" size={12} />
                            </a>
                          </div>
                        </div>
                        
                        {/* 圖片格式標籤 */}
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-medium">
                            {image.extension.replace('.', '').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* 響應式圖片資訊 */}
                      <div className="p-2 sm:p-3 bg-white">
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate mb-1" title={image.name}>
                          {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{formatFileSize(image.size)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span className="hidden sm:inline">
                              {new Date(image.modified).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="sm:hidden">
                              {new Date(image.modified).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 響應式圖片預覽模態框 */}
            {selectedImage && (
              <div 
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                onClick={() => setSelectedImage(null)}
              >
                <div className="relative w-full h-full max-w-6xl max-h-full flex flex-col">
                  {/* 圖片容器 */}
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <img
                      src={selectedImage.path}
                      alt={selectedImage.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* 頂部控制欄 */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                        {selectedImage.extension.replace('.', '').toUpperCase()}
                      </span>
                      <span className="hidden sm:inline px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm">
                        {formatFileSize(selectedImage.size)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedImage.path}
                        download={selectedImage.name}
                        className="p-2 sm:p-3 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-colors touch-manipulation"
                        title="下載圖片"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="p-2 sm:p-3 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-colors touch-manipulation"
                        title="關閉"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 底部資訊欄 */}
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-white">
                      <h3 className="font-medium mb-2 text-sm sm:text-base truncate" title={selectedImage.name}>
                        {selectedImage.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <span className="opacity-75">大小:</span>
                          <span className="font-medium">{formatFileSize(selectedImage.size)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span className="opacity-75">修改:</span>
                          <span className="font-medium">{formatDate(selectedImage.modified)}</span>
                        </span>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                          <span className="text-xs opacity-75">點擊空白處關閉</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
