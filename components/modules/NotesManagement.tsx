"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard, DataCardList, DataCardItem } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { StatCard } from "@/components/ui/stat-card";
import { useArticles } from "@/hooks/useArticles";
import { ArticleFormData, Article } from "@/types";
import { formatDate } from "@/lib/formatters";
import { FileText, Link as LinkIcon, File, Copy, Check, ChevronDown, ChevronUp, Search } from "lucide-react";

const INITIAL_FORM: ArticleFormData = {
  title: "",
  content: "",
  newDate: new Date().toISOString().split('T')[0],
  url1: "",
  url2: "",
  url3: "",
  file1: "",
  file1type: "",
  file2: "",
  file2type: "",
  file3: "",
  file3type: "",
};

export default function NotesManagement() {
  const { articles, loading, error, stats, createArticle, updateArticle, deleteArticle } = useArticles();
  const [form, setForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArticleFormData>(INITIAL_FORM);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // File upload states
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [selectedFile3, setSelectedFile3] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  
  // Edit mode file upload states
  const [editSelectedFile1, setEditSelectedFile1] = useState<File | null>(null);
  const [editSelectedFile2, setEditSelectedFile2] = useState<File | null>(null);
  const [editSelectedFile3, setEditSelectedFile3] = useState<File | null>(null);
  const [editUploadingFile, setEditUploadingFile] = useState<number | null>(null);

  // 搜尋過濾
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(article => 
      article.title?.toLowerCase().includes(query) ||
      article.content?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  // File upload handlers
  const handleFileSelect = (fileNumber: 1 | 2 | 3, file: File | null) => {
    if (!file) return;
    
    // Determine file type
    let fileType = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    
    if (fileNumber === 1) {
      setSelectedFile1(file);
      setForm({ ...form, [`file${fileNumber}type`]: fileType });
    } else if (fileNumber === 2) {
      setSelectedFile2(file);
      setForm({ ...form, [`file${fileNumber}type`]: fileType });
    } else {
      setSelectedFile3(file);
      setForm({ ...form, [`file${fileNumber}type`]: fileType });
    }
  };

  const handleEditFileSelect = (fileNumber: 1 | 2 | 3, file: File | null) => {
    if (!file) return;
    
    // Determine file type
    let fileType = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    
    if (fileNumber === 1) {
      setEditSelectedFile1(file);
      setEditForm({ ...editForm, [`file${fileNumber}type`]: fileType });
    } else if (fileNumber === 2) {
      setEditSelectedFile2(file);
      setEditForm({ ...editForm, [`file${fileNumber}type`]: fileType });
    } else {
      setEditSelectedFile3(file);
      setEditForm({ ...editForm, [`file${fileNumber}type`]: fileType });
    }
  };

  const uploadFile = async (file: File, endpoint: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const appwriteConfig = localStorage.getItem('appwriteConfig');
    const config = appwriteConfig ? JSON.parse(appwriteConfig) : {};
    const params = new URLSearchParams({
      _endpoint: config.endpoint || '',
      _project: config.projectId || '',
      _database: config.databaseId || '',
      _key: config.apiKey || '',
      _bucket: config.bucketId || '',
    });

    const response = await fetch(`${endpoint}?${params}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上傳失敗');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSubmit = { ...form };

      // Upload files if selected
      if (selectedFile1) {
        setUploadingFile(1);
        const endpoint = form.file1type === 'image' ? '/api/upload-image' : 
                        form.file1type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file1 = await uploadFile(selectedFile1, endpoint);
      }
      if (selectedFile2) {
        setUploadingFile(2);
        const endpoint = form.file2type === 'image' ? '/api/upload-image' : 
                        form.file2type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file2 = await uploadFile(selectedFile2, endpoint);
      }
      if (selectedFile3) {
        setUploadingFile(3);
        const endpoint = form.file3type === 'image' ? '/api/upload-image' : 
                        form.file3type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file3 = await uploadFile(selectedFile3, endpoint);
      }

      setUploadingFile(null);
      await createArticle(formDataToSubmit);
      resetForm();
      setIsFormCollapsed(true);
    } catch {
      setUploadingFile(null);
      alert("操作失敗，請稍後再試");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const formDataToSubmit = { ...editForm };

      // Upload new files if selected
      if (editSelectedFile1) {
        setEditUploadingFile(1);
        const endpoint = editForm.file1type === 'image' ? '/api/upload-image' : 
                        editForm.file1type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file1 = await uploadFile(editSelectedFile1, endpoint);
      }
      if (editSelectedFile2) {
        setEditUploadingFile(2);
        const endpoint = editForm.file2type === 'image' ? '/api/upload-image' : 
                        editForm.file2type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file2 = await uploadFile(editSelectedFile2, endpoint);
      }
      if (editSelectedFile3) {
        setEditUploadingFile(3);
        const endpoint = editForm.file3type === 'image' ? '/api/upload-image' : 
                        editForm.file3type === 'video' ? '/api/upload-video' : 
                        '/api/upload-music';
        formDataToSubmit.file3 = await uploadFile(editSelectedFile3, endpoint);
      }

      setEditUploadingFile(null);
      await updateArticle(editingId, formDataToSubmit);
      setEditingId(null);
      setEditSelectedFile1(null);
      setEditSelectedFile2(null);
      setEditSelectedFile3(null);
    } catch {
      setEditUploadingFile(null);
      alert("更新失敗，請稍後再試");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`確定刪除 ${title}？`)) return;
    try {
      await deleteArticle(id);
    } catch {
      alert("刪除失敗，請稍後再試");
    }
  };

  const handleEdit = (article: Article) => {
    setEditForm({
      title: article.title,
      content: article.content,
      newDate: formatDate(article.newDate),
      url1: article.url1 || "",
      url2: article.url2 || "",
      url3: article.url3 || "",
      file1: article.file1 || "",
      file1type: article.file1type || "",
      file2: article.file2 || "",
      file2type: article.file2type || "",
      file3: article.file3 || "",
      file3type: article.file3type || "",
    });
    setEditingId(article.$id);
    setEditSelectedFile1(null);
    setEditSelectedFile2(null);
    setEditSelectedFile3(null);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSelectedFile1(null);
    setSelectedFile2(null);
    setSelectedFile3(null);
    setUploadingFile(null);
  };

  const resetEditForm = () => {
    setEditingId(null);
    setEditForm(INITIAL_FORM);
  };

  const toggleExpanded = (id: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCopyContent = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("複製失敗:", err);
      alert("複製失敗，請再試一次");
    }
  };

  if (loading) return <FullPageLoading text="載入筆記資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <SectionHeader
        title="鋒兄筆記"
        subtitle={`共 ${stats.total} 篇筆記`}
        action={
          <StatCard title="筆記總數" value={stats.total} gradient="from-blue-500 to-blue-600" className="min-w-[160px]" />
        }
      />

      <FormCard 
        title={
          <div className="flex items-center justify-between w-full border-l-4 border-purple-500 pl-4 py-2">
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
              新增筆記
            </h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="h-8 px-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              {isFormCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </Button>
          </div>
        }
        accentColor="from-purple-500 to-purple-600"
      >
        {!isFormCollapsed && (
          <form onSubmit={handleSubmit} className="space-y-4">
          <FormGrid>
            <Input
              placeholder="筆記標題"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="h-12 rounded-xl col-span-2"
            />
            <Input
              placeholder="日期"
              type="date"
              value={form.newDate}
              onChange={(e) => setForm({ ...form, newDate: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </FormGrid>
          
          <Textarea
            placeholder="筆記內容 (上限 1000 字)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            className="min-h-[200px] rounded-xl"
            maxLength={1000}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">相關連結（選填）</label>
            <div className="space-y-2">
              <Input
                placeholder="URL 1"
                type="url"
                value={form.url1}
                onChange={(e) => setForm({ ...form, url1: e.target.value })}
                className="h-12 rounded-xl"
              />
              <Input
                placeholder="URL 2"
                type="url"
                value={form.url2}
                onChange={(e) => setForm({ ...form, url2: e.target.value })}
                className="h-12 rounded-xl"
              />
              <Input
                placeholder="URL 3"
                type="url"
                value={form.url3}
                onChange={(e) => setForm({ ...form, url3: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">上傳檔案（選填）</label>
            <div className="space-y-2">
              <div>
                <Input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileSelect(1, e.target.files?.[0] || null)}
                  disabled={uploadingFile !== null}
                  className="h-12 rounded-xl"
                />
                {selectedFile1 && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">已選擇: {selectedFile1.name}</p>}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileSelect(2, e.target.files?.[0] || null)}
                  disabled={uploadingFile !== null}
                  className="h-12 rounded-xl"
                />
                {selectedFile2 && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">已選擇: {selectedFile2.name}</p>}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileSelect(3, e.target.files?.[0] || null)}
                  disabled={uploadingFile !== null}
                  className="h-12 rounded-xl"
                />
                {selectedFile3 && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">已選擇: {selectedFile3.name}</p>}
              </div>
            </div>
            {uploadingFile && (
              <p className="text-sm text-purple-600 dark:text-purple-400">正在上傳檔案 {uploadingFile}...</p>
            )}
          </div>

          <FormActions>
            <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl font-medium shadow-lg shadow-purple-500/25">
              新增筆記
            </Button>
            {!isFormCollapsed && <Button type="button" variant="outline" onClick={() => setIsFormCollapsed(true)} className="h-12 px-6 rounded-xl">關閉</Button>}
          </FormActions>
        </form>
        )}
      </FormCard>

      {/* 搜尋欄位 */}
      {articles.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜尋標題、內容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      )}

      <DataCard>
        {articles.length === 0 ? (
          <EmptyState emoji="📝" title="暫無筆記資料" description="點擊上方表單新增第一篇筆記" />
        ) : filteredArticles.length === 0 ? (
          <EmptyState emoji="🔍" title="無搜尋結果" description={`找不到「${searchQuery}」相關的筆記`} />
        ) : (
          <DataCardList>
            {filteredArticles.map((article) => {
              const isEditing = editingId === article.$id;
              const isExpanded = expandedArticles.has(article.$id);
              const hasUrls = article.url1 || article.url2 || article.url3;
              
              return (
                <DataCardItem key={article.$id} className={isEditing ? "ring-2 ring-purple-500" : ""}>
                  {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4 p-2">
                      <div className="flex items-center gap-3 mb-2 border-l-4 border-purple-500 pl-3">
                        <FileText className="text-purple-600" size={20} />
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">編輯筆記</h3>
                      </div>
                      
                      <FormGrid columns={2}>
                        <Input
                          placeholder="筆記標題"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          required
                          className="h-10 rounded-lg"
                        />
                        <Input
                          placeholder="日期"
                          type="date"
                          value={editForm.newDate}
                          onChange={(e) => setEditForm({ ...editForm, newDate: e.target.value })}
                          required
                          className="h-10 rounded-lg"
                        />
                      </FormGrid>
                      
                      <Textarea
                        placeholder="筆記內容 (上限 1000 字)"
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        required
                        className="min-h-[150px] rounded-lg text-sm"
                        maxLength={1000}
                      />

                      <div className="grid grid-cols-1 gap-2">
                        <Input placeholder="URL 1" type="url" value={editForm.url1} onChange={(e) => setEditForm({ ...editForm, url1: e.target.value })} className="h-9 rounded-lg text-xs" />
                        <Input placeholder="URL 2" type="url" value={editForm.url2} onChange={(e) => setEditForm({ ...editForm, url2: e.target.value })} className="h-9 rounded-lg text-xs" />
                        <Input placeholder="URL 3" type="url" value={editForm.url3} onChange={(e) => setEditForm({ ...editForm, url3: e.target.value })} className="h-9 rounded-lg text-xs" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">上傳新檔案（選填）</label>
                        <div className="space-y-2">
                          <div>
                            <Input
                              type="file"
                              accept="image/*,video/*,audio/*"
                              onChange={(e) => handleEditFileSelect(1, e.target.files?.[0] || null)}
                              disabled={editUploadingFile !== null}
                              className="h-9 rounded-lg text-xs"
                            />
                            {editSelectedFile1 ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">已選擇: {editSelectedFile1.name}</p>
                            ) : editForm.file1 ? (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">現有: {editForm.file1type === 'image' ? '🖼️' : editForm.file1type === 'video' ? '🎥' : editForm.file1type === 'audio' ? '🎵' : '📄'} 檔案 1</p>
                            ) : null}
                          </div>
                          <div>
                            <Input
                              type="file"
                              accept="image/*,video/*,audio/*"
                              onChange={(e) => handleEditFileSelect(2, e.target.files?.[0] || null)}
                              disabled={editUploadingFile !== null}
                              className="h-9 rounded-lg text-xs"
                            />
                            {editSelectedFile2 ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">已選擇: {editSelectedFile2.name}</p>
                            ) : editForm.file2 ? (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">現有: {editForm.file2type === 'image' ? '🖼️' : editForm.file2type === 'video' ? '🎥' : editForm.file2type === 'audio' ? '🎵' : '📄'} 檔案 2</p>
                            ) : null}
                          </div>
                          <div>
                            <Input
                              type="file"
                              accept="image/*,video/*,audio/*"
                              onChange={(e) => handleEditFileSelect(3, e.target.files?.[0] || null)}
                              disabled={editUploadingFile !== null}
                              className="h-9 rounded-lg text-xs"
                            />
                            {editSelectedFile3 ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">已選擇: {editSelectedFile3.name}</p>
                            ) : editForm.file3 ? (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">現有: {editForm.file3type === 'image' ? '🖼️' : editForm.file3type === 'video' ? '🎥' : editForm.file3type === 'audio' ? '🎵' : '📄'} 檔案 3</p>
                            ) : null}
                          </div>
                        </div>
                        {editUploadingFile && (
                          <p className="text-xs text-purple-600 dark:text-purple-400">正在上傳檔案 {editUploadingFile}...</p>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={resetEditForm} className="rounded-lg h-9 px-4">取消</Button>
                        <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-9 px-4">更新</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(article.$id, article.title)} className="rounded-lg h-9 px-4 ml-auto">刪除</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="text-purple-600 dark:text-purple-400" size={20} />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{article.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyContent(article.content, article.$id)}
                            className="h-8 px-2 rounded-lg"
                            title="複製內容"
                          >
                            {copiedId === article.$id ? (
                              <Check className="text-green-600 dark:text-green-400" size={16} />
                            ) : (
                              <Copy className="text-gray-600 dark:text-gray-400" size={16} />
                            )}
                          </Button>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(article.newDate)}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {isExpanded ? (
                          <p className="whitespace-pre-wrap">{article.content}</p>
                        ) : (
                          <p className="line-clamp-5 whitespace-pre-wrap">{article.content}</p>
                        )}
                      </div>

                      {article.content.length > 100 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(article.$id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {isExpanded ? "收起" : "展開全文"}
                        </Button>
                      )}

                      {hasUrls && (
                        <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <LinkIcon size={16} />
                            <span>相關連結</span>
                          </div>
                          {article.url1 && (
                            <a href={article.url1} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                              {article.url1}
                            </a>
                          )}
                          {article.url2 && (
                            <a href={article.url2} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                              {article.url2}
                            </a>
                          )}
                          {article.url3 && (
                            <a href={article.url3} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline truncate">
                              {article.url3}
                            </a>
                          )}
                        </div>
                      )}

                      {(article.file1 || article.file2 || article.file3) && (
                        <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <File size={16} />
                            <span>附件</span>
                          </div>
                          {article.file1 && (
                            <a href={article.file1} target="_blank" rel="noreferrer" className="block text-sm text-green-600 dark:text-green-400 hover:underline truncate">
                              {article.file1type === 'image' ? '🖼️' : article.file1type === 'video' ? '🎥' : article.file1type === 'audio' ? '🎵' : '📄'} 檔案 1
                            </a>
                          )}
                          {article.file2 && (
                            <a href={article.file2} target="_blank" rel="noreferrer" className="block text-sm text-green-600 dark:text-green-400 hover:underline truncate">
                              {article.file2type === 'image' ? '🖼️' : article.file2type === 'video' ? '🎥' : article.file2type === 'audio' ? '🎵' : '📄'} 檔案 2
                            </a>
                          )}
                          {article.file3 && (
                            <a href={article.file3} target="_blank" rel="noreferrer" className="block text-sm text-green-600 dark:text-green-400 hover:underline truncate">
                              {article.file3type === 'image' ? '🖼️' : article.file3type === 'video' ? '🎥' : article.file3type === 'audio' ? '🎵' : '📄'} 檔案 3
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(article)} className="flex-1 rounded-xl">編輯</Button>
                      </div>
                    </div>
                  )}
                </DataCardItem>
              );
            })}
          </DataCardList>
        )}
      </DataCard>
    </div>
  );
}
