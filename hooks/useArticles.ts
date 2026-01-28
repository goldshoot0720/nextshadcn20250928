"use client";

import { useState, useEffect, useCallback } from "react";
import { Article, ArticleFormData } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入文章資料
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ARTICLE, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("載入文章資料失敗");
      }

      let data: Article[] = await res.json();
      // 按日期排序（最新的在前）
      data = data.sort(
        (a, b) => new Date(b.newDate).getTime() - new Date(a.newDate).getTime()
      );
      setArticles(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入文章資料失敗";
      setError(message);
      console.error("載入文章資料失敗:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 新增文章
  const createArticle = useCallback(async (formData: ArticleFormData): Promise<Article | null> => {
    try {
      // 轉換日期格式為 ISO datetime
      const dateTime = new Date(formData.newDate).toISOString();
      
      // 準備數據，過濾空字串的 URL 和 file 欄位
      const dataToSend: any = {
        title: formData.title,
        content: formData.content,
        newDate: dateTime,
      };
      
      // 只添加非空的 URL
      if (formData.url1 && formData.url1.trim()) dataToSend.url1 = formData.url1;
      if (formData.url2 && formData.url2.trim()) dataToSend.url2 = formData.url2;
      if (formData.url3 && formData.url3.trim()) dataToSend.url3 = formData.url3;
      
      // 只添加非空的 file 欄位
      if (formData.file1 && formData.file1.trim()) dataToSend.file1 = formData.file1;
      if (formData.file1type && formData.file1type.trim()) dataToSend.file1type = formData.file1type;
      if (formData.file2 && formData.file2.trim()) dataToSend.file2 = formData.file2;
      if (formData.file2type && formData.file2type.trim()) dataToSend.file2type = formData.file2type;
      if (formData.file3 && formData.file3.trim()) dataToSend.file3 = formData.file3;
      if (formData.file3type && formData.file3type.trim()) dataToSend.file3type = formData.file3type;
      
      const res = await fetch(API_ENDPOINTS.ARTICLE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "新增失敗");
      }
      
      const newArticle: Article = await res.json();
      setArticles((prev) => {
        const updated = [newArticle, ...prev];
        return updated.sort(
          (a, b) => new Date(b.newDate).getTime() - new Date(a.newDate).getTime()
        );
      });
      return newArticle;
    } catch (err) {
      console.error("新增文章失敗:", err);
      throw err;
    }
  }, []);

  // 更新文章
  const updateArticle = useCallback(async (id: string, formData: ArticleFormData): Promise<Article | null> => {
    try {
      // 轉換日期格式為 ISO datetime
      const dateTime = new Date(formData.newDate).toISOString();
      
      // 準備數據，過濾空字串的 URL 和 file 欄位
      const dataToSend: any = {
        title: formData.title,
        content: formData.content,
        newDate: dateTime,
      };
      
      // 只添加非空的 URL
      if (formData.url1 && formData.url1.trim()) dataToSend.url1 = formData.url1;
      if (formData.url2 && formData.url2.trim()) dataToSend.url2 = formData.url2;
      if (formData.url3 && formData.url3.trim()) dataToSend.url3 = formData.url3;
      
      // 只添加非空的 file 欄位
      if (formData.file1 && formData.file1.trim()) dataToSend.file1 = formData.file1;
      if (formData.file1type && formData.file1type.trim()) dataToSend.file1type = formData.file1type;
      if (formData.file2 && formData.file2.trim()) dataToSend.file2 = formData.file2;
      if (formData.file2type && formData.file2type.trim()) dataToSend.file2type = formData.file2type;
      if (formData.file3 && formData.file3.trim()) dataToSend.file3 = formData.file3;
      if (formData.file3type && formData.file3type.trim()) dataToSend.file3type = formData.file3type;
      
      const res = await fetch(`${API_ENDPOINTS.ARTICLE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "更新失敗");
      }
      
      const updatedArticle: Article = await res.json();
      setArticles((prev) => {
        const updated = prev.map((a) => (a.$id === id ? updatedArticle : a));
        return updated.sort(
          (a, b) => new Date(b.newDate).getTime() - new Date(a.newDate).getTime()
        );
      });
      return updatedArticle;
    } catch (err) {
      console.error("更新文章失敗:", err);
      throw err;
    }
  }, []);

  // 刪除文章
  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.ARTICLE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      
      setArticles((prev) => prev.filter((a) => a.$id !== id));
      return true;
    } catch (err) {
      console.error("刪除文章失敗:", err);
      throw err;
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const stats = {
    total: articles.length,
  };

  return {
    articles,
    loading,
    error,
    stats,
    loadArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
