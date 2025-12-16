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
    <>
      <div className="space-y-4 lg:space-y-6" id="food-management-container">
        {/* 標題區域 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="food-top">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              食品管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {foods.length} 項食品
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>即時同步</span>
          </div>
        </div>

      {/* 新增/編輯表單 */}
      <div id="food-form" className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h2 className="text-lg font-semibold">
            {editingFoodId ? "編輯食品" : "新增食品"}
          </h2>
        </div>
        <form onSubmit={handleFoodSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="食品名稱"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
              className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Input
              placeholder="有效期限"
              type="date"
              value={foodForm.todate}
              onChange={(e) => setFoodForm({ ...foodForm, todate: e.target.value })}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Input
              placeholder="圖片 URL"
              value={foodForm.photo}
              onChange={(e) => setFoodForm({ ...foodForm, photo: e.target.value })}
              className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit"
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25"
            >
              {editingFoodId ? "更新食品" : "新增食品"}
            </Button>
            {editingFoodId && (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setEditingFoodId(null);
                  setFoodForm({ name: "", amount: 0, todate: "", photo: "" });
                }}
                className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                取消編輯
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 食品列表 */}
      <div id="food-list" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* 桌面版表格 */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">名稱</TableHead>
                <TableHead className="font-semibold text-gray-700">有效期限</TableHead>
                <TableHead className="font-semibold text-gray-700">數量</TableHead>
                <TableHead className="font-semibold text-gray-700">圖片</TableHead>
                <TableHead className="font-semibold text-gray-700">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <p className="text-gray-500">暫無食品資料</p>
                      <p className="text-sm text-gray-400">點擊上方表單新增第一個食品</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                foods.map((f) => {
                  const today = new Date();
                  const expireDate = new Date(f.todate);
                  const daysUntilExpire = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysUntilExpire < 0;
                  const isExpiringSoon = daysUntilExpire <= 3 && daysUntilExpire >= 0;

                  return (
                    <TableRow key={f.$id} className={`hover:bg-gray-50/50 ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''}`}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(f.todate)}</span>
                          {isExpired && (
                            <span className="text-xs text-red-600 font-medium">已過期 {Math.abs(daysUntilExpire)} 天</span>
                          )}
                          {isExpiringSoon && (
                            <span className="text-xs text-yellow-600 font-medium">{daysUntilExpire} 天後過期</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-8 text-center font-medium">{f.amount}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAmountChange(f, -1)}
                            disabled={f.amount <= 0}
                            className="w-8 h-8 p-0 rounded-lg"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAmountChange(f, 1)}
                            className="w-8 h-8 p-0 rounded-lg"
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
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">
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
                            className="rounded-lg"
                          >
                            編輯
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleFoodDelete(f.$id)}
                            className="rounded-lg"
                          >
                            刪除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* 手機版和平板版卡片列表 */}
        <div className="lg:hidden">
          {foods.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-gray-500">暫無食品資料</p>
                <p className="text-sm text-gray-400">點擊上方表單新增第一個食品</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {foods.map((f) => {
                const today = new Date();
                const expireDate = new Date(f.todate);
                const daysUntilExpire = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isExpired = daysUntilExpire < 0;
                const isExpiringSoon = daysUntilExpire <= 3 && daysUntilExpire >= 0;

                return (
                  <div key={f.$id} className={`p-4 ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* 圖片 */}
                      <div className="flex-shrink-0">
                        {f.photo ? (
                          <img
                            src={f.photo}
                            alt={f.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                            無圖片
                          </div>
                        )}
                      </div>

                      {/* 內容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{f.name}</h3>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>期限:</span>
                                <span>{formatDate(f.todate)}</span>
                              </div>
                              {isExpired && (
                                <div className="text-xs text-red-600 font-medium">
                                  已過期 {Math.abs(daysUntilExpire)} 天
                                </div>
                              )}
                              {isExpiringSoon && (
                                <div className="text-xs text-yellow-600 font-medium">
                                  {daysUntilExpire} 天後過期
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 數量控制 */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">數量:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAmountChange(f, -1)}
                                disabled={f.amount <= 0}
                                className="w-8 h-8 p-0 rounded-lg"
                              >
                                -
                              </Button>
                              <span className="w-8 text-center font-medium">{f.amount}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAmountChange(f, 1)}
                                className="w-8 h-8 p-0 rounded-lg"
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          {/* 操作按鈕 */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFoodForm(f);
                                setEditingFoodId(f.$id);
                              }}
                              className="rounded-lg text-xs px-3"
                            >
                              編輯
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleFoodDelete(f.$id)}
                              className="rounded-lg text-xs px-3"
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* 底部標記，用於滾動導航 */}
      <div id="food-bottom" className="h-1"></div>
    </div>
  </>);
}