"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader, PageTitle } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { useCrud } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";

interface Routine {
  $id: string;
  name: string;
  note: string;
  lastdate1: string | null;
  lastdate2: string | null;
  lastdate3: string | null;
  link: string;
  photo: string;
}

interface RoutineFormData {
  name: string;
  note: string;
  lastdate1: string;
  lastdate2: string;
  lastdate3: string;
  link: string;
  photo: string;
}

const INITIAL_FORM: RoutineFormData = {
  name: "",
  note: "",
  lastdate1: "",
  lastdate2: "",
  lastdate3: "",
  link: "",
  photo: "",
};

export default function RoutineManagement() {
  const { items: routines, loading, error, create, update, remove, fetchAll } = useCrud<Routine>(API_ENDPOINTS.ROUTINE);
  const [form, setForm] = useState<RoutineFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getAppwriteHeaders = () => {
    if (typeof window === 'undefined') return {};
    const endpoint = localStorage.getItem('appwrite_endpoint');
    const project = localStorage.getItem('appwrite_project');
    const database = localStorage.getItem('appwrite_database');
    const apiKey = localStorage.getItem('appwrite_api_key');
    return {
      ...(endpoint && { 'X-Appwrite-Endpoint': endpoint }),
      ...(project && { 'X-Appwrite-Project': project }),
      ...(database && { 'X-Appwrite-Database': database }),
      ...(apiKey && { 'X-Appwrite-API-Key': apiKey }),
    };
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      alert(`檔案大小超過限制（${Math.round(file.size / 1024 / 1024)}MB > 50MB）`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('只支援 JPG, PNG, GIF, WEBP 格式的圖片');
      return;
    }

    // Store file for later upload, create preview URL
    setSelectedPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(objectUrl);
    // Clear the URL input when file is selected
    setForm({ ...form, photo: "" });
  };

  const uploadPhotoToAppwrite = async (file: File): Promise<string> => {
    setPhotoUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: getAppwriteHeaders(),
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '圖片上傳失敗');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      throw error;
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("請輸入名稱");
      return;
    }

    try {
      let finalPhoto = form.photo;

      // 如果有選擇圖片檔案，上傳到 Appwrite
      if (selectedPhotoFile) {
        finalPhoto = await uploadPhotoToAppwrite(selectedPhotoFile);
      }

      const payload = {
        ...form,
        photo: finalPhoto,
        lastdate1: form.lastdate1 || null,
        lastdate2: form.lastdate2 || null,
        lastdate3: form.lastdate3 || null,
      };

      const success = editingId
        ? await update(editingId, payload)
        : await create(payload);

      if (success) {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setIsFormOpen(false);
        setSelectedPhotoFile(null);
        setPhotoPreviewUrl("");
      }
    } catch (err) {
      alert("操作失敗：" + (err instanceof Error ? err.message : "請稍後再試"));
    }
  };

  const handleEdit = (routine: Routine) => {
    setForm({
      name: routine.name,
      note: routine.note || "",
      lastdate1: routine.lastdate1 ? routine.lastdate1.substring(0, 16) : "",
      lastdate2: routine.lastdate2 ? routine.lastdate2.substring(0, 16) : "",
      lastdate3: routine.lastdate3 ? routine.lastdate3.substring(0, 16) : "",
      link: routine.link || "",
      photo: routine.photo || "",
    });
    setEditingId(routine.$id);
    setIsFormOpen(true);
    setPhotoPreviewUrl(routine.photo || "");
    setSelectedPhotoFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除此例行事項嗎？")) {
      await remove(id);
    }
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl("");
  };

  const formatDateTime = (datetime: string | null) => {
    if (!datetime) return "-";
    return new Date(datetime).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="鋒兄例行"
        description="管理日常例行事項"
        badge={
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
            {routines.length}
          </span>
        }
      />

      {error && (
        <DataCard className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 whitespace-pre-line">{error.message}</p>
        </DataCard>
      )}

      {!error && (
        <>
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full md:w-auto"
          >
            <Plus size={18} className="mr-2" />
            {isFormOpen ? "收起表單" : "新增例行事項"}
          </Button>

          {isFormOpen && (
            <FormCard title={editingId ? "編輯例行事項" : "新增例行事項"}>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      名稱 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="例如：晨跑、閱讀"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">備註</label>
                    <Textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="額外說明"
                      maxLength={100}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近例行日期之一(最近)</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate1}
                      onChange={(e) => setForm({ ...form, lastdate1: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近例行日期之二(次近)</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate2}
                      onChange={(e) => setForm({ ...form, lastdate2: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">最近例行日期之三(最遠)</label>
                    <Input
                      type="datetime-local"
                      value={form.lastdate3}
                      onChange={(e) => setForm({ ...form, lastdate3: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">連結</label>
                    <Input
                      type="url"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">圖片</label>
                    <div className="space-y-3">
                      {/* URL 輸入 */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">圖片網址</label>
                        <Input
                          type="url"
                          value={form.photo}
                          onChange={(e) => {
                            setForm({ ...form, photo: e.target.value });
                            setPhotoPreviewUrl(e.target.value);
                            setSelectedPhotoFile(null);
                          }}
                          placeholder="https://..."
                        />
                      </div>

                      {/* 或者上傳檔案 */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">或上傳圖片檔案（上限 50MB）</label>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handlePhotoFileSelect}
                        />
                        {selectedPhotoFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            已選擇: {selectedPhotoFile.name} ({Math.round(selectedPhotoFile.size / 1024)}KB)
                          </p>
                        )}
                      </div>

                      {/* 預覽 */}
                      {photoPreviewUrl && (
                        <div className="mt-2">
                          <img
                            src={photoPreviewUrl}
                            alt="圖片預覽"
                            className="w-32 h-32 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </FormGrid>

                <FormActions>
                  <Button type="submit" disabled={photoUploading}>
                    {photoUploading ? "上傳中..." : editingId ? "更新" : "新增"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={photoUploading}>
                    取消
                  </Button>
                </FormActions>
              </form>
            </FormCard>
          )}

          {!loading && routines.length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} />}
              title="暫無例行事項"
              description="點擊上方按鈕新增第一筆例行事項"
            />
          ) : (
            <>
              {/* 桌面版表格 */}
              <div className="hidden md:block">
                <DataCard>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>圖片</TableHead>
                        <TableHead>名稱</TableHead>
                        <TableHead>備註</TableHead>
                        <TableHead>最近例行之一</TableHead>
                        <TableHead>最近例行之二</TableHead>
                        <TableHead>最近例行之三</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routines.map((routine) => (
                        <TableRow key={routine.$id}>
                          <TableCell>
                            {routine.photo ? (
                              <img
                                src={routine.photo}
                                alt={routine.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                <Calendar size={20} className="text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{routine.name}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {routine.note || "-"}
                          </TableCell>
                          <TableCell>{formatDateTime(routine.lastdate1)}</TableCell>
                          <TableCell>{formatDateTime(routine.lastdate2)}</TableCell>
                          <TableCell>{formatDateTime(routine.lastdate3)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(routine)}
                            >
                              編輯
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(routine.$id)}
                            >
                              刪除
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DataCard>
              </div>

              {/* 手機版卡片 */}
              <div className="md:hidden space-y-4">
                {routines.map((routine) => (
                  <DataCard key={routine.$id}>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {routine.photo ? (
                          <img
                            src={routine.photo}
                            alt={routine.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                            <Calendar size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{routine.name}</h3>
                          {routine.note && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routine.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近例行之一:</span>
                          <span>{formatDateTime(routine.lastdate1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近例行之二:</span>
                          <span>{formatDateTime(routine.lastdate2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">最近例行之三:</span>
                          <span>{formatDateTime(routine.lastdate3)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(routine)}
                          className="flex-1"
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(routine.$id)}
                          className="flex-1"
                        >
                          刪除
                        </Button>
                      </div>
                    </div>
                  </DataCard>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
