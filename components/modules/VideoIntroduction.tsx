"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Download, CheckCircle, AlertCircle, Loader, Trash2, HardDrive } from "lucide-react";
import SimpleVideoPlayer from "@/components/ui/simple-video-player";
import { useVideoCache } from "@/hooks/useVideoCache";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard } from "@/components/ui/data-card";
import { SimpleStatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { VideoItem } from "@/types";

const VIDEO_LIST: VideoItem[] = [
  {
    id: "feng-legend",
    title: "鋒兄的傳奇人生",
    description: "一個關於堅持與夢想的勵志故事，展現了鋒兄從平凡到不凡的人生歷程。",
    filename: "19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4",
    url: "https://oiutapchuu5rrlsr.public.blob.vercel-storage.com/19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4",
    duration: "15:32",
  },
  {
    id: "feng-evolution",
    title: "鋒兄進化Show🔥",
    description: "見證鋒兄的成長與蛻變，精彩的進化歷程讓人驚嘆不已。",
    filename: "clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4",
    url: "https://oiutapchuu5rrlsr.public.blob.vercel-storage.com/clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4",
    duration: "12:45",
  },
];

export default function VideoIntroduction() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    cacheStatus,
    cacheStats,
    loadVideoFromCache,
    downloadAndCacheVideo,
    deleteVideoCache,
    clearAllCache,
    updateCacheStats,
    formatFileSize,
    maxCacheSize,
  } = useVideoCache();

  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  const playVideo = useCallback(async (video: VideoItem) => {
    setCurrentVideo(video.id);
    const cachedUrl = await loadVideoFromCache(video.id);
    
    if (videoRef.current) {
      videoRef.current.src = cachedUrl || video.url || `/videos/${video.filename}`;
      videoRef.current.load();
    }
  }, [loadVideoFromCache]);

  const handleDownload = useCallback(async (video: VideoItem) => {
    await downloadAndCacheVideo(video);
  }, [downloadAndCacheVideo]);

  const handleDeleteCache = useCallback(async (videoId: string) => {
    if (confirm('確定要刪除此影片的快取嗎？')) {
      await deleteVideoCache(videoId);
    }
  }, [deleteVideoCache]);

  const handleClearAll = useCallback(async () => {
    if (confirm('確定要清空所有影片快取嗎？此操作無法復原。')) {
      await clearAllCache();
    }
  }, [clearAllCache]);

  const currentVideoData = VIDEO_LIST.find(v => v.id === currentVideo);

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader
        title="影片介紹"
        subtitle="觀看精彩影片內容，支援本地快取減少流量使用"
      />

      {/* 影片播放器 */}
      {currentVideo && currentVideoData && (
        <VideoPlayer video={currentVideoData} videoRef={videoRef} />
      )}

      {/* 影片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {VIDEO_LIST.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            cacheStatus={cacheStatus[video.id]}
            onPlay={() => playVideo(video)}
            onDownload={() => handleDownload(video)}
            onDeleteCache={() => handleDeleteCache(video.id)}
          />
        ))}
      </div>

      {/* 快取管理 */}
      <CacheManager
        cacheStats={cacheStats}
        maxCacheSize={maxCacheSize}
        formatFileSize={formatFileSize}
        onClearAll={handleClearAll}
        videoCount={VIDEO_LIST.length}
      />
    </div>
  );
}

// 影片播放器
function VideoPlayer({ video, videoRef }: { video: VideoItem; videoRef: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <DataCard className="overflow-hidden">
      <div className="p-2 sm:p-4">
        <SimpleVideoPlayer
          src={videoRef.current?.src || video.url || `/videos/${video.filename}`}
          title={video.title}
        />
      </div>
      <div className="p-4 pt-0">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{video.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{video.description}</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💡</span>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">播放控制提示：</p>
              <ul className="text-xs space-y-0.5 text-blue-600 dark:text-blue-400">
                <li>• 點擊影片或播放按鈕開始/暫停播放</li>
                <li>• 點擊時間軸任意位置快速跳轉</li>
                <li>• 雙擊影片進入全螢幕模式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DataCard>
  );
}

// 影片卡片
interface VideoCardProps {
  video: VideoItem;
  cacheStatus?: { cached: boolean; downloading: boolean; progress: number; error?: string };
  onPlay: () => void;
  onDownload: () => void;
  onDeleteCache: () => void;
}

function VideoCard({ video, cacheStatus, onPlay, onDownload, onDeleteCache }: VideoCardProps) {
  return (
    <DataCard className="overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* 縮圖 */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 cursor-pointer" onClick={onPlay}>
        <div className="absolute inset-0 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
          <Play className="text-white group-hover:scale-110 transition-transform duration-300 w-12 h-12" />
        </div>
        
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
            {video.duration}
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
          <CacheStatusIcon status={cacheStatus} />
        </div>
      </div>
      
      {/* 資訊 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{video.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>
        
        <div className="flex gap-2">
          <Button onClick={onPlay} className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-sm">
            <Play size={14} />
            <span className="hidden xs:inline">播放影片</span>
            <span className="xs:hidden">播放</span>
          </Button>
          
          {cacheStatus?.cached ? (
            <Button onClick={onDeleteCache} variant="outline" className="gap-1 text-red-600 hover:bg-red-50 rounded-xl text-sm">
              <Trash2 size={14} />
              <span className="hidden sm:inline">刪除快取</span>
            </Button>
          ) : (
            <Button onClick={onDownload} variant="outline" disabled={cacheStatus?.downloading} className="gap-1 rounded-xl text-sm">
              {cacheStatus?.downloading ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span className="hidden sm:inline">{Math.round(cacheStatus?.progress || 0)}%</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span className="hidden sm:inline">快取</span>
                </>
              )}
            </Button>
          )}
        </div>
        
        {cacheStatus?.error && (
          <div className="mt-2 text-red-600 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
            {cacheStatus.error}
          </div>
        )}
      </div>
    </DataCard>
  );
}

// 快取狀態圖示
function CacheStatusIcon({ status }: { status?: { cached: boolean; downloading: boolean; error?: string } }) {
  if (!status) return null;
  if (status.downloading) return <Loader className="animate-spin text-blue-500" size={16} />;
  if (status.cached) return <CheckCircle className="text-green-500" size={16} />;
  if (status.error) return <AlertCircle className="text-red-500" size={16} />;
  return null;
}

// 快取管理
interface CacheManagerProps {
  cacheStats: { totalSize: number; cachedVideos: number; downloadingVideos: number };
  maxCacheSize: number;
  formatFileSize: (bytes: number) => string;
  onClearAll: () => void;
  videoCount: number;
}

function CacheManager({ cacheStats, maxCacheSize, formatFileSize, onClearAll, videoCount }: CacheManagerProps) {
  const usagePercent = Math.round((cacheStats.totalSize / maxCacheSize) * 100);

  return (
    <DataCard className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">快取管理</h2>
        <Button onClick={onClearAll} variant="ghost" className="gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 size={16} />
          清空快取
        </Button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <SimpleStatCard title="已快取影片" value={cacheStats.cachedVideos} bgColor="bg-blue-50 dark:bg-blue-900/20" textColor="text-blue-600 dark:text-blue-400" />
        <SimpleStatCard title="下載中" value={cacheStats.downloadingVideos} bgColor="bg-green-50 dark:bg-green-900/20" textColor="text-green-600 dark:text-green-400" />
        <SimpleStatCard title="總影片數" value={videoCount} bgColor="bg-purple-50 dark:bg-purple-900/20" textColor="text-purple-600 dark:text-purple-400" />
        <SimpleStatCard title="快取大小" value={formatFileSize(cacheStats.totalSize)} icon={<HardDrive size={14} />} bgColor="bg-orange-50 dark:bg-orange-900/20" textColor="text-orange-600 dark:text-orange-400" />
      </div>

      {/* 進度條 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>快取使用量</span>
          <span className="font-medium">{formatFileSize(cacheStats.totalSize)} / {formatFileSize(maxCacheSize)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{usagePercent}% 已使用</div>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        💡 <span className="font-medium">提示：</span>快取影片到本地可以減少網路流量使用，提升播放體驗。當快取超過限制時，系統會自動清理最舊的影片。
      </div>
    </DataCard>
  );
}
