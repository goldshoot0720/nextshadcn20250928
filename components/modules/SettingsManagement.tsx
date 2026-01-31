"use client";

import { useState, useEffect } from "react";
import { Settings, Moon, Sun, Bell, Shield, Database, Palette, Table2, Loader2, Plus, X, CheckCircle2 } from "lucide-react";
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

interface CreateProgress {
  tableName: string;
  totalColumns: number;
  currentColumn: number;
  percent: number;
  currentAttribute: string;
  message: string;
  isComplete: boolean;
  isError: boolean;
  collectionId?: string;
}

export default function SettingsManagement() {
  const { theme, setTheme } = useTheme();
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [progress, setProgress] = useState<CreateProgress | null>(null);

  const fetchStats = () => {
    fetch("/api/database-stats", { cache: "no-store" })
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
    setCreating(tableName);
    setProgress({
      tableName,
      totalColumns: 0,
      currentColumn: 0,
      percent: 0,
      currentAttribute: '',
      message: '正在連線...',
      isComplete: false,
      isError: false
    });

    try {
      const eventSource = new EventSource(`/api/create-table?table=${tableName}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'start':
            setProgress(prev => prev ? {
              ...prev,
              totalColumns: data.totalColumns,
              message: `開始建立 ${data.tableName} (${data.totalColumns} 欄位)`
            } : null);
            break;
          case 'progress':
            if (data.step === 'attribute') {
              setProgress(prev => prev ? {
                ...prev,
                currentColumn: data.current,
                percent: data.percent,
                currentAttribute: data.attribute,
                message: data.message
              } : null);
            } else {
              setProgress(prev => prev ? {
                ...prev,
                message: data.message,
                collectionId: data.collectionId
              } : null);
            }
            break;
          case 'complete':
            setProgress(prev => prev ? {
              ...prev,
              percent: 100,
              isComplete: true,
              message: data.message,
              collectionId: data.collectionId
            } : null);
            eventSource.close();
            fetchStats();
            break;
          case 'error':
            setProgress(prev => prev ? {
              ...prev,
              isError: true,
              message: `錯誤: ${data.message}`
            } : null);
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = () => {
        setProgress(prev => prev ? {
          ...prev,
          isError: true,
          message: '連線失敗'
        } : null);
        eventSource.close();
      };

    } catch (err) {
      setProgress(prev => prev ? {
        ...prev,
        isError: true,
        message: `錯誤: ${err}`
      } : null);
    }
  };

  const closeProgressDialog = () => {
    setProgress(null);
    setCreating(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader
        title="鋒兄設定"
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

      {/* 建立進度對話框 */}
      {progress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {progress.isComplete ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : progress.isError ? (
                  <X size={20} className="text-red-500" />
                ) : (
                  <Loader2 size={20} className="text-blue-500 animate-spin" />
                )}
                建立 {progress.tableName} Table
              </h3>
              {(progress.isComplete || progress.isError) && (
                <Button variant="ghost" size="sm" onClick={closeProgressDialog}>
                  <X size={18} />
                </Button>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">進度</span>
                  <span className="font-mono font-bold text-blue-600">{progress.percent}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      progress.isError ? 'bg-red-500' : progress.isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
              
              {/* Current Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">{progress.message}</p>
                {progress.currentAttribute && !progress.isComplete && (
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    欄位: {progress.currentAttribute}
                  </p>
                )}
                {progress.collectionId && (
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    ID: {progress.collectionId}
                  </p>
                )}
              </div>

              {/* Column Counter */}
              {progress.totalColumns > 0 && (
                <div className="flex justify-center">
                  <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {progress.currentColumn}
                  </span>
                  <span className="text-lg text-gray-400 self-end mb-1">
                    /{progress.totalColumns} 欄位
                  </span>
                </div>
              )}

              {/* Close Button */}
              {(progress.isComplete || progress.isError) && (
                <Button 
                  className="w-full" 
                  onClick={closeProgressDialog}
                  variant={progress.isError ? "destructive" : "default"}
                >
                  {progress.isError ? '關閉' : '完成'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
