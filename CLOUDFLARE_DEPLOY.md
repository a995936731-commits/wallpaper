# Cloudflare Pages 部署指南

## 📋 准备工作

你已经完成:
- ✅ Git 仓库已初始化
- ✅ 代码已提交
- ✅ GitHub 仓库已创建: https://github.com/a995936731-commits/wallpaper

## 🚀 部署步骤

### 步骤 1: ✅ 已完成 - 创建 GitHub 仓库

你的 GitHub 仓库已创建:
- **仓库地址**: https://github.com/a995936731-commits/wallpaper
- **用户名**: a995936731-commits
- **仓库名**: wallpaper
- **状态**: Public ✅

### 步骤 2: 创建 GitHub Personal Access Token

由于 Git 需要认证,你需要创建一个访问令牌:

1. **访问 Token 页面**:
   - 打开 https://github.com/settings/tokens/new
   - 或者: GitHub → 头像 → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

2. **配置 Token**:
   - **Note**: `Wallpaper Gallery Deploy` (随便填,便于识别)
   - **Expiration**: `No expiration` (永不过期) 或 `90 days` (90天)
   - **Select scopes**: 勾选 `repo` (完整仓库访问权限)

3. **生成并复制**:
   - 点击页面底部的 **"Generate token"**
   - ⚠️ **重要**: 复制生成的 token (格式: `ghp_xxxxxxxxxxxx`)
   - ⚠️ **只显示一次**: 离开页面后无法再查看,请妥善保存

### 步骤 3: 推送代码到 GitHub

你的仓库已创建: https://github.com/a995936731-commits/wallpaper

使用 Token 推送代码:

```bash
# 进入项目目录
cd /Users/mac137/wallpaper-gallery

# 使用 Token 推送 (将 YOUR_TOKEN 替换为刚才复制的 token)
git push https://YOUR_TOKEN@github.com/a995936731-commits/wallpaper.git main
```

**示例** (假设你的 token 是 `ghp_abc123xyz`):
```bash
git push https://ghp_abc123xyz@github.com/a995936731-commits/wallpaper.git main
```

推送成功后,你会看到:
```
Enumerating objects: 8, done.
Counting objects: 100% (8/8), done.
...
To https://github.com/a995936731-commits/wallpaper.git
 * [new branch]      main -> main
```

### 步骤 4: 部署到 Cloudflare Pages

1. **访问 Cloudflare Pages**:
   - 打开 https://dash.cloudflare.com/sign-up (如果没账号,先注册,完全免费)
   - 登录后访问 https://dash.cloudflare.com/ → Workers & Pages → Create

2. **连接 GitHub**:
   - 选择 "Connect to Git"
   - 点击 "Connect GitHub"
   - 授权 Cloudflare 访问你的 GitHub
   - 选择 `wallpaper` 仓库

3. **配置构建设置**:
   ```
   Project name: wallpaper
   Production branch: main
   Framework preset: None
   Build command: (留空)
   Build output directory: /
   ```

4. **环境变量**:
   - 不需要设置,直接跳过

5. **点击 "Save and Deploy"**

6. **等待部署完成** (通常 30 秒内完成)

### 步骤 5: 获取访问地址

部署成功后,你会得到一个域名:
```
https://wallpaper.pages.dev
```

或者类似:
```
https://wallpaper-abc.pages.dev
```

## ✅ 完成!

现在你有了:
- 🌍 **Vercel 版本**: https://wallpaper-gallery-delta.vercel.app (需要 VPN)
- 🇨🇳 **Cloudflare 版本**: https://wallpaper.pages.dev (国内直连)

## 🔄 后续更新

每次修改代码后:

```bash
cd /Users/mac137/wallpaper-gallery
git add .
git commit -m "你的更新说明"
git push
```

推送后,Cloudflare Pages 会自动重新�署!

## 💡 提示

- Cloudflare Pages 在国内访问速度**非常快**
- 完全免费,无限流量
- 自动 HTTPS
- 每次 `git push` 自动部署

## ❓ 常见问题

**Q: 推送到 GitHub 失败?**
A: 可能需要配置 SSH key 或使用 Personal Access Token

**Q: Cloudflare Pages 连接不到 GitHub 仓库?**
A: 确保仓库是 Public,Private 仓库需要付费版

**Q: 部署后访问不了?**
A: 等待 1-2 分钟,DNS 需要传播时间

---

需要帮助? 随时问我! 🎉
