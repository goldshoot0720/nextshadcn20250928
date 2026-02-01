"use client";

import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Plus, 
  Minus,
  ChevronDown, 
  ChevronUp, 
  Link as LinkIcon, 
  MapPin, 
  CreditCard, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  User,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { FormCard, FormGrid, FormActions } from "@/components/ui/form-card";
import { DataCard, DataCardList, DataCardItem } from "@/components/ui/data-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { StatCard } from "@/components/ui/stat-card";
import { useBanks } from "@/hooks/useBanks";
import { BankFormData, Bank } from "@/types";
import { FaviconImage } from "@/components/ui/favicon-image";
import { formatCurrency } from "@/lib/formatters";

const INITIAL_FORM: BankFormData = { 
  name: "", 
  deposit: 0, 
  site: "", 
  address: "", 
  withdrawals: 0, 
  transfer: 0, 
  activity: "", 
  card: "", 
  account: "" 
};

export default function BankManagement() {
  const { banks, loading, error, stats, createBank, updateBank, deleteBank } = useBanks();
  const [form, setForm] = useState<BankFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 取得已存在的不重複資料用於下拉選單
  const existingNames = useMemo(() => {
    const names = banks.map(b => b.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [banks]);

  const existingSites = useMemo(() => {
    const sites = banks.map(b => b.site).filter(Boolean) as string[];
    return Array.from(new Set(sites)).sort();
  }, [banks]);

  const existingAddresses = useMemo(() => {
    const addresses = banks.map(b => b.address).filter(Boolean) as string[];
    return Array.from(new Set(addresses)).sort();
  }, [banks]);

  const existingCards = useMemo(() => {
    const cards = banks.map(b => b.card).filter(Boolean) as string[];
    return Array.from(new Set(cards)).sort();
  }, [banks]);

  const existingAccounts = useMemo(() => {
    const accounts = banks.map(b => b.account).filter(Boolean) as string[];
    return Array.from(new Set(accounts)).sort();
  }, [banks]);

  // 搜尋過濾
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;
    const query = searchQuery.toLowerCase();
    return banks.filter(bank => 
      bank.name?.toLowerCase().includes(query) ||
      bank.site?.toLowerCase().includes(query) ||
      bank.address?.toLowerCase().includes(query) ||
      bank.card?.toLowerCase().includes(query) ||
      bank.account?.toLowerCase().includes(query)
    );
  }, [banks, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBank(editingId, form);
      } else {
        await createBank(form);
      }
      resetForm();
    } catch {
      alert("操作失敗，請稍後再試");
    }
  };

  const handleEdit = (bank: Bank) => {
    setForm({
      name: bank.name,
      deposit: bank.deposit || 0,
      site: bank.site || "",
      address: bank.address || "",
      withdrawals: bank.withdrawals || 0,
      transfer: bank.transfer || 0,
      activity: bank.activity || "",
      card: bank.card || "",
      account: bank.account || ""
    });
    setEditingId(bank.$id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const userInput = prompt(`請輸入 "DELETE ${name}" 來確認刪除「${name}」的資料：`);
    if (!userInput || userInput !== `DELETE ${name}`) {
      if (userInput !== null) { // User didn't cancel
        alert("輸入不正確，取消刪除操作");
      }
      return;
    }
    try {
      await deleteBank(id);
    } catch {
      alert("刪除失敗");
    }
  };

  if (loading) return <FullPageLoading text="載入銀行資料中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <SectionHeader
        title="鋒兄銀行"
        subtitle={`管理您的銀行帳戶、資產與相關資訊`}
        action={
          <div className="flex gap-4">
            <StatCard title="總資產" value={formatCurrency(stats.totalDeposit)} gradient="from-blue-500 to-blue-600" className="min-w-[160px]" />
            <StatCard title="帳戶數" value={stats.total} gradient="from-purple-500 to-purple-600" className="min-w-[160px]" />
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
          {isFormOpen ? "收起表單" : "新增銀行資料"}
        </Button>
      </div>

      {isFormOpen && (
        <FormCard title={editingId ? "編輯銀行資料" : "新增銀行資料"} accentColor="from-blue-500 to-blue-600">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormGrid>
              <div className="space-y-1">
                <label className="text-sm font-medium">銀行名稱 / Bank Name</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input placeholder="例如: 台北富邦 / e.g. Taipei Fubon" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-12 rounded-xl w-full" />
                    <div className="px-1 h-4">
                      {form.name ? (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                      ) : (
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">請輸入名稱 / Please enter name</span>
                      )}
                    </div>
                  </div>
                  {existingNames.length > 0 && (
                    <Select value="" onValueChange={(val) => val && setForm({ ...form, name: val })}>
                      <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">存款金額 / Deposit Amount</label>
                <div className="flex gap-1 items-center">
                  <Input type="number" placeholder="0" value={form.deposit || ""} onChange={(e) => setForm({ ...form, deposit: parseInt(e.target.value) || 0 })} className="h-12 rounded-xl flex-1" />
                  {(form.deposit || 0) > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, deposit: (form.deposit || 0) + 1000 })}
                        className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded transition-colors"
                        title="+1000"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, deposit: Math.max(0, (form.deposit || 0) - 1000) })}
                        className="p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded transition-colors"
                        title="-1000"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-1 h-4">
                  {(form.deposit || 0) > 0 ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">可以 + 或 - / Can use + or -</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入金額 / (Optional) Please enter amount</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">官方網站 URL / Official Website URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input type="url" placeholder="https://..." value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} className="h-12 rounded-xl w-full" />
                    <div className="px-1 h-4">
                      {form.site ? (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入 URL / (Optional) Please enter URL</span>
                      )}
                    </div>
                  </div>
                  {existingSites.length > 0 && (
                    <Select value="" onValueChange={(val) => val && setForm({ ...form, site: val })}>
                      <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingSites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">分行地址 / Branch Address</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input placeholder="分行名稱或地址 / Branch name or address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-12 rounded-xl w-full" />
                    <div className="px-1 h-4">
                      {form.address ? (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入地址 / (Optional) Please enter address</span>
                      )}
                    </div>
                  </div>
                  {existingAddresses.length > 0 && (
                    <Select value="" onValueChange={(val) => val && setForm({ ...form, address: val })}>
                      <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingAddresses.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">提款額度 / Withdrawal Limit</label>
                <div className="flex gap-1 items-center">
                  <Input type="number" placeholder="0" value={form.withdrawals || ""} onChange={(e) => setForm({ ...form, withdrawals: parseInt(e.target.value) || 0 })} className="h-12 rounded-xl flex-1" />
                  {(form.withdrawals || 0) > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, withdrawals: (form.withdrawals || 0) + 1000 })}
                        className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded transition-colors"
                        title="+1000"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, withdrawals: Math.max(0, (form.withdrawals || 0) - 1000) })}
                        className="p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded transition-colors"
                        title="-1000"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-1 h-4">
                  {(form.withdrawals || 0) > 0 ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">可以 + 或 - / Can use + or -</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入金額 / (Optional) Please enter amount</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">轉帳額度 / Transfer Limit</label>
                <div className="flex gap-1 items-center">
                  <Input type="number" placeholder="0" value={form.transfer || ""} onChange={(e) => setForm({ ...form, transfer: parseInt(e.target.value) || 0 })} className="h-12 rounded-xl flex-1" />
                  {(form.transfer || 0) > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, transfer: (form.transfer || 0) + 1000 })}
                        className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded transition-colors"
                        title="+1000"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, transfer: Math.max(0, (form.transfer || 0) - 1000) })}
                        className="p-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 rounded transition-colors"
                        title="-1000"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-1 h-4">
                  {(form.transfer || 0) > 0 ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">可以 + 或 - / Can use + or -</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入金額 / (Optional) Please enter amount</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">優惠活動 URL / Activity URL</label>
                <Input type="url" placeholder="https://..." value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="h-12 rounded-xl" />
                <div className="px-1 h-4">
                  {form.activity ? (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入 URL / (Optional) Please enter URL</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">卡片資訊 / Card Info</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input placeholder="卡片類型或後四碼 / Card type or last 4 digits" value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })} className="h-12 rounded-xl w-full" />
                    <div className="px-1 h-4">
                      {form.card ? (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入卡片資訊 / (Optional) Please enter card info</span>
                      )}
                    </div>
                  </div>
                  {existingCards.length > 0 && (
                    <Select value="" onValueChange={(val) => val && setForm({ ...form, card: val })}>
                      <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingCards.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">帳號/用戶名 / Account/Username</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input placeholder="網銀帳號或登入 ID / Online banking or login ID" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} className="h-12 rounded-xl w-full" />
                    <div className="px-1 h-4">
                      {form.account ? (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入帳號 / (Optional) Please enter account</span>
                      )}
                    </div>
                  </div>
                  {existingAccounts.length > 0 && (
                    <Select value="" onValueChange={(val) => val && setForm({ ...form, account: val })}>
                      <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center">
                        <ChevronDown className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingAccounts.map(acc => <SelectItem key={acc} value={acc}>{acc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </FormGrid>
            <FormActions>
              <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25">
                {editingId ? "更新資料" : "新增資料"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="h-12 px-6 rounded-xl">取消</Button>
              {editingId && (
                <Button type="button" variant="destructive" onClick={() => handleDelete(editingId, form.name)} className="h-12 px-6 rounded-xl ml-auto">
                  刪除
                </Button>
              )}
            </FormActions>
          </form>
        </FormCard>
      )}

      {/* 搜尋欄位 */}
      {banks.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="搜尋名稱、網站、地址、卡號、帳號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
      )}

      <DataCard>
        {banks.length === 0 ? (
          <EmptyState icon={<Building2 className="w-12 h-12" />} title="暫無銀行資料" description="點擊上方按鈕新增您的第一筆銀行資料" />
        ) : filteredBanks.length === 0 ? (
          <EmptyState icon={<Search className="w-12 h-12" />} title="無搜尋結果" description={`找不到「${searchQuery}」相關的銀行`} />
        ) : (
          <DataCardList>
            {filteredBanks.map((bank) => (
              <DataCardItem key={bank.$id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FaviconImage siteUrl={bank.site || ""} siteName={bank.name} size={32} />
                      <div>
                        {bank.site ? (
                          <a 
                            href={bank.site} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {bank.name}
                            <LinkIcon size={14} />
                          </a>
                        ) : (
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{bank.name}</h3>
                        )}
                        {bank.account && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <User size={14} />
                            <span>{bank.account}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(bank.deposit || 0)}
                      </div>
                      <span className="text-xs text-gray-400">資產餘額</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 地址 */}
                    {bank.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="truncate">{bank.address}</span>
                      </div>
                    )}
                    
                    {/* 卡片 */}
                    {bank.card && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CreditCard size={16} className="text-gray-400" />
                        <span>{bank.card}</span>
                      </div>
                    )}

                    {/* 額度資訊 */}
                    {(bank.withdrawals || bank.transfer) && (
                      <div className="flex items-center gap-4 text-xs">
                        {bank.withdrawals !== undefined && (
                          <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                            <ArrowDownLeft size={12} />
                            <span>提款: {formatCurrency(bank.withdrawals)}</span>
                          </div>
                        )}
                        {bank.transfer !== undefined && (
                          <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            <ArrowUpRight size={12} />
                            <span>轉帳: {formatCurrency(bank.transfer)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 活動連結 */}
                    {bank.activity && (
                      <a href={bank.activity} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-purple-500 hover:underline">
                        <Activity size={16} />
                        <span>最新活動優惠</span>
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(bank)} className="flex-1 rounded-xl">
                      編輯詳細資料
                    </Button>
                  </div>
                </div>
              </DataCardItem>
            ))}
          </DataCardList>
        )}
      </DataCard>
    </div>
  );
}
