"use client";

import { useState } from "react";
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

const INITIAL_FORM: FoodFormData = { name: "", amount: 0, todate: "", photo: "" };

export default function FoodManagement() {
  const { foods, loading, createFood, updateFood, deleteFood, updateAmount } = useFoods();
  const [form, setForm] = useState<FoodFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateFood(editingId, form);
      } else {
        await createFood(form);
      }
      resetForm();
    } catch {
      alert("操作失敗，請稍後再試");
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
  };

  if (loading) return <FullPageLoading text="載入食品資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6" id="food-management-container">
      <SectionHeader
        title="食品管理"
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
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function FoodForm({ form, setForm, editingId, onSubmit, onCancel }: FoodFormProps) {
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
            placeholder="圖片 URL"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
            className="h-12 rounded-xl"
          />
        </FormGrid>
        <FormActions>
          <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25">
            {editingId ? "更新食品" : "新增食品"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-6 rounded-xl">
              取消編輯
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
    <div className="lg:hidden">
      <DataCardList>
        {foods.map((food) => (
          <FoodMobileCard key={food.$id} food={food} onEdit={onEdit} onDelete={onDelete} onAmountChange={onAmountChange} />
        ))}
      </DataCardList>
    </div>
  );
}

function FoodMobileCard({ food, onEdit, onDelete, onAmountChange }: { food: Food } & Omit<TableProps, "foods">) {
  const { daysRemaining, status, formattedDate, isExpired, isExpiringSoon } = getFoodExpiryInfo(food);
  const highlight = isExpired ? "expired" : isExpiringSoon ? "warning" : "normal";

  return (
    <DataCardItem highlight={highlight}>
      <div className="flex items-start gap-4">
        <FoodImage food={food} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{food.name}</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>期限:</span>
                  <span>{formattedDate}</span>
                </div>
                {status !== "normal" && (
                  <StatusBadge status={status}>{formatDaysRemaining(daysRemaining)}</StatusBadge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <AmountControl food={food} onAmountChange={onAmountChange} />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onEdit(food)} className="rounded-lg text-xs px-3">編輯</Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(food.$id)} className="rounded-lg text-xs px-3">刪除</Button>
            </div>
          </div>
        </div>
      </div>
    </DataCardItem>
  );
}

// 數量控制元件
function AmountControl({ food, onAmountChange }: { food: Food; onAmountChange: (food: Food, delta: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300 lg:hidden">數量:</span>
      <Button type="button" size="sm" variant="outline" onClick={() => onAmountChange(food, -1)} disabled={food.amount <= 0} className="w-8 h-8 p-0 rounded-lg">-</Button>
      <span className="w-8 text-center font-medium">{food.amount}</span>
      <Button type="button" size="sm" variant="outline" onClick={() => onAmountChange(food, 1)} className="w-8 h-8 p-0 rounded-lg">+</Button>
    </div>
  );
}

// 食品圖片元件
function FoodImage({ food }: { food: Food }) {
  if (food.photo) {
    return (
      <img src={food.photo} alt={food.name} className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm" />
    );
  }
  return (
    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
      無圖片
    </div>
  );
}
