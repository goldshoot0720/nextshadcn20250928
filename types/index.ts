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

// 文章相關類型
export interface Article {
  $id: string;
  title: string;
  content: string;
  newDate: string;
  url1?: string;
  url2?: string;
  url3?: string;
  file1?: string;
  file1type?: string;
  file2?: string;
  file2type?: string;
  file3?: string;
  file3type?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface ArticleFormData {
  title: string;
  content: string;
  newDate: string;
  url1?: string;
  url2?: string;
  url3?: string;
  file1?: string;
  file1type?: string;
  file2?: string;
  file2type?: string;
  file3?: string;
  file3type?: string;
}

// API 回應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 常用帳號站點類型
export interface CommonAccountSite {
  $id: string;
  name: string;
  site01?: string;
  site02?: string;
  site03?: string;
  site04?: string;
  site05?: string;
  site06?: string;
  site07?: string;
  site08?: string;
  site09?: string;
  site10?: string;
  site11?: string;
  site12?: string;
  site13?: string;
  site14?: string;
  site15?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface CommonAccountSiteFormData {
  name: string;
  site01?: string;
  site02?: string;
  site03?: string;
  site04?: string;
  site05?: string;
  site06?: string;
  site07?: string;
  site08?: string;
  site09?: string;
  site10?: string;
  site11?: string;
  site12?: string;
  site13?: string;
  site14?: string;
  site15?: string;
}

// 常用帳號筆記類型
export interface CommonAccountNote {
  $id: string;
  name: string;
  note01?: string;
  note02?: string;
  note03?: string;
  note04?: string;
  note05?: string;
  note06?: string;
  note07?: string;
  note08?: string;
  note09?: string;
  note10?: string;
  note11?: string;
  note12?: string;
  note13?: string;
  note14?: string;
  note15?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface CommonAccountNoteFormData {
  name: string;
  note01?: string;
  note02?: string;
  note03?: string;
  note04?: string;
  note05?: string;
  note06?: string;
  note07?: string;
  note08?: string;
  note09?: string;
  note10?: string;
  note11?: string;
  note12?: string;
  note13?: string;
  note14?: string;
  note15?: string;
}
