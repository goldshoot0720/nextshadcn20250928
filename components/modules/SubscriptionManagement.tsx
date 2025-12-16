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

interface Subscription {
  $id: string;
  name: string;
  site: string;
  price: number;
  nextdate: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function SubscriptionManagement() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subForm, setSubForm] = useState<Omit<Subscription, "$id">>({
    name: "",
    site: "",
    price: 0,
    nextdate: "",
  });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 載入訂閱資料
  async function loadSubs() {
    try {
      const res = await fetch("/api/subscription", { cache: "no-store" });
      let data: Subscription[] = await res.json();
      data = data.sort(
        (a, b) => new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
      );
      setSubs(data);
      return data;
    } catch (error) {
      console.error("載入訂閱資料失敗:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubs();
  }, []);

  // 提交表單
  async function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...subForm };
    let updatedSub: Subscription;

    try {
      if (editingSubId) {
        const res = await fetch(`/api/subscription/${editingSubId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        updatedSub = await res.json();
        const newSubs = subs.map((s) =>
          s.$id === editingSubId ? updatedSub : s
        );
        newSubs.sort(
          (a, b) =>
            new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
        );
        setSubs(newSubs);
      } else {
        const res = await fetch("/api/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        updatedSub = await res.json();
        const newSubs = [...subs, updatedSub];
        newSubs.sort(
          (a, b) =>
            new Date(a.nextdate).getTime() - new Date(b.nextdate).getTime()
        );
        setSubs(newSubs);
      }
      setSubForm({ name: "", site: "", price: 0, nextdate: "" });
      setEditingSubId(null);
    } catch (error) {
      console.error("操作失敗:", error);
      alert("操作失敗，請稍後再試");
    }
  }

  // 刪除訂閱
  async function handleSubDelete(id: string) {
    if (!confirm("確定刪除？")) return;
    
    try {
      await fetch(`/api/subscription/${id}`, { method: "DELETE" });
      setSubs(subs.filter((s) => s.$id !== id));
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除失敗，請稍後再試");
    }
  }

  // 計算總月費
  const totalMonthlyFee = subs.reduce((total, sub) => total + sub.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6" id="subscription-management-container">
        {/* 標題和統計區域 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" id="subscription-top">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              訂閱管理
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              共 {subs.length} 個訂閱服務
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/25">
            <div className="text-sm opacity-90">總月費</div>
            <div className="text-2xl lg:text-3xl font-bold">
              NT$ {totalMonthlyFee.toLocaleString()}
            </div>
          </div>
        </div>

      {/* 新增/編輯表單 */}
      <div id="subscription-form" className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <h2 className="text-lg font-semibold">
            {editingSubId ? "編輯訂閱" : "新增訂閱"}
          </h2>
        </div>
        <form onSubmit={handleSubSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="服務名稱"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Input
              placeholder="網站 URL"
              type="url"
              value={subForm.site}
              onChange={(e) => setSubForm({ ...subForm, site: e.target.value })}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Input
              placeholder="月費金額"
              type="number"
              min="0"
              value={subForm.price}
              onChange={(e) =>
                setSubForm({ ...subForm, price: parseInt(e.target.value) || 0 })
              }
              required
              className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Input
              placeholder="下次付款日期"
              type="date"
              value={subForm.nextdate}
              onChange={(e) => setSubForm({ ...subForm, nextdate: e.target.value })}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit"
              className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-medium shadow-lg shadow-green-500/25"
            >
              {editingSubId ? "更新訂閱" : "新增訂閱"}
            </Button>
            {editingSubId && (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setEditingSubId(null);
                  setSubForm({ name: "", site: "", price: 0, nextdate: "" });
                }}
                className="h-12 px-6 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                取消編輯
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 訂閱列表 */}
      <div id="subscription-list" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 桌面版表格 */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">服務名稱</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">下次付款日期</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">月費</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">網站</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">暫無訂閱資料</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">點擊上方表單新增第一個訂閱</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subs.map((s) => {
                  const nextDate = new Date(s.nextdate);
                  const today = new Date();
                  const daysUntilNext = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isUpcoming = daysUntilNext <= 7 && daysUntilNext >= 0;
                  const isOverdue = daysUntilNext < 0;

                  return (
                    <TableRow key={s.$id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : isUpcoming ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{s.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(s.nextdate)}</span>
                          {isOverdue && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">已逾期 {Math.abs(daysUntilNext)} 天</span>
                          )}
                          {isUpcoming && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">{daysUntilNext} 天後到期</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600 dark:text-green-400">NT$ {s.price.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={s.site}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline truncate block max-w-32 rounded-lg px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title={s.site}
                        >
                          前往網站
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSubForm(s);
                              setEditingSubId(s.$id);
                            }}
                            className="rounded-lg"
                          >
                            編輯
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSubDelete(s.$id)}
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
          {subs.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">暫無訂閱資料</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">點擊上方表單新增第一個訂閱</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subs.map((s) => {
                const nextDate = new Date(s.nextdate);
                const today = new Date();
                const daysUntilNext = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUpcoming = daysUntilNext <= 7 && daysUntilNext >= 0;
                const isOverdue = daysUntilNext < 0;

                return (
                  <div key={s.$id} className={`p-4 ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : isUpcoming ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}>
                    <div className="space-y-3">
                      {/* 標題和狀態 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{s.name}</h3>
                          <div className="mt-1">
                            {isOverdue && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                已逾期 {Math.abs(daysUntilNext)} 天
                              </span>
                            )}
                            {isUpcoming && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {daysUntilNext} 天後到期
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            NT$ {s.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">月費</div>
                        </div>
                      </div>

                      {/* 詳細資訊 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">下次付款:</span>
                          <span>{formatDate(s.nextdate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">網站:</span>
                          <a
                            href={s.site}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline text-sm bg-blue-50 px-2 py-1 rounded-lg"
                          >
                            前往網站
                          </a>
                        </div>
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSubForm(s);
                            setEditingSubId(s.$id);
                          }}
                          className="flex-1 rounded-xl"
                        >
                          編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSubDelete(s.$id)}
                          className="flex-1 rounded-xl"
                        >
                          刪除
                        </Button>
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
      <div id="subscription-bottom" className="h-1"></div>
    </div>
  </>);
}