"use client";

import { useState } from "react";
import { Music as MusicIcon, Plus, Edit, Trash2, X, Upload, Calendar, Play, Pause } from "lucide-react";
import { useMusic, MusicData } from "@/hooks/useMusic";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard } from "@/components/ui/data-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatLocalDate } from "@/lib/formatters";

export default function MusicManagement() {
  const { music, loading, error, stats, loadMusic } = useMusic();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicData | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingMusic(null);
    setShowFormModal(true);
  };

  const handleEdit = (musicItem: MusicData) => {
    setEditingMusic(musicItem);
    setShowFormModal(true);
  };

  const handleDelete = async (musicItem: MusicData) => {
    if (!confirm(`確定要刪除音樂「${musicItem.name}」嗎？`)) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MUSIC}/${musicItem.$id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');
      loadMusic();
    } catch (error) {
      alert(error instanceof Error ? error.message : '刪除失敗');
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingMusic(null);
    loadMusic();
  };

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <SectionHeader title="鋒兄音樂" subtitle="音樂管理" />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader
        title="鋒兄音樂"
        subtitle="管理音樂收藏，支援歌詞和多語言"
        action={
          <Button onClick={handleAdd} className="gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl">
            <Plus size={16} />
            新增音樂
          </Button>
        }
      />

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="音樂總數" value={stats.total} icon={MusicIcon} />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 音樂列表 */}
      {music.length === 0 ? (
        <EmptyState
          icon={<MusicIcon className="w-12 h-12" />}
          title="尚無音樂"
          description="點擊上方「新增音樂」按鈕新增第一首音樂"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {music.map((musicItem) => (
            <MusicCard
              key={musicItem.$id}
              music={musicItem}
              isPlaying={playingId === musicItem.$id}
              onPlay={() => togglePlay(musicItem.$id)}
              onEdit={() => handleEdit(musicItem)}
              onDelete={() => handleDelete(musicItem)}
            />
          ))}
        </div>
      )}

      {/* 表單模態框 */}
      {showFormModal && (
        <MusicFormModal
          music={editingMusic}
          onClose={() => {
            setShowFormModal(false);
            setEditingMusic(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

// 音樂卡片
interface MusicCardProps {
  music: MusicData;
  isPlaying: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function MusicCard({ music, isPlaying, onPlay, onEdit, onDelete }: MusicCardProps) {
  return (
    <DataCard className="overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* 封面 */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-pink-600 cursor-pointer" onClick={onPlay}>
        <div className="absolute inset-0 flex items-center justify-center group-hover:from-purple-600 group-hover:to-pink-700 transition-all duration-300">
          {music.cover ? (
            <img src={music.cover} alt={music.name} className="w-full h-full object-cover" />
          ) : (
            <MusicIcon className="text-white group-hover:scale-110 transition-transform duration-300 w-16 h-16" />
          )}
        </div>

        {/* 播放按鈕 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPlaying ? (
            <Pause className="text-white w-12 h-12" />
          ) : (
            <Play className="text-white w-12 h-12" />
          )}
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

        {/* 語言標籤 */}
        {music.language && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium">
            {music.language}
          </div>
        )}
      </div>

      {/* 資訊 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{music.name}</h3>
        {music.note && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{music.note}</p>}

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatLocalDate(music.$createdAt)}
          </span>
          {music.category && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{music.category}</span>}
        </div>

        {music.lyrics && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
            <p className="line-clamp-3">{music.lyrics}</p>
          </div>
        )}

        {music.file && (
          <audio src={music.file} controls className="w-full mt-3" />
        )}
      </div>
    </DataCard>
  );
}

// 音樂表單模態框
function MusicFormModal({ music, onClose, onSuccess }: { music: MusicData | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: music?.name || '',
    file: music?.file || '',
    lyrics: music?.lyrics || '',
    note: music?.note || '',
    ref: music?.ref || '',
    category: music?.category || '',
    hash: music?.hash || '',
    language: music?.language || '',
    cover: music?.cover || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小 (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('檔案大小不能超過 50MB');
      return;
    }

    // 檢查檔案類型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'];
    if (!validTypes.includes(file.type)) {
      alert('只支援 MP3, WAV, OGG, AAC, FLAC, M4A 格式的音樂');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上傳失敗');
      }

      const data = await response.json();

      // 更新表單資料
      setFormData(prev => ({
        ...prev,
        file: data.url,
        hash: data.fileId || '',
      }));

      setUploadProgress(100);
    } catch (error) {
      console.error('上傳錯誤:', error);
      alert(error instanceof Error ? error.message : '上傳失敗');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('請輸入音樂名稱');
      return;
    }

    setSubmitting(true);
    try {
      const url = music ? `${API_ENDPOINTS.MUSIC}/${music.$id}` : API_ENDPOINTS.MUSIC;
      const method = music ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(music ? '更新失敗' : '新增失敗');

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {music ? '編輯音樂' : '新增音樂'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              音樂名稱 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="請輸入音樂名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              音樂檔案 URL 或上傳檔案
            </label>
            <div className="space-y-3">
              <Input
                value={formData.file}
                onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                placeholder="https://example.com/audio.mp3"
                disabled={uploading}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">或</span>
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {uploading ? '上傳中...' : '上傳音樂 (最大 50MB)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/flac,audio/m4a"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {uploadProgress === 100 && (
                <p className="text-sm text-green-600 dark:text-green-400">✓ 上傳成功</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              歌詞
            </label>
            <Textarea
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="輸入歌詞內容"
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                語言
              </label>
              <Input
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="例如: 中文, English, 日本語"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分類
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="音樂分類"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              封面圖片 URL
            </label>
            <Input
              value={formData.cover}
              onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              備註
            </label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="音樂備註說明"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                參考
              </label>
              <Input
                value={formData.ref}
                onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                placeholder="參考資訊"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hash
              </label>
              <Input
                value={formData.hash}
                onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
                placeholder="音樂 hash 值"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} className="flex-1 bg-gray-500 hover:bg-gray-600 rounded-xl">
              取消
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-xl">
              {submitting ? '處理中...' : (music ? '更新' : '新增')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
