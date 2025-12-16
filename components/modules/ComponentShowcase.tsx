"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Package, 
  Users, 
  Settings, 
  Star, 
  Heart, 
  MessageCircle,
  Calendar,
  Clock,
  MapPin
} from "lucide-react";

export default function ComponentShowcase() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            shadcn/ui 組件展示
          </h1>
          <p className="text-gray-500 dark:text-gray-300 mt-1">
            展示整合的 shadcn/ui 組件庫功能
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Badge variant="secondary">v2.0.0</Badge>
        </div>
      </div>

      {/* Tabs 展示 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="components">組件</TabsTrigger>
          <TabsTrigger value="forms">表單</TabsTrigger>
          <TabsTrigger value="data">數據</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ComponentsTab />
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <FormsTab />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 概覽標籤頁
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,350</div>
          <p className="text-xs text-muted-foreground">
            +20.1% 比上個月
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">活躍項目</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">145</div>
          <p className="text-xs text-muted-foreground">
            +12% 比上週
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">系統狀態</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default">正常運行</Badge>
            <span className="text-sm text-muted-foreground">99.9%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 組件標籤頁
function ComponentsTab() {
  return (
    <div className="space-y-6">
      {/* 按鈕展示 */}
      <Card>
        <CardHeader>
          <CardTitle>按鈕組件</CardTitle>
          <CardDescription>不同樣式和大小的按鈕展示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>預設按鈕</Button>
            <Button variant="secondary">次要按鈕</Button>
            <Button variant="outline">輪廓按鈕</Button>
            <Button variant="ghost">幽靈按鈕</Button>
            <Button variant="destructive">危險按鈕</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">小按鈕</Button>
            <Button size="default">預設大小</Button>
            <Button size="lg">大按鈕</Button>
          </div>
        </CardContent>
      </Card>

      {/* 徽章展示 */}
      <Card>
        <CardHeader>
          <CardTitle>徽章組件</CardTitle>
          <CardDescription>用於狀態標示和標籤的徽章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>預設</Badge>
            <Badge variant="secondary">次要</Badge>
            <Badge variant="outline">輪廓</Badge>
            <Badge variant="destructive">危險</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 頭像展示 */}
      <Card>
        <CardHeader>
          <CardTitle>頭像組件</CardTitle>
          <CardDescription>用戶頭像和佔位符展示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>鋒</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>塗</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 表單標籤頁
function FormsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>表單組件</CardTitle>
          <CardDescription>輸入框、選擇器和對話框展示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <Input placeholder="請輸入您的姓名" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">職位</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選擇職位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">開發者</SelectItem>
                  <SelectItem value="designer">設計師</SelectItem>
                  <SelectItem value="manager">管理者</SelectItem>
                  <SelectItem value="analyst">分析師</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">開啟對話框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>確認操作</DialogTitle>
                  <DialogDescription>
                    這是一個示例對話框，用於確認用戶操作。
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">取消</Button>
                  <Button>確認</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 數據標籤頁
function DataTab() {
  const activities = [
    {
      id: 1,
      user: "鋒兄",
      action: "創建了新項目",
      time: "2 分鐘前",
      icon: <Package className="h-4 w-4" />
    },
    {
      id: 2,
      user: "塗哥",
      action: "更新了用戶資料",
      time: "5 分鐘前",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 3,
      user: "系統",
      action: "執行了備份任務",
      time: "10 分鐘前",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>最近活動</CardTitle>
          <CardDescription>系統和用戶的最新動態</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activity.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {activity.user} {activity.action}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  <Badge variant="outline">新</Badge>
                </div>
                {index < activities.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>統計數據</CardTitle>
          <CardDescription>系統使用情況統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-muted-foreground">總訪問量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">567</div>
              <div className="text-sm text-muted-foreground">活躍用戶</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-muted-foreground">新註冊</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-muted-foreground">待處理</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}