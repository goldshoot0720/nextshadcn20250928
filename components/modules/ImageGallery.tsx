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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* 版權信息區域 - 針對不同設備優化 */}
      <div id="copyright-section" className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 
        p-3 xs:p-4 sm:p-5 lg:p-6 xl:p-8 
        rounded-xl sm:rounded-2xl 
        text-white shadow-lg">
        <div className="text-center space-y-1.5 sm:space-y-2 lg:space-y-3">
          {/* 主標題 - 響應式字體大小 */}
          <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold 
            leading-tight tracking-wide">
            鋒兄塗哥公關資訊
          </h2>
          
          {/* 技術信息 - 針對不同設備的佈局 */}
          <div className="space-y-2 sm:space-y-0">
            {/* 版權信息 - 單獨一行 */}
            <div className="text-xs xs:text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
              © 版權所有 2025～2125
            </div>
            
            {/* 技術架構 - 響應式佈局 */}
            <div className="flex flex-col xs:flex-row xs:flex-wrap xs:items-center xs:justify-center 
              gap-1 xs:gap-2 sm:gap-3 lg:gap-4 
              text-xs xs:text-sm sm:text-base lg:text-lg
              opacity-90">
              
              {/* iPhone SE2 直向: 垂直排列 */}
              <span className="xs:hidden">前端使用 React (Next.js)</span>
              <span className="xs:hidden">後端使用 Appwrite</span>
              <span className="xs:hidden">影片存放於 Vercel</span>
              <span className="xs:hidden">網頁存放於 Vercel</span>
              
              {/* iPhone SE2 橫向 & 其他設備: 水平排列 */}
              <div className="hidden xs:flex xs:flex-wrap xs:items-center xs:justify-center 
                gap-1 xs:gap-2 sm:gap-3 lg:gap-4">
                <span>前端使用 React (Next.js)</span>
                <span className="text-white/60 hidden sm:inline">|</span>
                <span>後端使用 Appwrite</span>
                <span className="text-white/60 hidden sm:inline">|</span>
                <span>影片存放於 Vercel</span>
                <span className="text-white/60 hidden sm:inline">|</span>
                <span>網頁存放於 Vercel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 標題區域 - 響應式優化 */}
      <div id="title-section" className="flex flex-col xs:flex-row xs:items-center xs:justify-between 
        gap-3 sm:gap-4 lg:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 
            font-bold text-gray-900 dark:text-gray-100 
            leading-tight tracking-wide truncate">
            圖片展示
          </h1>
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg 
            text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
            {loading ? "載入中..." : `共 ${images.length} 張圖片`}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={loadImagesData}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 
              px-3 xs:px-4 sm:px-5 lg:px-6 
              py-2 xs:py-2.5 sm:py-3 lg:py-3.5
              text-xs xs:text-sm sm:text-base lg:text-lg
              bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
              text-white rounded-lg xs:rounded-xl 
              transition-colors duration-200 disabled:opacity-50
              touch-manipulation"
          >
            <ImageIcon size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="hidden xs:inline">重新載入</span>
            <span className="xs:hidden">載入</span>
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


// 統計卡片組件 - 針對不同設備優化
function ImageStats({ images }: { images: ImageFile[] }) {
  return (
    <div className="grid gap-3 sm:gap-4 lg:gap-6
      grid-cols-1 xs:grid-cols-3 
      portrait:grid-cols-1 landscape:xs:grid-cols-3">
      
      {/* 總圖片數卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 
        p-3 xs:p-4 sm:p-5 lg:p-6 xl:p-8
        rounded-xl sm:rounded-2xl 
        text-white shadow-lg shadow-blue-500/25
        transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-blue-100 text-xs xs:text-sm sm:text-base lg:text-lg 
              font-medium truncate">
              總圖片數
            </p>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 
              font-bold leading-tight">
              {images.length}
            </p>
          </div>
          <ImageIcon className="text-blue-200 flex-shrink-0 ml-2
            w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10" />
        </div>
      </div>
      
      {/* JPG/JPEG 卡片 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 
        p-3 xs:p-4 sm:p-5 lg:p-6 xl:p-8
        rounded-xl sm:rounded-2xl 
        text-white shadow-lg shadow-green-500/25
        transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-green-100 text-xs xs:text-sm sm:text-base lg:text-lg 
              font-medium truncate">
              JPG/JPEG
            </p>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 
              font-bold leading-tight">
              {images.filter(img => ['.jpg', '.jpeg'].includes(img.extension)).length}
            </p>
          </div>
          <div className="text-green-200 flex-shrink-0 ml-2
            text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
            📷
          </div>
        </div>
      </div>
      
      {/* PNG 卡片 */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 
        p-3 xs:p-4 sm:p-5 lg:p-6 xl:p-8
        rounded-xl sm:rounded-2xl 
        text-white shadow-lg shadow-purple-500/25
        transform hover:scale-105 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-purple-100 text-xs xs:text-sm sm:text-base lg:text-lg 
              font-medium truncate">
              PNG
            </p>
            <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 
              font-bold leading-tight">
              {images.filter(img => img.extension === '.png').length}
            </p>
          </div>
          <div className="text-purple-200 flex-shrink-0 ml-2
            text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
            🖼️
          </div>
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
    <div className="bg-white dark:bg-gray-800 
      rounded-xl sm:rounded-2xl 
      shadow-sm border border-gray-200 dark:border-gray-700 
      p-2 xs:p-3 sm:p-4 lg:p-6 xl:p-8">
      
      {/* 響應式網格 - 針對不同設備和方向優化 */}
      <div className="grid gap-2 xs:gap-3 sm:gap-4 lg:gap-6 xl:gap-8
        
        /* iPhone SE2 直向 (375px) */
        grid-cols-2
        
        /* iPhone SE2 橫向 (667px) & Samsung Galaxy A53 直向 (412px) */
        xs:grid-cols-3
        
        /* Samsung Galaxy A53 橫向 (915px) & 小平板 */
        sm:grid-cols-4
        
        /* Redmi Pad SE 8.7 直向 (800px) */
        md:grid-cols-5
        
        /* Redmi Pad SE 8.7 橫向 (1280px) & 桌面 100% */
        lg:grid-cols-6
        
        /* 桌面 150% 縮放 & 大屏幕 */
        xl:grid-cols-7
        2xl:grid-cols-8
        
        /* 超大屏幕 */
        3xl:grid-cols-10
        
        /* 方向特定優化 */
        portrait:xs:grid-cols-2
        portrait:sm:grid-cols-3
        portrait:md:grid-cols-4
        portrait:lg:grid-cols-5
        
        landscape:xs:grid-cols-4
        landscape:sm:grid-cols-5
        landscape:md:grid-cols-6
        landscape:lg:grid-cols-7
        landscape:xl:grid-cols-8
        landscape:2xl:grid-cols-10">
        
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


// 單張圖片卡片組件 - 針對不同設備優化
function ImageCard({ 
  image, 
  onSelect 
}: { 
  image: ImageFile; 
  onSelect: () => void;
}) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 
      rounded-lg xs:rounded-xl sm:rounded-2xl 
      overflow-hidden hover:shadow-xl 
      transition-all duration-300 cursor-pointer 
      border border-gray-100 dark:border-gray-700 
      hover:border-gray-200 dark:hover:border-gray-600
      transform hover:scale-105 active:scale-95">
      
      {/* 響應式圖片容器 */}
      <div className="relative overflow-hidden 
        rounded-t-lg xs:rounded-t-xl sm:rounded-t-2xl 
        aspect-square">
        <img
          src={image.path}
          alt={image.name}
          className="w-full h-full object-cover bg-gray-50 
            group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onClick={onSelect}
        />
        
        {/* 漸變遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t 
          from-black/30 via-transparent to-transparent 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-300"></div>
        
        {/* 操作按鈕 - 響應式大小 */}
        <div className="absolute top-1 xs:top-2 sm:top-3 
          right-1 xs:right-2 sm:right-3 
          opacity-0 group-hover:opacity-100 
          transition-all duration-300 transform 
          translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-1 xs:gap-1.5 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-1 xs:p-1.5 sm:p-2 lg:p-2.5
                bg-black/80 backdrop-blur-sm 
                rounded-md xs:rounded-lg 
                hover:bg-black/95 
                transition-colors touch-manipulation
                active:scale-95"
              title="查看大圖"
            >
              <Eye className="text-white 
                w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </button>
            <a
              href={image.path}
              download={image.name}
              onClick={(e) => e.stopPropagation()}
              className="p-1 xs:p-1.5 sm:p-2 lg:p-2.5
                bg-black/80 backdrop-blur-sm 
                rounded-md xs:rounded-lg 
                hover:bg-black/95 
                transition-colors touch-manipulation
                active:scale-95"
              title="下載圖片"
            >
              <Download className="text-white 
                w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </a>
          </div>
        </div>
        
        {/* 圖片格式標籤 - 響應式位置和大小 */}
        <div className="absolute bottom-1 xs:bottom-2 sm:bottom-3 
          left-1 xs:left-2 sm:left-3 
          opacity-0 group-hover:opacity-100 
          transition-all duration-300 transform 
          translate-y-2 group-hover:translate-y-0">
          <span className="px-1.5 xs:px-2 sm:px-3 
            py-0.5 xs:py-1 sm:py-1.5 
            bg-black/80 backdrop-blur-sm 
            rounded xs:rounded-md sm:rounded-lg 
            text-white 
            text-xs xs:text-xs sm:text-sm lg:text-base
            font-medium">
            {image.extension.replace('.', '').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* 圖片資訊 - 響應式間距和字體 */}
      <div className="p-1.5 xs:p-2 sm:p-3 lg:p-4 
        bg-white dark:bg-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 
          text-xs xs:text-sm sm:text-base lg:text-lg
          truncate mb-1 xs:mb-1.5 sm:mb-2 
          leading-tight" 
          title={image.name}>
          {/* 響應式文字截斷 */}
          <span className="xs:hidden">
            {image.name.length > 12 ? `${image.name.substring(0, 12)}...` : image.name}
          </span>
          <span className="hidden xs:inline sm:hidden">
            {image.name.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}
          </span>
          <span className="hidden sm:inline lg:hidden">
            {image.name.length > 18 ? `${image.name.substring(0, 18)}...` : image.name}
          </span>
          <span className="hidden lg:inline">
            {image.name.length > 25 ? `${image.name.substring(0, 25)}...` : image.name}
          </span>
        </h3>
        
        <div className="flex items-center justify-between 
          text-xs xs:text-xs sm:text-sm lg:text-base
          text-gray-500 dark:text-gray-300">
          <span className="font-medium truncate flex-1 mr-2">
            {formatFileSize(image.size)}
          </span>
          <span className="flex items-center gap-0.5 xs:gap-1 flex-shrink-0">
            <Calendar className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
            {/* 響應式日期格式 */}
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


// 圖片預覽模態框組件 - 針對不同設備優化
function ImagePreviewModal({ 
  image, 
  onClose 
}: { 
  image: ImageFile; 
  onClose: () => void;
}) {
  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 
        flex items-center justify-center 
        p-1 xs:p-2 sm:p-4 lg:p-6"
      onClick={onClose}
    >
      <div className="relative w-full h-full 
        max-w-7xl max-h-full flex flex-col">
        
        {/* 圖片容器 - 響應式間距 */}
        <div className="flex-1 flex items-center justify-center min-h-0 
          p-8 xs:p-12 sm:p-16 lg:p-20">
          <img
            src={image.path}
            alt={image.name}
            className="max-w-full max-h-full object-contain 
              rounded-lg xs:rounded-xl sm:rounded-2xl 
              shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* 頂部控制欄 - 響應式佈局 */}
        <div className="absolute 
          top-1 xs:top-2 sm:top-4 lg:top-6 
          left-1 xs:left-2 sm:left-4 lg:left-6 
          right-1 xs:right-2 sm:right-4 lg:right-6 
          flex justify-between items-start gap-2">
          
          {/* 左側信息標籤 */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
            <span className="px-2 xs:px-3 sm:px-4 
              py-1 xs:py-1.5 sm:py-2 
              bg-black/80 backdrop-blur-sm 
              rounded-md xs:rounded-lg sm:rounded-xl 
              text-white 
              text-xs xs:text-sm sm:text-base lg:text-lg
              font-medium">
              {image.extension.replace('.', '').toUpperCase()}
            </span>
            <span className="px-2 xs:px-3 sm:px-4 
              py-1 xs:py-1.5 sm:py-2 
              bg-black/80 backdrop-blur-sm 
              rounded-md xs:rounded-lg sm:rounded-xl 
              text-white 
              text-xs xs:text-sm sm:text-base lg:text-lg">
              {formatFileSize(image.size)}
            </span>
          </div>
          
          {/* 右側操作按鈕 */}
          <div className="flex items-center gap-1 xs:gap-2">
            <a
              href={image.path}
              download={image.name}
              className="p-2 xs:p-2.5 sm:p-3 lg:p-4
                bg-black/80 backdrop-blur-sm 
                rounded-md xs:rounded-lg sm:rounded-xl 
                text-white hover:bg-black/95 
                transition-colors touch-manipulation
                active:scale-95"
              title="下載圖片"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </a>
            <button
              onClick={onClose}
              className="p-2 xs:p-2.5 sm:p-3 lg:p-4
                bg-black/80 backdrop-blur-sm 
                rounded-md xs:rounded-lg sm:rounded-xl 
                text-white hover:bg-black/95 
                transition-colors touch-manipulation
                active:scale-95"
              title="關閉"
            >
              <span className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold">✕</span>
            </button>
          </div>
        </div>
        
        {/* 底部資訊欄 - 響應式佈局 */}
        <div className="absolute 
          bottom-1 xs:bottom-2 sm:bottom-4 lg:bottom-6 
          left-1 xs:left-2 sm:left-4 lg:left-6 
          right-1 xs:right-2 sm:right-4 lg:right-6">
          <div className="bg-black/80 backdrop-blur-sm 
            rounded-md xs:rounded-lg sm:rounded-xl 
            p-2 xs:p-3 sm:p-4 lg:p-6 
            text-white">
            
            <h3 className="font-medium mb-1 xs:mb-2 sm:mb-3 
              text-sm xs:text-base sm:text-lg lg:text-xl
              truncate" 
              title={image.name}>
              {image.name}
            </h3>
            
            <div className="flex flex-col xs:flex-row xs:items-center 
              gap-1 xs:gap-2 sm:gap-4 
              text-xs xs:text-sm sm:text-base lg:text-lg">
              
              <span className="flex items-center gap-1 xs:gap-2">
                <span className="opacity-75">大小:</span>
                <span className="font-medium">{formatFileSize(image.size)}</span>
              </span>
              
              <span className="flex items-center gap-1 xs:gap-2">
                <Calendar className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="opacity-75">修改:</span>
                <span className="font-medium">
                  {/* 響應式日期顯示 */}
                  <span className="xs:hidden">{formatNumericDate(image.modified)}</span>
                  <span className="hidden xs:inline sm:hidden">{formatShortDate(image.modified)}</span>
                  <span className="hidden sm:inline">{formatDate(image.modified)}</span>
                </span>
              </span>
              
              <div className="flex items-center gap-2 
                mt-1 xs:mt-0 xs:ml-auto">
                <span className="text-xs xs:text-sm opacity-75">
                  <span className="xs:hidden">輕觸關閉</span>
                  <span className="hidden xs:inline">點擊空白處關閉</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
