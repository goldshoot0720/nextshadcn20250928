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
  totalArticles: number;
  totalCommonAccounts: number;
  totalBanks: number;
  totalBankDeposit: number;
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
    totalArticles: 0,
    totalCommonAccounts: 0,
    totalBanks: 0,
    totalBankDeposit: 0,
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
        const errors: string[] = [];
        
        // 檢查所有表是否存在
        const tablesToCheck = [
          { name: 'article', api: '/api/article', label: 'Table article' },
          { name: 'bank', api: '/api/bank', label: 'Table bank' },
          { name: 'commonaccount', api: '/api/common-account', label: 'Table commonaccount' },
          { name: 'food', api: '/api/food', label: 'Table food' },
          { name: 'image', api: '/api/image', label: 'Table image' },
          { name: 'music', api: '/api/music', label: 'Table music' },
          { name: 'subscription', api: '/api/subscription', label: 'Table subscription' },
          { name: 'video', api: '/api/video', label: 'Table video' },
        ];

        // 並行檢查所有表
        const checkPromises = tablesToCheck.map(async (table) => {
          try {
            const res = await fetch(table.api, { cache: "no-store" });
            if (res.status === 404) {
              return `${table.label} 不存在，請至「鋒兄設定」中初始化。`;
            }
            return null;
          } catch (err) {
            return null;
          }
        });

        const checkResults = await Promise.all(checkPromises);
        const tableErrors = checkResults.filter(err => err !== null) as string[];
        
        if (tableErrors.length > 0) {
          throw new Error(tableErrors.join('\n'));
        }
        
        // 獲取食品數據
        const foodsRes = await fetch("/api/food", { cache: "no-store" });
        let foods: Food[] = [];
        if (foodsRes.ok) {
          const foodsData = await foodsRes.json();
          foods = Array.isArray(foodsData) ? foodsData : [];
        }

        // 獲取訂閱數據
        const subsRes = await fetch("/api/subscription", { cache: "no-store" });
        let subscriptions: Subscription[] = [];
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          subscriptions = Array.isArray(subsData) ? subsData : [];
        }

        // 獲取筆記數據
        const articlesRes = await fetch("/api/article", { cache: "no-store" });
        let articles: any[] = [];
        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          articles = Array.isArray(articlesData) ? articlesData : [];
        }

        // 獲取常用帳號數據
        const commonAccountsRes = await fetch("/api/common-account", { cache: "no-store" });
        let commonAccounts: any[] = [];
        if (commonAccountsRes.ok) {
          const commonAccountsData = await commonAccountsRes.json();
          commonAccounts = Array.isArray(commonAccountsData) ? commonAccountsData : [];
        }

        // 獲取銀行數據
        const banksRes = await fetch("/api/bank", { cache: "no-store" });
        let banks: any[] = [];
        if (banksRes.ok) {
          const banksData = await banksRes.json();
          banks = Array.isArray(banksData) ? banksData : [];
        }

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
        
        // 計算銀行總存款
        const totalBankDeposit = banks.reduce((total, bank) => total + (bank.deposit || 0), 0);

        setStats({
          totalFoods: foodsToProcess.length,
          totalSubscriptions: subsToProcess.length,
          totalArticles: articles.length,
          totalCommonAccounts: commonAccounts.length,
          totalBanks: banks.length,
          totalBankDeposit,
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