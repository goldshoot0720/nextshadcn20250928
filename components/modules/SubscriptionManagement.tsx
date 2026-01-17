"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeader } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard, DataCardList, DataCardItem } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { useSubscriptions, getSubscriptionExpiryInfo } from "@/hooks/useSubscriptions";
import { SubscriptionFormData, Subscription } from "@/types";
import { FaviconImage } from "@/components/ui/favicon-image";
import { formatDate, formatDaysRemaining, formatCurrency } from "@/lib/formatters";

const INITIAL_FORM: SubscriptionFormData = { name: "", site: "", price: 0, nextdate: "" };

export default function SubscriptionManagement() {
  const { subscriptions, loading, stats, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const [form, setForm] = useState<SubscriptionFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [canAskNotification, setCanAskNotification] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    setCanAskNotification(true);
    if (Notification.permission === "granted") {
      setNotificationEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (!subscriptions.length) return;

    const now = new Date();
    const hour = now.getHours();
    if (hour < 6) return;

    const today = now.toISOString().slice(0, 10);

    const items = subscriptions
      .map((sub) => {
        const info = getSubscriptionExpiryInfo(sub);
        return { sub, daysRemaining: info.daysRemaining };
      })
      .filter(({ daysRemaining }) => daysRemaining >= 0 && daysRemaining <= 3);

    if (items.length === 0) return;

    const storageKey = "subscriptionNotificationDaily";
    let notified: Record<string, string> = {};

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        notified = JSON.parse(raw) as Record<string, string>;
      }
    } catch {
    }

    const toNotify = items.filter(({ sub }) => {
      const key = `${sub.$id}-${sub.nextdate}-${today}`;
      return notified[key] !== "shown";
    });

    if (toNotify.length === 0) return;

    const updated = { ...notified };

    toNotify.forEach(({ sub, daysRemaining }) => {
      const key = `${sub.$id}-${sub.nextdate}-${today}`;

      try {
        new Notification("訂閱即將到期提醒", {
          body: `${sub.name} 將在 ${daysRemaining} 天內到期`,
          icon: "/favicon.ico",
        });
        updated[key] = "shown";
      } catch {
      }
    });

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
    }
  }, [subscriptions]);

  const handleEnableNotification = () => {
    if (typeof Notification === "undefined") {
      alert("此瀏覽器不支援通知功能");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationEnabled(true);
      alert("已啟用通知");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationEnabled(true);
        try {
          new Notification("通知已啟用", {
            body: "之後訂閱到期會顯示提醒",
            icon: "/favicon.ico",
          });
        } catch {
        }
      } else if (permission === "denied") {
        alert("瀏覽器已拒絕通知權限");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSubscription(editingId, form);
      } else {
        await createSubscription(form);
      }
      resetForm();
    } catch {
      alert("操作失敗，請稍後再試");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定刪除？")) return;
    try {
      await deleteSubscription(id);
    } catch {
      alert("刪除失敗，請稍後再試");
    }
  };

  const handleEdit = (sub: Subscription) => {
    setForm({ ...sub, nextdate: formatDate(sub.nextdate) });
    setEditingId(sub.$id);
    // 滾動到頁面頂部讓用戶看到編輯表單
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  if (loading) return <FullPageLoading text="載入訂閱資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader
        title="訂閱管理"
        subtitle={`共 ${stats.total} 個訂閱服務`}
        action={
          <StatCard title="總月費" value={formatCurrency(stats.totalMonthlyFee)} gradient="from-blue-500 to-blue-600" className="min-w-[160px]" />
        }
      />

      {canAskNotification && !notificationEnabled && (
        <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <span>可以在此裝置啟用訂閱到期通知</span>
          <Button type="button" size="sm" variant="outline" onClick={handleEnableNotification} className="rounded-lg">
            啟用通知
          </Button>
        </div>
      )}

      <FormCard title={editingId ? "編輯訂閱" : "新增訂閱"} accentColor="from-green-500 to-green-600">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGrid>
            <Input placeholder="服務名稱" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-12 rounded-xl" />
            <Input placeholder="網站 URL" type="url" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} required className="h-12 rounded-xl" />
            <Input placeholder="月費金額" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} required className="h-12 rounded-xl" />
            <Input placeholder="下次付款日期" type="date" value={form.nextdate} onChange={(e) => setForm({ ...form, nextdate: e.target.value })} required className="h-12 rounded-xl" />
          </FormGrid>
          <FormActions>
            <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-medium shadow-lg shadow-green-500/25">
              {editingId ? "更新訂閱" : "新增訂閱"}
            </Button>
            {editingId && <Button type="button" variant="outline" onClick={resetForm} className="h-12 px-6 rounded-xl">取消編輯</Button>}
          </FormActions>
        </form>
      </FormCard>

      <DataCard>
        {subscriptions.length === 0 ? (
          <EmptyState emoji="💳" title="暫無訂閱資料" description="點擊上方表單新增第一個訂閱" />
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
                    <TableHead className="font-semibold">服務名稱</TableHead>
                    <TableHead className="font-semibold">下次付款日期</TableHead>
                    <TableHead className="font-semibold">月費</TableHead>
                    <TableHead className="font-semibold">網站</TableHead>
                    <TableHead className="font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const { daysRemaining, status, formattedDate, isOverdue, isUpcoming } = getSubscriptionExpiryInfo(sub);
                    const rowClass = isOverdue ? "bg-red-50 dark:bg-red-900/20" : isUpcoming ? "bg-yellow-50 dark:bg-yellow-900/20" : "";
                    return (
                      <TableRow key={sub.$id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${rowClass}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FaviconImage siteUrl={sub.site} siteName={sub.name} size={20} />
                            <span>{sub.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{formattedDate}</span>
                            {status !== "normal" && <StatusBadge status={status}>{formatDaysRemaining(daysRemaining)}</StatusBadge>}
                          </div>
                        </TableCell>
                        <TableCell><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(sub.price)}</span></TableCell>
                        <TableCell>
                          <a href={sub.site} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline truncate block max-w-32 rounded-lg px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20">前往網站</a>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(sub)} className="rounded-xl">編輯</Button>
                            <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(sub.$id)} className="rounded-xl">刪除</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden">
              <DataCardList>
                {subscriptions.map((sub) => {
                  const { daysRemaining, status, formattedDate, isOverdue, isUpcoming } = getSubscriptionExpiryInfo(sub);
                  const highlight = isOverdue ? "expired" : isUpcoming ? "warning" : "normal";
                  return (
                    <DataCardItem key={sub.$id} highlight={highlight}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FaviconImage siteUrl={sub.site} siteName={sub.name} size={20} />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{sub.name}</h3>
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(sub.price)}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">下次付款:</span><span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">網站:</span>
                            <a href={sub.site} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm bg-blue-50 px-2 py-1 rounded-lg">前往網站</a>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(sub)} className="flex-1 rounded-xl">編輯</Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(sub.$id)} className="flex-1 rounded-xl">刪除</Button>
                        </div>
                      </div>
                    </DataCardItem>
                  );
                })}
              </DataCardList>
            </div>
          </>
        )}
      </DataCard>
    </div>
  );
}
