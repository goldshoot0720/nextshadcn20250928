"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import EnhancedScrollNavigation from "@/components/ui/enhanced-scroll-navigation";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";

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
  const [isMobile, setIsMobile] = useState(false);

  // 檢測螢幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 touch-manipulation ${
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-gray-700 dark:text-gray-200'
          } ${isMobile ? 'min-h-[48px]' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onModuleChange(item.id);
              if (isMobile) {
                setIsSidebarOpen(false);
              }
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {item.icon}
            </div>
            <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
              {item.label}
            </span>
          </div>
          {hasChildren && (
            <div className={`${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* 手機版頂部導航欄 */}
      <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">管理系統</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleCompact />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 側邊欄 - 桌面版 */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 min-h-screen shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">管理系統</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">鋒兄AI管理系統</p>
                </div>
              </div>
              <ThemeToggleCompact />
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </aside>

        {/* 手機版和平板版側邊欄覆蓋層 */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={toggleSidebar} 
            />
            <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">管理系統</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">鋒兄AI管理系統</p>
                    </div>
                  </div>
                  <ThemeToggleCompact />
                </div>
              </div>
              <nav className="p-4 space-y-2 h-full overflow-y-auto pb-20">
                {menuItems.map(item => renderMenuItem(item))}
              </nav>
            </aside>
          </div>
        )}

        {/* 主要內容區域 */}
        <main className="flex-1 min-h-screen">
          <div className="h-full">
            <div className="p-4 lg:p-8 h-full overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 全局滾動導航 */}
      <EnhancedScrollNavigation 
        showThreshold={200}
        showProgress={true}
        quickNavItems={[]}
      />
    </div>
  );
}