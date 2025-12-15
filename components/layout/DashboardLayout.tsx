"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  menuItems: MenuItem[];
}

export default function DashboardLayout({
  children,
  currentModule,
  onModuleChange,
  menuItems,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = currentModule === item.id;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            isActive
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onModuleChange(item.id);
              // 手機版選擇後關閉選單
              if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }
          }}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <div className="text-gray-400">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 手機版頂部導航欄 */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">管理系統</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* 側邊欄 - 桌面版 */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">管理系統</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </aside>

        {/* 手機版側邊欄覆蓋層 */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar} />
            <aside className="relative w-64 bg-white shadow-xl">
              <nav className="p-4 space-y-2 h-full overflow-y-auto">
                {menuItems.map(item => renderMenuItem(item))}
              </nav>
            </aside>
          </div>
        )}

        {/* 主要內容區域 */}
        <main className="flex-1 min-h-screen">
          {/* 平板橫向和桌面版 */}
          <div className="hidden md:block h-full">
            <div className="p-6 h-full overflow-auto">
              {children}
            </div>
          </div>

          {/* 手機版和平板直向 */}
          <div className="md:hidden">
            {/* 手機版選單區域 */}
            {isSidebarOpen && (
              <div className="bg-white border-b border-gray-200 p-4">
                <nav className="space-y-2">
                  {menuItems.map(item => renderMenuItem(item))}
                </nav>
              </div>
            )}
            
            {/* 內容區域 */}
            <div className="p-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}