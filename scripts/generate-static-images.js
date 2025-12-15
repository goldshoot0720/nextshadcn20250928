#!/usr/bin/env node

/**
 * 構建時腳本：生成靜態圖片列表
 * 這個腳本會掃描 public/images 資料夾並生成靜態圖片數據
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'static-images.ts');

// 支援的圖片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

function generateStaticImagesList() {
  try {
    console.log('🔍 掃描圖片資料夾:', IMAGES_DIR);
    
    // 檢查資料夾是否存在
    if (!fs.existsSync(IMAGES_DIR)) {
      console.log('⚠️  圖片資料夾不存在，創建空列表');
      writeStaticImagesFile([]);
      return;
    }

    // 讀取資料夾內容
    const files = fs.readdirSync(IMAGES_DIR);
    
    // 過濾圖片文件
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    console.log(`📸 找到 ${imageFiles.length} 張圖片`);

    // 生成圖片數據
    const imagesData = imageFiles.map(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      return {
        name: file,
        path: `/images/${file}`,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        extension: path.extname(file).toLowerCase()
      };
    });

    // 按修改時間排序
    imagesData.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    // 寫入文件
    writeStaticImagesFile(imagesData);
    
    console.log('✅ 靜態圖片列表生成完成');
    console.log(`📁 輸出文件: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('❌ 生成靜態圖片列表失敗:', error);
    process.exit(1);
  }
}

function writeStaticImagesFile(imagesData) {
  const fileContent = `// 靜態圖片列表 - 由構建腳本自動生成
// 生成時間: ${new Date().toISOString()}
// 請勿手動編輯此文件

export interface StaticImageFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
}

// 靜態圖片數據 - 構建時自動生成
export const staticImages: StaticImageFile[] = ${JSON.stringify(imagesData, null, 2)};

// 動態載入圖片的函數（用於開發環境或有 API 的環境）
export async function loadImagesFromAPI(): Promise<StaticImageFile[]> {
  try {
    const response = await fetch("/api/images");
    const data = await response.json();
    if (data.success) {
      return data.images;
    }
    return [];
  } catch (error) {
    console.error("API 載入失敗，使用靜態數據:", error);
    return staticImages;
  }
}

// 載入圖片的統一函數 - 自動選擇最佳方式
export async function loadImages(): Promise<StaticImageFile[]> {
  // 檢查是否在靜態環境中（沒有 API）
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    // 文件協議，使用靜態數據
    return staticImages;
  }
  
  // 嘗試使用 API，失敗則回退到靜態數據
  try {
    return await loadImagesFromAPI();
  } catch (error) {
    console.log("使用靜態圖片數據");
    return staticImages;
  }
}
`;

  // 確保目錄存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 寫入文件
  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
}

// 執行腳本
if (require.main === module) {
  generateStaticImagesList();
}

module.exports = { generateStaticImagesList };