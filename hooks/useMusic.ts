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

export function useMusic() {
  const [music, setMusic] = useState<MusicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入音樂資料
  const loadMusic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.MUSIC);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Table music 不存在，請至「鋒兄設定」中初始化。");
        }
        throw new Error("載入失敗");
      }
      
      const data = await response.json();
      // Ensure data is an array
      const musicList = Array.isArray(data) ? data : [];
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
  };
}
