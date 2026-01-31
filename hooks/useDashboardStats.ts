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

interface FoodDetail {
  id: string;
  name: string;
  daysRemaining: number;
  expireDate: string;
}

interface SubscriptionDetail {
  id: string;
  name: string;
  site: string;
  daysRemaining: number;
  nextDate: string;
  price: number;
}

interface DashboardStats {
  totalFoods: number;
  totalSubscriptions: number;
  foodsExpiring7Days: number;
  foodsExpiring30Days: number;
  subscriptionsExpiring3Days: number;
  subscriptionsExpiring7Days: number;
  totalMonthlyFee: number;
  totalAnnualFee: number;
  expiredFoods: number;
  overdueSubscriptions: number;
  // 詳細項目列表
  foodsExpiring7DaysList: FoodDetail[];
  foodsExpiring30DaysList: FoodDetail[];
  expiredFoodsList: FoodDetail[];
  subscriptionsExpiring3DaysList: SubscriptionDetail[];
  subscriptionsExpiring7DaysList: SubscriptionDetail[];
  overdueSubscriptionsList: SubscriptionDetail[];
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
    totalAnnualFee: 0,
    expiredFoods: 0,
    overdueSubscriptions: 0,
    foodsExpiring7DaysList: [],
    foodsExpiring30DaysList: [],
    expiredFoodsList: [],
    subscriptionsExpiring3DaysList: [],
    subscriptionsExpiring7DaysList: [],
    overdueSubscriptionsList: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setError(null);
      try {
        // 獲取食品數據
        const foodsRes = await fetch("/api/food", { cache: "no-store" });
        if (!foodsRes.ok) {
          if (foodsRes.status === 404) {
            throw new Error("Table food 不存在，請至「鋒兄設定」中初始化。");
          }
          throw new Error("獲取食品數據失敗");
        }
        const foodsData = await foodsRes.json();
        const foods: Food[] = Array.isArray(foodsData) ? foodsData : [];

        // 獲取訂閱數據
        const subsRes = await fetch("/api/subscription", { cache: "no-store" });
        if (!subsRes.ok) {
          if (subsRes.status === 404) {
            throw new Error("Table subscription 不存在，請至「鋒兄設定」中初始化。");
          }
          throw new Error("獲取訂閱數據失敗");
        }
        const subsData = await subsRes.json();
        const subscriptions: Subscription[] = Array.isArray(subsData) ? subsData : [];

        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

        // 計算食品統計和詳細列表
        const foodsToProcess = Array.isArray(foods) ? foods : [];
        const foodsExpiring7DaysList: FoodDetail[] = foodsToProcess
          .filter(food => {
            const expireDate = new Date(food.todate);
            return expireDate <= sevenDaysFromNow && expireDate >= today;
          })
          .map(food => {
            const expireDate = new Date(food.todate);
            const daysRemaining = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: food.$id,
              name: food.name,
              daysRemaining,
              expireDate: food.todate
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        const foodsExpiring30DaysList: FoodDetail[] = foodsToProcess
          .filter(food => {
            const expireDate = new Date(food.todate);
            return expireDate <= thirtyDaysFromNow && expireDate >= today;
          })
          .map(food => {
            const expireDate = new Date(food.todate);
            const daysRemaining = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: food.$id,
              name: food.name,
              daysRemaining,
              expireDate: food.todate
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        const expiredFoodsList: FoodDetail[] = foodsToProcess
          .filter(food => {
            const expireDate = new Date(food.todate);
            return expireDate < today;
          })
          .map(food => {
            const expireDate = new Date(food.todate);
            const daysRemaining = Math.floor((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: food.$id,
              name: food.name,
              daysRemaining,
              expireDate: food.todate
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        // 計算訂閱統計和詳細列表
        const subsToProcess = Array.isArray(subscriptions) ? subscriptions : [];
        const subscriptionsExpiring3DaysList: SubscriptionDetail[] = subsToProcess
          .filter(sub => {
            const nextDate = new Date(sub.nextdate);
            return nextDate <= threeDaysFromNow && nextDate >= today;
          })
          .map(sub => {
            const nextDate = new Date(sub.nextdate);
            const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: sub.$id,
              name: sub.name,
              site: sub.site,
              daysRemaining,
              nextDate: sub.nextdate,
              price: sub.price
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        const subscriptionsExpiring7DaysList: SubscriptionDetail[] = subsToProcess
          .filter(sub => {
            const nextDate = new Date(sub.nextdate);
            return nextDate <= sevenDaysFromNow && nextDate >= today;
          })
          .map(sub => {
            const nextDate = new Date(sub.nextdate);
            const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: sub.$id,
              name: sub.name,
              site: sub.site,
              daysRemaining,
              nextDate: sub.nextdate,
              price: sub.price
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        const overdueSubscriptionsList: SubscriptionDetail[] = subsToProcess
          .filter(sub => {
            const nextDate = new Date(sub.nextdate);
            return nextDate < today;
          })
          .map(sub => {
            const nextDate = new Date(sub.nextdate);
            const daysRemaining = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: sub.$id,
              name: sub.name,
              site: sub.site,
              daysRemaining,
              nextDate: sub.nextdate,
              price: sub.price
            };
          })
          .sort((a, b) => a.daysRemaining - b.daysRemaining);

        const totalMonthlyFee = subsToProcess.reduce((total, sub) => total + sub.price, 0);
        
        // 計算年費總計 (所有訂閱服務費用總和)
        const totalAnnualFee = subsToProcess.reduce((total, sub) => total + sub.price, 0);

        setStats({
          totalFoods: foodsToProcess.length,
          totalSubscriptions: subsToProcess.length,
          foodsExpiring7Days: foodsExpiring7DaysList.length,
          foodsExpiring30Days: foodsExpiring30DaysList.length,
          subscriptionsExpiring3Days: subscriptionsExpiring3DaysList.length,
          subscriptionsExpiring7Days: subscriptionsExpiring7DaysList.length,
          totalMonthlyFee,
          totalAnnualFee,
          expiredFoods: expiredFoodsList.length,
          overdueSubscriptions: overdueSubscriptionsList.length,
          foodsExpiring7DaysList,
          foodsExpiring30DaysList,
          expiredFoodsList,
          subscriptionsExpiring3DaysList,
          subscriptionsExpiring7DaysList,
          overdueSubscriptionsList,
        });
      } catch (error) {
        console.error("獲取統計數據失敗:", error);
        setError(error instanceof Error ? error.message : "獲取統計數據失敗");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    
    // 每分鐘更新一次數據
    const interval = setInterval(fetchStats, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}