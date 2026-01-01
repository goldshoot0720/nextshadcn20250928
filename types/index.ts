// 統一類型定義

// 食品相關類型
export interface Food {
  $id: string;
  name: string;
  amount: number;
  todate: string;
  photo: string;
}

export interface FoodFormData {
  name: string;
  amount: number;
  todate: string;
  photo: string;
}

export interface FoodDetail {
  id: string;
  name: string;
  daysRemaining: number;
  expireDate: string;
}

// 訂閱相關類型
export interface Subscription {
  $id: string;
  name: string;
  site: string;
  price: number;
  nextdate: string;
}

export interface SubscriptionFormData {
  name: string;
  site: string;
  price: number;
  nextdate: string;
}

export interface SubscriptionDetail {
  id: string;
  name: string;
  site: string;
  daysRemaining: number;
  nextDate: string;
  price: number;
}

// 圖片相關類型
export interface ImageFile {
  name: string;
  path: string;
  size: number;
  extension: string;
  modified: string;
}

// 影片相關類型
export interface VideoItem {
  id: string;
  title: string;
  description: string;
  filename: string;
  url?: string;
  duration?: string;
  thumbnail?: string;
}

export interface VideoCacheStatus {
  cached: boolean;
  downloading: boolean;
  progress: number;
  error?: string;
  size?: number;
  cachedAt?: string;
}

export interface CacheStats {
  totalSize: number;
  totalVideos: number;
  cachedVideos: number;
  downloadingVideos: number;
}

// 儀表板統計類型
export interface DashboardStats {
  totalFoods: number;
  totalSubscriptions: number;
  foodsExpiring7Days: number;
  foodsExpiring30Days: number;
  subscriptionsExpiring3Days: number;
  subscriptionsExpiring7Days: number;
  totalMonthlyFee: number;
  expiredFoods: number;
  overdueSubscriptions: number;
  foodsExpiring7DaysList: FoodDetail[];
  foodsExpiring30DaysList: FoodDetail[];
  expiredFoodsList: FoodDetail[];
  subscriptionsExpiring3DaysList: SubscriptionDetail[];
  subscriptionsExpiring7DaysList: SubscriptionDetail[];
  overdueSubscriptionsList: SubscriptionDetail[];
}

// 選單項目類型
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

// API 回應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
