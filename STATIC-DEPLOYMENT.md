# 靜態網站部署指南

這個專案支援兩種部署方式：

## 1. 動態部署 (預設)
使用 Next.js 伺服器端渲染和 API 路由

```bash
# 構建和啟動
npm run build
npm start

# 或使用 Docker
docker build -t nextshadcn-app .
docker run -p 3000:3000 nextshadcn-app
```

## 2. 靜態網站部署
生成純靜態 HTML/CSS/JS 文件，可部署到任何靜態主機

### 本地構建靜態網站

```bash
# 生成靜態圖片列表
npm run generate:static

# 構建靜態網站
npm run build:static

# 靜態文件會生成在 'out' 資料夾中
```

### 使用 Docker + Nginx 部署

```bash
# 構建靜態版本的 Docker 映像
docker build -f Dockerfile.static -t nextshadcn-static .

# 啟動靜態網站 (nginx)
docker run -p 80:80 nextshadcn-static
```

### 部署到靜態主機

構建完成後，將 `out` 資料夾的內容上傳到：

- **Vercel**: 自動檢測靜態導出
- **Netlify**: 拖放 `out` 資料夾
- **GitHub Pages**: 推送到 `gh-pages` 分支
- **AWS S3**: 上傳到 S3 bucket
- **任何 CDN**: 上傳靜態文件

## 配置說明

### next.config.ts
```typescript
const nextConfig = {
  output: 'export',        // 啟用靜態導出
  images: {
    unoptimized: true     // 禁用圖片優化
  },
  trailingSlash: true     // 添加尾隨斜線
};
```

### 靜態圖片處理
- 圖片數據在構建時生成 (`lib/static-images.ts`)
- 自動掃描 `public/images` 資料夾
- 支援 JPG/JPEG/PNG 格式
- 包含文件大小和修改時間

### 功能限制
靜態版本中以下功能會受限：
- ✅ 圖片展示 (使用靜態數據)
- ❌ 食品管理 (需要資料庫)
- ❌ 訂閱管理 (需要資料庫)
- ✅ 關於我們頁面
- ✅ 影片介紹
- ✅ 儀表板 (靜態數據)

## 建議部署方式

### 開發/測試環境
```bash
npm run dev
```

### 生產環境 (完整功能)
```bash
docker build -t nextshadcn-app .
docker run -p 3000:3000 nextshadcn-app
```

### 靜態展示網站
```bash
docker build -f Dockerfile.static -t nextshadcn-static .
docker run -p 80:80 nextshadcn-static
```

## 自動化部署

### GitHub Actions 範例
```yaml
name: Deploy Static Site
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:static
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```