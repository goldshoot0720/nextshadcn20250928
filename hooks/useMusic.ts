"use client";

import { useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "@/lib/constants";

export interface MusicData {
  $id: string;
  name: string;
  file: string;
  lyrics: string;
  note: string;
  ref: string;
  category: string;
  hash: string;
  language: string;
  cover: string;
  $createdAt: string;
  $updatedAt: string;
}

// 全域快取
let cachedMusic: MusicData[] | null = null;
let cacheTimestamp: number = 0;

export function useMusic() {
  const [music, setMusic] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRefreshKey = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('music_refresh_key') || '';
  };

  const setRefreshKeyValue = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('music_refresh_key', Date.now().toString());
  };

  // 載入音樂資料（使用快取）
  const loadMusic = useCallback(async (forceRefresh = false) => {
    const storedRefreshKey = getRefreshKey();
    
    if (!forceRefresh && cachedMusic && (!storedRefreshKey || cacheTimestamp >= parseInt(storedRefreshKey))) {
      setMusic(cachedMusic);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cacheParam = (forceRefresh || storedRefreshKey) ? `?t=${storedRefreshKey || Date.now()}` : '';
      const response = await fetch(API_ENDPOINTS.MUSIC + cacheParam);
      if (!response.ok) {
        if (response.status === 404) {
          // 檢查是否真的是 collection not found
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error && (errorData.error.includes('could not be found') || errorData.error.includes('not found'))) {
            throw new Error("Table music 不存在，請至「鋒兄設定」中初始化。");
          }
        }
        throw new Error("載入失敗");
      }
      
      const data = await response.json();
      // Ensure data is an array
      const musicList = Array.isArray(data) ? data : [];
      
      cachedMusic = musicList;
      cacheTimestamp = Date.now();
      
      setMusic(musicList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入音樂失敗";
      setError(message);
      console.error("載入音樂失敗:", err);
      setMusic([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadMusic();
  }, [loadMusic]);

  // 計算統計資料
  const stats = {
    total: Array.isArray(music) ? music.length : 0,
  };

  return {
    music,
    loading,
    error,
    stats,
    loadMusic,
    refresh: () => setRefreshKeyValue(),
  };
}
