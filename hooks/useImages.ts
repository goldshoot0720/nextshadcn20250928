"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/constants";
import { fetchApi } from "@/hooks/useApi";

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
      const data = await fetchApi<ImageData[]>(API_ENDPOINTS.IMAGE + cacheParam);
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