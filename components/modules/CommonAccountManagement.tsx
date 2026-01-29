"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Star, Link as LinkIcon, FileText as NoteIcon, Plus, Play, Trash2, Edit2, X, Save, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { MenuItem, CommonAccountSite, CommonAccountNote, CommonAccountSiteFormData, CommonAccountNoteFormData } from "@/types";
import { Input, Textarea, DataCard, StatCard, Button, Tabs, TabsList, TabsTrigger, TabsContent, SectionHeader, FormCard, FormGrid, FormActions } from "@/components/ui";
import { FaviconImage } from "@/components/ui/favicon-image";
import { useCrud } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/lib/constants";
import { FullPageLoading } from "@/components/ui/loading-spinner";

interface CombinedAccount {
  name: string;
  site?: CommonAccountSite;
  note?: CommonAccountNote;
}

// Known site names mapped to their URLs
const SITE_URL_MAP: Record<string, string> = {
  "Musicful": "https://tw.musicful.ai/",
  "MindVideo": "https://www.mindvideo.ai/",
};

const INITIAL_SITE_FORM: CommonAccountSiteFormData = {
  name: "",
  ...Object.fromEntries([...Array(15)].map((_, i) => [`site${(i + 1).toString().padStart(2, '0')}`, ""]))
} as any;

const INITIAL_NOTE_FORM: CommonAccountNoteFormData = {
  name: "",
  ...Object.fromEntries([...Array(15)].map((_, i) => [`note${(i + 1).toString().padStart(2, '0')}`, ""]))
} as any;

export default function CommonAccountManagement() {
  const { items: sites, loading: loadingSites, fetchAll: fetchSites, create: createSite, update: updateSite, remove: removeSite } = useCrud<CommonAccountSite>(API_ENDPOINTS.COMMON_ACCOUNT_SITE);
  const { items: notes, loading: loadingNotes, fetchAll: fetchNotes, create: createNote, update: updateNote, remove: removeNote } = useCrud<CommonAccountNote>(API_ENDPOINTS.COMMON_ACCOUNT_NOTE);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState<CommonAccountSiteFormData>(INITIAL_SITE_FORM);
  const [noteForm, setNoteForm] = useState<CommonAccountNoteFormData>(INITIAL_NOTE_FORM);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  // Inline edit state: { accountName, idx, siteName, note }
  const [inlineEdit, setInlineEdit] = useState<{ accountName: string; idx: string; siteName: string; note: string } | null>(null);
  // Site filter state
  const [siteFilter, setSiteFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
    fetchNotes();
  }, [fetchSites, fetchNotes]);

  const combinedAccounts = useMemo(() => {
    const accountMap = new Map<string, { site?: CommonAccountSite; note?: CommonAccountNote }>();
    sites.forEach(site => accountMap.set(site.name, { ...accountMap.get(site.name), site }));
    notes.forEach(note => accountMap.set(note.name, { ...accountMap.get(note.name), note }));
    return Array.from(accountMap.entries()).map(([name, data]) => ({ name, ...data }));
  }, [sites, notes]);

  // Collect all unique site names from all accounts
  const allSiteNames = useMemo(() => {
    const siteSet = new Set<string>();
    combinedAccounts.forEach(account => {
      if (account.site) {
        [...Array(15)].forEach((_, i) => {
          const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccountSite;
          const siteName = account.site?.[siteKey] as string;
          if (siteName) siteSet.add(siteName.trim());
        });
      }
    });
    // Sort: Qoder first, then alphabetically
    return Array.from(siteSet).sort((a, b) => {
      if (a === 'Qoder') return -1;
      if (b === 'Qoder') return 1;
      return a.localeCompare(b);
    });
  }, [combinedAccounts]);

  // Filter accounts based on selected site filter
  const filteredAccounts = useMemo(() => {
    if (!siteFilter) return combinedAccounts;
    return combinedAccounts.filter(account => {
      if (!account.site) return false;
      return [...Array(15)].some((_, i) => {
        const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccountSite;
        const siteName = account.site?.[siteKey] as string;
        return siteName?.trim() === siteFilter.trim();
      });
    });
  }, [combinedAccounts, siteFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.name) return;

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

    const isUpdate = !!editingName;
    const sitePayload = getPayload(siteForm, isUpdate);
    const notePayload = getPayload({ ...noteForm, name: siteForm.name }, isUpdate);

    try {
      if (editingName) {
        const existingAccount = combinedAccounts.find(a => a.name === editingName);
        
        // Update Site
        if (existingAccount?.site) {
          await updateSite(existingAccount.site.$id, sitePayload);
        } else {
          await createSite(sitePayload);
        }

        // Update Note
        if (existingAccount?.note) {
          await updateNote(existingAccount.note.$id, notePayload);
        } else {
          await createNote(notePayload);
        }
      } else {
        // Create New
        await createSite(sitePayload);
        await createNote(notePayload);
      }
      resetForm();
      fetchSites();
      fetchNotes();
    } catch (err) {
      console.error("Save failed:", err);
      alert("儲存失敗");
    }
  };

  const handleEdit = (account: CombinedAccount) => {
    const siteData = { ...INITIAL_SITE_FORM, name: account.name };
    if (account.site) {
      Object.keys(siteData).forEach(key => {
        if (key in account.site!) siteData[key as keyof CommonAccountSiteFormData] = (account.site as any)[key];
      });
    }

    const noteData = { ...INITIAL_NOTE_FORM, name: account.name };
    if (account.note) {
      Object.keys(noteData).forEach(key => {
        if (key in account.note!) noteData[key as keyof CommonAccountNoteFormData] = (account.note as any)[key];
      });
    }

    setSiteForm(siteData as any);
    setNoteForm(noteData as any);
    setEditingName(account.name);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (account: CombinedAccount) => {
    if (!confirm(`確定要刪除「${account.name}」的所有站點與筆記嗎？`)) return;

    try {
      if (account.site) await removeSite(account.site.$id);
      if (account.note) await removeNote(account.note.$id);
      fetchSites();
      fetchNotes();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("刪除失敗");
    }
  };

  const resetForm = () => {
    setSiteForm(INITIAL_SITE_FORM);
    setNoteForm(INITIAL_NOTE_FORM);
    setExpandedNotes({});
    setEditingName(null);
    setIsFormOpen(false);
  };

  const toggleNote = (idx: string) => {
    setExpandedNotes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAccountExpand = (accountName: string) => {
    setExpandedAccounts(prev => ({ ...prev, [accountName]: !prev[accountName] }));
  };

  // Start inline editing for a single item
  const startInlineEdit = (accountName: string, idx: string, siteName: string, note: string) => {
    setInlineEdit({ accountName, idx, siteName, note });
  };

  // Cancel inline edit
  const cancelInlineEdit = () => {
    setInlineEdit(null);
  };

  // Save inline edit
  const saveInlineEdit = async () => {
    if (!inlineEdit) return;
    
    const account = combinedAccounts.find(a => a.name === inlineEdit.accountName);
    if (!account) return;

    const siteKey = `site${inlineEdit.idx}`;
    const noteKey = `note${inlineEdit.idx}`;

    try {
      // Update site
      if (account.site) {
        const sitePayload = { [siteKey]: inlineEdit.siteName };
        await updateSite(account.site.$id, sitePayload);
      }
      // Update note
      if (account.note) {
        const notePayload = { [noteKey]: inlineEdit.note };
        await updateNote(account.note.$id, notePayload);
      }
      setInlineEdit(null);
      fetchSites();
      fetchNotes();
    } catch (err) {
      console.error("Inline save failed:", err);
      alert("儲存失敗");
    }
  };

  const isLoading = loadingSites || loadingNotes;

  if (isLoading && combinedAccounts.length === 0) return <FullPageLoading text="載入常用帳號中..." />;

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader 
        title="鋒兄常用" 
        subtitle={`共 ${combinedAccounts.length} 組帳號設定`}
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
        <FormCard title={editingName ? `編輯帳號: ${editingName}` : "新增帳號組合"} accentColor="from-blue-500 to-blue-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">帳號名稱</label>
              <Input
                placeholder="輸入帳號名稱 (例如: example@example.com)"
                value={siteForm.name}
                onChange={(e) => {
                  setSiteForm({ ...siteForm, name: e.target.value });
                  setNoteForm({ ...noteForm, name: e.target.value });
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
                <LinkIcon size={18} /> 常用網站與備註 (最多 15 個)
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {[...Array(15)].map((_, i) => {
                  const idx = (i + 1).toString().padStart(2, '0');
                  const siteKey = `site${idx}` as keyof CommonAccountSiteFormData;
                  const noteKey = `note${idx}` as keyof CommonAccountNoteFormData;
                  const isExpanded = expandedNotes[idx];

                  return (
                    <div key={idx} className="space-y-2 pb-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <div className="flex gap-2 items-center">
                        <span className="w-8 h-10 flex items-center justify-center text-xs text-gray-400 font-mono shrink-0">{idx}</span>
                        <Input
                          placeholder={`網站名稱/URL ${idx}`}
                          value={(siteForm as any)[siteKey] || ""}
                          onChange={(e) => setSiteForm({ ...siteForm, [siteKey]: e.target.value } as any)}
                          className="rounded-xl flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNote(idx)}
                          className={`shrink-0 rounded-xl h-10 w-10 ${isExpanded ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                          title="顯示/隱藏備註"
                        >
                          <NoteIcon size={18} />
                        </Button>
                      </div>
                      {isExpanded && (
                        <div className="pl-10 pr-2 pb-2">
                          <Textarea
                            placeholder={`備註內容 ${idx} (例如: Musicful，將作為網站標題)`}
                            value={(noteForm as any)[noteKey] || ""}
                            onChange={(e) => setNoteForm({ ...noteForm, [noteKey]: e.target.value } as any)}
                            className="rounded-xl border-purple-100 dark:border-purple-900/30 min-h-[80px] resize-y py-2 text-sm shadow-inner"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </FormCard>
      )}

      {/* Site Filter */}
      {allSiteNames.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter size={14} />
            篩選:
          </span>
          <Button
            size="sm"
            variant={siteFilter === null ? "default" : "outline"}
            onClick={() => setSiteFilter(null)}
            className={`h-8 px-3 rounded-lg text-sm ${siteFilter === null ? 'bg-blue-600 text-white' : ''}`}
          >
            全部 ({combinedAccounts.length})
          </Button>
          {allSiteNames.map(siteName => {
            const count = combinedAccounts.filter(account => {
              if (!account.site) return false;
              return [...Array(15)].some((_, i) => {
                const siteKey = `site${(i + 1).toString().padStart(2, '0')}` as keyof CommonAccountSite;
                const name = account.site?.[siteKey] as string;
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
                className={`h-8 px-3 rounded-lg text-sm flex items-center gap-1.5 ${siteFilter === siteName ? 'bg-blue-600 text-white' : ''}`}
              >
                {siteUrl && <FaviconImage siteUrl={siteUrl} siteName={siteName} size={14} />}
                {siteName} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {filteredAccounts.length === 0 ? (
        <DataCard className="p-12 text-center">
          <Star size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {siteFilter 
              ? `沒有帳號包含「${siteFilter}」` 
              : "尚無常用帳號資料，請點擊右上方「新增」按鈕"
            }
          </p>
        </DataCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAccounts.map((account) => (
            <DataCard key={account.name} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500 overflow-hidden group">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <NoteIcon size={20} className="text-blue-500 shrink-0" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {account.name}
                  </h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(account)} className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Edit2 size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(account)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 flex-1 space-y-4">
                {(() => {
                  // Collect all non-empty site/note pairs
                  const items = [...Array(15)].map((_, i) => {
                    const idx = (i + 1).toString().padStart(2, '0');
                    const siteKey = `site${idx}` as keyof CommonAccountSite;
                    const noteKey = `note${idx}` as keyof CommonAccountNote;
                    const siteName = account.site?.[siteKey] as string;
                    const note = account.note?.[noteKey] as string;
                    if (!siteName && !note) return null;
                    return { idx, siteName, note };
                  }).filter(Boolean) as { idx: string; siteName: string; note: string }[];

                  const isExpanded = expandedAccounts[account.name];
                  
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
                        const isInlineEditing = inlineEdit?.accountName === account.name && inlineEdit?.idx === idx;
                        
                        return (
                          <div key={idx} className="group/item relative bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                            {isInlineEditing ? (
                              // Inline Edit Mode
                              <div className="space-y-3">
                                <div className="flex gap-2 items-center">
                                  <Input
                                    placeholder="網站名稱"
                                    value={inlineEdit.siteName}
                                    onChange={(e) => setInlineEdit({ ...inlineEdit, siteName: e.target.value })}
                                    className="rounded-lg flex-1 h-9 text-sm"
                                    autoFocus
                                  />
                                </div>
                                <Textarea
                                  placeholder={`備註內容${idx}`}
                                  value={inlineEdit.note}
                                  onChange={(e) => setInlineEdit({ ...inlineEdit, note: e.target.value })}
                                  className="rounded-lg text-sm min-h-[120px] resize-y"
                                  rows={5}
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
                              <div className="flex items-center gap-4">
                                {siteName && (
                                  siteUrl ? (
                                    <a
                                      href={siteUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                      title={siteUrl}
                                    >
                                      <FaviconImage siteUrl={siteUrl} siteName={siteName} size={18} />
                                      <span>{siteName}</span>
                                      <Play size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                      <LinkIcon size={16} className="text-gray-400" />
                                      {siteName}
                                    </span>
                                  )
                                )}
                                {note && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap flex-1">
                                    {note}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startInlineEdit(account.name, idx, siteName || '', note || '')}
                                  className="h-7 w-7 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg shrink-0"
                                  title="編輯此項目"
                                >
                                  <Edit2 size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {hasMore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAccountExpand(account.name)}
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
