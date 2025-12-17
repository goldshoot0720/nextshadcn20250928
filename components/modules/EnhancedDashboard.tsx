"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Package, CreditCard, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { DataCard } from "@/components/ui/data-card";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { StatusDot } from "@/components/ui/status-badge";
import { PageTitle } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDaysRemaining } from "@/lib/formatters";
import { FoodDetail, SubscriptionDetail } from "@/types";

interface EnhancedDashboardProps {
  onNavigate: (moduleId: string) => void;
}

export default function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const { stats, loading } = useDashboardStats();

  if (loading) return <FullPageLoading text="載入統計數據中..." />;

  const needsAttention = stats.foodsExpiring7Days > 0 || stats.subscriptionsExpiring3Days > 0 || stats.expiredFoods > 0 || stats.overdueSubscriptions > 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageTitle title="儀表板" description="鋒兄Next資訊管理 - 數據匯總與分析" />

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="食品項目" value={stats.totalFoods} icon={Package} gradient="from-blue-500 to-blue-600" />
        <StatCard title="訂閱服務" value={stats.totalSubscriptions} icon={CreditCard} gradient="from-green-500 to-green-600" />
        <StatCard title="需要關注" value={stats.foodsExpiring7Days + stats.subscriptionsExpiring3Days} icon={AlertTriangle} gradient="from-yellow-500 to-orange-500" />
        <StatCard title="月費總計" value={formatCurrency(stats.totalMonthlyFee)} icon={DollarSign} gradient="from-purple-500 to-purple-600" />
      </div>

      {/* 詳細統計區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <FoodStatsCard stats={stats} onNavigate={onNavigate} />
        <SubscriptionStatsCard stats={stats} onNavigate={onNavigate} />
      </div>

      {/* 快速操作區域 */}
      <QuickActions onNavigate={onNavigate} />

      {/* 提醒和建議 */}
      {needsAttention && <AlertSection stats={stats} />}
    </div>
  );
}

// 食品統計卡片
function FoodStatsCard({ stats, onNavigate }: { stats: ReturnType<typeof useDashboardStats>["stats"]; onNavigate: (id: string) => void }) {
  return (
    <DataCard className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Package className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">食品管理統計</h2>
      </div>
      
      <div className="space-y-3">
        <StatRow label="正常食品" value={stats.totalFoods - stats.foodsExpiring30Days - stats.expiredFoods} status="success" />
        <DetailStatRow label="7天內過期" value={stats.foodsExpiring7Days} status="warning" items={stats.foodsExpiring7DaysList} bgColor="bg-yellow-50 dark:bg-yellow-900/20" />
        <DetailStatRow label="30天內過期" value={stats.foodsExpiring30Days} status="urgent" items={stats.foodsExpiring30DaysList} bgColor="bg-orange-50 dark:bg-orange-900/20" />
        <DetailStatRow label="已過期" value={stats.expiredFoods} status="expired" items={stats.expiredFoodsList} bgColor="bg-red-50 dark:bg-red-900/20" isExpired />
      </div>
      
      <Button onClick={() => onNavigate("food")} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 rounded-xl">
        前往食品管理
      </Button>
    </DataCard>
  );
}

// 訂閱統計卡片
function SubscriptionStatsCard({ stats, onNavigate }: { stats: ReturnType<typeof useDashboardStats>["stats"]; onNavigate: (id: string) => void }) {
  return (
    <DataCard className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <CreditCard className="text-green-600 dark:text-green-400" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">訂閱管理統計</h2>
      </div>
      
      <div className="space-y-3">
        <StatRow label="正常訂閱" value={stats.totalSubscriptions - stats.subscriptionsExpiring7Days - stats.overdueSubscriptions} status="success" />
        <DetailStatRowSub label="3天內到期" value={stats.subscriptionsExpiring3Days} status="warning" items={stats.subscriptionsExpiring3DaysList} bgColor="bg-yellow-50 dark:bg-yellow-900/20" />
        <DetailStatRowSub label="7天內到期" value={stats.subscriptionsExpiring7Days} status="urgent" items={stats.subscriptionsExpiring7DaysList} bgColor="bg-orange-50 dark:bg-orange-900/20" />
        <DetailStatRowSub label="已逾期" value={stats.overdueSubscriptions} status="expired" items={stats.overdueSubscriptionsList} bgColor="bg-red-50 dark:bg-red-900/20" isExpired />
      </div>
      
      <Button onClick={() => onNavigate("subscription")} className="w-full mt-4 bg-green-500 hover:bg-green-600 rounded-xl">
        前往訂閱管理
      </Button>
    </DataCard>
  );
}

// 統計行
function StatRow({ label, value, status }: { label: string; value: number; status: "success" | "warning" | "urgent" | "expired" }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-center gap-3">
        <StatusDot status={status} />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

// 詳細統計行 (食品)
function DetailStatRow({ label, value, status, items, bgColor, isExpired = false }: { label: string; value: number; status: "warning" | "urgent" | "expired"; items: FoodDetail[]; bgColor: string; isExpired?: boolean }) {
  const textColor = status === "expired" ? "text-red-700 dark:text-red-400" : status === "urgent" ? "text-orange-700 dark:text-orange-400" : "text-yellow-700 dark:text-yellow-400";
  
  return (
    <div className={`p-3 ${bgColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <StatusDot status={status} />
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className={`font-semibold ${textColor}`}>{value}</span>
      </div>
      {items.length > 0 && (
        <div className="space-y-1 mt-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">{item.name}</span>
              <span className={`font-medium ${textColor}`}>
                {isExpired ? `${Math.abs(item.daysRemaining)}天前` : formatDaysRemaining(item.daysRemaining)}
              </span>
            </div>
          ))}
          {items.length > 3 && <div className="text-xs text-gray-500 text-center">還有 {items.length - 3} 項...</div>}
        </div>
      )}
    </div>
  );
}

// 詳細統計行 (訂閱)
function DetailStatRowSub({ label, value, status, items, bgColor, isExpired = false }: { label: string; value: number; status: "warning" | "urgent" | "expired"; items: SubscriptionDetail[]; bgColor: string; isExpired?: boolean }) {
  const textColor = status === "expired" ? "text-red-700 dark:text-red-400" : status === "urgent" ? "text-orange-700 dark:text-orange-400" : "text-yellow-700 dark:text-yellow-400";
  
  return (
    <div className={`p-3 ${bgColor} rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <StatusDot status={status} />
          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className={`font-semibold ${textColor}`}>{value}</span>
      </div>
      {items.length > 0 && (
        <div className="space-y-1 mt-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">{item.name}</span>
              <span className={`font-medium ${textColor}`}>
                {isExpired ? `${Math.abs(item.daysRemaining)}天前` : formatDaysRemaining(item.daysRemaining)}
              </span>
            </div>
          ))}
          {items.length > 3 && <div className="text-xs text-gray-500 text-center">還有 {items.length - 3} 項...</div>}
        </div>
      )}
    </div>
  );
}

// 快速操作
function QuickActions({ onNavigate }: { onNavigate: (id: string) => void }) {
  const actions = [
    { id: "food", icon: Package, title: "新增食品", desc: "快速添加食品項目", color: "blue" },
    { id: "subscription", icon: CreditCard, title: "新增訂閱", desc: "管理訂閱服務", color: "green" },
    { id: "food", icon: AlertTriangle, title: "檢查過期", desc: "查看即將過期項目", color: "yellow" },
    { id: "settings", icon: TrendingUp, title: "查看報告", desc: "詳細統計報告", color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    green: "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30",
    yellow: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30",
    purple: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <DataCard className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">快速操作</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <button key={action.title} onClick={() => onNavigate(action.id)} className={`p-4 ${colorMap[action.color]} rounded-xl transition-colors duration-200 text-left`}>
            <action.icon className={`${iconColorMap[action.color]} mb-2`} size={24} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{action.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
          </button>
        ))}
      </div>
    </DataCard>
  );
}

// 警告區塊
function AlertSection({ stats }: { stats: ReturnType<typeof useDashboardStats>["stats"] }) {
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">需要注意</h2>
      </div>
      <div className="space-y-2 text-sm">
        {stats.expiredFoods > 0 && <p className="text-red-700 dark:text-red-300">⚠️ 有 {stats.expiredFoods} 項食品已過期，建議立即處理</p>}
        {stats.foodsExpiring7Days > 0 && <p className="text-orange-700 dark:text-orange-300">📅 有 {stats.foodsExpiring7Days} 項食品將在7天內過期</p>}
        {stats.overdueSubscriptions > 0 && <p className="text-red-700 dark:text-red-300">💳 有 {stats.overdueSubscriptions} 項訂閱已逾期付款</p>}
        {stats.subscriptionsExpiring3Days > 0 && <p className="text-orange-700 dark:text-orange-300">🔔 有 {stats.subscriptionsExpiring3Days} 項訂閱將在3天內到期</p>}
      </div>
    </div>
  );
}
