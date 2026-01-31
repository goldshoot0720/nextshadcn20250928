"use client";

import { useState, useEffect, useCallback } from "react";
import { Food, FoodFormData } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDate, getDaysFromToday, getExpiryStatus } from "@/lib/formatters";
import { fetchApi } from "@/hooks/useApi";

// 全域快取
let cachedFoods: Food[] | null = null;
let cacheTimestamp: number = 0;

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從localStorage 讀取上次 CRUD 的時間戳
  const getRefreshKey = () => {
    if (typeof window === 'undefined') return '';
    const accountSwitched = localStorage.getItem('appwrite_account_switched');
    if (accountSwitched) return accountSwitched;
    return localStorage.getItem('foods_refresh_key') || '';
  };

  const setRefreshKey = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('foods_refresh_key', Date.now().toString());
  };

  // 載入食品資料（使用快取）
  const loadFoods = useCallback(async (forceRefresh = false) => {
    const storedRefreshKey = getRefreshKey();
    const accountSwitched = typeof window !== 'undefined' ? localStorage.getItem('appwrite_account_switched') : null;
      
    if (accountSwitched && cacheTimestamp < parseInt(accountSwitched)) {
      cachedFoods = null;
      forceRefresh = true;
    }
      
    // 如果有快取且沒有 CRUD 操作，直接使用快取
    if (!forceRefresh && cachedFoods && (!storedRefreshKey || cacheTimestamp >= parseInt(storedRefreshKey))) {
      setFoods(cachedFoods);
      setLoading(false);
      return cachedFoods;
    }

    setLoading(true);
    setError(null);
    try {
      const cacheParam = (forceRefresh || storedRefreshKey) ? `?t=${storedRefreshKey || Date.now()}` : '';
      const resData = await fetchApi<Food[]>(API_ENDPOINTS.FOOD + cacheParam);
      let data: Food[] = Array.isArray(resData) ? resData : [];
      // 按到期日排序
      data = data.sort(
        (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
      );
      
      // 更新快取
      cachedFoods = data;
      cacheTimestamp = Date.now();
      
      setFoods(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入食品資料失敗";
      setError(message);
      console.error("載入食品資料失敗:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 新增食品
  const createFood = useCallback(async (formData: FoodFormData): Promise<Food | null> => {
    try {
      const res = await fetch(API_ENDPOINTS.FOOD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("新增失敗");
      
      const newFood: Food = await res.json();
      setFoods((prev) => {
        const updated = [...prev, newFood];
        return updated.sort(
          (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
        );
      });
      cachedFoods = null;
      setRefreshKey();
      return newFood;
    } catch (err) {
      console.error("新增食品失敗:", err);
      throw err;
    }
  }, []);

  // 更新食品
  const updateFood = useCallback(async (id: string, formData: FoodFormData): Promise<Food | null> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.FOOD}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("更新失敗");
      
      const updatedFood: Food = await res.json();
      setFoods((prev) => {
        const updated = prev.map((f) => (f.$id === id ? updatedFood : f));
        return updated.sort(
          (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
        );
      });
      cachedFoods = null;
      setRefreshKey();
      return updatedFood;
    } catch (err) {
      console.error("更新食品失敗:", err);
      throw err;
    }
  }, []);

  // 刪除食品
  const deleteFood = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.FOOD}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      
      setFoods((prev) => prev.filter((f) => f.$id !== id));
      cachedFoods = null;
      setRefreshKey();
      return true;
    } catch (err) {
      console.error("刪除食品失敗:", err);
      throw err;
    }
  }, []);

  // 更新數量
  const updateAmount = useCallback(async (food: Food, delta: number): Promise<boolean> => {
    const newAmount = food.amount + delta;
    if (newAmount < 0) return false;

    try {
      await updateFood(food.$id, { ...food, amount: newAmount });
      return true;
    } catch {
      return false;
    }
  }, [updateFood]);

  // 初始載入
  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // 計算統計資料
  const stats = {
    total: Array.isArray(foods) ? foods.length : 0,
    expired: Array.isArray(foods) ? foods.filter((f) => getDaysFromToday(f.todate) < 0).length : 0,
    expiringSoon: Array.isArray(foods) ? foods.filter((f) => {
      const days = getDaysFromToday(f.todate);
      return days >= 0 && days <= 7;
    }).length : 0,
  };

  return {
    foods,
    loading,
    error,
    stats,
    loadFoods,
    createFood,
    updateFood,
    deleteFood,
    updateAmount,
  };
}

// 食品項目的輔助函數
export function getFoodExpiryInfo(food: Food) {
  const daysRemaining = getDaysFromToday(food.todate);
  const status = getExpiryStatus(daysRemaining);
  const formattedDate = formatDate(food.todate);
  
  return {
    daysRemaining,
    status,
    formattedDate,
    isExpired: daysRemaining < 0,
    isExpiringSoon: daysRemaining >= 0 && daysRemaining <= 3,
  };
}
