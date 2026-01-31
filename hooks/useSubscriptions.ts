"use client";

import { useState, useEffect, useCallback } from "react";
import { Subscription, SubscriptionFormData } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDate, getDaysFromToday, getExpiryStatus } from "@/lib/formatters";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入訂閱資料
  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.SUBSCRIPTION, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Table subscription 不存在，請至「鋒兄設定」中初始化。");
        }
        throw new Error("載入訂閱資料失敗");
      }

      const resData = await res.json();
      let data: Subscription[] = Array.isArray(resData) ? resData : [];
      // 按下次付款日排序
      data = data.sort(
        (a, b) => new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
      );
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
    
    // 計算本月需要付款的訂閱
    const currentMonthSubscriptions = subsToProcess.filter(s => {
      const nextDate = new Date(s.nextdate);
      return nextDate.getFullYear() === currentYear && nextDate.getMonth() === currentMonth;
    });
    
    // 計算下月需要付款的訂閱
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextMonthSubscriptions = subsToProcess.filter(s => {
      const nextDate = new Date(s.nextdate);
      return nextDate.getFullYear() === nextMonthYear && nextDate.getMonth() === nextMonth;
    });
    
    return {
      total: subsToProcess.length,
      totalMonthlyFee: currentMonthSubscriptions.reduce((sum, s) => sum + s.price, 0),
      nextMonthFee: nextMonthSubscriptions.reduce((sum, s) => sum + s.price, 0),
      overdue: subsToProcess.filter((s) => getDaysFromToday(s.nextdate) < 0).length,
      expiringSoon: subsToProcess.filter((s) => {
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
