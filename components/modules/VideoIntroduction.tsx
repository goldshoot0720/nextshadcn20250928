"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Download, CheckCircle, AlertCircle, Loader } from "lucide-react";
import SimpleVideoPlayer from "@/components/ui/simple-video-player";

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
    duration: "15:32",
    thumbnail: "/api/placeholder/400/225"
  },
  {
    id: "feng-evolution",
    title: "鋒兄進化Show🔥",
    description: "見證鋒兄的成長與蛻變，精彩的進化歷程讓人驚嘆不已。",
    filename: "clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc.mp4",
    duration: "12:45",
    thumbnail: "/api/placeholder/400/225"
  }
];

interface CacheStatus {
  [key: string]: {
    cached: boolean;
    downloading: boolean;
    progress: number;
    error?: string;
  };
}

export default function VideoIntroduction() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 檢查本地快取狀態
    checkCacheStatus();
  }, []);

  const checkCacheStatus = async () => {
    const status: CacheStatus = {};
    
    for (const video of videoList) {
      try {
        // 檢查 IndexedDB 中是否有快取
        const cached = await checkVideoCache(video.id);
        status[video.id] = {
          cached,
          downloading: false,
          progress: 0
        };
      } catch (error) {
        status[video.id] = {
          cached: false,
          downloading: false,
          progress: 0,
          error: "檢查快取失敗"
        };
      }
    }
    
    setCacheStatus(status);
  };

  const checkVideoCache = async (videoId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const request = indexedDB.open("VideoCache", 1);
      
      request.onerror = () => resolve(false);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["videos"], "readonly");
        const store = transaction.objectStore("videos");
        const getRequest = store.get(videoId);
        
        getRequest.onsuccess = () => {
          resolve(!!getRequest.result);
        };
        
        getRequest.onerror = () => resolve(false);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos", { keyPath: "id" });
        }
      };
    });
  };

  const downloadAndCacheVideo = async (video: VideoItem) => {
    setCacheStatus(prev => ({
      ...prev,
      [video.id]: {
        ...prev[video.id],
        downloading: true,
        progress: 0,
        error: undefined
      }
    }));

    try {
      // 模擬從服務器下載影片
      const videoUrl = `/videos/${video.filename}`;
      
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          
          const progress = total > 0 ? (loaded / total) * 100 : 0;
          setCacheStatus(prev => ({
            ...prev,
            [video.id]: {
              ...prev[video.id],
              progress
            }
          }));
        }
      }

      // 將影片數據存儲到 IndexedDB
      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
      await saveVideoToCache(video.id, blob, video);

      setCacheStatus(prev => ({
        ...prev,
        [video.id]: {
          cached: true,
          downloading: false,
          progress: 100
        }
      }));

    } catch (error) {
      console.error('下載影片失敗:', error);
      setCacheStatus(prev => ({
        ...prev,
        [video.id]: {
          cached: false,
          downloading: false,
          progress: 0,
          error: "下載失敗"
        }
      }));
    }
  };

  const saveVideoToCache = async (videoId: string, blob: Blob, videoInfo: VideoItem) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("VideoCache", 1);
      
      request.onerror = () => reject(new Error("無法打開數據庫"));
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["videos"], "readwrite");
        const store = transaction.objectStore("videos");
        
        const videoData = {
          id: videoId,
          blob: blob,
          info: videoInfo,
          cachedAt: new Date().toISOString()
        };
        
        const putRequest = store.put(videoData);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error("存儲失敗"));
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos", { keyPath: "id" });
        }
      };
    });
  };

  const loadVideoFromCache = async (videoId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const request = indexedDB.open("VideoCache", 1);
      
      request.onerror = () => resolve(null);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["videos"], "readonly");
        const store = transaction.objectStore("videos");
        const getRequest = store.get(videoId);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const blob = getRequest.result.blob;
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => resolve(null);
      };
    });
  };

  const playVideo = async (video: VideoItem) => {
    setCurrentVideo(video.id);
    
    // 嘗試從快取載入
    const cachedUrl = await loadVideoFromCache(video.id);
    
    if (cachedUrl && videoRef.current) {
      videoRef.current.src = cachedUrl;
      videoRef.current.load();
    } else {
      // 如果沒有快取，使用原始 URL
      if (videoRef.current) {
        videoRef.current.src = `/videos/${video.filename}`;
        videoRef.current.load();
      }
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
              src={videoRef.current?.src || `/videos/${videoList.find(v => v.id === currentVideo)?.filename}`}
              title={videoList.find(v => v.id === currentVideo)?.title || ""}
            />
          </div>
          
          <div className="p-4 pt-0">
            {currentVideo && (
              <div>
                <h3 className="font-semibold text-gray-900">
                  {videoList.find(v => v.id === currentVideo)?.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {videoList.find(v => v.id === currentVideo)?.description}
                </p>
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
                
                <button
                  onClick={() => downloadAndCacheVideo(video)}
                  disabled={cacheStatus[video.id]?.downloading || cacheStatus[video.id]?.cached}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={cacheStatus[video.id]?.cached ? "已快取" : "下載到本地"}
                >
                  {cacheStatus[video.id]?.downloading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      {Math.round(cacheStatus[video.id]?.progress || 0)}%
                    </>
                  ) : cacheStatus[video.id]?.cached ? (
                    <>
                      <CheckCircle size={16} />
                      已快取
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      快取
                    </>
                  )}
                </button>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快取管理</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(cacheStatus).filter(s => s.cached).length}
            </div>
            <div className="text-sm text-gray-600">已快取影片</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(cacheStatus).filter(s => s.downloading).length}
            </div>
            <div className="text-sm text-gray-600">下載中</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {videoList.length}
            </div>
            <div className="text-sm text-gray-600">總影片數</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          💡 提示：快取影片到本地可以減少網路流量使用，提升播放體驗。
        </div>
      </div>
    </div>
  );
}