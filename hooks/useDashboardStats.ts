"use client";

import { useState, useEffect } from "react";

interface Food {
  $id: string;
  name: string;
  amount: number;
  todate: string;
  photo: string;
}

interface Subscription {
  $id: string;
  name: string;
  site: string;
  price: number;
  nextdate: string;
}

interface DashboardStats {
  totalFoods: number;
  totalSubscriptions: number;
  foodsExpiring7Days: number;
  foodsExpiring30Days: number;
  subscriptionsExpiring3Days: number;
  subscriptionsExpiring7Days: number;
  totalMonthlyFee: number;
  expiredFoods: number;
  overdueSubscriptions: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFoods: 0,
    totalSubscriptions: 0,
    foodsExpiring7Days: 0,
    foodsExpiring30Days: 0,
    subscriptionsExpiring3Days: 0,
    subscriptionsExpiring7Days: 0,
    totalMonthlyFee: 0,
    expiredFoods: 0,
    overdueSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 獲取食品數據
        const foodsRes = await fetch("/api/food", { cache: "no-store" });
        const foods: Food[] = await foodsRes.json();

        // 獲取訂閱數據
        const subsRes = await fetch("/api/subscription", { cache: "no-store" });
        const subscriptions: Subscription[] = await subsRes.json();

        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

        // 計算食品統計
        const foodsExpiring7Days = foods.filter(food => {
          const expireDate = new Date(food.todate);
          return expireDate <= sevenDaysFromNow && expireDate >= today;
        }).length;

        const foodsExpiring30Days = foods.filter(food => {
          const expireDate = new Date(food.todate);
          return expireDate <= thirtyDaysFromNow && expireDate >= today;
        }).length;

        const expiredFoods = foods.filter(food => {
          const expireDate = new Date(food.todate);
          return expireDate < today;
        }).length;

        // 計算訂閱統計
        const subscriptionsExpiring3Days = subscriptions.filter(sub => {
          const nextDate = new Date(sub.nextdate);
          return nextDate <= threeDaysFromNow && nextDate >= today;
        }).length;

        const subscriptionsExpiring7Days = subscriptions.filter(sub => {
          const nextDate = new Date(sub.nextdate);
          return nextDate <= sevenDaysFromNow && nextDate >= today;
        }).length;

        const overdueSubscriptions = subscriptions.filter(sub => {
          const nextDate = new Date(sub.nextdate);
          return nextDate < today;
        }).length;

        const totalMonthlyFee = subscriptions.reduce((total, sub) => total + sub.price, 0);

        setStats({
          totalFoods: foods.length,
          totalSubscriptions: subscriptions.length,
          foodsExpiring7Days,
          foodsExpiring30Days,
          subscriptionsExpiring3Days,
          subscriptionsExpiring7Days,
          totalMonthlyFee,
          expiredFoods,
          overdueSubscriptions,
        });
      } catch (error) {
        console.error("獲取統計數據失敗:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    
    // 每分鐘更新一次數據
    const interval = setInterval(fetchStats, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}