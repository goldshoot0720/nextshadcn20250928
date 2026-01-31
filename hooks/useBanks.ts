"use client";

import { useState, useEffect, useCallback } from "react";
import { Bank, BankFormData } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入銀行資料
  const loadBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bank', { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          // 檢查是否真的是 collection not found
          const errorData = await res.json().catch(() => ({}));
          if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
            throw new Error("Table bank 不存在，請至「鋒兄設定」中初始化。");
          }
        }
        throw new Error("載入失敗");
      }
      
      const resData = await res.json();
      let data: Bank[] = Array.isArray(resData) ? resData : [];
      // 按名稱排序
      data = data.sort((a, b) => a.name.localeCompare(b.name));
      setBanks(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入銀行資料失敗";
      setError(message);
      console.error("載入銀行資料失敗:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 新增銀行
  const createBank = useCallback(async (formData: BankFormData): Promise<Bank | null> => {
    try {
      const res = await fetch('/api/bank', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("新增失敗");
      
      const newBank: Bank = await res.json();
      setBanks((prev) => {
        const updated = [...prev, newBank];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      return newBank;
    } catch (err) {
      console.error("新增銀行失敗:", err);
      throw err;
    }
  }, []);

  // 更新銀行
  const updateBank = useCallback(async (id: string, formData: BankFormData): Promise<Bank | null> => {
    try {
      const res = await fetch(`/api/bank/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("更新失敗");
      
      const updatedBank: Bank = await res.json();
      setBanks((prev) => {
        const updated = prev.map((b) => (b.$id === id ? updatedBank : b));
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      return updatedBank;
    } catch (err) {
      console.error("更新銀行失敗:", err);
      throw err;
    }
  }, []);

  // 刪除銀行
  const deleteBank = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/bank/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      
      setBanks((prev) => prev.filter((b) => b.$id !== id));
      return true;
    } catch (err) {
      console.error("刪除銀行失敗:", err);
      throw err;
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  // 計算統計資料
  const stats = {
    total: Array.isArray(banks) ? banks.length : 0,
    totalDeposit: Array.isArray(banks) ? banks.reduce((sum, b) => sum + (b.deposit || 0), 0) : 0,
  };

  return {
    banks,
    loading,
    error,
    stats,
    loadBanks,
    createBank,
    updateBank,
    deleteBank,
  };
}
