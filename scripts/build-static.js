#!/usr/bin/env node

/**
 * 靜態網站構建腳本
 * 自動切換配置並構建靜態版本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_FILE = path.join(process.cwd(), 'next.config.ts');
const STATIC_CONFIG_FILE = path.join(process.cwd(), 'next.config.static.ts');
const BACKUP_CONFIG_FILE = path.join(process.cwd(), 'next.config.ts.backup');

function buildStatic() {
  try {
    console.log('🚀 開始構建靜態網站...');
    
    // 1. 生成靜態圖片列表
    console.log('📸 生成靜態圖片列表...');
    execSync('node scripts/generate-static-images.js', { stdio: 'inherit' });
    
    // 2. 備份原始配置
    console.log('💾 備份原始配置...');
    if (fs.existsSync(CONFIG_FILE)) {
      fs.copyFileSync(CONFIG_FILE, BACKUP_CONFIG_FILE);
    }
    
    // 3. 使用靜態配置
    console.log('⚙️  切換到靜態配置...');
    if (fs.existsSync(STATIC_CONFIG_FILE)) {
      fs.copyFileSync(STATIC_CONFIG_FILE, CONFIG_FILE);
    }
    
    // 4. 構建靜態網站
    console.log('🔨 構建靜態網站...');
    execSync('next build', { stdio: 'inherit' });
    
    console.log('✅ 靜態網站構建完成！');
    console.log('📁 靜態文件位於 ./out 資料夾');
    
  } catch (error) {
    console.error('❌ 構建失敗:', error.message);
    process.exit(1);
  } finally {
    // 5. 恢復原始配置
    console.log('🔄 恢復原始配置...');
    if (fs.existsSync(BACKUP_CONFIG_FILE)) {
      fs.copyFileSync(BACKUP_CONFIG_FILE, CONFIG_FILE);
      fs.unlinkSync(BACKUP_CONFIG_FILE);
    }
  }
}

// 執行腳本
if (require.main === module) {
  buildStatic();
}

module.exports = { buildStatic };