"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Food {
  $id: string;
  name: string;
  amount: number;
  todate: string;
  photo: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function FoodManagement() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodForm, setFoodForm] = useState<Omit<Food, "$id">>({
    name: "",
    amount: 0,
    todate: "",
    photo: "",
  });
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 載入食品資料
  async function loadFoods() {
    try {
      const res = await fetch("/api/food", { cache: "no-store" });
      let data: Food[] = await res.json();
      data = data.sort(
        (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
      );
      setFoods(data);
      return data;
    } catch (error) {
      console.error("載入食品資料失敗:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  // 提交表單
  async function handleFoodSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...foodForm };
    let updatedFood: Food;

    try {
      if (editingFoodId) {
        const res = await fetch(`/api/food/${editingFoodId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        updatedFood = await res.json();
        const newFoods = foods.map((f) =>
          f.$id === editingFoodId ? updatedFood : f
        );
        newFoods.sort(
          (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
        );
        setFoods(newFoods);
      } else {
        const res = await fetch("/api/food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        updatedFood = await res.json();
        const newFoods = [...foods, updatedFood];
        newFoods.sort(
          (a, b) => new Date(a.todate).getTime() - new Date(b.todate).getTime()
        );
        setFoods(newFoods);
      }
      setFoodForm({ name: "", amount: 0, todate: "", photo: "" });
      setEditingFoodId(null);
    } catch (error) {
      console.error("操作失敗:", error);
      alert("操作失敗，請稍後再試");
    }
  }

  // 刪除食品
  async function handleFoodDelete(id: string) {
    if (!confirm("確定刪除？")) return;
    
    try {
      await fetch(`/api/food/${id}`, { method: "DELETE" });
      setFoods(foods.filter((f) => f.$id !== id));
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除失敗，請稍後再試");
    }
  }

  // 修改數量
  async function handleAmountChange(food: Food, delta: number) {
    const newAmount = food.amount + delta;
    if (newAmount < 0) return;

    const updatedFood = { ...food, amount: newAmount };

    try {
      await fetch(`/api/food/${food.$id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFood),
      });

      setFoods(foods.map((f) => (f.$id === food.$id ? updatedFood : f)));
    } catch (error) {
      console.error("更新數量失敗:", error);
      alert("更新失敗，請稍後再試");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          食品管理
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({foods.length} 項目)
          </span>
        </h1>
      </div>

      {/* 新增/編輯表單 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {editingFoodId ? "編輯食品" : "新增食品"}
        </h2>
        <form onSubmit={handleFoodSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="食品名稱"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              required
            />
            <Input
              placeholder="數量"
              type="number"
              min="0"
              value={foodForm.amount}
              onChange={(e) =>
                setFoodForm({ ...foodForm, amount: parseInt(e.target.value) || 0 })
              }
              required
            />
            <Input
              placeholder="有效期限"
              type="date"
              value={foodForm.todate}
              onChange={(e) => setFoodForm({ ...foodForm, todate: e.target.value })}
              required
            />
            <Input
              placeholder="圖片 URL"
              value={foodForm.photo}
              onChange={(e) => setFoodForm({ ...foodForm, photo: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              {editingFoodId ? "更新" : "新增"}
            </Button>
            {editingFoodId && (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setEditingFoodId(null);
                  setFoodForm({ name: "", amount: 0, todate: "", photo: "" });
                }}
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 食品列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>有效期限</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>圖片</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    暫無食品資料
                  </TableCell>
                </TableRow>
              ) : (
                foods.map((f) => (
                  <TableRow key={f.$id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{formatDate(f.todate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-center font-medium">{f.amount}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAmountChange(f, -1)}
                          disabled={f.amount <= 0}
                        >
                          -
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAmountChange(f, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {f.photo ? (
                        <img
                          src={f.photo}
                          alt={f.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          無圖片
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFoodForm(f);
                            setEditingFoodId(f.$id);
                          }}
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleFoodDelete(f.$id)}
                        >
                          刪除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}