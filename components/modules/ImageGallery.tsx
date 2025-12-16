"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Download, Eye, Calendar } from "lucide-react";
import { ImageFile } from "@/types/image";
import { formatFileSize, formatDate, formatShortDate, formatNumericDate } from "@/lib/imageUtils";

export default function ImageGallery() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  useEffect(() => {
    loadImagesData();
  }, []);

  const loadImagesData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/images");
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error("載入圖片失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 版權信息區域 */}
      <div id="copyright-section" className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-4 lg:p-6 rounded-2xl text-white shadow-lg">
        <div className="text-center space-y-2">
          <h2 className="text-xl lg:text-2xl font-bold">鋒兄塗哥公關資訊</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4 text-sm lg:text-base">
            <span className="flex items-center justify-center gap-1">
              <span>© 版權所有 2025～2125</span>
            </span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span>前端使用 React (Next.js)</span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span>後端使用 Appwrite</span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span>影片存放於 Vercel</span>
            <span className="hidden sm:inline text-white/60">|</span>
            <span>網頁存放於 Vercel</span>
          </div>
        </div>
      </div>

      {/* 標題區域 */}
      <div id="title-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">圖片展示</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? "載入中..." : `共 ${images.length} 張圖片`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadImagesData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 disabled:opacity-50"
          >
            <ImageIcon size={18} />
            重新載入
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div id="stats-section">
        <ImageStats images={images} />
      </div>

      {/* 圖片網格 */}
      <div id="gallery-section">
        <ImageGrid 
          images={images} 
          loading={loading} 
          onSelectImage={setSelectedImage} 
        />
      </div>

      {/* 圖片預覽模態框 */}
      {selectedImage && (
        <ImagePreviewModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}


// 統計卡片組件
function ImageStats({ images }: { images: ImageFile[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-blue-500/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs lg:text-sm">總圖片數</p>
            <p className="text-xl lg:text-2xl font-bold">{images.length}</p>
          </div>
          <ImageIcon size={24} className="text-blue-200 lg:w-8 lg:h-8" />
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-green-500/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs lg:text-sm">JPG/JPEG</p>
            <p className="text-xl lg:text-2xl font-bold">
              {images.filter(img => ['.jpg', '.jpeg'].includes(img.extension)).length}
            </p>
          </div>
          <div className="text-green-200 text-xl lg:text-2xl">📷</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 lg:p-6 rounded-2xl text-white shadow-lg shadow-purple-500/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-xs lg:text-sm">PNG</p>
            <p className="text-xl lg:text-2xl font-bold">
              {images.filter(img => img.extension === '.png').length}
            </p>
          </div>
          <div className="text-purple-200 text-xl lg:text-2xl">🖼️</div>
        </div>
      </div>
    </div>
  );
}

// 圖片網格組件
function ImageGrid({ 
  images, 
  loading, 
  onSelectImage 
}: { 
  images: ImageFile[]; 
  loading: boolean; 
  onSelectImage: (image: ImageFile) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-300">載入圖片中...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="text-gray-400" size={32} />
        </div>
        <p className="text-gray-500 dark:text-gray-300">沒有找到圖片</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6">
      <div className="grid gap-3 sm:gap-4 lg:gap-6 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5 
        xl:grid-cols-6 
        2xl:grid-cols-8">
        {images.map((image, index) => (
          <ImageCard 
            key={index} 
            image={image} 
            onSelect={() => onSelectImage(image)} 
          />
        ))}
      </div>
    </div>
  );
}


// 單張圖片卡片組件
function ImageCard({ 
  image, 
  onSelect 
}: { 
  image: ImageFile; 
  onSelect: () => void;
}) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600">
      {/* 響應式圖片容器 */}
      <div className="relative overflow-hidden rounded-t-xl aspect-square">
        <img
          src={image.path}
          alt={image.name}
          className="w-full h-full object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onClick={onSelect}
        />
        
        {/* 漸變遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* 操作按鈕 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-sm rounded-lg hover:bg-black/90 transition-colors touch-manipulation"
              title="查看大圖"
            >
              <Eye className="text-white" size={12} />
            </button>
            <a
              href={image.path}
              download={image.name}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-sm rounded-lg hover:bg-black/90 transition-colors touch-manipulation"
              title="下載圖片"
            >
              <Download className="text-white" size={12} />
            </a>
          </div>
        </div>
        
        {/* 圖片格式標籤 */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-medium">
            {image.extension.replace('.', '').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* 圖片資訊 */}
      <div className="p-2 sm:p-3 bg-white dark:bg-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate mb-1" title={image.name}>
          {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
          <span className="font-medium">{formatFileSize(image.size)}</span>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            <span className="hidden sm:inline">
              {formatShortDate(image.modified)}
            </span>
            <span className="sm:hidden">
              {formatNumericDate(image.modified)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}


// 圖片預覽模態框組件
function ImagePreviewModal({ 
  image, 
  onClose 
}: { 
  image: ImageFile; 
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-6xl max-h-full flex flex-col">
        {/* 圖片容器 */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <img
            src={image.path}
            alt={image.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* 頂部控制欄 */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
              {image.extension.replace('.', '').toUpperCase()}
            </span>
            <span className="hidden sm:inline px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm">
              {formatFileSize(image.size)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={image.path}
              download={image.name}
              className="p-2 sm:p-3 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-colors touch-manipulation"
              title="下載圖片"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/90 transition-colors touch-manipulation"
              title="關閉"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
        </div>
        
        {/* 底部資訊欄 */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <div className="bg-black/70 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-white">
            <h3 className="font-medium mb-2 text-sm sm:text-base truncate" title={image.name}>
              {image.name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <span className="opacity-75">大小:</span>
                <span className="font-medium">{formatFileSize(image.size)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                <span className="opacity-75">修改:</span>
                <span className="font-medium">{formatDate(image.modified)}</span>
              </span>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                <span className="text-xs opacity-75">點擊空白處關閉</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
