# 管理系統

這是一個使用 Next.js 和 shadcn/ui 構建的響應式管理系統，支援食品管理和訂閱管理功能。

## 功能特色

- 📱 **響應式設計**: 支援桌面、平板和手機版本
- 🎛️ **可折疊選單**: 電腦版左側選單，手機版上方選單
- 📦 **食品管理**: 管理食品庫存、有效期限和圖片
- 💳 **訂閱管理**: 追蹤訂閱服務和付款日期
- 🏗️ **模組化架構**: 組件分離，易於維護和擴展

## 項目結構

```
├── app/
│   ├── api/                    # API 路由
│   │   ├── food/              # 食品 API
│   │   └── subscription/      # 訂閱 API
│   ├── page.tsx               # 主頁面
│   └── layout.tsx             # 根佈局
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx # 響應式佈局組件
│   ├── modules/
│   │   ├── FoodManagement.tsx      # 食品管理組件
│   │   └── SubscriptionManagement.tsx # 訂閱管理組件
│   └── ui/                    # shadcn/ui 組件
└── .env                       # 環境變數 (Appwrite 配置)
```

## 響應式設計

### 桌面版 (≥768px)
- 左側固定選單
- 右側內容區域
- 選單可展開/收合

### 平板版
- 橫向: 比照桌面版佈局
- 直向: 比照手機版佈局

### 手機版 (<768px)
- 上方導航欄
- 可滑出的側邊選單
- 下方內容區域

## 開始使用

1. 安裝依賴:
```bash
npm install
```

2. 配置環境變數:
確保 `.env` 文件包含正確的 Appwrite 配置

3. 啟動開發服務器:
```bash
npm run dev
```

4. 打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 技術棧

- **框架**: Next.js 15
- **UI 庫**: shadcn/ui + Tailwind CSS
- **圖標**: Lucide React
- **後端**: Appwrite
- **語言**: TypeScript

## 部署

構建生產版本:
```bash
npm run build
```

啟動生產服務器:
```bash
npm start
```