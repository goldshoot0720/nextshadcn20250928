"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatDate, formatDaysRemaining, formatCurrency, formatCurrencyWithExchange, convertToTWD } from "@/lib/formatters";

const INITIAL_FORM: SubscriptionFormData = { name: "", site: "", price: 0, nextdate: "", note: "", account: "", currency: "TWD", continue: true };

export default function SubscriptionManagement() {
  const { subscriptions, loading, error, stats, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const [form, setForm] = useState<SubscriptionFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [canAskNotification, setCanAskNotification] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // 取得已存在的不重複服務名稱
  const existingNames = useMemo(() => {
    const names = subscriptions.map(s => s.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [subscriptions]);

  // 取得已存在的不重複網站 URL
  const existingSites = useMemo(() => {
    const sites = subscriptions.map(s => s.site).filter(Boolean) as string[];
    return Array.from(new Set(sites)).sort();
  }, [subscriptions]);

  // 取得已存在的不重複帳號
  const existingAccounts = useMemo(() => {
    const accounts = subscriptions.map(s => s.account).filter(Boolean) as string[];
    return Array.from(new Set(accounts)).sort();
  }, [subscriptions]);

  // 搜尋過濾
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const query = searchQuery.toLowerCase();
    return subscriptions.filter(sub => 
      sub.name?.toLowerCase().includes(query) ||
      sub.site?.toLowerCase().includes(query) ||
      sub.account?.toLowerCase().includes(query) ||
      sub.note?.toLowerCase().includes(query)
    );
  }, [subscriptions, searchQuery]);

  const truncateName = (name: string, id: string) => {
    const isExpanded = expandedNames.has(id);
    if (name.length <= 37 || isExpanded) {
      return name;
    }
    return name.substring(0, 37);
  };

  const toggleNameExpansion = (id: string) => {
    setExpandedNames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
      // Prepare form data ensuring price is properly handled
      const formDataToSend = {
        ...form,
        price: form.price !== undefined && form.price !== null ? form.price : 0
      };
      
      if (editingId) {
        await updateSubscription(editingId, formDataToSend);
      } else {
        await createSubscription(formDataToSend);
      }
      resetForm();
    } catch (error) {
      console.error('Subscription operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : '操作失敗，請稍後再試';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定刪除？")) return;
    try {
      await deleteSubscription(id);
    } catch (error) {
      console.error('Delete subscription failed:', error);
      const errorMessage = error instanceof Error ? error.message : '刪除失敗，請稍後再試';
      alert(errorMessage);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setForm({ 
      name: sub.name,
      site: sub.site,
      price: sub.price !== undefined && sub.price !== null && sub.price !== 0 ? sub.price : 0,
      nextdate: sub.nextdate ? formatDate(sub.nextdate) : "",
      note: sub.note || "",
      account: sub.account || "",
      currency: sub.currency || "TWD",
      continue: sub.continue !== false
    });
    setEditingId(sub.$id);
    setIsFormOpen(true);
    // 滾動到頁面頂部讓用戶看到編輯表單
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExtend30Days = () => {
    if (!editingId) return;
    if (!form.nextdate) return; // 如果沒有日期，不執行操作
    
    // 計算新日期 (+30天)
    const currentDate = new Date(form.nextdate);
    currentDate.setDate(currentDate.getDate() + 30);
    const newDate = currentDate.toISOString().split('T')[0];
    
    // 更新表單中的日期
    setForm(prev => ({ ...prev, nextdate: newDate }));
  };

  const handleReduce30Days = () => {
    if (!editingId) return;
    if (!form.nextdate) return; // 如果沒有日期，不執行操作
    
    // 計算新日期 (-30天)
    const currentDate = new Date(form.nextdate);
    currentDate.setDate(currentDate.getDate() - 30);
    const newDate = currentDate.toISOString().split('T')[0];
    
    // 更新表單中的日期
    setForm(prev => ({ ...prev, nextdate: newDate }));
  };

  const handleDeleteFromForm = async () => {
    if (!editingId) return;
    if (!confirm(`確定刪除 ${form.name}？`)) return;
    try {
      await deleteSubscription(editingId);
      resetForm();
    } catch (error) {
      console.error('Delete subscription from form failed:', error);
      const errorMessage = error instanceof Error ? error.message : '刪除失敗，請稍後再試';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(false);
  };

  if (loading) return <FullPageLoading text="載入訂閱資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <SectionHeader
        title="鋒兄訂閱"
        subtitle={`共 ${stats.total} 個訂閱服務`}
        action={
          <div className="flex gap-4">
            <StatCard title="本月月費" value={formatCurrency(stats.totalMonthlyFee)} gradient="from-blue-500 to-blue-600" className="min-w-[160px]" />
            <StatCard title="下月月費" value={formatCurrency(stats.nextMonthFee)} gradient="from-purple-500 to-purple-600" className="min-w-[160px]" />
          </div>
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

      <div className="flex justify-end">
        <Button
          onClick={() => setIsFormOpen(!isFormOpen)}
          variant="outline"
          className="rounded-xl flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 h-10 px-4"
        >
          {isFormOpen ? <ChevronUp size={18} /> : <Plus size={18} />}
          {isFormOpen ? "收起表單" : "新增訂閱"}
        </Button>
      </div>

      {isFormOpen && (
        <FormCard title={editingId ? "編輯訂閱" : "新增訂閱"} accentColor="from-green-500 to-green-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormGrid>
              {/* 服務名稱：可輸入或從下拉選單選擇 */}
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input 
                    placeholder="服務名稱 / Service Name" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    required 
                    className="h-12 rounded-xl w-full" 
                  />
                  <div className="px-1 h-4">
                    {form.name ? (
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                    ) : (
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">請輸入名稱 / Please enter name</span>
                    )}
                  </div>
                </div>
                {existingNames.length > 0 && (
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value) {
                        setForm({ ...form, name: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                      <ChevronDown className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* 網站 URL：可輸入或從下拉選單選擇 */}
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input 
                    placeholder="網站 URL / Website URL" 
                    type="url" 
                    value={form.site || ""} 
                    onChange={(e) => setForm({ ...form, site: e.target.value })} 
                    className="h-12 rounded-xl w-full" 
                  />
                  <div className="px-1 h-4">
                    {form.site ? (
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入 URL / (Optional) Please enter URL</span>
                    )}
                  </div>
                </div>
                {existingSites.length > 0 && (
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value) {
                        setForm({ ...form, site: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                      <ChevronDown className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingSites.map((site) => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex gap-1 items-center">
                  <Input 
                    placeholder="價錢 / Price" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={form.price ?? ""} 
                    onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0 })} 
                    className="h-12 rounded-xl flex-1" 
                  />
                  <div className="px-1 h-4">
                    {(form.price !== undefined && form.price !== null && form.price > 0) ? (
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入價格 / (Optional) Please enter price</span>
                    )}
                  </div>
                </div>
                <div className="px-1 h-4">
                  {(form.price || 0) > 0 ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                      可以 + 或 - / Can use + or -
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      (選填) 請輸入數字 / (Optional) Please enter a number
                    </span>
                  )}
                </div>
              </div>
              <Select value={form.currency || "TWD"} onValueChange={(value) => setForm({ ...form, currency: value })}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="選擇幣別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWD">新台幣 (TWD)</SelectItem>
                  <SelectItem value="USD">美元 (USD)</SelectItem>
                  <SelectItem value="EUR">歐元 (EUR)</SelectItem>
                  <SelectItem value="JPY">日圓 (JPY)</SelectItem>
                  <SelectItem value="CNY">人民幣 (CNY)</SelectItem>
                  <SelectItem value="HKD">港幣 (HKD)</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <div className="flex gap-1 items-center">
                  <Input 
                    placeholder="下次付款日期 / Next Payment Date" 
                    type="date" 
                    value={form.nextdate || ""} 
                    onChange={(e) => setForm({ ...form, nextdate: e.target.value })} 
                    className="h-12 rounded-xl flex-1" 
                  />
                  {form.nextdate && (
                    <div className="flex flex-col gap-0.5">
                      <button 
                        type="button"
                        onClick={() => {
                          if (!form.nextdate) return;
                          const d = new Date(form.nextdate);
                          d.setDate(d.getDate() + 30);
                          setForm({ ...form, nextdate: d.toISOString().split('T')[0] });
                        }}
                        className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded transition-colors"
                        title="+30天"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!form.nextdate) return;
                          const d = new Date(form.nextdate);
                          d.setDate(d.getDate() - 30);
                          setForm({ ...form, nextdate: d.toISOString().split('T')[0] });
                        }}
                        className="p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded transition-colors"
                        title="-30天"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-1 h-4">
                  {form.nextdate ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">可以 + 或 - (30天) / Can use + or - (30 Days)</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請選擇日期 / (Optional) Please select a date</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input 
                    placeholder="帳號 / Account" 
                    value={form.account || ""} 
                    onChange={(e) => setForm({ ...form, account: e.target.value })} 
                    className="h-12 rounded-xl w-full" 
                  />
                  <div className="px-1 h-4">
                    {form.account ? (
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入帳號 / (Optional) Please enter account</span>
                    )}
                  </div>
                </div>
                {existingAccounts.length > 0 && (
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value) {
                        setForm({ ...form, account: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                      <ChevronDown className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingAccounts.map((account) => (
                        <SelectItem key={account} value={account}>{account}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <label className="flex items-center gap-2 h-12 px-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input 
                  type="checkbox" 
                  checked={form.continue !== false} 
                  onChange={(e) => setForm({ ...form, continue: e.target.checked })} 
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">續訂</span>
              </label>
            </FormGrid>
            <div className="space-y-1">
              <Textarea 
                placeholder="備註 / Note" 
                value={form.note || ""} 
                onChange={(e) => setForm({ ...form, note: e.target.value })} 
                className="rounded-xl min-h-[100px] resize-y w-full"
                rows={3}
              />
              <div className="px-1 h-4">
                {form.note ? (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入備註 / (Optional) Please enter note</span>
                )}
              </div>
            </div>
            <FormActions>
              <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-medium shadow-lg shadow-green-500/25">
                {editingId ? "更新訂閱" : "新增訂閱"}
              </Button>
              {editingId && (
                <Button type="button" variant="default" onClick={handleExtend30Days} className="h-12 px-6 rounded-xl bg-blue-500 hover:bg-blue-600">
                  +30天
                </Button>
              )}
              {editingId && (
                <Button type="button" variant="default" onClick={handleReduce30Days} className="h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600">
                  -30天
                </Button>
              )}
              {editingId && <Button type="button" variant="outline" onClick={resetForm} className="h-12 px-6 rounded-xl">取消編輯</Button>}
              {!editingId && <Button type="button" variant="outline" onClick={resetForm} className="h-12 px-6 rounded-xl">取消</Button>}
              {editingId && <Button type="button" variant="destructive" onClick={handleDeleteFromForm} className="h-12 px-6 rounded-xl">刪除</Button>}
            </FormActions>
          </form>
        </FormCard>
      )}

      {/* 搜尋欄位 */}
      {subscriptions.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜尋服務名稱、網站、帳號、備註..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      )}

      <DataCard>
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              {error}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              請至「鋒兄設定」頁面初始化資料庫
            </p>
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState emoji="💳" title="暫無訂閱資料" description="點擊上方表單新增第一個訂閱" />
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState emoji="🔍" title="無搜尋結果" description={`找不到「${searchQuery}」相關的訂閱`} />
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-700/50">
                    <TableHead className="font-semibold">服務名稱</TableHead>
                    <TableHead className="font-semibold">下次付款日期</TableHead>
                    <TableHead className="font-semibold">月費</TableHead>
                    <TableHead className="font-semibold">續訂</TableHead>
                    <TableHead className="font-semibold">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => {
                    const { daysRemaining, status, formattedDate, isExpired, isExpiringSoon } = getSubscriptionExpiryInfo(sub);
                    const rowClass = isExpired ? "bg-red-50 dark:bg-red-900/20" : isExpiringSoon ? "bg-yellow-50 dark:bg-yellow-900/20" : "";
                    return (
                      <TableRow key={sub.$id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${rowClass}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-start gap-2">
                            {sub.site && <FaviconImage siteUrl={sub.site} siteName={sub.name} size={20} />}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {sub.site ? (
                                  <a href={sub.site} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                                    {truncateName(sub.name, sub.$id)}
                                  </a>
                                ) : (
                                  <span className="text-gray-900 dark:text-gray-100">{truncateName(sub.name, sub.$id)}</span>
                                )}
                                {sub.name.length > 37 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleNameExpansion(sub.$id)}
                                    className="h-6 px-2 text-xs rounded-lg"
                                  >
                                    {expandedNames.has(sub.$id) ? "收起" : "詳細"}
                                  </Button>
                                )}
                              </div>
                              {sub.account && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">{sub.account}</span>
                              )}
                              {sub.note && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">📝 {sub.note}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formattedDate ? (
                            <div className="flex flex-col gap-1">
                              <span>{formattedDate}</span>
                              {status !== "normal" && <StatusBadge status={status}>{formatDaysRemaining(daysRemaining)}</StatusBadge>}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">無日期</span>
                          )}
                        </TableCell>
                        <TableCell><span className="font-semibold text-green-600 dark:text-green-400">{formatCurrencyWithExchange(sub.price, sub.currency)}</span></TableCell>
                        <TableCell>
                          {formattedDate ? (
                            sub.continue !== false ? (
                              <span className="text-green-600 dark:text-green-400">✓ 續訂</span>
                            ) : (
                              <span className="text-red-500 dark:text-red-400">✗ 不續</span>
                            )
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(sub)} className="rounded-xl">編輯</Button>
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
                {filteredSubscriptions.map((sub) => {
                  const { daysRemaining, status, formattedDate, isExpired, isExpiringSoon } = getSubscriptionExpiryInfo(sub);
                  const highlight = isExpired ? "expired" : isExpiringSoon ? "warning" : "normal";
                  return (
                    <DataCardItem key={sub.$id} highlight={highlight}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {sub.site && <FaviconImage siteUrl={sub.site} siteName={sub.name} size={20} />}
                            <div className="flex flex-col gap-1 flex-1">
                              {sub.site ? (
                                <a href={sub.site} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-semibold">
                                  {truncateName(sub.name, sub.$id)}
                                </a>
                              ) : (
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">{truncateName(sub.name, sub.$id)}</span>
                              )}
                              {sub.account && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">{sub.account}</span>
                              )}
                              {sub.note && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">📝 {sub.note}</span>
                              )}
                              {sub.name.length > 37 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleNameExpansion(sub.$id)}
                                  className="h-6 px-2 text-xs rounded-lg self-start"
                                >
                                  {expandedNames.has(sub.$id) ? "收起" : "詳細服務名稱"}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-green-600 dark:text-green-400">{formatCurrencyWithExchange(sub.price, sub.currency)}</span>
                            {formattedDate && (
                              sub.continue !== false ? (
                                <span className="text-xs text-green-600 dark:text-green-400">✓ 續訂</span>
                              ) : (
                                <span className="text-xs text-red-500 dark:text-red-400">✗ 不續</span>
                              )
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {formattedDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">下次付款:</span><span>{formattedDate}</span>
                            </div>
                          )}
                          {sub.site && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">網站:</span>
                              <a href={sub.site} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm bg-blue-50 px-2 py-1 rounded-lg">前往網站</a>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(sub)} className="flex-1 rounded-xl">編輯</Button>
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
