"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageFile } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";

export function useImages() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入圖片資料
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.IMAGES);
      if (!response.ok) throw new Error("載入失敗");
      
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      } else {
        throw new Error(data.error || "載入圖片失敗");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "載入圖片失敗";
      setError(message);
      console.error("載入圖片失敗:", err);
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
    totalSize: Array.isArray(images) ? images.reduce((sum, img) => sum + img.size, 0) : 0,
  };

  return {
    images,
    loading,
    error,
    stats,
    loadImages,
  };
}