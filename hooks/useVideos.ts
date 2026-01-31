"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/constants";

export interface VideoData {
  $id: string;
  name: string;
  file: string;
  note: string;
  ref: string;
  category: string;
  hash: string;
  cover: string;
  $createdAt: string;
  $updatedAt: string;
}

// 全域快取
let cachedVideos: VideoData[] | null = null;
let cacheTimestamp: number = 0;

export function useVideos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRefreshKey = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('videos_refresh_key') || '';
  };

  const setRefreshKeyValue = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('videos_refresh_key', Date.now().toString());
  };

  // 載入影片資料（使用快取）
  const loadVideos = useCallback(async (forceRefresh = false) => {
    const storedRefreshKey = getRefreshKey();
    
    if (!forceRefresh && cachedVideos && (!storedRefreshKey || cacheTimestamp >= parseInt(storedRefreshKey))) {
      setVideos(cachedVideos);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cacheParam = (forceRefresh || storedRefreshKey) ? `?t=${storedRefreshKey || Date.now()}` : '';
      const response = await fetch(API_ENDPOINTS.VIDEO + cacheParam);
      if (!response.ok) {
        if (response.status === 404) {
          // 檢查是否真的是 collection not found
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
            throw new Error("Table video 不存在，請至「鋒兄設定」中初始化。");
          }
        }
        throw new Error("載入失敗");
      }
      
      const data = await response.json();
      // Ensure data is an array
      const videoList = Array.isArray(data) ? data : [];
      
      cachedVideos = videoList;
      cacheTimestamp = Date.now();
      
      setVideos(videoList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入影片失敗";
      setError(message);
      console.error("載入影片失敗:", err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // 計算統計資料
  const stats = {
    total: Array.isArray(videos) ? videos.length : 0,
  };

  return {
    videos,
    loading,
    error,
    stats,
    loadVideos,
    refresh: () => setRefreshKeyValue(),
  };
}
