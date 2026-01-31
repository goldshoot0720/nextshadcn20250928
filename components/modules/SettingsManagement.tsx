"use client";

import { useState, useEffect } from "react";
import { Settings, Moon, Sun, Bell, Shield, Database, Palette, Table2, Loader2, Plus } from "lucide-react";
import { Button, DataCard, SectionHeader } from "@/components/ui";
import { useTheme } from "@/components/providers/theme-provider";

interface CollectionStats {
  name: string;
  columnCount: number;
  documentCount: number;
  error?: boolean;
}

interface DatabaseStats {
  totalColumns: number;
  totalCollections: number;
  collections: CollectionStats[];
  databaseId: string;
}

export default function SettingsManagement() {
  const { theme, setTheme } = useTheme();
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  const fetchStats = () => {
    fetch("/api/database-stats")
      .then(res => res.json())
      .then(data => {
        setDbStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch database stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateTable = async (tableName: string) => {
    if (tableName !== "commonaccount") {
      alert(`請在 Appwrite Console 手動建立 ${tableName} Table`);
      return;
    }
    setCreating(tableName);
    try {
      const res = await fetch("/api/create-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${tableName} Table 建立成功!`);
        fetchStats();
      } else {
        alert(`建立失敗: ${data.error}`);
      }
    } catch (err) {
      alert(`建立失敗: ${err}`);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader 
        title="設定" 
        subtitle="應用程式設定與偏好"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 資料庫欄位統計 - 第一欄位 */}
        <DataCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Table2 size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">資料庫欄位統計</h3>
              <p className="text-xs text-gray-400">單一 Table text 上限 15000</p>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : dbStats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <span className="text-gray-600 dark:text-gray-300">總欄位數</span>
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{dbStats.totalColumns}</span>
              </div>
              <div className="space-y-2 text-sm">
                {dbStats.collections.map(col => {
                  // 綠燈: 有資料, 黃燈: 無資料, 紅燈: Table不存在
                  const statusColor = col.error 
                    ? "bg-red-500" 
                    : col.documentCount > 0 
                      ? "bg-green-500" 
                      : "bg-yellow-500";
                  const statusTitle = col.error 
                    ? "Table 不存在" 
                    : col.documentCount > 0 
                      ? "Table 存在且有資料" 
                      : "Table 存在但無資料";
                  return (
                    <div key={col.name} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`w-2.5 h-2.5 rounded-full ${statusColor}`} 
                          title={statusTitle}
                        />
                        <span className="font-mono text-gray-600 dark:text-gray-400">{col.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{col.columnCount} 欄位</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{col.documentCount} 筆</span>
                        {col.error && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleCreateTable(col.name)}
                            disabled={creating === col.name}
                          >
                            {creating === col.name ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <><Plus size={12} /> 建立</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">無法取得資料</div>
          )}
        </DataCard>

        {/* 資料庫資訊 */}
        <DataCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Database size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">資料庫</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Appwrite 雲端資料庫連線資訊
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">端點</span>
              <span className="font-mono text-xs">fra.cloud.appwrite.io</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collections</span>
              <span className="font-medium">{dbStats?.totalCollections || 5}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">狀態</span>
              <span className="text-green-600 font-medium">已連線</span>
            </div>
          </div>
        </DataCard>

        {/* 主題設定 */}
        <DataCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Palette size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-lg">主題設定</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            選擇您喜歡的介面主題
          </p>
          <div className="flex gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex items-center gap-2"
            >
              <Sun size={16} />
              淺色
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex items-center gap-2"
            >
              <Moon size={16} />
              深色
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              系統
            </Button>
          </div>
        </DataCard>

        {/* 安全設定 */}
        <DataCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Shield size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg">安全性</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            帳號安全與隱私設定
          </p>
          <div className="text-sm text-gray-400">
            即將推出...
          </div>
        </DataCard>
      </div>

      {/* 版本資訊 */}
      <DataCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">應用程式版本</h3>
            <p className="text-sm text-gray-500">鋒兄管理系統 v1.0.0</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            <p>Next.js 16.0</p>
            <p>React 19</p>
          </div>
        </div>
      </DataCard>
    </div>
  );
}
