"use client";

import { useState, useEffect, useCallback } from "react";
import { Subscription, SubscriptionFormData } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDate, getDaysFromToday, getExpiryStatus, convertToTWD } from "@/lib/formatters";

// 全域快取，儲存於模組外層
let cachedSubscriptions: Subscription[] | null = null;
let cacheTimestamp: number = 0;

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRefreshKey = () => {
    if (typeof window === 'undefined') return '';
    // 檢查是否有 Appwrite 帳號切換
    const accountSwitched = localStorage.getItem('appwrite_account_switched');
    if (accountSwitched) {
      return accountSwitched; // 強制重新載入
    }
    return localStorage.getItem('subscriptions_refresh_key') || '';
  };

  const setRefreshKey = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('subscriptions_refresh_key', Date.now().toString());
  };

  // 載入訂閱資料（使用快取）
  const loadSubscriptions = useCallback(async (forceRefresh = false) => {
    const storedRefreshKey = getRefreshKey();
    const accountSwitched = typeof window !== 'undefined' ? localStorage.getItem('appwrite_account_switched') : null;
    
    console.log('[useSubscriptions] loadSubscriptions 被呼叫', {
      forceRefresh,
      storedRefreshKey,
      accountSwitched,
      cacheTimestamp,
      hasCachedData: !!cachedSubscriptions
    });
      
    // 如果切換了帳號，清除快取並強制重新載入
    if (accountSwitched && cacheTimestamp < parseInt(accountSwitched)) {
      console.log('[useSubscriptions] 偵測到帳號切換，清除快取');
      cachedSubscriptions = null;
      cacheTimestamp = 0;
      forceRefresh = true;
    }
      
    // 如果有 refresh key ，也要強制重新載入
    if (storedRefreshKey && cacheTimestamp < parseInt(storedRefreshKey)) {
      console.log('[useSubscriptions] 偵測到 refresh key 更新，清除快取');
      cachedSubscriptions = null;
      cacheTimestamp = 0;
      forceRefresh = true;
    }
      
    // 如果有快取且沒有 CRUD 操作，直接使用快取
    if (!forceRefresh && cachedSubscriptions) {
      console.log('[useSubscriptions] 使用快变資料');
      setSubscriptions(cachedSubscriptions);
      setLoading(false);
      return cachedSubscriptions;
    }

    console.log('[useSubscriptions] 從 API 載入資料');
    setLoading(true);
    setError(null);
    try {
      // 如果是強制重新載入或有 refreshKey，添加時間戳破壞快取
      const cacheParam = (forceRefresh || storedRefreshKey) ? `?t=${storedRefreshKey || Date.now()}` : '';
      const res = await fetch(API_ENDPOINTS.SUBSCRIPTION + cacheParam);
      if (!res.ok) {
        if (res.status === 404) {
          // 檢查是否真的是 collection not found
          const errorData = await res.json().catch(() => ({}));
          if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
            throw new Error("Table subscription 不存在，請至「鋒兄設定」中初始化。");
          }
        }
        throw new Error("載入訂閱資料失敗");
      }

      const resData = await res.json();
      let data: Subscription[] = Array.isArray(resData) ? resData : [];
      // 按下次付款日排序
      data = data.sort(
        (a, b) => {
          if (!a.nextdate) return 1;
          if (!b.nextdate) return -1;
          return new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime();
        }
      );
      
      // 更新快取
      cachedSubscriptions = data;
      cacheTimestamp = Date.now();
      
      setSubscriptions(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入訂閱資料失敗";
      setError(message);
      console.error("載入訂閱資料失敗:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 新增訂閱
  const createSubscription = useCallback(async (formData: SubscriptionFormData): Promise<Subscription | null> => {
    try {
      const res = await fetch(API_ENDPOINTS.SUBSCRIPTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("新增失敗");
      
      const newSub: Subscription = await res.json();
      setSubscriptions((prev) => {
        const updated = [...prev, newSub];
        return updated.sort(
          (a, b) => new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
        );
      });
      // CRUD 操作後重新載入
      cachedSubscriptions = null; // 清空快取
      setRefreshKey();
      return newSub;
    } catch (err) {
      console.error("新增訂閱失敗:", err);
      throw err;
    }
  }, []);

  // 更新訂閱
  const updateSubscription = useCallback(async (id: string, formData: SubscriptionFormData): Promise<Subscription | null> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.SUBSCRIPTION}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("更新失敗");
      
      const updatedSub: Subscription = await res.json();
      setSubscriptions((prev) => {
        const updated = prev.map((s) => (s.$id === id ? updatedSub : s));
        return updated.sort(
          (a, b) => new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
        );
      });
      // CRUD 操作後重新載入
      cachedSubscriptions = null; // 清空快取
      setRefreshKey();
      return updatedSub;
    } catch (err) {
      console.error("更新訂閱失敗:", err);
      throw err;
    }
  }, []);

  // 刪除訂閱
  const deleteSubscription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.SUBSCRIPTION}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      
      setSubscriptions((prev) => prev.filter((s) => s.$id !== id));
      // CRUD 操作後重新載入
      cachedSubscriptions = null; // 清空快取
      setRefreshKey();
      return true;
    } catch (err) {
      console.error("刪除訂閱失敗:", err);
      throw err;
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // 計算統計資料
  const stats = (() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const subsToProcess = Array.isArray(subscriptions) ? subscriptions : [];
    
    // 計算本月需要付款的訂閱（只計算有 nextdate 的）
    const currentMonthSubscriptions = subsToProcess.filter(s => {
      if (!s.nextdate) return false;
      const nextDate = new Date(s.nextdate);
      return nextDate.getFullYear() === currentYear && nextDate.getMonth() === currentMonth;
    });
    
    // 計算下月需要付款的訂閱（只計算有 nextdate 的）
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonthSubscriptions = subsToProcess.filter(s => {
      if (!s.nextdate) return false;
      const nextDate = new Date(s.nextdate);
      return nextDate.getFullYear() === nextMonthYear && nextDate.getMonth() === nextMonth;
    });
    
    return {
      total: subsToProcess.length,
      totalMonthlyFee: currentMonthSubscriptions.reduce((sum, s) => sum + convertToTWD(s.price, s.currency), 0),
      nextMonthFee: nextMonthSubscriptions.reduce((sum, s) => sum + convertToTWD(s.price, s.currency), 0),
      overdue: subsToProcess.filter((s) => s.nextdate && getDaysFromToday(s.nextdate) < 0).length,
      expiringSoon: subsToProcess.filter((s) => {
        if (!s.nextdate) return false;
        const days = getDaysFromToday(s.nextdate);
        return days >= 0 && days <= 7;
      }).length,
    };
  })();

  return {
    subscriptions,
    loading,
    error,
    stats,
    loadSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  };
}

// 訂閱項目的輔助函數
export function getSubscriptionExpiryInfo(subscription: Subscription) {
  // 如果沒有下次付款日期，返回預設值
  if (!subscription.nextdate) {
    return {
      daysRemaining: Infinity,
      status: "normal" as const,
      formattedDate: "",
      isOverdue: false,
      isUpcoming: false,
    };
  }
  
  const daysRemaining = getDaysFromToday(subscription.nextdate);
  const status = getExpiryStatus(daysRemaining);
  const formattedDate = formatDate(subscription.nextdate);
  
  return {
    daysRemaining,
    status,
    formattedDate,
    isOverdue: daysRemaining < 0,
    isUpcoming: daysRemaining >= 0 && daysRemaining <= 7,
  };
}
