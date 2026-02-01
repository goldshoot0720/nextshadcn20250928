"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard, DataCardList, DataCardItem } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { useFoods, getFoodExpiryInfo } from "@/hooks/useFoods";
import { FoodFormData, Food } from "@/types";
import { formatDate, formatDaysRemaining } from "@/lib/formatters";

const INITIAL_FORM: FoodFormData = { name: "", amount: 0, todate: "", photo: "", price: 0, shop: "", photohash: "" };

export default function FoodManagement() {
  const { foods, loading, error, createFood, updateFood, deleteFood, updateAmount } = useFoods();
  const [form, setForm] = useState<FoodFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const getAppwriteHeaders = () => {
    if (typeof window === 'undefined') return {};
    const endpoint = localStorage.getItem('appwrite_endpoint');
    const project = localStorage.getItem('appwrite_project');
    const database = localStorage.getItem('appwrite_database');
    const apiKey = localStorage.getItem('appwrite_api_key');
    const bucket = localStorage.getItem('appwrite_bucket');
    return {
      ...(endpoint && { 'X-Appwrite-Endpoint': endpoint }),
      ...(project && { 'X-Appwrite-Project': project }),
      ...(database && { 'X-Appwrite-Database': database }),
      ...(apiKey && { 'X-Appwrite-API-Key': apiKey }),
      ...(bucket && { 'X-Appwrite-Bucket-ID': bucket }),
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
    
    try {
      let finalPhoto = form.photo;

      // If a file is selected, upload it to Appwrite
      if (selectedPhotoFile) {
        finalPhoto = await uploadPhotoToAppwrite(selectedPhotoFile);
      }

      const formData = {
        ...form,
        photo: finalPhoto,
        price: form.price || 0,
        shop: form.shop || '',
        photohash: form.photohash || '',
      };

      if (editingId) {
        await updateFood(editingId, formData);
      } else {
        await createFood(formData);
      }
      resetForm();
    } catch (err) {
      alert("操作失敗：" + (err instanceof Error ? err.message : "請稍後再試"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定刪除？")) return;
    try {
      await deleteFood(id);
    } catch {
      alert("刪除失敗，請稍後再試");
    }
  };

  const handleEdit = (food: Food) => {
    setForm({ ...food, todate: formatDate(food.todate) });
    setEditingId(food.$id);
    setIsFormOpen(true);
    // 滾動到頁面頂部讓用戶看到編輯表單
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(false);
    // Reset photo-related states
    setSelectedPhotoFile(null);
    setPhotoPreviewUrl("");
  };

  if (loading) return <FullPageLoading text="載入食品資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6" id="food-management-container">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <SectionHeader
        title="鋒兄食品"
        subtitle={`共 ${foods.length} 項食品`}
        action={
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>即時同步</span>
          </div>
        }
      />

      <div className="flex justify-end">
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          variant="outline"
          className="rounded-xl flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-10 px-4"
        >
          {isFormOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
          {isFormOpen ? "收起表單" : "新增食品"}
        </Button>
      </div>

      {isFormOpen && (
        <FoodForm
          form={form}
          setForm={setForm}
          editingId={editingId}
          photoPreviewUrl={photoPreviewUrl}
          selectedPhotoFile={selectedPhotoFile}
          photoUploading={photoUploading}
          handlePhotoFileSelect={handlePhotoFileSelect}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <DataCard>
        <DesktopTable
          foods={foods}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAmountChange={updateAmount}
        />
        <MobileList
          foods={foods}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAmountChange={updateAmount}
        />
      </DataCard>
    </div>
  );
}

// 表單元件
interface FoodFormProps {
  form: FoodFormData;
  setForm: (form: FoodFormData) => void;
  editingId: string | null;
  photoPreviewUrl: string;
  selectedPhotoFile: File | null;
  photoUploading: boolean;
  handlePhotoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function FoodForm({ 
  form, 
  setForm, 
  editingId, 
  photoPreviewUrl, 
  selectedPhotoFile, 
  photoUploading, 
  handlePhotoFileSelect, 
  onSubmit, 
  onCancel 
}: FoodFormProps) {
  return (
    <FormCard title={editingId ? "編輯食品" : "新增食品"} accentColor="from-blue-500 to-blue-600">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormGrid>
          <Input
            placeholder="食品名稱"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="數量"
            type="number"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="有效期限"
            type="date"
            value={form.todate}
            onChange={(e) => setForm({ ...form, todate: e.target.value })}
            required
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="價格"
            type="number"
            min="0"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: e.target.value ? parseInt(e.target.value) : 0 })}
            className="h-12 rounded-xl"
          />
          <Input
            placeholder="商店/地點"
            value={form.shop || ''}
            onChange={(e) => setForm({ ...form, shop: e.target.value })}
            className="h-12 rounded-xl"
          />
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
                    // We don't need to set photo preview here since it's passed as prop
                    // setSelectedPhotoFile(null) equivalent is handled by parent
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
          <Button type="submit" disabled={photoUploading} className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25">
            {photoUploading ? "上傳中..." : editingId ? "更新食品" : "新增食品"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6 rounded-xl" disabled={photoUploading}>
              取消編輯
            </Button>
          )}
          {!editingId && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6 rounded-xl" disabled={photoUploading}>
              取消
            </Button>
          )}
        </FormActions>
      </form>
    </FormCard>
  );
}

// 桌面版表格
interface TableProps {
  foods: Food[];
  onEdit: (food: Food) => void;
  onDelete: (id: string) => void;
  onAmountChange: (food: Food, delta: number) => void;
}

function DesktopTable({ foods, onEdit, onDelete, onAmountChange }: TableProps) {
  if (foods.length === 0) {
    return (
      <div className="hidden lg:block">
        <EmptyState emoji="📦" title="暫無食品資料" description="點擊上方表單新增第一個食品" />
      </div>
    );
  }

  return (
    <div className="hidden lg:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
            <TableHead className="font-semibold">名稱</TableHead>
            <TableHead className="font-semibold">有效期限</TableHead>
            <TableHead className="font-semibold">數量</TableHead>
            <TableHead className="font-semibold">圖片</TableHead>
            <TableHead className="font-semibold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {foods.map((food) => (
            <FoodTableRow key={food.$id} food={food} onEdit={onEdit} onDelete={onDelete} onAmountChange={onAmountChange} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FoodTableRow({ food, onEdit, onDelete, onAmountChange }: { food: Food } & Omit<TableProps, "foods">) {
  const { daysRemaining, status, formattedDate, isExpired, isExpiringSoon } = getFoodExpiryInfo(food);
  const rowClass = isExpired ? "bg-red-50 dark:bg-red-900/20" : isExpiringSoon ? "bg-yellow-50 dark:bg-yellow-900/20" : "";

  return (
    <TableRow className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${rowClass}`}>
      <TableCell className="font-medium">{food.name}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span>{formattedDate}</span>
          {status !== "normal" && (
            <StatusBadge status={status}>{formatDaysRemaining(daysRemaining)}</StatusBadge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <AmountControl food={food} onAmountChange={onAmountChange} />
      </TableCell>
      <TableCell>
        <FoodImage food={food} />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onEdit(food)} className="rounded-lg">編輯</Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(food.$id)} className="rounded-lg">刪除</Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// 手機版列表
function MobileList({ foods, onEdit, onDelete, onAmountChange }: TableProps) {
  if (foods.length === 0) {
    return (
      <div className="lg:hidden">
        <EmptyState emoji="📦" title="暫無食品資料" description="點擊上方表單新增第一個食品" />
      </div>
    );
  }

  return (
    <div className="lg:hidden px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {foods.map((food) => (
          <FoodMobileCard key={food.$id} food={food} onEdit={onEdit} onDelete={onDelete} onAmountChange={onAmountChange} />
        ))}
      </div>
    </div>
  );
}

function FoodMobileCard({ food, onEdit, onDelete, onAmountChange }: { food: Food } & Omit<TableProps, "foods">) {
  const { daysRemaining, status, formattedDate, isExpired, isExpiringSoon } = getFoodExpiryInfo(food);
  const highlight = isExpired ? "expired" : isExpiringSoon ? "warning" : "normal";

  return (
    <div className={`p-4 border-b last:border-0 border-gray-100 dark:border-gray-800 ${isExpired ? "bg-red-50/50" : isExpiringSoon ? "bg-amber-50/50" : ""}`}>
      <div className="flex gap-4 items-start">
        <FoodImage food={food} className="w-20 h-20 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-snug break-words line-clamp-2">
              {food.name}
            </h3>
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">期限:</span>
              <span className={isExpired ? "text-red-600 font-bold" : isExpiringSoon ? "text-amber-600 font-bold" : ""}>
                {formattedDate}
              </span>
            </div>
            {status !== "normal" && (
              <StatusBadge status={status}>{formatDaysRemaining(daysRemaining)}</StatusBadge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="w-full">
          <AmountControl food={food} onAmountChange={onAmountChange} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(food)}
            className="h-11 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-bold"
          >
            編輯
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onDelete(food.$id)}
            className="h-11 rounded-xl font-bold"
          >
            刪除
          </Button>
        </div>
      </div>
    </div>
  );
}

// 數量控制元件
function AmountControl({ food, onAmountChange }: { food: Food; onAmountChange: (food: Food, delta: number) => void }) {
  return (
    <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onAmountChange(food, -1)}
        disabled={food.amount <= 0}
        className="w-10 h-10 p-0 rounded-lg text-gray-500 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800"
      >
        -
      </Button>
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">數量</span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{food.amount}</span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onAmountChange(food, 1)}
        className="w-10 h-10 p-0 rounded-lg text-gray-500 hover:text-green-500 hover:bg-white dark:hover:bg-gray-800"
      >
        +
      </Button>
    </div>
  );
}

// 食品圖片元件
function FoodImage({ food, className }: { food: Food; className?: string }) {
  const baseClass = "object-cover rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800";
  const sizeClass = className || "w-16 h-16";
  
  if (food.photo) {
    return (
      <img src={food.photo} alt={food.name} className={`${baseClass} ${sizeClass}`} />
    );
  }
  return (
    <div className={`${baseClass} ${sizeClass} flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-1`}>
      <div className="text-[10px] font-medium opacity-50">NO IMAGE</div>
    </div>
  );
}
