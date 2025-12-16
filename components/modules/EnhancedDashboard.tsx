"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Package, CreditCard, AlertTriangle, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface EnhancedDashboardProps {
  onNavigate: (moduleId: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">載入統計數據中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 tablet-8-7">
      {/* 標題區域 */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">儀表板</h1>
        <p className="text-gray-500 mt-1">鋒兄Next資訊管理 - 數據匯總與分析</p>
      </div>

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 tablet-8-7">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">食品項目</p>
              <p className="text-2xl font-bold">{stats.totalFoods}</p>
            </div>
            <Package size={32} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg shadow-green-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">訂閱服務</p>
              <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
            </div>
            <CreditCard size={32} className="text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white shadow-lg shadow-yellow-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">需要關注</p>
              <p className="text-2xl font-bold">{stats.foodsExpiring7Days + stats.subscriptionsExpiring3Days}</p>
            </div>
            <AlertTriangle size={32} className="text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">月費總計</p>
              <p className="text-2xl font-bold">NT$ {stats.totalMonthlyFee.toLocaleString()}</p>
            </div>
            <DollarSign size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* 詳細統計區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 食品管理統計 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">食品管理統計</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">正常食品</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.totalFoods - stats.foodsExpiring30Days - stats.expiredFoods}
              </span>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">7天內過期</span>
                </div>
                <span className="font-semibold text-yellow-700">{stats.foodsExpiring7Days}</span>
              </div>
              {stats.foodsExpiring7DaysList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.foodsExpiring7DaysList.slice(0, 3).map((food) => (
                    <div key={food.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{food.name}</span>
                      <span className="text-yellow-600 font-medium">
                        {food.daysRemaining === 0 ? '今天' : `${food.daysRemaining}天`}
                      </span>
                    </div>
                  ))}
                  {stats.foodsExpiring7DaysList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.foodsExpiring7DaysList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">30天內過期</span>
                </div>
                <span className="font-semibold text-orange-700">{stats.foodsExpiring30Days}</span>
              </div>
              {stats.foodsExpiring30DaysList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.foodsExpiring30DaysList.slice(0, 3).map((food) => (
                    <div key={food.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{food.name}</span>
                      <span className="text-orange-600 font-medium">{food.daysRemaining}天</span>
                    </div>
                  ))}
                  {stats.foodsExpiring30DaysList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.foodsExpiring30DaysList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-red-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">已過期</span>
                </div>
                <span className="font-semibold text-red-700">{stats.expiredFoods}</span>
              </div>
              {stats.expiredFoodsList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.expiredFoodsList.slice(0, 3).map((food) => (
                    <div key={food.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{food.name}</span>
                      <span className="text-red-600 font-medium">
                        {Math.abs(food.daysRemaining)}天前
                      </span>
                    </div>
                  ))}
                  {stats.expiredFoodsList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.expiredFoodsList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onNavigate("food")}
            className="w-full mt-4 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
          >
            前往食品管理
          </button>
        </div>

        {/* 訂閱管理統計 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-green-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">訂閱管理統計</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">正常訂閱</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.totalSubscriptions - stats.subscriptionsExpiring7Days - stats.overdueSubscriptions}
              </span>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">3天內到期</span>
                </div>
                <span className="font-semibold text-yellow-700">{stats.subscriptionsExpiring3Days}</span>
              </div>
              {stats.subscriptionsExpiring3DaysList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.subscriptionsExpiring3DaysList.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{sub.name}</span>
                      <span className="text-yellow-600 font-medium">
                        {sub.daysRemaining === 0 ? '今天' : `${sub.daysRemaining}天`}
                      </span>
                    </div>
                  ))}
                  {stats.subscriptionsExpiring3DaysList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.subscriptionsExpiring3DaysList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">7天內到期</span>
                </div>
                <span className="font-semibold text-orange-700">{stats.subscriptionsExpiring7Days}</span>
              </div>
              {stats.subscriptionsExpiring7DaysList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.subscriptionsExpiring7DaysList.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{sub.name}</span>
                      <span className="text-orange-600 font-medium">{sub.daysRemaining}天</span>
                    </div>
                  ))}
                  {stats.subscriptionsExpiring7DaysList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.subscriptionsExpiring7DaysList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-red-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">已逾期</span>
                </div>
                <span className="font-semibold text-red-700">{stats.overdueSubscriptions}</span>
              </div>
              {stats.overdueSubscriptionsList.length > 0 && (
                <div className="space-y-1 mt-2">
                  {stats.overdueSubscriptionsList.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 truncate flex-1 mr-2">{sub.name}</span>
                      <span className="text-red-600 font-medium">
                        {Math.abs(sub.daysRemaining)}天前
                      </span>
                    </div>
                  ))}
                  {stats.overdueSubscriptionsList.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      還有 {stats.overdueSubscriptionsList.length - 3} 項...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onNavigate("subscription")}
            className="w-full mt-4 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
          >
            前往訂閱管理
          </button>
        </div>
      </div>

      {/* 快速操作區域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 tablet-8-7">
          <button
            onClick={() => onNavigate("food")}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 text-left"
          >
            <Package className="text-blue-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">新增食品</h3>
            <p className="text-sm text-gray-500">快速添加食品項目</p>
          </button>
          
          <button
            onClick={() => onNavigate("subscription")}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 text-left"
          >
            <CreditCard className="text-green-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">新增訂閱</h3>
            <p className="text-sm text-gray-500">管理訂閱服務</p>
          </button>
          
          <button
            onClick={() => onNavigate("food")}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors duration-200 text-left"
          >
            <AlertTriangle className="text-yellow-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">檢查過期</h3>
            <p className="text-sm text-gray-500">查看即將過期項目</p>
          </button>
          
          <button
            onClick={() => onNavigate("settings")}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200 text-left"
          >
            <TrendingUp className="text-purple-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900">查看報告</h3>
            <p className="text-sm text-gray-500">詳細統計報告</p>
          </button>
        </div>
      </div>

      {/* 提醒和建議 */}
      {(stats.foodsExpiring7Days > 0 || stats.subscriptionsExpiring3Days > 0 || stats.expiredFoods > 0 || stats.overdueSubscriptions > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-lg font-semibold text-red-900">需要注意</h2>
          </div>
          
          <div className="space-y-2">
            {stats.expiredFoods > 0 && (
              <p className="text-red-700">
                ⚠️ 有 {stats.expiredFoods} 項食品已過期，建議立即處理
              </p>
            )}
            {stats.foodsExpiring7Days > 0 && (
              <p className="text-orange-700">
                📅 有 {stats.foodsExpiring7Days} 項食品將在7天內過期
              </p>
            )}
            {stats.overdueSubscriptions > 0 && (
              <p className="text-red-700">
                💳 有 {stats.overdueSubscriptions} 項訂閱已逾期付款
              </p>
            )}
            {stats.subscriptionsExpiring3Days > 0 && (
              <p className="text-orange-700">
                🔔 有 {stats.subscriptionsExpiring3Days} 項訂閱將在3天內到期
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}