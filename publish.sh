#!/usr/bin/env bash
# ============================================================
#  MyX 摄影网站 · 一键同步发布脚本
#  用法：
#    bash publish.sh               完整流程：压缩新照片 → 更新配置 → 提交 → 推送上线
#    bash publish.sh --push-only   仅推送（不重新压缩照片，适合只想同步已有改动）
#  认证：已配置 GitHub 凭据，正常情况无需输入账号密码
# ============================================================
set -e
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
PUSH_ONLY=0
[ "$1" = "--push-only" ] && PUSH_ONLY=1

echo ""
echo "============================================"
echo " MyX 摄影网站 · 一键同步发布"
echo " 目标网址：https://myxphoto.com"
echo "============================================"

# 1. 检查远程仓库
if ! git remote get-url origin >/dev/null 2>&1; then
  echo -e "${RED}尚未关联远程仓库，无法推送。${NC}"
  echo "请先运行："
  echo "  git remote add origin https://github.com/xuyb2009-dotcom/myxphoto.git"
  exit 1
fi

# 2. 更新图片（压缩 + 重写 data.js）
if [ "$PUSH_ONLY" -eq 0 ]; then
  echo -e "\n${GREEN}[1/3] 更新图片与配置...${NC}"
  PY="python"
  command -v "$PY" >/dev/null 2>&1 || PY="python3"
  if ! command -v "$PY" >/dev/null 2>&1; then
    echo -e "${RED}未找到 Python，跳过图片更新。请安装 Python 或用 --push-only 仅推送。${NC}"
  elif ! "$PY" -c "import PIL" >/dev/null 2>&1; then
    echo -e "${YELLOW}Python 缺少 Pillow 库，跳过图片更新。可运行 pip install Pillow 后重试。${NC}"
  else
    "$PY" update_images.py
  fi
else
  echo -e "\n${GREEN}[1/3] 跳过图片更新（--push-only）${NC}"
fi

# 3. 提交变更
echo -e "\n${GREEN}[2/3] 提交变更...${NC}"
git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的改动。"
else
  MSG="更新摄影作品 $(date +%Y-%m-%d\ %H:%M)"
  git commit -m "$MSG"
  echo -e "已提交：${GREEN}$MSG${NC}"
fi

# 4. 推送上线
echo -e "\n${GREEN}[3/3] 推送到 GitHub...${NC}"
BRANCH=$(git branch --show-current)
if git push origin "$BRANCH"; then
  echo ""
  echo "============================================"
  echo -e "${GREEN}发布成功！${NC}"
  echo "GitHub Pages 会在 1-2 分钟内自动更新。"
  echo "访问：https://myxphoto.com"
  echo "若页面未变，按 Ctrl+F5 强制刷新清缓存。"
  echo "============================================"
else
  echo ""
  echo -e "${RED}推送失败——通常是 GitHub 认证问题。${NC}"
  echo "处理方式（任选其一）："
  echo "  1) 在本机运行一次：git push origin main"
  echo "     弹出 GitHub 登录窗口时，用浏览器登录一次即可记住。"
  echo "  2) 或生成 Personal Access Token 后运行："
  echo "     git -c credential.helper= push https://x-access-token:<令牌>@github.com/xuyb2009-dotcom/myxphoto.git main"
  exit 1
fi
