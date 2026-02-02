"use client";

import { useState, useMemo, useEffect } from "react";
import { FileText as DocumentIcon, Plus, Edit, Edit2, Trash2, X, Upload, Calendar, Search, Download, Eye, FileArchive, File } from "lucide-react";
import { useCommonDocument, CommonDocumentData } from "@/hooks/useCommonDocument";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatLocalDate } from "@/lib/formatters";
import { getAppwriteHeaders, getAppwriteDownloadUrl, getProxiedMediaUrl } from "@/lib/utils";
import { PlyrPlayer } from "@/components/ui/plyr-player";
import JSZip from "jszip";

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

// Get file extension
function getFileExtension(filename: string): string {
  return filename?.toLowerCase().split('.').pop() || '';
}

// Get file type info for styling
function getFileTypeInfo(filename: string): { color: string; bgColor: string; label: string } {
  const ext = getFileExtension(filename);
  switch (ext) {
    case 'pdf':
      return { color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'PDF' };
    case 'doc':
    case 'docx':
      return { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Word' };
    case 'xls':
    case 'xlsx':
      return { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Excel' };
    case 'ppt':
    case 'pptx':
      return { color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'PPT' };
    case 'txt':
      return { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700', label: 'TXT' };
    case 'md':
      return { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'MD' };
    case 'zip':
    case 'rar':
    case '7z':
      return { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'ZIP' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return { color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', label: 'IMG' };
    case 'mp4':
    case 'webm':
      return { color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'VIDEO' };
    case 'mp3':
    case 'wav':
    case 'm4a':
      return { color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', label: 'AUDIO' };
    default:
      return { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700', label: ext.toUpperCase() || 'File' };
  }
}

// Check if file can be previewed
function canPreviewFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['pdf', 'txt', 'md', 'docx', 'xlsx', 'pptx', 'zip', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mp3', 'wav', 'm4a'].includes(ext);
}

export default function CommonDocumentManagement() {
  const { commondocument, loading, error, stats, loadCommonDocument } = useCommonDocument();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CommonDocumentData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDocument, setPreviewDocument] = useState<CommonDocumentData | null>(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);

  // 搜尋過濾
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return commondocument;
    const query = searchQuery.toLowerCase();
    return commondocument.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.note?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }, [commondocument, searchQuery]);

  const handleAdd = () => {
    setEditingDocument(null);
    setShowFormModal(true);
  };

  const handleEdit = (doc: CommonDocumentData) => {
    setEditingDocument(doc);
    setShowFormModal(true);
  };

  const handleDelete = async (doc: CommonDocumentData) => {
    const confirmText = `DELETE ${doc.name}`;
    const userInput = prompt(`確定要刪除文件「${doc.name}」嗎？\n\n請輸入以下文字以確認刪除：\n${confirmText}`);
    
    if (userInput !== confirmText) {
      if (userInput !== null) {
        alert('輸入不正確，刪除已取消');
      }
      return;
    }

    try {
      const url = addAppwriteConfigToUrl(`${API_ENDPOINTS.COMMONDOCUMENT}/${doc.$id}`);
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('刪除失敗');
      loadCommonDocument(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : '刪除失敗');
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingDocument(null);
    loadCommonDocument(true);
  };

  const handlePreview = (doc: CommonDocumentData, editMode = false) => {
    if (doc.file && canPreviewFile(doc.name || doc.file)) {
      setPreviewDocument(doc);
      setOpenInEditMode(editMode);
    }
  };

  const handleEditContent = (doc: CommonDocumentData) => {
    handlePreview(doc, true);
  };

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <SectionHeader title="鋒兄文件" subtitle="文件管理" />
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
        title="鋒兄文件"
        subtitle="管理文件收藏，支援 PDF、Word、Excel、PowerPoint、TXT、MD、ZIP、影片"
        action={
          <Button onClick={handleAdd} className="gap-2 bg-blue-500 hover:bg-blue-600 rounded-xl">
            <Plus size={16} />
            新增文件
          </Button>
        }
      />

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="文件總數" value={stats.total} icon={DocumentIcon} />
      </div>

      {/* 搜尋欄位 */}
      {commondocument.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜尋文件名稱、備註、分類..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      )}

      {/* 文件列表 */}
      {commondocument.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon className="w-12 h-12" />}
          title="尚無文件"
          description="點擊上方「新增文件」按鈕新增第一份文件"
        />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="無搜尋結果"
          description={`找不到「${searchQuery}」相關的文件`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.$id}
              document={doc}
              onEdit={() => handleEdit(doc)}
              onDelete={() => handleDelete(doc)}
              onPreview={() => handlePreview(doc)}
              onEditContent={() => handleEditContent(doc)}
            />
          ))}
        </div>
      )}

      {/* 表單模態框 */}
      {showFormModal && (
        <DocumentFormModal
          document={editingDocument}
          existingDocuments={commondocument}
          onClose={() => {
            setShowFormModal(false);
            setEditingDocument(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* 預覽模態框 */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => {
            setPreviewDocument(null);
            setOpenInEditMode(false);
          }}
          openInEditMode={openInEditMode}
        />
      )}
    </div>
  );
}

// 文件卡片
interface DocumentCardProps {
  document: CommonDocumentData;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onEditContent: () => void;
}

function DocumentCard({ document, onEdit, onDelete, onPreview, onEditContent }: DocumentCardProps) {
  const fileInfo = getFileTypeInfo(document.name || document.file || '');
  const canPreview = document.file && canPreviewFile(document.name || document.file);
  const ext = getFileExtension(document.name || document.file || '');
  const canEditContent = ext === 'txt' || ext === 'md';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start gap-4">
        {/* 文件圖示 */}
        <div className={`w-14 h-14 flex-shrink-0 rounded-xl ${fileInfo.bgColor} flex items-center justify-center`}>
          {getFileExtension(document.name || document.file || '') === 'zip' ? (
            <FileArchive className={`w-7 h-7 ${fileInfo.color}`} />
          ) : (
            <DocumentIcon className={`w-7 h-7 ${fileInfo.color}`} />
          )}
        </div>

        {/* 資訊區 */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">{document.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full ${fileInfo.bgColor} ${fileInfo.color} font-medium`}>
              {fileInfo.label}
            </span>
            {document.category && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                {document.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatLocalDate(document.$createdAt)}
          </div>
          {document.note && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{document.note}</p>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        {document.file && (
          <a
            href={getAppwriteDownloadUrl(document.file)}
            download={document.name || "download"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            下載
          </a>
        )}
        {canPreview && (
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            預覽
          </button>
        )}
        {canEditContent && (
          <button
            onClick={onEditContent}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-200 text-sm font-medium"
            title="編輯檔案內容"
          >
            <Edit className="w-4 h-4" />
            編輯內容
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
          title="編輯資訊"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          title="刪除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 文件表單模態框
function DocumentFormModal({ document, existingDocuments, onClose, onSuccess }: { 
  document: CommonDocumentData | null; 
  existingDocuments: CommonDocumentData[]; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    name: document?.name || '',
    file: document?.file || '',
    note: document?.note || '',
    ref: document?.ref || '',
    category: document?.category || '',
    hash: document?.hash || '',
    cover: document?.cover || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileHash, setFileHash] = useState<string>('');
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [useCategorySelect, setUseCategorySelect] = useState(true);

  const existingCategories = Array.from(new Set(existingDocuments.map(d => d.category).filter(Boolean)));

  const calculateFileHash = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Hash calculation error:', error);
      return `fallback_${file.name}_${file.size}_${file.lastModified}`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('檔案大小不能超過 50MB');
      return;
    }

    const validExtensions = ['.pdf', '.txt', '.md', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      alert('只支援 PDF, TXT, MD, Word, Excel, PowerPoint, ZIP, 影片 格式');
      return;
    }

    setUploadStatus('idle');
    setUploadProgress(0);
    setDuplicateWarning('');
    setSelectedFile(file);

    if (!formData.name) {
      setFormData(prev => ({ ...prev, name: file.name }));
    }

    const hash = await calculateFileHash(file);
    setFileHash(hash);
    setFormData(prev => ({ ...prev, hash }));

    const duplicateDoc = existingDocuments.find(d => 
      d.hash === hash && (!document || d.$id !== document.$id)
    );

    if (duplicateDoc) {
      setDuplicateWarning(`警告：此文件與「${duplicateDoc.name}」相同，請勿重複上傳！`);
    }
  };

  const uploadFileToAppwrite = async (file: File): Promise<{ url: string; fileId: string }> => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev >= 90 ? prev : prev + 10);
    }, 200);

    try {
      const response = await fetch('/api/upload-music', {
        method: 'POST',
        headers: getAppwriteHeaders(),
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = '上傳失敗';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('請輸入文件名稱');
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = formData.file;

      if (selectedFile) {
        const uploadResult = await uploadFileToAppwrite(selectedFile);
        fileUrl = uploadResult.url;
      }

      const url = document
        ? addAppwriteConfigToUrl(`${API_ENDPOINTS.COMMONDOCUMENT}/${document.$id}`)
        : addAppwriteConfigToUrl(API_ENDPOINTS.COMMONDOCUMENT);
      
      const response = await fetch(url, {
        method: document ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          file: fileUrl,
          hash: fileHash || formData.hash,
        }),
      });

      if (!response.ok) throw new Error(document ? '更新失敗' : '新增失敗');
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {document ? '編輯文件' : '新增文件'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 文件名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文件名稱 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="輸入文件名稱"
              className="h-12 rounded-xl"
            />
          </div>

          {/* 檔案上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              上傳文件
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.mp4,.webm,.mov,.avi,.mkv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile ? selectedFile.name : '點擊或拖曳上傳文件'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  支援 PDF, TXT, MD, Word, Excel, PowerPoint, ZIP, 影片 (最大 50MB)
                </p>
              </label>
            </div>

            {/* 上傳進度 */}
            {uploadStatus === 'uploading' && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">上傳中... {uploadProgress}%</p>
              </div>
            )}

            {/* 重複警告 */}
            {duplicateWarning && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{duplicateWarning}</p>
              </div>
            )}

            {/* 現有檔案 URL */}
            {formData.file && !selectedFile && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  目前檔案：{formData.file}
                </p>
              </div>
            )}
          </div>

          {/* 分類 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                分類
              </label>
              {existingCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseCategorySelect(!useCategorySelect)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {useCategorySelect ? '自訂輸入' : '從列表選擇'}
                </button>
              )}
            </div>
            {useCategorySelect && existingCategories.length > 0 ? (
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="輸入分類"
                className="h-12 rounded-xl"
              />
            )}
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              備註
            </label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="輸入備註"
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* 參考連結 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              參考連結
            </label>
            <Input
              value={formData.ref}
              onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
              placeholder="輸入參考連結"
              className="h-12 rounded-xl"
            />
          </div>

          {/* 提交按鈕 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadStatus === 'uploading'}
              className="flex-1 h-12 rounded-xl bg-blue-500 hover:bg-blue-600"
            >
              {submitting ? '儲存中...' : document ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 文件預覽模態框
function DocumentPreviewModal({ document, onClose, openInEditMode = false }: { document: CommonDocumentData; onClose: () => void; openInEditMode?: boolean }) {
  const ext = getFileExtension(document.name || document.file || '');
  const [txtContent, setTxtContent] = useState<string>('');
  const [txtLoading, setTxtLoading] = useState(false);
  const [zipEntries, setZipEntries] = useState<{ name: string; isDir: boolean; size: number }[]>([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(openInEditMode);
  const [editedContent, setEditedContent] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if ((ext === 'txt' || ext === 'md') && document.file) {
      setTxtLoading(true);
      fetch(document.file)
        .then(res => res.text())
        .then(text => {
          setTxtContent(text);
          if (openInEditMode) {
            setEditedContent(text);
          }
          setTxtLoading(false);
        })
        .catch(() => {
          setTxtContent('無法讀取檔案');
          setTxtLoading(false);
        });
    } else if (ext === 'zip' && document.file) {
      setZipLoading(true);
      fetch(document.file)
        .then(res => res.arrayBuffer())
        .then(async (buffer) => {
          const zip = await JSZip.loadAsync(buffer);
          const entries: { name: string; isDir: boolean; size: number }[] = [];
          zip.forEach((relativePath, file) => {
            entries.push({
              name: relativePath,
              isDir: file.dir,
              size: (file as any)._data?.uncompressedSize || 0,
            });
          });
          entries.sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          setZipEntries(entries);
          setZipLoading(false);
        })
        .catch(() => {
          setZipEntries([]);
          setZipLoading(false);
        });
    }
  }, [ext, document.file]);

  const getPreviewContent = () => {
    if (!document.file) return null;
    
    // Image Preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-gray-50 dark:bg-gray-900/50">
          <img 
            src={document.file} 
            alt={document.name} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    }

    // Video/Audio Preview
    if (['mp4', 'webm', 'mp3', 'wav', 'm4a'].includes(ext)) {
      const isAudio = ['mp3', 'wav', 'm4a'].includes(ext);
      return (
        <div className="flex items-center justify-center h-full p-8 bg-black">
          <div className={`w-full ${isAudio ? 'max-w-2xl' : 'max-w-4xl'}`}>
            <PlyrPlayer 
              src={getProxiedMediaUrl(document.file)} 
              type={isAudio ? 'audio' : 'video'} 
            />
          </div>
        </div>
      );
    }

    if (['docx', 'xlsx', 'pptx'].includes(ext)) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.file)}`}
          className="w-full h-full border-0"
          title={document.name}
        />
      );
    }
    
    if (ext === 'pdf') {
      return (
        <iframe
          src={document.file}
          className="w-full h-full border-0"
          title={document.name}
        />
      );
    }
    
    if (ext === 'txt' || ext === 'md') {
      if (txtLoading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
      }
      if (isEditing) {
        return (
          <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1 font-mono text-sm resize-none rounded-xl"
              placeholder="編輯內容..."
            />
          </div>
        );
      }
      return (
        <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-gray-900">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">{txtContent}</pre>
        </div>
      );
    }
    
    if (ext === 'zip') {
      if (zipLoading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
      }
      return (
        <div className="p-6 h-full overflow-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            ZIP 檔案結構 ({zipEntries.length} 項)
          </h3>
          <div className="space-y-1">
            {zipEntries.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {entry.isDir ? (
                  <File className="w-4 h-4 text-yellow-500" />
                ) : (
                  <DocumentIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                {!entry.isDir && (
                  <span className="text-xs text-gray-400">
                    {entry.size < 1024 ? `${entry.size} B` : entry.size < 1024 * 1024 ? `${(entry.size / 1024).toFixed(1)} KB` : `${(entry.size / 1024 / 1024).toFixed(1)} MB`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        無法預覽此文件格式
      </div>
    );
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedContent(txtContent);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Create a new file with edited content
      const blob = new Blob([editedContent], { type: ext === 'md' ? 'text/markdown' : 'text/plain' });
      const file = new globalThis.File([blob], document.name || `edited.${ext}`, { type: blob.type });
      
      // Upload the new file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload-music', {
        method: 'POST',
        headers: getAppwriteHeaders(),
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('上傳失敗');
      }
      
      const uploadData = await uploadResponse.json();
      
      // Update the document with new file URL
      const url = addAppwriteConfigToUrl(`${API_ENDPOINTS.COMMONDOCUMENT}/${document.$id}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...document,
          file: uploadData.url,
        }),
      });
      
      if (!response.ok) throw new Error('更新失敗');
      
      setTxtContent(editedContent);
      setIsEditing(false);
      alert('儲存成功！');
    } catch (error) {
      alert(error instanceof Error ? error.message : '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = ext === 'txt' || ext === 'md';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 truncate flex-1 mr-4">{document.name}</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    編輯
                  </button>
                )}
              </>
            )}
            <a
              href={getAppwriteDownloadUrl(document.file)}
              download={document.name || "download"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下載
            </a>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {getPreviewContent()}
        </div>
      </div>
    </div>
  );
}
