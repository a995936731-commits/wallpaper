# 🔥 Firebase 云端同步配置指南

## 📋 概述

Firebase 云端同步功能让你的壁纸数据在多个设备间自动同步，无需手动导入导出。

**✨ 功能特性：**
- ✅ 自动上传壁纸到云端
- ✅ 实时同步到所有设备
- ✅ 删除时自动同步
- ✅ 首次加载自动下载云端数据
- ✅ 完全免费（在免费额度内）

---

## 🚀 配置步骤

### 步骤 1: 创建 Firebase 项目

1. **访问 Firebase Console**
   - 打开 https://console.firebase.google.com/
   - 使用 Google 账号登录

2. **创建新项目**
   - 点击"添加项目"
   - 项目名称：`wallpaper-gallery`（或任意名称）
   - Google Analytics：选择"暂不启用"（可选）
   - 点击"创建项目"

### 步骤 2: 注册 Web 应用

1. **添加 Web 应用**
   - 在项目概览页面，点击 **`</>`** 图标（Web）
   - 应用昵称：`wallpaper-web`
   - **不要**勾选"同时设置 Firebase Hosting"
   - 点击"注册应用"

2. **复制配置信息**
   ```javascript
   // 你会看到类似这样的配置
   const firebaseConfig = {
     apiKey: "AIzaSyA...",
     authDomain: "wallpaper-gallery.firebaseapp.com",
     projectId: "wallpaper-gallery",
     storageBucket: "wallpaper-gallery.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

   **⚠️ 重要：复制这些值，稍后要用**

### 步骤 3: 启用 Firebase 服务

#### 3.1 启用 Authentication（身份验证）

1. 左侧菜单 → **Authentication** → "开始使用"
2. 登录方法 → 选择"匿名"
3. 启用开关 → 保存

#### 3.2 启用 Firestore Database（数据库）

1. 左侧菜单 → **Firestore Database** → "创建数据库"
2. 位置：选择 **asia-east1（台湾）** 或 **asia-southeast1（新加坡）**
3. 安全规则：选择"**生产模式**"（我们稍后配置）
4. 点击"启用"

#### 3.3 启用 Storage（文件存储）

1. 左侧菜单 → **Storage** → "开始使用"
2. 位置：选择与 Firestore 相同的位置
3. 安全规则：选择"**生产模式**"
4. 点击"完成"

### 步骤 4: 配置安全规则

#### 4.1 Firestore 安全规则

1. Firestore Database → 规则
2. 粘贴以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 每个用户只能访问自己的数据
    match /users/{userId}/wallpapers/{wallpaperId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. 点击"发布"

#### 4.2 Storage 安全规则

1. Storage → 规则
2. 粘贴以下规则：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 每个用户只能访问自己的文件
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. 点击"发布"

### 步骤 5: 填写配置信息

1. **打开项目文件**
   - 找到 `firebase-config.js` 文件
   - 打开编辑器

2. **替换配置**
   - 将步骤 2 复制的配置信息填入：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // 替换为你的 API Key
    authDomain: "YOUR_PROJECT.firebaseapp.com",  // 替换
    projectId: "YOUR_PROJECT_ID",     // 替换
    storageBucket: "YOUR_PROJECT.appspot.com",   // 替换
    messagingSenderId: "YOUR_SENDER_ID",  // 替换
    appId: "YOUR_APP_ID"              // 替换
};
```

3. **保存并提交**
   ```bash
   cd /Users/mac137/wallpaper-gallery
   git add firebase-config.js
   git commit -m "Configure Firebase cloud sync"
   git push origin main
   ```

4. **等待部署**
   - Cloudflare Pages 会自动部署（约 1-2 分钟）

---

## ✅ 测试云端同步

### 测试步骤

1. **在电脑上上传一张壁纸**
   - 打开壁纸库网站
   - 上传一张图片
   - 查看浏览器控制台，应该看到：
     ```
     ✅ Firebase 已连接，用户 ID: abc123...
     ☁️ 云端同步已启用
     ✅ 壁纸已上传到云端: example.jpg
     ```

2. **在手机上查看**
   - 打开同一个网站
   - 等待几秒钟（自动同步）
   - 应该看到刚才上传的壁纸自动出现！

3. **测试删除同步**
   - 在手机上删除一张壁纸
   - 查看电脑，几秒后应该自动删除

---

## 💰 费用说明

### 免费额度（完全够用）

```
Firestore:
- 存储：1 GB
- 读取：50,000 次/天
- 写入：20,000 次/天
- 删除：20,000 次/天

Storage:
- 存储：5 GB
- 下载：1 GB/天
- 上传：无限制

估算：
- 每张图片 5MB → 可存储 1000 张
- 每天上传 10 张 → 完全免费
```

### 超出免费额度怎么办？

- Firebase 有非常详细的用量监控
- 接近限额时会邮件提醒
- 可以升级到 Blaze 计划（按量付费）
- 实际使用中，个人用户很难超出免费额度

---

## 🔍 故障排查

### 问题 1: 页面显示"Firebase 未配置"

**原因：** `firebase-config.js` 未填写配置

**解决：**
1. 检查 `firebaseConfig.apiKey` 是否为 `"YOUR_API_KEY"`
2. 如果是，按照步骤 5 填写正确的配置

---

### 问题 2: 控制台显示"Firebase 登录失败"

**原因：** Authentication 未启用匿名登录

**解决：**
1. 进入 Firebase Console
2. Authentication → 登录方法
3. 启用"匿名"登录

---

### 问题 3: 上传失败 "permission-denied"

**原因：** Storage 安全规则未正确配置

**解决：**
1. 进入 Firebase Console
2. Storage → 规则
3. 确保规则中包含 `request.auth != null`
4. 点击"发布"

---

### 问题 4: 数据不同步

**可能原因：**
1. 两个设备用了不同的匿名账户
2. 网络问题

**解决：**
- 清除浏览器数据，重新加载
- 检查网络连接
- 查看浏览器控制台的错误信息

---

## 📊 监控用量

1. **进入 Firebase Console**
2. **左侧菜单 → Usage**
3. **查看各项服务用量**
   - Firestore 读/写次数
   - Storage 存储量和流量

---

## 🎉 完成！

配置成功后，你将拥有：
- ☁️ 自动云端备份
- 🔄 多设备实时同步
- 💾 50GB+ 本地存储 + 5GB 云端存储
- 📱 电脑/手机无缝切换
- 💰 完全免费

**享受云端同步带来的便捷吧！** 🚀

---

## 🆘 需要帮助？

如果遇到任何问题，可以：
1. 查看浏览器控制台的错误信息
2. 检查 Firebase Console 的用量和日志
3. 参考 Firebase 官方文档：https://firebase.google.com/docs
