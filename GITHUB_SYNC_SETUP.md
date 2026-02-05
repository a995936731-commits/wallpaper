# 🔄 GitHub 云端同步配置指南

## 📋 概述

使用 GitHub 作为免费云端存储，实现壁纸数据的跨设备同步。

**✨ 优势：**
- ✅ 完全免费，无需信用卡
- ✅ 国内可访问（下载使用 Raw 地址）
- ✅ 自动版本控制
- ✅ 数据安全可靠
- ✅ 支持私有仓库

---

## 🚀 配置步骤

### 步骤 1: 创建 GitHub Personal Access Token

1. **登录 GitHub**
   - 打开 https://github.com
   - 登录你的 GitHub 账号

2. **进入设置页面**
   - 点击右上角头像 → **Settings**
   - 左侧菜单滚动到底部 → 点击 **Developer settings**
   - 点击 **Personal access tokens** → **Tokens (classic)**

3. **创建新 Token**
   - 点击 **Generate new token** → **Generate new token (classic)**
   - Note (备注): 填写 `Wallpaper Gallery Sync`
   - Expiration (过期时间): 选择 `No expiration`（永不过期）或自定义时间

4. **设置权限**
   勾选以下权限（只需要 repo 权限）：
   ```
   ✅ repo (Full control of private repositories)
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
      ✅ security_events
   ```

5. **生成并保存 Token**
   - 滚动到底部，点击 **Generate token**
   - ⚠️ **重要：立即复制 Token！**
   - Token 格式类似: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Token 只会显示一次，请妥善保存！

---

### 步骤 2: 配置 github-sync.js

1. **打开项目文件**
   ```bash
   cd /Users/mac137/wallpaper-gallery
   ```

2. **编辑 github-sync.js**
   - 找到第 13 行：
   ```javascript
   token: 'YOUR_GITHUB_TOKEN' // 需要用户填写
   ```

   - 替换为你的 Token：
   ```javascript
   token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
   ```

3. **检查配置**
   - 确保 `owner` 和 `repo` 配置正确：
   ```javascript
   config = {
       owner: 'a995936731-commits',  // 你的 GitHub 用户名
       repo: 'wallpaper',             // 仓库名
       branch: 'main',                // 分支名
       dataPath: 'data/wallpaper-data.json',  // 数据文件路径
       token: 'ghp_xxxxxxxxxxxx'      // 你的 Token
   };
   ```

4. **保存文件**

---

### 步骤 3: 在仓库中创建 data 文件夹

GitHub API 要求路径存在，所以需要先创建 `data` 文件夹：

**方法 1: 通过命令行**
```bash
cd /Users/mac137/wallpaper-gallery
mkdir -p data
echo "{}" > data/.gitkeep
git add data/.gitkeep
git commit -m "Add data folder for cloud sync"
git push origin main
```

**方法 2: 通过 GitHub 网页**
1. 打开你的仓库 https://github.com/a995936731-commits/wallpaper
2. 点击 **Add file** → **Create new file**
3. 文件名输入: `data/.gitkeep`
4. 文件内容留空或输入 `{}`
5. 点击 **Commit new file**

---

### 步骤 4: 提交并部署

1. **提交代码**
   ```bash
   cd /Users/mac137/wallpaper-gallery
   git add github-sync.js
   git commit -m "Configure GitHub cloud sync token"
   git push origin main
   ```

2. **等待部署**
   - Cloudflare Pages 会自动部署（约 1-2 分钟）
   - 访问你的网站测试功能

---

## ✅ 测试云端同步

### 测试步骤

1. **打开壁纸库网站**
   - 浏览器控制台应该显示：
   ```
   ✅ GitHub 云端同步已启用
   ✅ 本地数据已是最新
   ```

2. **上传一张壁纸**
   - 点击"上传壁纸"，选择一张图片
   - 等待上传完成

3. **同步到云端**
   - 点击"☁️ 同步到云端"按钮
   - 等待同步完成，应该显示：
   ```
   ✅ 同步成功！已上传 X 张壁纸到 GitHub
   ```

4. **检查 GitHub 仓库**
   - 访问 https://github.com/a995936731-commits/wallpaper
   - 应该能看到新的提交记录
   - 查看 `data/wallpaper-data.json` 文件

5. **在另一台设备测试下载**
   - 在手机/平板打开同一个网站
   - 应该看到提示：
   ```
   ☁️ 检测到云端有更新！

   云端: X 张壁纸
   本地: 0 张壁纸
   更新时间: 2024-XX-XX XX:XX:XX

   是否立即从云端下载更新？
   ```
   - 点击"确定"
   - 等待下载完成，壁纸应该自动出现！

---

## 🔒 安全说明

### Token 安全

⚠️ **重要提示：**

1. **不要将 Token 提交到公开仓库**
   - 如果你的仓库是公开的，不要直接在代码中写入 Token
   - 建议使用环境变量或配置文件（添加到 .gitignore）

2. **Token 泄露怎么办？**
   - 立即在 GitHub 设置中撤销（Revoke）该 Token
   - 生成新的 Token 并重新配置

3. **最佳实践**
   - 定期更换 Token
   - 只授予必要的权限
   - 使用私有仓库存储敏感数据

### 为公开仓库配置（推荐）

如果你的仓库是公开的，建议将 Token 单独存储：

1. **创建配置文件**
   ```bash
   echo 'window.GITHUB_TOKEN = "ghp_xxxxx";' > github-token.js
   echo "github-token.js" >> .gitignore
   ```

2. **在 index-db.html 中加载**
   ```html
   <script src="github-token.js"></script>
   <script src="github-sync.js"></script>
   ```

3. **修改 github-sync.js**
   ```javascript
   token: window.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN'
   ```

4. **手动维护本地配置**
   - `github-token.js` 不会被提交到 Git
   - 每台设备手动创建该文件
   - 或使用浏览器 localStorage 存储

---

## 📊 数据格式

云端数据格式（`data/wallpaper-data.json`）：

```json
{
  "version": "1.0",
  "exportDate": "2024-01-15T08:30:00.000Z",
  "wallpapers": [
    {
      "id": 1705308600123.456,
      "name": "wallpaper.jpg",
      "type": "image",
      "src": "data:image/jpeg;base64,/9j/4AAQ...",
      "uploadDate": "2024-01-15T08:30:00.000Z"
    }
  ],
  "settings": {
    "fitModes": {
      "1705308600123.456": "contain"
    }
  },
  "stats": {
    "staticCount": 10,
    "dynamicCount": 5,
    "totalCount": 15
  }
}
```

---

## 🔍 故障排查

### 问题 1: 页面显示"GitHub 同步未启用"

**原因：** Token 未配置或配置错误

**解决：**
1. 检查 `github-sync.js` 中的 token 是否为 `'YOUR_GITHUB_TOKEN'`
2. 确保 Token 格式正确（以 `ghp_` 开头）
3. 重新生成 Token 并配置

---

### 问题 2: 上传失败 "404 Not Found"

**原因：** data 文件夹不存在

**解决：**
1. 按照步骤 3 创建 data 文件夹
2. 确保仓库名称和分支正确
3. 检查 `config.dataPath` 路径配置

---

### 问题 3: 上传失败 "401 Unauthorized"

**原因：** Token 无效或权限不足

**解决：**
1. 检查 Token 是否过期
2. 确认 Token 具有 `repo` 权限
3. 重新生成 Token

---

### 问题 4: 下载失败 "CORS 错误"

**原因：** Raw 地址被墙或网络问题

**解决：**
1. 使用 VPN（仅电脑需要）
2. 手机/平板通常可以直接访问 Raw 地址
3. 等待一段时间后重试

---

### 问题 5: 数据不同步

**原因：** 可能是缓存问题

**解决：**
1. 手动点击"从云端下载"按钮
2. 清除浏览器缓存
3. 检查浏览器控制台的错误信息

---

## 💡 使用技巧

### 1. 定期备份

虽然 GitHub 已经是云端备份，但建议定期使用"导出数据"功能下载本地备份：
- 点击"💾 导出数据"
- 保存 JSON 文件到安全位置

### 2. 多设备同步流程

**电脑（有 VPN）：**
1. 上传壁纸
2. 点击"同步到云端"
3. 等待同步完成

**手机/平板（无 VPN）：**
1. 打开网站
2. 看到更新提示后点击"确定"
3. 等待下载完成

### 3. 版本控制

GitHub 会保留所有提交历史，如果误操作可以恢复：
1. 访问仓库 → `data/wallpaper-data.json`
2. 点击 **History**
3. 找到之前的版本
4. 点击文件 → **Raw** → 复制内容
5. 使�"导入数据"功能恢复

---

## 🎉 完成！

配置成功后，你将拥有：
- ☁️ 免费的云端存储
- 🔄 跨设备自动同步
- 📱 手机/电脑无缝切换
- 🔒 数据安全可靠
- 💰 完全免费

**开始享受云端同步的便捷吧！** 🚀

---

## 🆘 需要帮助？

如果遇到任何问题：
1. 查看浏览器控制台的错误信息
2. 检查 GitHub 仓库的提交历史
3. 确认 Token 权限和有效性
4. 参考本指南的故障排查部分
