#!/bin/bash

echo "🧹 开始清理项目多余文件..."

# 删除旧方案文件
rm -f qiniu-sync.js
rm -f worker.js
rm -f wrangler.toml
rm -f api/qiniu-token.js
rmdir api 2>/dev/null
rm -f vercel.json
rm -f deploy-vercel.sh
rm -f _redirects
rm -f config.html.backup
rm -f test-token.html
rm -f QINIU_DEPLOY.md
rm -f FEATURES.md

# 删除构建文件夹
rm -rf .vercel
rm -rf .wrangler
rm -rf node_modules

# 删除配置文件
rm -f package.json
rm -f .env.local

echo "✅ 清理完成！"
echo ""
echo "保留的文件:"
ls -1 *.html *.js *.md 2>/dev/null

