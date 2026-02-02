"use client";

import { useState, useMemo, useEffect } from "react";
import { Star, Link as LinkIcon, FileText as NoteIcon, Plus, Play, Trash2, Edit2, X, Save, ChevronDown, ChevronUp, Filter, Search, AlertTriangle, Copy } from "lucide-react";
import { CommonAccount, CommonAccountFormData } from "@/types";
import { Input, Textarea, DataCard, Button, SectionHeader, FormCard, FormActions } from "@/components/ui";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FaviconImage } from "@/components/ui/favicon-image";
import { useCrud } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";
import { FullPageLoading } from "@/components/ui/loading-spinner";

// Known site names mapped to their URLs
const SITE_URL_MAP: Record<string, string> = {
  "Musicful": "https://tw.musicful.ai/",
  "MindVideo": "https://www.mindvideo.ai/",
  "Qoder": "https://qoder.com/",
  "GitHub": "https://github.com/",
  "Gmail": "https://mail.google.com/",
  "Outlook": "https://outlook.live.com/",
  "Google": "https://www.google.com/",
  "Facebook": "https://www.facebook.com/",
  "YouTube": "https://www.youtube.com/",
  "Twitter": "https://twitter.com/",
  "LinkedIn": "https://www.linkedin.com/",
  "Amazon": "https://www.amazon.com/",
  "Netflix": "https://www.netflix.com/",
  "Apple": "https://www.apple.com/",
  "Microsoft": "https://www.microsoft.com/",
  "Dropbox": "https://www.dropbox.com/",
  "Evernote": "https://evernote.com/",
  "Slack": "https://slack.com/",
  "Discord": "https://discord.com/",
  "Trello": "https://trello.com/",
  "Notion": "https://www.notion.so/",
  "Canva": "https://www.canva.com/",
  "Pinterest": "https://www.pinterest.com/",
  "Instagram": "https://www.instagram.com/",
  "TikTok": "https://www.tiktok.com/",
  "Reddit": "https://www.reddit.com/",
  "Spotify": "https://www.spotify.com/",
  "SoundCloud": "https://soundcloud.com/",
  "Medium": "https://medium.com/",
  "Quora": "https://www.quora.com/",
  "StackOverflow": "https://stackoverflow.com/",
  "Behance": "https://www.behance.net/",
  "Dribbble": "https://dribbble.com/",
  "Adobe": "https://www.adobe.com/",
  "Figma": "https://www.figma.com/",
  "Zoom": "https://zoom.us/",
  "Skype": "https://www.skype.com/",
  "WhatsApp": "https://www.whatsapp.com/",
  "TRAE": "https://www.trae.ai/",
};

// Array of common site names for the select dropdown
const COMMON_SITES = Object.keys(SITE_URL_MAP).sort();

const INITIAL_FORM: CommonAccountFormData = {
  name: "",
  ...Object.fromEntries([...Array(37)].map((_, i) => [`site${(i + 1).toString().padStart(2, '0')}`, ""])),
  ...Object.fromEntries([...Array(37)].map((_, i) => [`note${(i + 1).toString().padStart(2, '0')}`, ""]))
} as CommonAccountFormData;

export default function CommonAccountManagement() {
  const { items: accounts, loading, fetchAll, create, update, remove, error } = useCrud<CommonAccount>(API_ENDPOINTS.COMMON_ACCOUNT);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommonAccountFormData>(INITIAL_FORM);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  // Inline edit state: { accountId, idx, siteName, note }
  const [inlineEdit, setInlineEdit] = useState<{ accountId: string; idx: string; siteName: string; note: string } | null>(null);
  // Site filter state
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  // Name search state
  const [searchQuery, setSearchQuery] = useState("");
  // Sort order state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Error state for duplicate name
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Collect all unique site names from all accounts
  const allSiteNames = useMemo(() => {
    const siteSet = new Set<string>();
    accounts.forEach(account => {
      [...Array(37)].forEach((_, i) => {
        const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccount;
        const siteName = account[siteKey] as string;
        if (siteName) siteSet.add(siteName.trim());
      });
    });
    // Sort alphabetically a~z A~Z
    return Array.from(siteSet).sort((a, b) => a.localeCompare(b));
  }, [accounts]);

  // Filter accounts based on selected site filter and search query
  const filteredAccounts = useMemo(() => {
    let filtered = accounts.filter(account => {
      // Filter by search query (name)
      const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by site selection
      if (!siteFilter) return true;
      return [...Array(37)].some((_, i) => {
        const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccount;
        const siteName = account[siteKey] as string;
        return siteName?.trim() === siteFilter.trim();
      });
    });

    // Sort alphabetically by name
    filtered = filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [accounts, siteFilter, searchQuery, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    // 檢查名稱格式 (必須包含 @ 和 .)
    const nameRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nameRegex.test(form.name.trim())) {
      setDuplicateError("帳號名稱格式不正確，必須符合 example@domain.com 格式");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 檢查名稱是否重複 (僅限新增模式)
    if (!editingId) {
      const isExisting = accounts.some(a => a.name.trim().toLowerCase() === form.name.trim().toLowerCase());
      if (isExisting) {
        setDuplicateError(`帳號名稱「${form.name}」已存在，請勿重複新增`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else {
      // 編輯模式：如果名稱被修改且新名稱已存在（且不是原本編輯的這個）
      const editingAccount = accounts.find(a => a.$id === editingId);
      if (editingAccount && form.name.trim().toLowerCase() !== editingAccount.name.trim().toLowerCase()) {
        const isExisting = accounts.some(a => a.name.trim().toLowerCase() === form.name.trim().toLowerCase());
        if (isExisting) {
          setDuplicateError(`帳號名稱「${form.name}」已存在，請使用其他名稱`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }

    // 檢查站點名稱是否重複
    const siteNames = Object.keys(form)
      .filter(key => key.startsWith('site') && key !== 'name')
      .map(key => (form as any)[key]?.trim())
      .filter(name => name && name !== "");
    
    // 找出重複的名稱
    const duplicates = siteNames.filter((name, index) => siteNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setDuplicateError(`常用網站名稱重複: 「${duplicates[0]}」，請檢查 01~37 欄位`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setDuplicateError(null);

    // 根據字母排序站點與備註 (不包含空值)
    const sortedPairs = [...Array(37)].map((_, i) => {
      const idx = (i + 1).toString().padStart(2, '0');
      return {
        site: (form as any)[`site${idx}`] || "",
        note: (form as any)[`note${idx}`] || ""
      };
    }).filter(pair => pair.site.trim() !== "");

    // 排序
    sortedPairs.sort((a, b) => a.site.localeCompare(b.site, 'zh-TW', { sensitivity: 'base' }));

    // 建立新的表單物件，將排序後的內容填入前段，後段清空
    const sortedForm = { ...form };
    [...Array(37)].forEach((_, i) => {
      const idx = (i + 1).toString().padStart(2, '0');
      if (i < sortedPairs.length) {
        (sortedForm as any)[`site${idx}`] = sortedPairs[i].site;
        (sortedForm as any)[`note${idx}`] = sortedPairs[i].note;
      } else {
        (sortedForm as any)[`site${idx}`] = "";
        (sortedForm as any)[`note${idx}`] = "";
      }
    });

    // 清理 payload，移除後端 metadata，並根據操作決定是否保留空值
    const getPayload = (data: any, isUpdate: boolean) => {
      const payload = { ...data };
      // 移除 metadata
      delete payload.$id;
      delete payload.$createdAt;
      delete payload.$updatedAt;
      
      // 對於建立操作，移除空值以避免驗證錯誤
      // 對於更新操作，保留空值以利於清除資料庫中的欄位 (Appwrite String 欄位接受 "")
      if (!isUpdate) {
        Object.keys(payload).forEach(key => {
          if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
            delete payload[key];
          }
        });
      }
      return payload;
    };

    const isUpdate = !!editingId;
    const payload = getPayload(sortedForm, isUpdate);

    try {
      if (editingId) {
        await update(editingId, payload);
      } else {
        await create(payload);
      }
      resetForm();
      fetchAll();
    } catch (err) {
      console.error("Save failed:", err);
      alert("儲存失敗");
    }
  };

  const handleEdit = (account: CommonAccount) => {
    const formData = { ...INITIAL_FORM };
    Object.keys(formData).forEach(key => {
      if (key in account) {
        (formData as any)[key] = (account as any)[key] || "";
      }
    });
    setForm(formData);
    setEditingId(account.$id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy note (account info) to clipboard
  const handleCopyNote = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Check if it looks like an email (simple check)
      const isEmail = text.includes('@') && text.includes('.');
      alert(isEmail ? '✅ 已複製帳號！' : '✅ 已複製備註！');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('❌ 複製失敗');
    }
  };

  const handleDelete = async (account: CommonAccount) => {
    if (!confirm(`確定要刪除「${account.name}」嗎？`)) return;

    try {
      await remove(account.$id);
      fetchAll();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("刪除失敗");
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setExpandedNotes({});
    setEditingId(null);
    setDuplicateError(null);
    setIsFormOpen(false);
  };

  const toggleNote = (idx: string) => {
    setExpandedNotes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAccountExpand = (accountId: string) => {
    setExpandedAccounts(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  // Start inline editing for a single item
  const startInlineEdit = (accountId: string, idx: string, siteName: string, note: string) => {
    setInlineEdit({ accountId, idx, siteName, note });
  };

  // Cancel inline edit
  const cancelInlineEdit = () => {
    setInlineEdit(null);
  };

  // Save inline edit
  const saveInlineEdit = async () => {
    if (!inlineEdit) return;
    
    const account = accounts.find(a => a.$id === inlineEdit.accountId);
    if (!account) return;

    const siteKey = `site${inlineEdit.idx}`;
    const noteKey = `note${inlineEdit.idx}`;

    // 檢查站點名稱是否與該帳號其他站點重複
    if (inlineEdit.siteName.trim() !== "") {
      const otherSites = Object.entries(account)
        .filter(([key, val]) => key.startsWith('site') && key !== siteKey && key !== 'name' && val)
        .map(([_, val]) => (val as string).trim());
      
      if (otherSites.includes(inlineEdit.siteName.trim())) {
        alert(`此帳號已有重複的站點名稱: 「${inlineEdit.siteName.trim()}」，請修改名稱後再儲存`);
        return;
      }
    }

    try {
      const payload = { [siteKey]: inlineEdit.siteName, [noteKey]: inlineEdit.note };
      await update(account.$id, payload);
      setInlineEdit(null);
      fetchAll();
    } catch (err) {
      console.error("Inline save failed:", err);
      alert("儲存失敗");
    }
  };

  if (loading) return <FullPageLoading text="載入常用帳號中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error.message}
        </div>
      )}

      <SectionHeader 
        title="鋒兄常用" 
        subtitle={`共 ${accounts.length} 組帳號設定`}
        action={
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            className="rounded-xl flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            {isFormOpen ? <X size={18} /> : <Plus size={18} />}
            {isFormOpen ? "取消" : "新增帳號組"}
          </Button>
        }
      />

      {isFormOpen && (
        <div className="space-y-4">
          {duplicateError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-700 font-medium">{duplicateError}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setDuplicateError(null)}
                className="ml-auto h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <FormCard title={editingId ? `編輯帳號` : "新增帳號組合"} accentColor="from-blue-500 to-blue-600">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">帳號名稱</label>
                <Input
                  placeholder="輸入帳號名稱 (例如: example@example.com)"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (duplicateError) setDuplicateError(null);
                  }}
                  required
                  className="h-12 rounded-xl text-lg font-medium"
                />
              </div>

            <FormActions>
              <Button type="submit" className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-bold shadow-xl">
                <Save size={20} />
                儲存帳號組合
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="h-12 px-8 rounded-xl border-gray-200 dark:border-gray-700">
                取消
              </Button>
            </FormActions>

            <div className="space-y-4">
              <h3 className="text-md font-bold flex items-center gap-2 text-blue-600">
                <LinkIcon size={18} /> 常用網站與備註 (最多 37 個)
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {[...Array(37)].map((_, i) => {
                  const idx = (i + 1).toString().padStart(2, '0');
                  const siteKey = `site${idx}` as keyof CommonAccountFormData;
                  const noteKey = `note${idx}` as keyof CommonAccountFormData;
                  const isExpanded = expandedNotes[idx];

                  return (
                    <div key={idx} className="space-y-2 pb-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          <span className="w-8 h-10 flex items-center justify-center text-xs text-gray-400 font-mono shrink-0">{idx}</span>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder={`網站名稱 / Site Name (${idx})`}
                              value={(form as any)[siteKey] || ""}
                              onChange={(e) => setForm({ ...form, [siteKey]: e.target.value } as any)}
                              className="rounded-xl flex-1 h-12"
                              maxLength={100}
                            />
                            <Select
                              value=""
                              onValueChange={(val) => setForm({ ...form, [siteKey]: val } as any)}
                            >
                              <SelectTrigger className="h-12 w-12 rounded-xl px-0 justify-center shrink-0">
                                <ChevronDown className="h-4 w-4" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSiteNames.map(site => (
                                  <SelectItem key={site} value={site}>{site}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNote(idx)}
                            className={`shrink-0 rounded-xl h-12 w-12 ${isExpanded ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                            title="顯示/隱藏備註"
                          >
                            <NoteIcon size={18} />
                          </Button>
                        </div>
                        <div className="pl-10 px-1 h-4">
                          {(form as any)[siteKey] ? (
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                          ) : (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入名稱 / (Optional) Please enter name</span>
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="pl-10 pr-2 pb-2 space-y-1">
                          <Textarea
                            placeholder={`備註內容 / Note Content (Max 100 chars)`}
                            value={(form as any)[noteKey] || ""}
                            onChange={(e) => setForm({ ...form, [noteKey]: e.target.value } as any)}
                            className="rounded-xl border-purple-100 dark:border-purple-900/30 min-h-[80px] resize-y py-2 text-sm shadow-inner"
                            maxLength={100}
                          />
                          <div className="px-1 h-4">
                            {(form as any)[noteKey] ? (
                              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">已輸入 / Entered</span>
                            ) : (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">(選填) 請輸入備註 / (Optional) Please enter note</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </FormCard>
      </div>
      )}

      {/* Search and Site Filter */}
      <div className="space-y-4">
        {/* Search Input and Sort */}
        <div className="flex gap-3">
          <div className="relative group flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="搜尋帳號名稱 (例如: activist949...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            className="h-12 px-4 rounded-xl flex items-center gap-2 shrink-0"
            title={sortOrder === 'asc' ? '依字母順序 (A-Z)' : '依字母倒序 (Z-A)'}
          >
            {sortOrder === 'asc' ? (
              <>
                <ChevronUp size={18} />
                A-Z
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                Z-A
              </>
            )}
          </Button>
        </div>

        {allSiteNames.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap">
            <span className="text-sm text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} />
              篩選:
            </span>
            <Button
              size="sm"
              variant={siteFilter === null ? "default" : "outline"}
              onClick={() => setSiteFilter(null)}
              className={`h-8 px-3 rounded-lg text-sm shrink-0 ${siteFilter === null ? 'bg-blue-600 text-white' : ''}`}
            >
              全部 ({accounts.length})
            </Button>
            {allSiteNames.map(siteName => {
              const count = accounts.filter(account => {
                return [...Array(37)].some((_, i) => {
                  const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccount;
                  const name = account[siteKey] as string;
                  return name?.trim() === siteName.trim();
                });
              }).length;
              const siteUrl = SITE_URL_MAP[siteName];
              return (
                <Button
                  key={siteName}
                  size="sm"
                  variant={siteFilter === siteName ? "default" : "outline"}
                  onClick={() => setSiteFilter(siteFilter === siteName ? null : siteName)}
                  className={`h-8 px-3 rounded-lg text-sm flex items-center gap-1.5 shrink-0 ${siteFilter === siteName ? 'bg-blue-600 text-white' : ''}`}
                >
                  {siteUrl && <FaviconImage siteUrl={siteUrl} siteName={siteName} size={14} />}
                  {siteName} ({count})
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {filteredAccounts.length === 0 ? (
        <DataCard className="p-12 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {siteFilter || searchQuery
              ? `沒有符合「${searchQuery || siteFilter}」的帳號` 
              : "尚無常用帳號資料，請點擊右上方「新增」按鈕"
            }
          </p>
        </DataCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAccounts.map((account) => (
            <DataCard key={account.$id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500 overflow-hidden group">
              <div className="p-4 pr-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <NoteIcon size={20} className="text-blue-500 shrink-0" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                    {account.name}
                  </h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleCopyNote(account.name)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="複製帳號"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(account)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg shadow-sm bg-white/50 dark:bg-gray-800/50">
                    <Edit2 size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(account)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shadow-sm bg-white/50 dark:bg-gray-800/50">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 flex-1 space-y-4">
                {(() => {
                  // Collect all non-empty site/note pairs
                  const items = [...Array(37)].map((_, i) => {
                    const idx = (i + 1).toString().padStart(2, '0');
                    const siteKey = `site${idx}` as keyof CommonAccount;
                    const noteKey = `note${idx}` as keyof CommonAccount;
                    const siteName = account[siteKey] as string;
                    const note = account[noteKey] as string;
                    if (!siteName && !note) return null;
                    return { idx, siteName, note };
                  }).filter(Boolean) as { idx: string; siteName: string; note: string }[];

                  const isExpanded = expandedAccounts[account.$id];
                  
                  // 篩選時且未展開時，將符合篩選條件的項目移到第一位
                  let displayItems = [...items];
                  if (!isExpanded && siteFilter) {
                    const matchIdx = displayItems.findIndex(item => item.siteName === siteFilter);
                    if (matchIdx > -1) {
                      const [matchItem] = displayItems.splice(matchIdx, 1);
                      displayItems.unshift(matchItem);
                    }
                  }

                  const visibleItems = isExpanded ? items : displayItems.slice(0, 3);
                  const hasMore = items.length > 3;

                  return (
                    <>
                      {visibleItems.map(({ idx, siteName, note }) => {
                        const siteUrl = siteName ? SITE_URL_MAP[siteName] : undefined;
                        const isInlineEditing = inlineEdit?.accountId === account.$id && inlineEdit?.idx === idx;
                        
                        return (
                          <div key={idx} className="group/item relative bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                            {isInlineEditing ? (
                              // Inline Edit Mode
                              <div className="space-y-3">
                                <div className="flex gap-2 items-center">
                            <div className="flex-1 flex gap-2">
                              <Input
                                placeholder={`網站名稱/${idx}`}
                                value={inlineEdit.siteName}
                                onChange={(e) => setInlineEdit({ ...inlineEdit, siteName: e.target.value })}
                                className="rounded-lg flex-1 h-9 text-sm"
                                autoFocus
                                maxLength={100}
                              />
                              <Select
                                value=""
                                onValueChange={(val) => setInlineEdit({ ...inlineEdit, siteName: val })}
                              >
                                <SelectTrigger className="h-9 w-9 rounded-lg px-0 justify-center shrink-0">
                                  <ChevronDown className="h-4 w-4" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COMMON_SITES.map(site => (
                                    <SelectItem key={site} value={site}>{site}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                                </div>
                                <Textarea
                                  placeholder={`備註內容 (上限100個字)`}
                                  value={inlineEdit.note}
                                  onChange={(e) => setInlineEdit({ ...inlineEdit, note: e.target.value })}
                                  className="rounded-lg text-sm min-h-[120px] resize-y"
                                  rows={5}
                                  maxLength={100}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelInlineEdit}
                                    className="h-8 px-3 text-gray-500 hover:text-gray-700"
                                  >
                                    <X size={14} className="mr-1" />
                                    取消
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={saveInlineEdit}
                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Save size={14} className="mr-1" />
                                    儲存
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display Mode
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                {siteName && (
                                  siteUrl ? (
                                    <a
                                      href={siteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors shrink-0"
                                      title={siteUrl}
                                    >
                                      <FaviconImage siteUrl={siteUrl} siteName={siteName} size={18} />
                                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{siteName}</span>
                                      <Play size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                                    </a>
                                  ) : (
                                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                                      <LinkIcon size={16} className="text-gray-400" />
                                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{siteName}</span>
                                    </span>
                                  )
                                )}
                                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                  {note && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words line-clamp-2 sm:line-clamp-none">
                                      {note}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {note && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleCopyNote(note)}
                                        className="h-7 w-7 p-0 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                        title="複製備註"
                                      >
                                        <Copy size={14} />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startInlineEdit(account.$id, idx, siteName || '', note || '')}
                                      className="h-7 w-7 p-0 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                      title="編輯此項目"
                                    >
                                      <Edit2 size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {hasMore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAccountExpand(account.$id)}
                          className="w-full h-10 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl flex items-center justify-center gap-2"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} />
                              收起 (共{items.length}項)
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              查看更多 (共{items.length}項)
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </DataCard>
          ))}
        </div>
      )}
    </div>
  );
}
