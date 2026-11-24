/* ============================================================
 *  作品数据配置 —— 只需要修改这个文件，就能管理你的作品
 * ------------------------------------------------------------
 *  字段说明：
 *  - code       照片编号（全局唯一，如 MYX-001）。轮播靠它指定照片
 *  - uploadDate 上传日期（YYYY-MM-DD）。"全部作品"按此日期排序，越新越靠前
 *  - category   分类：portrait / landscape / architecture / documentary
 *  - title/meta/year/src  标题、说明、年份、图片路径
 *
 *  怎么用：
 *  1. 换照片：把图片放进 images/ 对应文件夹，改 src 路径
 *  2. 调整排序：改 uploadDate，日期越新展示越靠前
 *  3. 指定轮播：在 heroCodes 里填想展示的照片编号（见下方）
 *  4. 也可以用 update_images.py 脚本批量更新（会自动保留编号/日期）
 * ============================================================ */

// 站点基本信息
const SITE = {
  name: 'MyX',
  nameMain: 'My',      // 字标主体：现代无衬线
  nameAccent: 'X',     // 字标焦点：衬线斜体，放大的设计字母
  nameCn: '林间影像',
  tagline: '以一双发现美的眼睛，收藏光影与情绪的相遇',
  author: 'Photography',
  email: 'xuyb2009@gmail.com',

  // —— 关于区 ——
  aboutTitle: '关于我',
  aboutLead: '白天理顺系统，傍晚等一束光',
  intro: [
    '我是一名 IT 从业者，日常工作做数字化咨询与转型落地。说白了，就是陪企业把散落的流程、数据和协作方式重新梳理清楚，让管理少一点内耗、多一点确定性。这份工作训练了我两件事：把复杂拆成结构，以及在一堆细节里认出真正关键的那一个。',
    '下班之后，我换另一种方式做差不多的事——带上相机，把生活里那些一闪而过、本来不会被记录的瞬间留下来。窗边斜进来的光、路口刚好错开的两个人、雨后路面的一小块反光。它们不解决任何问题，却常常比一份漂亮的方案更让人愿意停下来。',
    '咨询交付的是「更顺的运行」，摄影留下的是「没被优化掉的时刻」。一个向内收拢，一个向外敞开；一个追求可复用，一个只发生一次。两者放在一起，刚好是我比较舒服的节奏。',
    '这个站点不打算做成规整的作品陈列，更像一本公开的随身笔记：不定期放几张我自己看得顺眼的照片，偶尔写两句当时为什么按了快门。没有选题计划，也不追热点，只保留真实看过的东西。',
    '如果你也刚好在某个寻常时刻停了一下，那我们大概算是同一类人。随便逛逛就好。'
  ],

  // —— 页脚联系区：引导语在上，邮箱在下 ——
  contactLead: '照片转载、约拍，或单纯想聊聊当时那束光，都可以写到这里！',
  copyright: '© 2026 MyX. All rights reserved.'
};

// ============================================================
//  首页轮播指定：填写想展示的照片编号（来自 works 的 code）
//  - 顺序即轮播顺序；编号必须在 works 中存在，否则自动跳过
//  - 想展示哪几张、按什么顺序，改这个数组即可，无需动图片文件
// ============================================================
const heroCodes = [
  'MYX-006',  // 闭眼听秋
  'MYX-011',  // 粉叶如霞
  'MYX-001',  // 秋日笑靥
  'MYX-010',  // 秋色朦胧
  'MYX-004'   // 深嗅秋香
];

// 作品列表（来自 D:/工作区/个人摄影作品 的真实素材）
// "全部作品"按 uploadDate 降序展示；同日按 code 降序（编号越大越新）
const works = [
  // ---------- 人像 ----------
  { code: 'MYX-001', uploadDate: '2026-11-12', id: 'p1', category: 'portrait', title: '秋日笑靥', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-01.webp' },
  { code: 'MYX-002', uploadDate: '2026-11-12', id: 'p2', category: 'portrait', title: '林间回望', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-02.webp' },
  { code: 'MYX-003', uploadDate: '2026-11-12', id: 'p3', category: 'portrait', title: '仰望秋空', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-03.webp' },
  { code: 'MYX-004', uploadDate: '2026-11-15', id: 'p4', category: 'portrait', title: '深嗅秋香', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-04.webp' },
  { code: 'MYX-005', uploadDate: '2026-11-15', id: 'p5', category: 'portrait', title: '秋色欢颜', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-05.webp' },
  { code: 'MYX-006', uploadDate: '2026-11-18', id: 'p6', category: 'portrait', title: '闭眼听秋', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-06.webp' },
  { code: 'MYX-007', uploadDate: '2026-11-18', id: 'p7', category: 'portrait', title: '一叶知秋', year: '2025', meta: '秋日写真', src: 'images/portrait/portrait-07.webp' },

  // ---------- 风光 ----------
  { code: 'MYX-008', uploadDate: '2026-11-12', id: 'l1', category: 'landscape', title: '霜叶红', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-01.webp' },
  { code: 'MYX-009', uploadDate: '2026-11-12', id: 'l2', category: 'landscape', title: '枫影斑驳', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-02.webp' },
  { code: 'MYX-010', uploadDate: '2026-11-15', id: 'l3', category: 'landscape', title: '秋色朦胧', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-03.webp' },
  { code: 'MYX-011', uploadDate: '2026-11-15', id: 'l4', category: 'landscape', title: '粉叶如霞', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-04.webp' },
  { code: 'MYX-012', uploadDate: '2026-11-18', id: 'l5', category: 'landscape', title: '深红印象', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-05.webp' },
  { code: 'MYX-013', uploadDate: '2026-11-18', id: 'l6', category: 'landscape', title: '枫红点点', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-06.webp' },
  { code: 'MYX-014', uploadDate: '2026-11-18', id: 'l7', category: 'landscape', title: '叶落无声', year: '2025', meta: '秋色 · 自然光影', src: 'images/landscape/landscape-07.webp' }
];

// 分类定义（顺序即筛选栏显示顺序）
// 注：architecture（建筑）与 documentary（人文）暂无素材，点击时显示"筹备中"占位
const categories = [
  { key: 'all',          label: '全部作品', en: 'All' },
  { key: 'portrait',     label: '人像', en: 'Portrait' },
  { key: 'landscape',    label: '风光', en: 'Landscape' },
  { key: 'architecture', label: '建筑', en: 'Architecture' },
  { key: 'documentary',  label: '人文', en: 'Documentary' }
];
