"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Download, CheckCircle, AlertCircle, Loader, Trash2, HardDrive } from "lucide-react";
import SimpleVideoPlayer from "@/components/ui/simple-video-player";
import { useVideoCache } from "@/hooks/useVideoCache";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  filename: string;
  url?: string;
  duration?: string;
  thumbnail?: string;
}

const videoList: VideoItem[] = [
  {
    id: "feng-legend",
    title: "鋒兄的傳奇人生",
    description: "一個關於堅持與夢想的勵志故事，展現了鋒兄從平凡到不凡的人生歷程。",
    filename: "19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4",
    url: "https://oiutapchuu5rrlsr.public.blob.vercel-storage.com/19700121-1829-693fee512bec81918cbfd484c6a5ba8f_enx4rsS0.mp4",
    duration: "15:32",
    thumbnail: "/api/placeholder/400/225"
  },
  {
    id: "feng-evolution",
    title: "鋒兄進化Show🔥",
    description: "見證鋒兄的成長與蛻變，精彩的進化歷程讓人驚嘆不已。",
    filename: "clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4",
    url: "https://oiutapchuu5rrlsr.public.blob.vercel-storage.com/clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4",
    duration: "12:45",
    thumbnail: "/api/placeholder/400/225"
  }
];

export default function VideoIntroduction() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    cacheStatus,
    cacheStats,
    checkVideoCache,
    downloadAndCacheVideo,
    loadVideoFromCache,
    deleteVideoCache,
    clearAllCache,
    updateCacheStats,
    formatFileSize,
    maxCacheSize
  } = useVideoCache();

  useEffect(() => {
    // 初始化快取狀態
    initializeCacheStatus();
  }, []);

  const initializeCacheStatus = async () => {
    await updateCacheStats();
  };



  const playVideo = async (video: VideoItem) => {
    setCurrentVideo(video.id);
    
    // 嘗試從快取載入
    const cachedUrl = await loadVideoFromCache(video.id);
    
    if (cachedUrl && videoRef.current) {
      videoRef.current.src = cachedUrl;
      videoRef.current.load();
    } else {
      // 如果沒有快取，使用 Vercel Blob URL 或本地路徑
      if (videoRef.current) {
        videoRef.current.src = video.url || `/videos/${video.filename}`;
        videoRef.current.load();
      }
    }
  };

  const handleDownloadVideo = async (video: VideoItem) => {
    await downloadAndCacheVideo(video);
  };

  const handleDeleteCache = async (videoId: string) => {
    if (confirm('確定要刪除此影片的快取嗎？')) {
      await deleteVideoCache(videoId);
    }
  };

  const handleClearAllCache = async () => {
    if (confirm('確定要清空所有影片快取嗎？此操作無法復原。')) {
      await clearAllCache();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getCacheStatusIcon = (videoId: string) => {
    const status = cacheStatus[videoId];
    if (!status) return null;

    if (status.downloading) {
      return <Loader className="animate-spin text-blue-500" size={16} />;
    } else if (status.cached) {
      return <CheckCircle className="text-green-500" size={16} />;
    } else if (status.error) {
      return <AlertCircle className="text-red-500" size={16} />;
    }
    return null;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 標題區域 */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">影片介紹</h1>
        <p className="text-gray-500 mt-1">觀看精彩影片內容，支援本地快取減少流量使用</p>
      </div>

      {/* 影片播放器 */}
      {currentVideo && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4">
            <SimpleVideoPlayer
              src={videoRef.current?.src || videoList.find(v => v.id === currentVideo)?.url || `/videos/${videoList.find(v => v.id === currentVideo)?.filename}`}
              title={videoList.find(v => v.id === currentVideo)?.title || ""}
            />
          </div>
          
          <div className="p-4 pt-0">
            {currentVideo && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {videoList.find(v => v.id === currentVideo)?.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {videoList.find(v => v.id === currentVideo)?.description}
                </p>
                
                {/* 播放提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 text-lg">💡</div>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">播放控制提示：</p>
                      <ul className="text-xs space-y-1 text-blue-600">
                        <li>• 點擊影片或播放按鈕開始/暫停播放</li>
                        <li>• 點擊時間軸任意位置快速跳轉</li>
                        <li>• 拖拽音量滑桿調整音量</li>
                        <li>• 雙擊影片進入全螢幕模式</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 影片列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {videoList.map((video) => (
          <div key={video.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* 縮圖 */}
            <div className="relative aspect-video bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <Play className="text-white" size={48} />
              </div>
              
              {/* 時長標籤 */}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
              
              {/* 快取狀態 */}
              <div className="absolute top-2 right-2">
                {getCacheStatusIcon(video.id)}
              </div>
            </div>
            
            {/* 影片資訊 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{video.description}</p>
              
              {/* 操作按鈕 */}
              <div className="flex gap-2">
                <button
                  onClick={() => playVideo(video)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200"
                >
                  <Play size={16} />
                  播放
                </button>
                
                {cacheStatus[video.id]?.cached ? (
                  <button
                    onClick={() => handleDeleteCache(video.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors duration-200"
                    title="刪除快取"
                  >
                    <Trash2 size={16} />
                    刪除快取
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadVideo(video)}
                    disabled={cacheStatus[video.id]?.downloading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="下載到本地"
                  >
                    {cacheStatus[video.id]?.downloading ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        {Math.round(cacheStatus[video.id]?.progress || 0)}%
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        快取
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* 錯誤訊息 */}
              {cacheStatus[video.id]?.error && (
                <div className="mt-2 text-red-600 text-xs">
                  {cacheStatus[video.id]?.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 快取管理 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">快取管理</h2>
          <button
            onClick={handleClearAllCache}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 size={16} />
            清空快取
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {cacheStats.cachedVideos}
            </div>
            <div className="text-sm text-gray-600">已快取影片</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {cacheStats.downloadingVideos}
            </div>
            <div className="text-sm text-gray-600">下載中</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {videoList.length}
            </div>
            <div className="text-sm text-gray-600">總影片數</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <HardDrive size={16} className="text-orange-600" />
              <div className="text-lg font-bold text-orange-600">
                {formatFileSize(cacheStats.totalSize)}
              </div>
            </div>
            <div className="text-sm text-gray-600">快取大小</div>
          </div>
        </div>

        {/* 快取使用進度條 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>快取使用量</span>
            <span>{formatFileSize(cacheStats.totalSize)} / {formatFileSize(maxCacheSize)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((cacheStats.totalSize / maxCacheSize) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          💡 提示：快取影片到本地可以減少網路流量使用，提升播放體驗。當快取超過限制時，系統會自動清理最舊的影片。
        </div>
      </div>
    </div>
  );
}