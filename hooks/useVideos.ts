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

export function useVideos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入影片資料
  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.VIDEO);
      if (!response.ok) throw new Error("載入失敗");
      
      const data = await response.json();
      // Ensure data is an array
      const videoList = Array.isArray(data) ? data : [];
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
  };
}
