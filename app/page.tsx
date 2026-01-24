"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FoodManagement from "@/components/modules/FoodManagement";
import SubscriptionManagement from "@/components/modules/SubscriptionManagement";
import EnhancedDashboard from "@/components/modules/EnhancedDashboard";
import VideoIntroduction from "@/components/modules/VideoIntroduction";
import ImageGallery from "@/components/modules/ImageGallery";
import AboutUs from "@/components/modules/AboutUs";
import MusicLyrics from "@/components/modules/MusicLyrics";
import { Package, CreditCard, Home, BarChart3, Info, Play, Music } from "lucide-react";
import { MenuItem } from "@/types";
import { Input, DataCard, StatCard } from "@/components/ui";
import { FaviconImage } from "@/components/ui/favicon-image";

// 選單項目配置
const MENU_ITEMS: MenuItem[] = [
  { id: "home", label: "首頁", icon: <Home size={18} /> },
  { id: "dashboard", label: "儀表板", icon: <BarChart3 size={18} /> },
  { id: "subscription", label: "訂閱管理", icon: <CreditCard size={18} /> },
  { id: "food", label: "食品管理", icon: <Package size={18} /> },
  { id: "videos", label: "影片介紹", icon: <Play size={18} /> },
  { id: "music", label: "鋒兄音樂歌詞", icon: <Music size={18} /> },
  { id: "bank-stats", label: "銀行統計", icon: <BarChart3 size={18} /> },
  { id: "about", label: "關於我們", icon: <Info size={18} /> },
];

export default function DashboardPage() {
  const [currentModule, setCurrentModule] = useState("home");

  const handleModuleChange = useCallback((moduleId: string) => {
    setCurrentModule(moduleId);
  }, []);

  // 渲染當前模組內容
  const currentContent = useMemo(() => {
    switch (currentModule) {
      case "home":
        return <ImageGallery />;
      case "dashboard":
        return <EnhancedDashboard onNavigate={handleModuleChange} />;
      case "subscription":
        return <SubscriptionManagement />;
      case "food":
        return <FoodManagement />;
      case "videos":
        return <VideoIntroduction />;
      case "music":
        return <MusicLyrics />;
      case "bank-stats":
        return <BankStatistics />;
      case "about":
        return <AboutUs />;
      default:
        return <NotFoundModule />;
    }
  }, [currentModule, handleModuleChange]);

  return (
    <DashboardLayout
      currentModule={currentModule}
      onModuleChange={handleModuleChange}
      menuItems={MENU_ITEMS}
    >
      {currentContent}
    </DashboardLayout>
  );
}

// 銀行統計模組
function BankStatistics() {
  const INITIAL_BANKS = [
    { id: "fubon", name: "台北富邦", siteUrl: "https://www.fubon.com/bank/home", value: 423 },
    { id: "cathay", name: "國泰世華", siteUrl: "https://www.cathaybk.com.tw/", value: 213 },
    { id: "mega", name: "兆豐銀行", siteUrl: "https://www.megabank.com.tw/", value: 452 },
    { id: "obank", name: "王道銀行", siteUrl: "https://www.o-bank.com/", value: 500 },
    { id: "skbank", name: "新光銀行", siteUrl: "https://www.skbank.com.tw/", value: 200 },
    { id: "post", name: "中華郵政", siteUrl: "https://www.post.gov.tw/", value: 601 },
    { id: "esun", name: "玉山銀行", siteUrl: "https://www.esunbank.com.tw/", value: 496 },
    { id: "ctbc", name: "中國信託", siteUrl: "https://www.ctbcbank.com/", value: 696 },
    { id: "taishin", name: "台新銀行", siteUrl: "https://www.taishinbank.com.tw/", value: 611 },
  ];

  const [banks, setBanks] = useState(INITIAL_BANKS);
  // 新增 Appwrite ID 映射
  const [bankMap, setBankMap] = useState<Record<string, string>>({}); // bankId -> $id
  const [isLoading, setIsLoading] = useState(false);
  
  // 載入銀行數據
  useEffect(() => {
    async function loadBanks() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/bank');
        if (!res.ok) throw new Error('Failed to fetch banks');
        const data = await res.json();
        
        if (data.length > 0) {
          // 如果有數據，更新狀態
          const newMap: Record<string, string> = {};
          const newBanks = INITIAL_BANKS.map(initialBank => {
            // 使用 name 來比對，因為 bankId 不再存儲於後端
            const found = data.find((d: any) => d.name === initialBank.name);
            if (found) {
              newMap[initialBank.id] = found.$id;
              // 映射: deposit -> value
              return { ...initialBank, value: found.deposit || 0 };
            }
            return initialBank;
          });
          
          setBankMap(newMap);
          setBanks(newBanks);
        } else {
          // 如果沒有數據，執行初始化
          console.log('Initializing bank data...');
          const newMap: Record<string, string> = {};
          
          for (const bank of INITIAL_BANKS) {
            try {
              const createRes = await fetch('/api/bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: bank.name,
                  deposit: bank.value, // 映射: value -> deposit
                  site: bank.siteUrl,  // 映射: siteUrl -> site
                  // 其他新欄位設為 null
                  address: null,
                  withdrawals: 0,
                  transfer: 0,
                  activity: null,
                  card: null,
                  account: null
                })
              });
              if (createRes.ok) {
                const created = await createRes.json();
                newMap[bank.id] = created.$id;
              }
            } catch (err) {
              console.error(`Failed to initialize bank ${bank.name}`, err);
            }
          }
          setBankMap(newMap);
        }
      } catch (err) {
        console.error('Error loading banks:', err);
        // Fallback to localStorage logic if API fails? 
        // 暫時保留 localStorage 讀取作為備案，或者直接提示錯誤。
        // 為了相容性，如果 API 失敗，嘗試讀取 localStorage
        try {
          const raw = localStorage.getItem("bank_statistics_values");
          if (raw) {
            const saved = JSON.parse(raw);
            if (Array.isArray(saved)) {
              setBanks((prev) =>
                prev.map((b) => {
                  const found = saved.find((s: any) => s.id === b.id);
                  return found ? { ...b, value: Number(found.value) || 0 } : b;
                })
              );
            }
          }
        } catch {}
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBanks();
  }, []);

  // 移除 localStorage 的 useEffect
  // useEffect(() => {
  //   try {
  //     const payload = banks.map((b) => ({ id: b.id, value: b.value }));
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  //   } catch {}
  // }, [banks]);

  const total = useMemo(() => {
    return banks.reduce((sum, b) => sum + (Number(b.value) || 0), 0);
  }, [banks]);

  const handleChange = useCallback((id: string, newValue: string) => {
    setBanks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, value: Number(newValue) || 0 } : b))
    );
  }, []);

  const handleBlur = useCallback(async (id: string, value: number) => {
    const documentId = bankMap[id];
    if (!documentId) return; // 如果還沒有對應的 document ID，無法更新

    try {
      await fetch(`/api/bank/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit: value }) // 映射: value -> deposit
      });
    } catch (err) {
      console.error('Failed to update bank value', err);
    }
  }, [bankMap]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        銀行統計
        {isLoading && <span className="text-sm font-normal text-gray-500">(同步中...)</span>}
      </h1>

      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="合計" value={total} gradient="from-purple-500 to-purple-600" />
        <StatCard title="銀行數" value={banks.length} gradient="from-blue-500 to-blue-600" />
        <StatCard title="可編輯" value="是" gradient="from-green-500 to-green-600" />
      </div>

      <DataCard className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {banks.map((bank) => (
            <div key={bank.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <FaviconImage siteUrl={bank.siteUrl} siteName={bank.name} size={20} />
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{bank.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={bank.value}
                  onChange={(e) => handleChange(bank.id, e.target.value)}
                  onBlur={(e) => handleBlur(bank.id, Number(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
}

// 404 模組
function NotFoundModule() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">頁面未找到</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">請選擇有效的功能模組</p>
      </div>
    </div>
  );
}
