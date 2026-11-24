#!/usr/bin/env bash
# ============================================================
#  MyX 摄影网站 · 一键同步发布脚本
#  用法：把新照片放进源文件夹后，运行  bash publish.sh
#  作用：压缩图片 → 更新 data.js → 提交 → 推送 → 自动上线
# ============================================================
set -e
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo ""
echo "============================================"
echo " MyX 摄影网站 · 一键同步发布"
echo "============================================"

# 1. 检查是否已关联远程仓库
if ! git remote get-url origin >/dev/null 2>&1; then
  echo -e "${YELLOW}尚未关联远程仓库，无法推送。${NC}"
  echo "请先执行（把地址换成你自己的仓库）："
  echo "  git remote add origin https://github.com/你的用户名/你的仓库名.git"
  exit 1
fi

# 2. 更新图片（压缩 + 写 data.js）
echo -e "\n${GREEN}[1/3] 更新图片与配置...${NC}"
python update_images.py

# 3. 提交变更
echo -e "\n${GREEN}[2/3] 提交变更...${NC}"
git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动，跳过提交。"
else
  MSG="更新摄影作品 $(date +%Y-%m-%d\ %H:%M)"
  git commit -m "$MSG"
  echo "已提交：$MSG"
fi

# 4. 推送上线
echo -e "\n${GREEN}[3/3] 推送到远程仓库...${NC}"
BRANCH=$(git branch --show-current)
git push -u origin "$BRANCH"

echo ""
echo "============================================"
echo -e "${GREEN}发布完成！${NC}"
echo "托管平台会在 1-2 分钟内自动更新线上网址。"
echo "如果没变化，刷新浏览器（Ctrl+F5 强制刷新）。"
echo "============================================"
