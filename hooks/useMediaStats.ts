"use client";

import { useState, useEffect } from "react";
import { useImages } from "./useImages";
import { useVideos } from "./useVideos";
import { useMusic } from "./useMusic";
import { usePodcast } from "./usePodcast";

interface MediaStats {
  totalImages: number; // From database
  totalVideos: number; // From database
  totalMusic: number; // From database
  totalDocuments: number;
  totalPodcasts: number; // From database
  storageImagesCount: number; // From Appwrite Storage
  storageVideosCount: number; // From Appwrite Storage
  storageMusicCount: number; // From Appwrite Storage
  imagesSize: number; // in bytes
  videosSize: number; // in bytes
  musicSize: number; // in bytes
  documentsSize: number; // in bytes
  otherSize: number; // in bytes
  totalSize: number; // in bytes
  totalFiles: number;
  storageLimit: number;
  usagePercentage: number;
}

export function useMediaStats() {
  // Get counts from database tables
  const { images, loading: imagesLoading, error: imagesError } = useImages();
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const { music, loading: musicLoading, error: musicError } = useMusic();
  const { podcast, loading: podcastLoading, error: podcastError } = usePodcast();

  const [stats, setStats] = useState<MediaStats>({
    totalImages: 0,
    totalVideos: 0,
    totalMusic: 0,
    totalDocuments: 0,
    totalPodcasts: 0,
    storageImagesCount: 0,
    storageVideosCount: 0,
    storageMusicCount: 0,
    imagesSize: 0,
    videosSize: 0,
    musicSize: 0,
    documentsSize: 0,
    otherSize: 0,
    totalSize: 0,
    totalFiles: 0,
    storageLimit: 2 * 1024 * 1024 * 1024, // 2GB
    usagePercentage: 0,
  });
  
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  const loading = imagesLoading || videosLoading || musicLoading || podcastLoading || storageLoading;
  const error = imagesError || videosError || musicError || podcastError || storageError;

  useEffect(() => {
    const fetchStorageStats = async () => {
      try {
        setStorageLoading(true);
        setStorageError(null);

        // Get Appwrite config from localStorage
        const endpoint = localStorage.getItem('appwrite_endpoint') || '';
        const projectId = localStorage.getItem('appwrite_project') || '';
        const apiKey = localStorage.getItem('appwrite_key') || '';
        const bucketId = localStorage.getItem('appwrite_bucket') || '';

        const response = await fetch('/api/storage-stats', {
          headers: {
            'x-appwrite-endpoint': endpoint,
            'x-appwrite-project': projectId,
            'x-appwrite-key': apiKey,
            'x-appwrite-bucket': bucketId,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch storage stats');
        }

        // Combine database counts with Appwrite Storage sizes
        setStats({
          totalImages: images.length, // From database
          totalVideos: videos.length, // From database
          totalMusic: music.length, // From database
          totalDocuments: data.stats.documents.count, // From Appwrite Storage (鋒兄文件)
          totalPodcasts: podcast.length, // From database
          storageImagesCount: data.stats.images.count, // From Appwrite Storage
          storageVideosCount: data.stats.videos.count, // From Appwrite Storage
          storageMusicCount: data.stats.music.count, // From Appwrite Storage
          imagesSize: data.stats.images.size, // From Appwrite Storage
          videosSize: data.stats.videos.size, // From Appwrite Storage
          musicSize: data.stats.music.size, // From Appwrite Storage
          documentsSize: data.stats.documents.size, // From Appwrite Storage
          otherSize: data.stats.other.size, // From Appwrite Storage
          totalSize: data.stats.totalSize, // From Appwrite Storage
          totalFiles: data.stats.totalFiles, // From Appwrite Storage
          storageLimit: data.stats.storageLimit, // From Appwrite Storage
          usagePercentage: data.stats.usagePercentage, // From Appwrite Storage
        });
      } catch (err) {
        console.error('Error fetching storage stats:', err);
        setStorageError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setStorageLoading(false);
      }
    };

    fetchStorageStats();
  }, [images.length, videos.length, music.length, podcast.length]);

  return { stats, loading, error };
}
