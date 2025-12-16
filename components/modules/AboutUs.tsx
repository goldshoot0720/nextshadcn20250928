"use client";

import { Package, BarChart3, Info, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AboutUs() {
  return (
    <div className="space-y-4 lg:space-y-6 tablet-8-7">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">關於我們</h1>
        <p className="text-gray-500 dark:text-gray-300 mt-1">了解鋒兄Next資訊管理的使命與願景</p>
      </div>
      
      <Card className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 公司標誌與介紹 */}
          <CompanyHeader />

          {/* 團隊成員 */}
          <TeamMembers />

          {/* 服務特色 */}
          <ServiceFeatures />

          {/* 聯絡資訊 */}
          <ContactInfo />

          {/* 版權資訊 */}
          <Copyright />
        </div>
      </Card>
    </div>
  );
}

// 公司標誌與介紹
function CompanyHeader() {
  return (
    <div className="text-center mb-12">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <span className="text-white font-bold text-3xl">鋒塗</span>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">鋒兄塗哥公關資訊</h2>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
        我們是專業的公關團隊，致力於為客戶提供最優質的公關服務和智能管理解決方案。
        透過創新技術和專業服務，幫助企業和個人實現更高效的管理目標。
      </p>
    </div>
  );
}


// 團隊成員
function TeamMembers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 tablet-8-7">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">鋒</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">鋒兄</h3>
        <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">技術總監 & 創新領袖</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          專精於系統架構設計與技術創新，擁有豐富的軟體開發經驗，
          致力於打造用戶友好的智能管理解決方案。
        </p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">塗</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">塗哥</h3>
        <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">公關總監 & 策略專家</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          擅長品牌策略規劃與公關活動執行，具備敏銳的市場洞察力，
          專注於建立企業與客戶之間的良好關係。
        </p>
      </div>
    </div>
  );
}

// 服務特色
function ServiceFeatures() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-12 tablet-8-7">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="text-white" size={28} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">智能管理</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">提供全方位的智能管理解決方案，讓生活更有序</p>
      </div>
      
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="text-white" size={28} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">數據洞察</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">深度數據分析，提供精準的決策支援</p>
      </div>
      
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Info className="text-white" size={28} />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">專業服務</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">24/7 專業客服支援，確保最佳使用體驗</p>
      </div>
    </div>
  );
}


// 聯絡資訊
function ContactInfo() {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">聯絡我們</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Phone className="text-white" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">業務洽詢</p>
              <p className="text-gray-600 dark:text-gray-300">+886-2-1234-5678</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">📧</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">電子郵件</p>
              <p className="text-gray-600 dark:text-gray-300">contact@fengtuge.com</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🌐</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">官方網站</p>
              <p className="text-gray-600 dark:text-gray-300">www.fengtuge.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">📍</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">公司地址</p>
              <p className="text-gray-600 dark:text-gray-300">台北市信義區信義路五段7號</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 版權資訊
function Copyright() {
  return (
    <div className="text-center border-t border-gray-200 pt-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        <h3 className="text-2xl font-bold mb-4">鋒兄Next資訊管理</h3>
      </div>
      <div className="space-y-2 text-gray-600 dark:text-gray-300">
        <p className="text-lg font-medium">鋒兄塗哥公關資訊有限公司</p>
        <p className="flex items-center justify-center gap-2">
          <span className="text-xl">©</span>
          <span className="font-medium">2025 ～ 2125</span>
          <span>版權所有</span>
        </p>
        <p className="text-sm">Feng & Tu Public Relations Information Co., Ltd.</p>
        <p className="text-sm">All Rights Reserved</p>
      </div>
      
      <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>鋒兄Next資訊管理 v2.0.0</span>
        <span>•</span>
        <span>Next.js + TypeScript</span>
        <span>•</span>
        <span>Made with ❤️ in Taiwan</span>
      </div>
    </div>
  );
}
