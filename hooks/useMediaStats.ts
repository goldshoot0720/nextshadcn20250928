"use client";

import { useState, useEffect } from "react";
import { useImages } from "./useImages";
import { useVideos } from "./useVideos";
import { useMusic } from "./useMusic";

interface MediaStats {
  totalImages: number;
  totalVideos: number;
  totalMusic: number;
  imagesSize: number; // in bytes
  videosSize: number; // in bytes
  musicSize: number; // in bytes
  totalSize: number; // in bytes
  storageLimit: number; // 2GB in bytes
  usagePercentage: number;
}

export function useMediaStats() {
  const { images, loading: imagesLoading } = useImages();
  const { videos, loading: videosLoading } = useVideos();
  const { music, loading: musicLoading } = useMusic();
  
  const [stats, setStats] = useState<MediaStats>({
    totalImages: 0,
    totalVideos: 0,
    totalMusic: 0,
    imagesSize: 0,
    videosSize: 0,
    musicSize: 0,
    totalSize: 0,
    storageLimit: 2 * 1024 * 1024 * 1024, // 2GB
    usagePercentage: 0,
  });

  const loading = imagesLoading || videosLoading || musicLoading;

  useEffect(() => {
    // Calculate storage sizes (estimated based on file count since we don't have actual file sizes in the data)
    // This is a rough estimate - ideally file sizes should be stored in the database
    const avgImageSize = 2 * 1024 * 1024; // Average 2MB per image
    const avgVideoSize = 10 * 1024 * 1024; // Average 10MB per video
    const avgMusicSize = 5 * 1024 * 1024; // Average 5MB per music file

    const imagesSize = images.length * avgImageSize;
    const videosSize = videos.length * avgVideoSize;
    const musicSize = music.length * avgMusicSize;
    const totalSize = imagesSize + videosSize + musicSize;
    const storageLimit = 2 * 1024 * 1024 * 1024; // 2GB
    const usagePercentage = (totalSize / storageLimit) * 100;

    setStats({
      totalImages: images.length,
      totalVideos: videos.length,
      totalMusic: music.length,
      imagesSize,
      videosSize,
      musicSize,
      totalSize,
      storageLimit,
      usagePercentage,
    });
  }, [images, videos, music]);

  return { stats, loading };
}
