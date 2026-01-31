"use client";

import { useState } from "react";
import { Settings, Moon, Sun, Bell, Shield, Database, Palette } from "lucide-react";
import { Button, DataCard, SectionHeader } from "@/components/ui";
import { useTheme } from "@/components/providers/theme-provider";

export default function SettingsManagement() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4 lg:space-y-6">
      <SectionHeader 
        title="設定" 
        subtitle="應用程式設定與偏好"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <span className="text-gray-500">狀態</span>
              <span className="text-green-600 font-medium">已連線</span>
            </div>
          </div>
        </DataCard>

        {/* 通知設定 */}
        <DataCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Bell size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-bold text-lg">通知</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            管理通知偏好設定
          </p>
          <div className="text-sm text-gray-400">
            即將推出...
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
