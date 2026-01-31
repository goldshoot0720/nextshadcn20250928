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

export function useImages() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入圖片資料
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.IMAGE);
      if (!response.ok) throw new Error("載入失敗");
      
      const data = await response.json();
      // Ensure data is an array
      const imageList = Array.isArray(data) ? data : [];
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
  };
}