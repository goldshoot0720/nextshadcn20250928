"use client";

import { useState, useMemo } from "react";
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
  PageTitle,
  SectionHeader,
  StatCard,
  SimpleStatCard,
  DataCard,
  DataCardItem,
  DataCardList,
  StatusBadge,
  LoadingSpinner,
} from "@/components/ui";
import { 
  Package, 
  Users, 
  Settings, 
  Star, 
  Heart, 
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";

export default function ComponentShowcase() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const headerBadge = useMemo(() => (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <StatusBadge status="normal">v2.0.0</StatusBadge>
    </div>
  ), []);

  return (
    <div className="space-y-6">
      <PageTitle
        title="shadcn/ui 組件展示"
        description="展示整合的 shadcn/ui 組件庫功能"
        badge={headerBadge}
      />

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
  const stats = useMemo(() => [
    {
      title: "總用戶數",
      value: "2,350",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      description: "+20.1% 比上個月"
    },
    {
      title: "活躍項目",
      value: "145",
      icon: Package,
      gradient: "from-green-500 to-green-600",
      description: "+12% 比上週"
    },
    {
      title: "系統狀態",
      value: "99.9%",
      icon: Settings,
      gradient: "from-purple-500 to-purple-600",
      description: "正常運行"
    }
  ], []);

  return (
    <div className="space-y-6">
      <SectionHeader title="系統概覽" subtitle="查看系統整體運行狀況" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SimpleStatCard title="在線用戶" value="1,234" icon={<Activity className="w-4 h-4" />} />
        <SimpleStatCard title="今日訪問" value="567" icon={<TrendingUp className="w-4 h-4" />} />
        <SimpleStatCard title="系統負載" value="23%" icon={<Zap className="w-4 h-4" />} />
        <SimpleStatCard title="響應時間" value="120ms" icon={<Clock className="w-4 h-4" />} />
      </div>
    </div>
  );
}

// 組件標籤頁
function ComponentsTab() {
  const buttonVariants = useMemo(() => [
    { variant: "default" as const, label: "預設按鈕" },
    { variant: "secondary" as const, label: "次要按鈕" },
    { variant: "outline" as const, label: "輪廓按鈕" },
    { variant: "ghost" as const, label: "幽靈按鈕" },
    { variant: "destructive" as const, label: "危險按鈕" },
  ], []);

  const buttonSizes = useMemo(() => [
    { size: "sm" as const, label: "小按鈕" },
    { size: "default" as const, label: "預設大小" },
    { size: "lg" as const, label: "大按鈕" },
  ], []);

  const badgeVariants = useMemo(() => [
    { variant: "default" as const, label: "預設" },
    { variant: "secondary" as const, label: "次要" },
    { variant: "outline" as const, label: "輪廓" },
    { variant: "destructive" as const, label: "危險" },
  ], []);

  const statusExamples = useMemo(() => [
    { status: "normal" as const, text: "正常" },
    { status: "warning" as const, text: "警告" },
    { status: "urgent" as const, text: "緊急" },
    { status: "expired" as const, text: "過期" },
  ], []);

  return (
    <div className="space-y-6">
      <SectionHeader title="UI 組件展示" subtitle="展示各種可重用的 UI 組件" />

      {/* 按鈕展示 */}
      <Card>
        <CardHeader>
          <CardTitle>按鈕組件</CardTitle>
          <CardDescription>不同樣式和大小的按鈕展示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">按鈕樣式</h4>
            <div className="flex flex-wrap gap-2">
              {buttonVariants.map(({ variant, label }) => (
                <Button key={variant} variant={variant}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">按鈕大小</h4>
            <div className="flex flex-wrap gap-2">
              {buttonSizes.map(({ size, label }) => (
                <Button key={size} size={size}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 徽章和狀態展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>徽章組件</CardTitle>
            <CardDescription>用於狀態標示和標籤的徽章</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badgeVariants.map(({ variant, label }) => (
                <Badge key={variant} variant={variant}>
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>狀態徽章</CardTitle>
            <CardDescription>自定義狀態徽章組件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusExamples.map(({ status, text }) => (
                <StatusBadge key={status} status={status}>
                  {text}
                </StatusBadge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <Avatar>
              <AvatarFallback><Users className="w-4 h-4" /></AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 表單標籤頁
function FormsTab() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
  });

  const positions = useMemo(() => [
    { value: "developer", label: "開發者" },
    { value: "designer", label: "設計師" },
    { value: "manager", label: "管理者" },
    { value: "analyst", label: "分析師" },
  ], []);

  return (
    <div className="space-y-6">
      <SectionHeader title="表單組件" subtitle="展示各種表單輸入和互動組件" />

      <Card>
        <CardHeader>
          <CardTitle>基本表單</CardTitle>
          <CardDescription>輸入框和選擇器展示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <Input 
                placeholder="請輸入您的姓名" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">職位</label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇職位" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>對話框組件</CardTitle>
          <CardDescription>模態對話框和確認框展示</CardDescription>
        </CardHeader>
        <CardContent>
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
            
            <Button variant="secondary" disabled>
              載入中...
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>載入狀態</CardTitle>
          <CardDescription>各種載入指示器展示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">處理中...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 數據標籤頁
function DataTab() {
  const activities = useMemo(() => [
    {
      id: 1,
      user: "鋒兄",
      action: "創建了新項目",
      time: "2 分鐘前",
      icon: <Package className="h-4 w-4" />,
      status: "normal" as const
    },
    {
      id: 2,
      user: "塗哥",
      action: "更新了用戶資料",
      time: "5 分鐘前",
      icon: <Users className="h-4 w-4" />,
      status: "normal" as const
    },
    {
      id: 3,
      user: "系統",
      action: "執行了備份任務",
      time: "10 分鐘前",
      icon: <Settings className="h-4 w-4" />,
      status: "warning" as const
    }
  ], []);

  const statisticsData = useMemo(() => [
    { label: "總訪問量", value: "1,234", color: "text-blue-600", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "活躍用戶", value: "567", color: "text-green-600", icon: <Users className="w-4 h-4" /> },
    { label: "新註冊", value: "89", color: "text-purple-600", icon: <Star className="w-4 h-4" /> },
    { label: "待處理", value: "12", color: "text-orange-600", icon: <Clock className="w-4 h-4" /> },
  ], []);

  return (
    <div className="space-y-6">
      <SectionHeader title="數據展示" subtitle="系統數據和活動記錄展示" />

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
                  <StatusBadge status={activity.status}>新</StatusBadge>
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
            {statisticsData.map(({ label, value, color, icon }) => (
              <SimpleStatCard
                key={label}
                title={label}
                value={value}
                icon={icon}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>數據卡片列表</CardTitle>
          <CardDescription>展示 DataCard 和 DataCardItem 組件</CardDescription>
        </CardHeader>
        <CardContent>
          <DataCard>
            <DataCardList>
              <DataCardItem>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">系統版本</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">v2.0.0</span>
                </div>
              </DataCardItem>
              <DataCardItem>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">運行時間</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">15 天 8 小時</span>
                </div>
              </DataCardItem>
              <DataCardItem>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">內存使用</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">2.4 GB / 8 GB</span>
                </div>
              </DataCardItem>
              <DataCardItem>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">磁盤空間</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">45.2 GB / 100 GB</span>
                </div>
              </DataCardItem>
              <DataCardItem>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">網絡流量</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">1.2 TB</span>
                </div>
              </DataCardItem>
            </DataCardList>
          </DataCard>
        </CardContent>
      </Card>
    </div>
  );
}