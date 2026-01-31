"use client";

import { useState } from "react";
import { Image as ImageIcon, Download, Eye, Calendar, RefreshCw } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { DataCard } from "@/components/ui/data-card";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useImages } from "@/hooks";
import { ImageFile } from "@/types";
import { formatFileSize, formatShortDate, formatNumericDate, formatLocalDate } from "@/lib/formatters";

export default function ImageGallery() {
  const { images, loading, loadImages } = useImages();
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  return (
    <div className="space-y-4 lg:space-y-6">
      <CopyrightBanner />
      
      <SectionHeader
        title="鋒兄圖片"
        subtitle={loading ? "載入中..." : `共 ${images.length} 張圖片`}
        action={
          <Button onClick={loadImages} disabled={loading} className="gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">重新載入</span>
          </Button>
        }
      />

      <ImageStats images={images} />
      <ImageGrid images={images} loading={loading} onSelectImage={setSelectedImage} />
      
      {selectedImage && (
        <ImagePreviewModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

// 版權橫幅
function CopyrightBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl text-white shadow-lg">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide">鋒兄塗哥公關資訊</h2>
        <div className="text-sm sm:text-base opacity-90">© 版權所有 2025～2125</div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-80">
          <span>前端使用 React (Next.js)</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>後端使用 Appwrite</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>網頁存放於 Vercel</span>
          <span className="hidden sm:inline text-white/50">|</span>
          <span>影片存放於 Vercel Blob</span>
        </div>
      </div>
    </div>
  );
}

// 統計卡片
function ImageStats({ images }: { images: ImageFile[] }) {
  const jpgCount = images.filter(img => ['.jpg', '.jpeg'].includes(img.extension.toLowerCase())).length;
  const pngCount = images.filter(img => img.extension.toLowerCase() === '.png').length;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
      <StatCard title="總圖片數" value={images.length} icon={ImageIcon} gradient="from-blue-500 to-blue-600" />
      <StatCard title="JPG/JPEG" value={jpgCount} iconElement={<span className="text-2xl">📷</span>} gradient="from-green-500 to-green-600" />
      <StatCard title="PNG" value={pngCount} iconElement={<span className="text-2xl">🖼️</span>} gradient="from-purple-500 to-purple-600" />
    </div>
  );
}

// 圖片網格
function ImageGrid({ images, loading, onSelectImage }: { images: ImageFile[]; loading: boolean; onSelectImage: (img: ImageFile) => void }) {
  if (loading) return <FullPageLoading text="載入圖片中..." />;
  if (images.length === 0) return <EmptyState icon={<ImageIcon className="text-gray-400" size={32} />} title="沒有找到圖片" />;

  return (
    <DataCard className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
        {images.map((image, index) => (
          <ImageCard key={index} image={image} onSelect={() => onSelectImage(image)} />
        ))}
      </div>
    </DataCard>
  );
}

// 單張圖片卡片
function ImageCard({ image, onSelect }: { image: ImageFile; onSelect: () => void }) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image.path}
          alt={image.name}
          className="w-full h-full object-cover bg-gray-50 group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onClick={onSelect}
        />
        
        {/* 漸變遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 操作按鈕 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-1.5 sm:p-2 bg-black/80 backdrop-blur-sm rounded-lg hover:bg-black/95 transition-colors" title="查看大圖">
            <Eye className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <a href={image.path} download={image.name} onClick={(e) => e.stopPropagation()} className="p-1.5 sm:p-2 bg-black/80 backdrop-blur-sm rounded-lg hover:bg-black/95 transition-colors" title="下載圖片">
            <Download className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>
        </div>
        
        {/* 格式標籤 */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
            {image.extension.replace('.', '').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* 圖片資訊 */}
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate mb-1" title={image.name}>
          {image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{formatFileSize(image.size)}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">{formatShortDate(image.modified)}</span>
            <span className="sm:hidden">{formatNumericDate(image.modified)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// 圖片預覽模態框
function ImagePreviewModal({ image, onClose }: { image: ImageFile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="relative w-full h-full max-w-7xl flex flex-col">
        {/* 圖片 */}
        <div className="flex-1 flex items-center justify-center p-12 sm:p-16">
          <img src={image.path} alt={image.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
        
        {/* 頂部控制欄 */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
              {image.extension.replace('.', '').toUpperCase()}
            </span>
            <span className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm">
              {formatFileSize(image.size)}
            </span>
          </div>
          <div className="flex gap-2">
            <a href={image.path} download={image.name} className="p-2.5 bg-black/80 backdrop-blur-sm rounded-lg text-white hover:bg-black/95 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Download className="w-5 h-5" />
            </a>
            <button onClick={onClose} className="p-2.5 bg-black/80 backdrop-blur-sm rounded-lg text-white hover:bg-black/95 transition-colors">
              <span className="text-lg font-bold">✕</span>
            </button>
          </div>
        </div>
        
        {/* 底部資訊欄 */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-white">
            <h3 className="font-medium mb-2 truncate">{image.name}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>大小: <span className="font-medium">{formatFileSize(image.size)}</span></span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                修改: <span className="font-medium">{formatLocalDate(image.modified)}</span>
              </span>
              <span className="ml-auto text-xs opacity-75">點擊空白處關閉</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
