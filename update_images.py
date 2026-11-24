# -*- coding: utf-8 -*-
"""
MyX 摄影作品网站 —— 图片一键更新工具

作用：
  把源文件夹里的照片自动压缩成 WebP，替换网站图片，并同步更新 data.js 的作品列表。
  - 已有照片按图片文件名精确匹配，自动保留编号(code)、上传日期(uploadDate)、标题等
  - 新增照片自动分配下一个编号，上传日期记为当天，"全部作品"中会自动排在最前

用法：
  python update_images.py           正式更新（会先备份 data.js）
  python update_images.py --dry-run 只预览将要做什么，不改动任何文件

源文件夹（可在下方 SOURCE 修改）：
  D:/工作区/个人摄影作品/人像图片
  D:/工作区/个人摄影作品/风光图片
  D:/工作区/个人摄影作品/建筑图片   （没有就跳过）
  D:/工作区/个人摄影作品/人文图片   （没有就跳过）
"""
import os
import re
import sys
import shutil
from datetime import date
from PIL import Image

SOURCE = 'D:/工作区/个人摄影作品'
SITE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(SITE_DIR, 'images')
DATA_FILE = os.path.join(SITE_DIR, 'js', 'data.js')
CODE_PREFIX = 'MYX'          # 编号前缀
TODAY = date.today().isoformat()   # 新增照片的上传日期

# 源文件夹名 -> 网站分类目录名
FOLDERS = {
    '人像图片': 'portrait',
    '风光图片': 'landscape',
    '建筑图片': 'architecture',
    '人文图片': 'documentary',
}
DEFAULT_META = {
    'portrait': '人像写真',
    'landscape': '自然光影',
    'architecture': '建筑摄影',
    'documentary': '人文纪实',
}
MAX_WIDTH = 1920
QUALITY = 82


def parse_works(text):
    """解析现有 works，返回 (按src文件名索引的记录字典, 已用编号集合)"""
    by_src = {}
    codes = set()
    block = re.search(r'const works = \[(.*?)\n\];', text, re.S)
    if not block:
        return by_src, codes
    for line in block.group(1).splitlines():
        def grab(key):
            m = re.search(key + r":\s*'([^']*)'", line)
            return m.group(1) if m else ''
        code = grab('code')
        src = grab('src')
        if code:
            codes.add(code)
        if src:
            by_src[os.path.basename(src).lower()] = {
                'code': code,
                'uploadDate': grab('uploadDate'),
                'title': grab('title'),
                'year': grab('year'),
                'meta': grab('meta'),
            }
    return by_src, codes


def next_code(existing_codes, used):
    """分配下一个全局编号，如 MYX-015"""
    nums = [int(m.group(1)) for c in existing_codes for m in [re.match(CODE_PREFIX + r'-(\d+)', c)] if m]
    n = max(nums, default=0) + 1
    while f'{CODE_PREFIX}-{n:03d}' in used:
        n += 1
    used.add(f'{CODE_PREFIX}-{n:03d}')
    return f'{CODE_PREFIX}-{n:03d}'


def main():
    dry = '--dry-run' in sys.argv
    print('=' * 60)
    print('MyX 摄影网站 · 图片更新工具' + ('（预览模式，不改动文件）' if dry else ''))
    print('=' * 60)

    if not os.path.isfile(DATA_FILE):
        print('错误：找不到 data.js，请在网站根目录运行本脚本。')
        return

    with open(DATA_FILE, encoding='utf-8') as f:
        content = f.read()
    by_src, used_codes = parse_works(content)
    print('已读取现有作品：%d 条，编号至 %s\n' % (len(by_src), sorted(used_codes)[-1] if used_codes else '无'))

    new_lines = ['const works = [']
    total = 0
    added = 0

    for cn, en in FOLDERS.items():
        src_folder = os.path.join(SOURCE, cn)
        out_folder = os.path.join(IMG_DIR, en)
        if not os.path.isdir(src_folder):
            print('[%s] 源文件夹不存在，跳过' % cn)
            continue
        files = sorted(
            f for f in os.listdir(src_folder)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.bmp'))
        )
        if not files:
            print('[%s] 文件夹为空，跳过' % cn)
            continue
        os.makedirs(out_folder, exist_ok=True)
        print('[%s] 找到 %d 张照片' % (cn, len(files)))

        for i, fn in enumerate(files, 1):
            out_name = '%s-%02d.webp' % (en, i)
            out_src = 'images/%s/%s' % (en, out_name)
            out_path = os.path.join(IMG_DIR, en, out_name)

            # 用输出文件名匹配已有记录（稳定），其次用源文件名匹配
            old = by_src.get(out_name.lower()) or by_src.get(fn.lower())
            if old:
                code = old['code'] or next_code(used_codes, used_codes)
                upload = old['uploadDate'] or TODAY
                title = old['title'] or os.path.splitext(fn)[0]
                year = old['year'] or '2025'
                meta = old['meta'] or DEFAULT_META[en]
                tag = '保留'
            else:
                code = next_code(used_codes, used_codes)
                upload = TODAY
                title = os.path.splitext(fn)[0]
                year = '2025'
                meta = DEFAULT_META[en]
                tag = '新增'
                added += 1
            size_before = os.path.getsize(os.path.join(src_folder, fn)) // 1024

            if not dry:
                im = Image.open(os.path.join(src_folder, fn)).convert('RGB')
                im.thumbnail((MAX_WIDTH, MAX_WIDTH), Image.LANCZOS)
                im.save(out_path, 'WEBP', quality=QUALITY, method=6)
                size_after = os.path.getsize(out_path) // 1024
            else:
                size_after = '?'

            print('   %-21s -> %-20s %s %s->%sKB  [%s %s %s]' % (
                fn[:21], out_name, code, size_before, size_after, tag, upload, title))
            new_lines.append(
                "  { code: '%s', uploadDate: '%s', id: '%s%d', category: '%s', title: '%s', year: '%s', meta: '%s', src: '%s' }"
                % (code, upload, en[0], i, en, title, year, meta, out_src)
            )
            total += 1
        print()

    new_lines.append('];')
    new_block = '\n'.join(new_lines)

    if total == 0:
        print('没有找到任何照片，未做改动。')
        return

    updated = re.sub(r'const works = \[.*?\n\];', lambda _: new_block, content, count=1, flags=re.S)

    if dry:
        print('预览完成：共 %d 张，新增 %d 张，新增上传日期为 %s。' % (total, added, TODAY))
        print('正式运行：python update_images.py')
        return

    shutil.copyfile(DATA_FILE, DATA_FILE + '.bak')
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(updated)
    print('=' * 60)
    print('更新完成：%d 张作品（新增 %d 张，日期 %s）。' % (total, added, TODAY))
    print('原配置已备份为 js/data.js.bak')
    print('提示：轮播由 data.js 中的 heroCodes 按编号指定，可自由调整。')


if __name__ == '__main__':
    main()
