"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, Download, CheckCircle, AlertCircle, Loader, Trash2, HardDrive, Plus, Edit, X, Upload, Calendar, Search } from "lucide-react";
import SimpleVideoPlayer from "@/components/ui/simple-video-player";
import { PlyrPlayer } from "@/components/ui/plyr-player";
import { useVideoCache } from "@/hooks/useVideoCache";
import { useVideos, VideoData } from "@/hooks/useVideos";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard } from "@/components/ui/data-card";
import { SimpleStatCard, StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { VideoItem } from "@/types";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatLocalDate } from "@/lib/formatters";
import { getAppwriteHeaders } from "@/lib/utils";

// Helper function to add Appwrite config to URL
function addAppwriteConfigToUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  
  const endpoint = localStorage.getItem('NEXT_PUBLIC_APPWRITE_ENDPOINT');
  const projectId = localStorage.getItem('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  const databaseId = localStorage.getItem('APPWRITE_DATABASE_ID');
  const apiKey = localStorage.getItem('APPWRITE_API_KEY');
  const bucketId = localStorage.getItem('APPWRITE_BUCKET_ID');
  
  if (!endpoint && !projectId && !databaseId) {
    return url;
  }
  
  const separator = url.includes('?') ? '&' : '?';
  const params = new URLSearchParams();
  
  if (endpoint) params.set('_endpoint', endpoint);
  if (projectId) params.set('_project', projectId);
  if (databaseId) params.set('_database', databaseId);
  if (apiKey) params.set('_key', apiKey);
  if (bucketId) params.set('_bucket', bucketId);
  
  const paramString = params.toString();
  return paramString ? `${url}${separator}${paramString}` : url;
}



export default function VideoIntroduction() {
  const { videos, loading, error, stats, loadVideos } = useVideos();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // 搜尋過濾
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.name?.toLowerCase().includes(query) ||
      video.note?.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);
  
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

  const handleAdd = () => {
    setEditingVideo(null);
    setShowFormModal(true);
  };

  const handleEdit = (video: VideoData) => {
    setEditingVideo(video);
    setShowFormModal(true);
  };

  const handleDelete = async (video: VideoData) => {
    const confirmText = `DELETE ${video.name}`;
    const userInput = prompt(`確定要刪除影片「${video.name}」嗎？\n\n請輸入以下文字以確認刪除：\n${confirmText}`);
    
    if (userInput !== confirmText) {
      if (userInput !== null) {
        alert('輸入不正確，刪除已取消');
      }
      return;
    }

    try {
      const url = addAppwriteConfigToUrl(`${API_ENDPOINTS.VIDEO}/${video.$id}`);
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');
      loadVideos(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : '刪除失敗');
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingVideo(null);
    loadVideos(true);
  };

  const playVideo = useCallback(async (video: VideoData) => {
    setCurrentVideo(video.$id);
    setShowPlayer(true);
    const cachedUrl = await loadVideoFromCache(video.$id);
    
    if (videoRef.current) {
      videoRef.current.src = cachedUrl || video.file || '';
      videoRef.current.load();
    }
  }, [loadVideoFromCache]);

  const handleDownload = useCallback(async (video: VideoData) => {
    const videoItem: VideoItem = {
      id: video.$id,
      title: video.name,
      description: video.note || '',
      filename: video.name,
      url: video.file,
      cover: typeof video.cover === 'string' ? video.cover : '',
    };
    await downloadAndCacheVideo(videoItem);
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

  const currentVideoData = videos.find(v => v.$id === currentVideo);

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <SectionHeader title="鋒兄影片" subtitle="影片管理" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <SectionHeader
        title="鋒兄影片"
        subtitle="觀看精彩影片內容，支援本地快取減少流量使用"
        action={
          <Button onClick={handleAdd} className="gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl">
            <Plus size={16} />
            新增影片
          </Button>
        }
      />

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="影片總數" value={stats.total} icon={Play} />
        <StatCard title="已快取" value={cacheStats.cachedVideos} icon={CheckCircle} />
        <StatCard title="快取大小" value={formatFileSize(cacheStats.totalSize)} icon={HardDrive} />
      </div>

      {/* 影片播放器 */}
      {showPlayer && currentVideo && currentVideoData && (
        <VideoPlayerModal
          video={currentVideoData}
          videoRef={videoRef}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* 搜尋欄位 */}
      {videos.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜尋影片名稱、備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      )}

      {/* 影片列表 */}
      {videos.length === 0 ? (
        <EmptyState
          icon={<Play className="w-12 h-12" />}
          title="尚無影片"
          description="點擊上方「新增影片」按鈕新增第一個影片"
        />
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="無搜尋結果"
          description={`找不到「${searchQuery}」相關的影片`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {filteredVideos.map((video) => (
            <VideoManagementCard
              key={video.$id}
              video={video}
              cacheStatus={cacheStatus[video.$id]}
              onPlay={() => playVideo(video)}
              onEdit={() => handleEdit(video)}
              onDelete={() => handleDelete(video)}
              onDownload={() => handleDownload(video)}
              onDeleteCache={() => handleDeleteCache(video.$id)}
            />
          ))}
        </div>
      )}

      {/* 快取管理 */}
      <CacheManager
        cacheStats={cacheStats}
        maxCacheSize={maxCacheSize}
        formatFileSize={formatFileSize}
        onClearAll={handleClearAll}
        videoCount={videos.length}
      />

      {/* 表單模態框 */}
      {showFormModal && (
        <VideoFormModal
          video={editingVideo}
          existingVideos={videos}
          onClose={() => {
            setShowFormModal(false);
            setEditingVideo(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

// 影片播放器模態框
function VideoPlayerModal({ video, videoRef, onClose }: { video: VideoData; videoRef: React.RefObject<HTMLVideoElement | null>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{video.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <PlyrPlayer
            type="video"
            src={videoRef.current?.src || video.file || ''}
            poster={video.cover}
            className="w-full"
          />
        </div>
        {video.note && (
          <div className="p-4 pt-0">
            <p className="text-gray-600 dark:text-gray-400 text-sm">{video.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 影片管理卡片
interface VideoManagementCardProps {
  video: VideoData;
  cacheStatus?: { cached: boolean; downloading: boolean; progress: number; error?: string };
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onDeleteCache: () => void;
}

function VideoManagementCard({ video, cacheStatus, onPlay, onEdit, onDelete, onDownload, onDeleteCache }: VideoManagementCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 如果沒有封面圖，從影片生成縮圖
    if (!video.cover && video.file) {
      const videoElement = document.createElement('video');
      videoElement.src = video.file;
      videoElement.crossOrigin = 'anonymous';
      videoElement.currentTime = 1;

      videoElement.addEventListener('seeked', () => {
        try {
          const canvas = canvasRef.current || document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setThumbnailUrl(dataUrl);
          }
        } catch (error) {
          console.error('Thumbnail generation error:', error);
        }
      });

      videoElement.load();
    }
  }, [video.cover, video.file]);

  return (
    <DataCard className="overflow-hidden hover:shadow-md transition-all duration-200 group">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 縮圖 */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer" onClick={onPlay}>
        {(video.cover || thumbnailUrl) ? (
          <img 
            src={video.cover || thumbnailUrl || ''} 
            alt={video.name} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300" />
        )}
        
        {/* 播放按鈕 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="text-white group-hover:scale-110 transition-transform duration-300 w-12 h-12 drop-shadow-lg" />
        </div>
        
        {/* 分類標籤 */}
        {video.category && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-indigo-500/90 text-white rounded-md backdrop-blur-sm">
              {video.category}
            </span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          {typeof video.cover === 'string' && video.cover && (
            <div className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
              THUMBNAIL
            </div>
          )}
          <CacheStatusIcon status={cacheStatus} />
        </div>

        {/* 編輯和刪除按鈕 */}
        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg p-2 transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg p-2 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      
      {/* 資訊 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{video.name}</h3>
        {video.note && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{video.note}</p>}
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatLocalDate(video.$createdAt)}
          </span>
          {video.category && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{video.category}</span>}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onPlay} className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-sm">
            <Play size={14} />
            <span className="hidden xs:inline">播放影片</span>
            <span className="xs:hidden">播放</span>
          </Button>
          
          {cacheStatus?.cached ? (
            <Button onClick={onDeleteCache} variant="outline" className="gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm">
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

// 影片表單模態框
function VideoFormModal({ video, existingVideos, onClose, onSuccess }: { video: VideoData | null; existingVideos: VideoData[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: video?.name || '',
    file: video?.file || '',
    note: video?.note || '',
    ref: video?.ref || '',
    category: video?.category || '',
    hash: video?.hash || '',
    cover: typeof video?.cover === 'string' ? video.cover : '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileHash, setFileHash] = useState<string>(''); // 儲存檔案 hash
  const [duplicateWarning, setDuplicateWarning] = useState<string>(''); // 重複警告
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
  const [coverPreviewLoading, setCoverPreviewLoading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [coverUploadStatus, setCoverUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [useCategorySelect, setUseCategorySelect] = useState(true); // 是否使用選擇框

  // 獲取所有已存在的分類
  const existingCategories = Array.from(new Set(existingVideos.map(v => v.category).filter(Boolean)));

  // 計算檔案 SHA-256 hash
  const calculateFileHash = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Hash calculation error:', error);
      // 如果計算失敗，使用備用方案
      return `fallback_${file.name}_${file.size}_${file.lastModified}`;
    }
  };

  // 從影片第 1 秒生成縮圖
  const generateThumbnailFromVideo = (videoUrl: string, videoFileName?: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // 設定到第 1 秒

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // 轉換為 Blob
          canvas.toBlob((blob) => {
            if (blob) {
              // 使用影片名稱生成縮圖檔名
              const baseFileName = videoFileName || 'video';
              const nameWithoutExt = baseFileName.substring(0, baseFileName.lastIndexOf('.')) || baseFileName;
              const thumbnailName = `${nameWithoutExt}-thumbnail.jpg`;
              
              const file = new File([blob], thumbnailName, { type: 'image/jpeg' });
              setSelectedCoverFile(file);
              const thumbnailUrl = URL.createObjectURL(blob);
              setCoverPreviewUrl(thumbnailUrl);
            }
          }, 'image/jpeg', 0.9);
        }
      } catch (error) {
        console.error('Thumbnail generation error:', error);
      } finally {
        URL.revokeObjectURL(videoUrl);
      }
    });

    video.addEventListener('error', (e) => {
      console.error('Video load error:', e);
    });

    video.load();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小 (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('檔案大小不能超過 50MB');
      return;
    }

    // 檢查檔案類型
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('只支援 MP4, WebM, OGG, MOV 格式的影片');
      return;
    }

    // 顯示預覽載入狀態
    setPreviewLoading(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setDuplicateWarning(''); // 清除之前的警告
    
    // 儲存檔案並產生預覽 URL
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // 計算檔案 hash
    const hash = await calculateFileHash(file);
    setFileHash(hash);

    // 如果沒有封面圖，從影片第 1 秒生成縮圖
    if (!formData.cover && !selectedCoverFile) {
      generateThumbnailFromVideo(objectUrl, file.name);
    }

    // 檢查是否與現有影片重複
    setFileHash(hash);
    setFormData({ ...formData, hash });
    
    // 檢查是否有重複的 hash
    const duplicateVideo = existingVideos.find(vid => 
      vid.hash === hash && (!video || vid.$id !== video.$id)
    );
    
    if (duplicateVideo) {
      setDuplicateWarning(`警告：此影片與「${duplicateVideo.name}」相同，請勿重複上傳！`);
    }
    
    // 模擬預覽載入完成
    setTimeout(() => setPreviewLoading(false), 300);
  };

  const uploadFileToAppwrite = async (file: File): Promise<{ url: string; fileId: string }> => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    // 模擬上傳進度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: getAppwriteHeaders(),
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上傳失敗');
      }

      const data = await response.json();
      setUploadStatus('success');
      return { url: data.url, fileId: data.fileId || '' };
    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      throw error;
    }
  };

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小 (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('封面圖大小不能超過 50MB');
      return;
    }

    // 檢查檔案類型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('只支援 JPG, PNG, GIF, WEBP 格式的圖片');
      return;
    }

    // 顯示預覽載入狀態
    setCoverPreviewLoading(true);
    setCoverUploadStatus('idle');
    setCoverUploadProgress(0);
    
    // 儲存檔案並產生預覽 URL
    setSelectedCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(objectUrl);
    
    // 模擬預覽載入完成
    setTimeout(() => setCoverPreviewLoading(false), 300);
  };

  const uploadCoverFileToAppwrite = async (file: File): Promise<{ url: string; fileId: string }> => {
    setCoverUploadStatus('uploading');
    setCoverUploadProgress(0);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    // 模擬上傳進度
    const progressInterval = setInterval(() => {
      setCoverUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: getAppwriteHeaders(),
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setCoverUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '封面圖上傳失敗');
      }

      const data = await response.json();
      setCoverUploadStatus('success');
      return { url: data.url, fileId: data.fileId || '' };
    } catch (error) {
      clearInterval(progressInterval);
      setCoverUploadStatus('error');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('請輸入影片名稱');
      return;
    }

    // 檢查是否有重複
    if (duplicateWarning) {
      alert('此影片與既有影片重複，無法上傳！請選擇其他影片。');
      return;
    }

    setSubmitting(true);
    try {
      let finalFormData = { ...formData };

      // 如果有選擇新檔案，先上傳到 Appwrite
      if (selectedFile) {
        const { url, fileId } = await uploadFileToAppwrite(selectedFile);
        finalFormData.file = url;
        // 使用已計算的 hash，如果沒有則使用 fileId
        finalFormData.hash = fileHash || fileId;
      } else if (!video && !formData.hash) {
        // 新增且沒有檔案也沒有 hash 的情況，生成一個備用 hash
        finalFormData.hash = `no_file_${Date.now()}`;
      }

      // 如果有選擇封面圖檔案，上傳到 Appwrite
      if (selectedCoverFile) {
        const { url } = await uploadCoverFileToAppwrite(selectedCoverFile);
        finalFormData.cover = url;
      }

      const apiUrl = video 
        ? addAppwriteConfigToUrl(`${API_ENDPOINTS.VIDEO}/${video.$id}`) 
        : addAppwriteConfigToUrl(API_ENDPOINTS.VIDEO);
      const method = video ? 'PUT' : 'POST';
      
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) throw new Error(video ? '更新失敗' : '新增失敗');
      
      onSuccess();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {video ? '編輯影片' : '新增影片'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              影片名稱 / Video Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="請輸入影片名稱 / Video Name"
              required
              className="h-12 rounded-xl"
            />
            <div className="px-1 h-4">
              {formData.name ? (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
              ) : (
                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">請輸入名稱 / Please enter name</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              影片檔案 / Video File (URL or Upload)
            </label>
            <div className="space-y-3">
              <Input
                value={formData.file}
                onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                placeholder="https://example.com/video.mp4"
                disabled={submitting}
                className="h-12 rounded-xl"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">或 / OR</span>
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {previewLoading ? '載入中...' : selectedFile ? `已選擇: ${selectedFile.name}` : '上傳影片 (最大 50MB) / Upload (Max 50MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileSelect}
                    disabled={submitting || previewLoading}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="px-1 h-4">
                {formData.file || selectedFile ? (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已備妥 / Ready</span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請提供 URL 或上傳檔案 / (Optional) Please provide URL or upload</span>
                )}
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">預覽：</p>
                  <video src={previewUrl} controls className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700" />
                </div>
              )}
              {duplicateWarning && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {duplicateWarning}
                  </p>
                </div>
              )}
              {uploadStatus === 'uploading' && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>上傳至 Appwrite...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {uploadStatus === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400">✓ 上傳成功</p>
              )}
              {uploadStatus === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400">✗ 上傳失敗</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              備註 / Note
            </label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="影片備註說明 / Video Note"
              rows={3}
              className="rounded-xl"
            />
            <div className="px-1 h-4">
              {formData.note ? (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
              ) : (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入備註 / (Optional) Please enter note</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分類 / Category
              </label>
              {useCategorySelect && existingCategories.length > 0 ? (
                <div className="space-y-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setUseCategorySelect(false);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="選擇分類 / Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="__custom__">自行輸入... / Custom input...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="輸入新分類 / Enter new category"
                    className="h-12 rounded-xl"
                  />
                  {existingCategories.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUseCategorySelect(true)}
                      className="text-xs h-7"
                    >
                      從現有分類中選擇 / Select from existing
                    </Button>
                  )}
                </div>
              )}
              <div className="px-1 h-4">
                {formData.category ? (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入分類 / (Optional) Please enter category</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                參考 / Reference
              </label>
              <Input
                value={formData.ref}
                onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                placeholder="參考資訊 / Reference Info"
                className="h-12 rounded-xl"
              />
              <div className="px-1 h-4">
                {formData.ref ? (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入參考 / (Optional) Please enter reference</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hash (程式自動生成)
            </label>
            <Input
              value={formData.hash}
              disabled
              placeholder="上傳檔案後自動生成"
              className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              封面圖 URL 或上傳檔案
            </label>
            <div className="space-y-3">
              <Input
                value={formData.cover}
                onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                disabled={submitting}
                maxLength={150}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">或</span>
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {coverPreviewLoading ? '載入中...' : selectedCoverFile ? `已選擇: ${selectedCoverFile.name}` : '上傳封面圖 (最大 50MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleCoverFileSelect}
                    disabled={submitting || coverPreviewLoading}
                    className="hidden"
                  />
                </label>
              </div>
              {coverPreviewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">封面圖預覽：</p>
                  <img src={coverPreviewUrl} alt="Cover Preview" className="max-h-32 rounded-lg border border-gray-200 dark:border-gray-700" />
                </div>
              )}
              {coverUploadStatus === 'uploading' && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>上傳封面圖至 Appwrite...</span>
                    <span>{coverUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${coverUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {coverUploadStatus === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400">✓ 封面圖上傳成功</p>
              )}
              {coverUploadStatus === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400">✗ 封面圖上傳失敗</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} className="flex-1 bg-gray-500 hover:bg-gray-600 rounded-xl">
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !!duplicateWarning} 
              className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '處理中...' : (video ? '更新' : '新增')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 影片播放器
function VideoPlayer({ video, videoRef }: { video: VideoItem; videoRef: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <DataCard className="overflow-hidden">
      <div className="p-2 sm:p-4">
        <PlyrPlayer
          type="video"
          src={videoRef.current?.src || video.url || `/videos/${video.filename}`}
          className="w-full"
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
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer" onClick={onPlay}>
        {typeof video.cover === 'string' && video.cover ? (
          <img 
            src={video.cover} 
            alt={video.title} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
            <Play className="text-white group-hover:scale-110 transition-transform duration-300 w-12 h-12" />
          </div>
        )}
        
        {typeof video.cover === 'string' && video.cover && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play className="text-white w-12 h-12 drop-shadow-lg opacity-80" />
          </div>
        )}
        
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
            {video.duration}
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          {typeof video.cover === 'string' && video.cover && (
            <div className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center">
              THUMBNAIL
            </div>
          )}
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
