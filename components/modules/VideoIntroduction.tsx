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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 tablet-8-7">
      {/* 響應式標題區域 */}
      <div className="px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">影片介紹</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">觀看精彩影片內容，支援本地快取減少流量使用</p>
      </div>

      {/* 響應式影片播放器 */}
      {currentVideo && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden mx-1 sm:mx-0">
          <div className="p-2 sm:p-4">
            <SimpleVideoPlayer
              src={videoRef.current?.src || videoList.find(v => v.id === currentVideo)?.url || `/videos/${videoList.find(v => v.id === currentVideo)?.filename}`}
              title={videoList.find(v => v.id === currentVideo)?.title || ""}
            />
          </div>
          
          <div className="p-3 sm:p-4 pt-0">
            {currentVideo && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  {videoList.find(v => v.id === currentVideo)?.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">
                  {videoList.find(v => v.id === currentVideo)?.description}
                </p>
                
                {/* 響應式播放提示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 text-base sm:text-lg flex-shrink-0">💡</div>
                    <div className="text-xs sm:text-sm text-blue-700 min-w-0">
                      <p className="font-medium mb-1">播放控制提示：</p>
                      <ul className="text-xs space-y-0.5 sm:space-y-1 text-blue-600">
                        <li>• 點擊影片或播放按鈕開始/暫停播放</li>
                        <li>• 點擊時間軸任意位置快速跳轉</li>
                        <li className="hidden sm:list-item">• 拖拽音量滑桿調整音量</li>
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

      {/* 響應式影片列表 */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 mx-1 sm:mx-0
        grid-cols-1 
        sm:grid-cols-1 
        md:grid-cols-2 
        xl:grid-cols-2">
        {videoList.map((video) => (
          <div key={video.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
            {/* 響應式縮圖 */}
            <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => playVideo(video)}>
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                <Play className="text-white group-hover:scale-110 transition-transform duration-300 w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              
              {/* 響應式時長標籤 */}
              {video.duration && (
                <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-center font-medium">
                  {video.duration}
                </div>
              )}
              
              {/* 響應式快取狀態 */}
              <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5">
                {getCacheStatusIcon(video.id)}
              </div>

              {/* 播放覆蓋層 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3 sm:p-4">
                  <Play className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            
            {/* 響應式影片資訊 */}
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base line-clamp-1" title={video.title}>
                {video.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                {video.description}
              </p>
              
              {/* 響應式操作按鈕 */}
              <div className="flex gap-2">
                <button
                  onClick={() => playVideo(video)}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium touch-manipulation"
                >
                  <Play size={14} />
                  <span className="hidden xs:inline">播放影片</span>
                  <span className="xs:hidden">播放</span>
                </button>
                
                {cacheStatus[video.id]?.cached ? (
                  <button
                    onClick={() => handleDeleteCache(video.id)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg sm:rounded-xl transition-colors duration-200 text-xs sm:text-sm touch-manipulation"
                    title="刪除快取"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">刪除快取</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownloadVideo(video)}
                    disabled={cacheStatus[video.id]?.downloading}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation"
                    title="下載到本地"
                  >
                    {cacheStatus[video.id]?.downloading ? (
                      <>
                        <Loader className="animate-spin" size={14} />
                        <span className="hidden sm:inline">{Math.round(cacheStatus[video.id]?.progress || 0)}%</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span className="hidden sm:inline">快取</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* 響應式錯誤訊息 */}
              {cacheStatus[video.id]?.error && (
                <div className="mt-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-2">
                  {cacheStatus[video.id]?.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 響應式快取管理 */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mx-1 sm:mx-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">快取管理</h2>
          <button
            onClick={handleClearAllCache}
            className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm touch-manipulation"
          >
            <Trash2 size={16} />
            <span>清空快取</span>
          </button>
        </div>
        
        {/* 響應式統計卡片 */}
        <div className="grid gap-3 sm:gap-4 mb-4 sm:mb-6
          grid-cols-2 
          sm:grid-cols-2 
          lg:grid-cols-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
              {cacheStats.cachedVideos}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">已快取影片</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
              {cacheStats.downloadingVideos}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">下載中</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">
              {videoList.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">總影片數</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <HardDrive size={14} className="text-orange-600 sm:w-4 sm:h-4" />
              <div className="text-sm sm:text-lg font-bold text-orange-600">
                {formatFileSize(cacheStats.totalSize)}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">快取大小</div>
          </div>
        </div>

        {/* 響應式快取使用進度條 */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-2">
            <span>快取使用量</span>
            <span className="font-medium">{formatFileSize(cacheStats.totalSize)} / {formatFileSize(maxCacheSize)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min((cacheStats.totalSize / maxCacheSize) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">
            {Math.round((cacheStats.totalSize / maxCacheSize) * 100)}% 已使用
          </div>
        </div>
        
        <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">
          💡 <span className="font-medium">提示：</span>快取影片到本地可以減少網路流量使用，提升播放體驗。當快取超過限制時，系統會自動清理最舊的影片。
        </div>
      </div>
    </div>
  );
}