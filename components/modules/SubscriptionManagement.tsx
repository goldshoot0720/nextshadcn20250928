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
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          訂閱管理
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({subs.length} 項目)
          </span>
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-500">總月費</div>
          <div className="text-2xl font-bold text-blue-600">
            NT$ {totalMonthlyFee.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {editingSubId ? "編輯訂閱" : "新增訂閱"}
        </h2>
        <form onSubmit={handleSubSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="服務名稱"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              required
            />
            <Input
              placeholder="網站 URL"
              type="url"
              value={subForm.site}
              onChange={(e) => setSubForm({ ...subForm, site: e.target.value })}
              required
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
            />
            <Input
              placeholder="下次付款日期"
              type="date"
              value={subForm.nextdate}
              onChange={(e) => setSubForm({ ...subForm, nextdate: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              {editingSubId ? "更新" : "新增"}
            </Button>
            {editingSubId && (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setEditingSubId(null);
                  setSubForm({ name: "", site: "", price: 0, nextdate: "" });
                }}
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* 訂閱列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>服務名稱</TableHead>
                <TableHead>下次付款日期</TableHead>
                <TableHead>月費</TableHead>
                <TableHead>網站</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    暫無訂閱資料
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
                    <TableRow key={s.$id} className={isOverdue ? "bg-red-50" : isUpcoming ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(s.nextdate)}</span>
                          {isOverdue && (
                            <span className="text-xs text-red-600">已逾期 {Math.abs(daysUntilNext)} 天</span>
                          )}
                          {isUpcoming && (
                            <span className="text-xs text-yellow-600">{daysUntilNext} 天後到期</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">NT$ {s.price.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={s.site}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline truncate block max-w-32"
                          title={s.site}
                        >
                          {s.site}
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
                          >
                            編輯
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSubDelete(s.$id)}
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
      </div>
    </div>
  );
}