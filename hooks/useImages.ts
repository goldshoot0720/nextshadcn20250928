"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/constants";

export interface ImageData {
  $id: string;
  name: string;
  file: string;
  note: string;
  ref: string;
  category: string;
  hash: string;
  cover: boolean;
  $createdAt: string;
  $updatedAt: string;
}

// 全域快取
let cachedImages: ImageData[] | null = null;
let cacheTimestamp: number = 0;

export function useImages() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRefreshKey = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('images_refresh_key') || '';
  };

  const setRefreshKeyValue = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('images_refresh_key', Date.now().toString());
  };

  // 載入圖片資料（使用快取）
  const loadImages = useCallback(async (forceRefresh = false) => {
    const storedRefreshKey = getRefreshKey();
    
    if (!forceRefresh && cachedImages && (!storedRefreshKey || cacheTimestamp >= parseInt(storedRefreshKey))) {
      setImages(cachedImages);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cacheParam = (forceRefresh || storedRefreshKey) ? `?t=${storedRefreshKey || Date.now()}` : '';
      const response = await fetch(API_ENDPOINTS.IMAGE + cacheParam);
      if (!response.ok) {
        if (response.status === 404) {
          // 檢查是否真的是 collection not found
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
            throw new Error("Table image 不存在，請至「鋒兄設定」中初始化。");
          }
        }
        throw new Error("載入失敗");
      }
      
      const data = await response.json();
      // Ensure data is an array
      const imageList = Array.isArray(data) ? data : [];
      
      cachedImages = imageList;
      cacheTimestamp = Date.now();
      
      setImages(imageList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入圖片失敗";
      setError(message);
      console.error("載入圖片失敗:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 計算統計資料
  const stats = {
    total: Array.isArray(images) ? images.length : 0,
  };

  return {
    images,
    loading,
    error,
    stats,
    loadImages,
    refresh: () => setRefreshKeyValue(),
  };
}