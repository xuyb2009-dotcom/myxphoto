#!/usr/bin/env bash
# ============================================================
#  MyX 摄影网站 · GitHub Pages 首次配置助手
#  用法：bash setup_github.sh  （按提示粘贴你的仓库地址）
#  作用：关联远程仓库，之后即可用 publish.sh 一键发布
# ============================================================
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo ""
echo "============================================"
echo " GitHub Pages 首次配置"
echo "============================================"
echo ""
echo "第一步（在网页上完成）："
echo "  1. 打开 https://github.com/new 登录并新建仓库"
echo "  2. 仓库名建议：myx-photo（随便起，记住它）"
echo "  3. 选择 Public（公开，GitHub Pages 免费版需要）"
echo "  4. 不要勾选 README / .gitignore / License（保持空仓库）"
echo "  5. 点 Create repository"
echo ""

if git remote get-url origin >/dev/null 2>&1; then
  echo "当前已关联远程：$(git remote get-url origin)"
  read -r -p "是否要改为新的仓库地址？(y/N): " change
  case "$change" in
    [yY][eE][sS]|[yY]) git remote set-url origin "$REPO" 2>/dev/null || true ;;
    *) echo "保持原有远程。" ;;
  esac
fi

echo ""
read -r -p "请粘贴仓库地址（形如 https://github.com/用户名/仓库名.git）：" REPO
if [ -z "$REPO" ]; then
  echo -e "${YELLOW}地址为空，已取消。${NC}"
  exit 1
fi

# 若上面已 set-url 过则用已设置的，否则重新设置
git remote get-url origin >/dev/null 2>&1 && git remote set-url origin "$REPO" || git remote add origin "$REPO"
echo -e "${GREEN}已关联远程：$REPO${NC}"

echo ""
echo "第二步：首次推送"
git add -A
git commit -m "初始化摄影网站" 2>/dev/null || echo "（已是最新，无需提交）"
BRANCH=$(git branch --show-current)
git push -u origin "$BRANCH"

echo ""
echo "第三步（在网页上完成）："
echo "  1. 进入仓库 → Settings → Pages"
echo "  2. Source 选择：Deploy from a branch"
echo "  3. Branch 选择：main ，目录选 /(root)，Save 保存"
echo ""
echo "第四步：绑定自定义域名 myxphoto.com"
echo "  A) 在域名注册商（买域名的地方）做 DNS 解析："
echo "     根域名 myxphoto.com 添加 4 条 A 记录，指向："
echo "       185.199.108.153"
echo "       185.199.109.153"
echo "       185.199.110.153"
echo "       185.199.111.153"
echo "     若也要 www.myxphoto.com，再加 1 条 CNAME 记录："
echo "       www  ->  $(git remote get-url origin | sed -E 's#.*github.com/([^/]+)/.*#\1#').github.io"
echo "  B) 回到仓库 Settings → Pages → Custom domain"
echo "     填入 myxphoto.com 并保存（仓库已自带 CNAME 文件）"
echo "     勾选 Enforce HTTPS 启用免费 SSL 证书"
echo ""
echo "  DNS 生效需几分钟到几小时，生效后访问："
echo -e "  ${GREEN}https://myxphoto.com${NC}"
echo ""
echo "============================================"
echo -e "${GREEN}配置完成！${NC}"
echo "以后每次更新照片，只需运行：bash publish.sh"
echo "============================================"
