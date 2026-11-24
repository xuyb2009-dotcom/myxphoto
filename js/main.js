/* ============================================================
 *  MyX · 交互逻辑（零依赖，纯原生 JS）
 *  包含：Hero 轮播 / 分类筛选 / 作品网格 / 灯箱 / 滚动动画 / 导航
 * ============================================================ */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- 站点信息填充 ---------- */
  function fillSiteInfo() {
    // 品牌字标：My（无衬线主体） + X（衬线斜体焦点）
    $('#brandMain').textContent = SITE.nameMain;
    $('#brandX').textContent = SITE.nameAccent;
    $('#footerMain').textContent = SITE.nameMain;
    $('#footerX').textContent = SITE.nameAccent;
    document.title = SITE.name + ' · 个人摄影作品集';
    $('#worksIntro').textContent = SITE.tagline;
    $('#aboutTitle').textContent = SITE.aboutTitle || '关于我';
    $('#aboutLead').textContent = SITE.aboutLead || '';
    // 正文支持数组（多段）或单段字符串
    const intro = Array.isArray(SITE.intro) ? SITE.intro : [SITE.intro];
    $('#aboutText').innerHTML = intro.map((p) => '<p>' + p + '</p>').join('');
    $('#footerLead').textContent = SITE.contactLead || '';
    $('#footerCopy').textContent = SITE.copyright;
    const mail = $('#footerEmail');
    mail.href = 'mailto:' + SITE.email;
    mail.textContent = SITE.email;
  }

  /* ============================================================
   *  Hero 轮播（淡入淡出 + 进度指示器）
   * ============================================================ */
  let heroIndex = 0;
  let heroTimer = null;
  let heroSlides = [];
  const HERO_INTERVAL = 5500;

  // 按上传日期排序：日期越新越靠前；同一天按编号越大越靠前
  function sortByUpload(a, b) {
    const da = a.uploadDate || '';
    const db = b.uploadDate || '';
    if (da !== db) return db.localeCompare(da);
    return (b.code || '').localeCompare(a.code || '');
  }

  // 从作品库按编号列表解析轮播照片（heroCodes 在 data.js 中指定）
  function resolveHeroSlides() {
    const byCode = new Map(works.map((w) => [w.code, w]));
    const toSlide = (w) => ({
      src: w.src,
      title: w.title,
      subtitle: catLabel(w.category) + ' · ' + (categories.find((c) => c.key === w.category)?.en || ''),
      kicker: w.code + ' · Featured',
      code: w.code
    });
    heroSlides = (typeof heroCodes !== 'undefined' ? heroCodes : [])
      .map((code) => byCode.get(code))
      .filter(Boolean)
      .map(toSlide);
    // 若编号全部无效，回退到最近上传的前 5 张，保证轮播不空
    if (!heroSlides.length) {
      heroSlides = works.slice().sort(sortByUpload).slice(0, 5).map(toSlide);
    }
  }

  function buildHero() {
    resolveHeroSlides();
    const slidesBox = $('#heroSlides');
    const dotsBox = $('#heroDots');
    heroSlides.forEach((slide, i) => {
      const s = document.createElement('div');
      s.className = 'hero__slide' + (i === 0 ? ' is-active' : '');
      s.innerHTML = '<img src="' + slide.src + '" alt="' + slide.title + '"' + (i > 1 ? ' loading="lazy"' : '') + '>';
      slidesBox.appendChild(s);

      const dot = document.createElement('button');
      dot.className = 'hero__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
      dot.addEventListener('click', () => goHero(i));
      dotsBox.appendChild(dot);
    });
    showHeroText(0);
    startHero();
  }

  function showHeroText(i) {
    const content = $('.hero__content');
    content.classList.add('is-changing');
    setTimeout(() => {
      const slide = heroSlides[i];
      $('#heroKicker').textContent = slide.kicker;
      $('#heroTitle').textContent = slide.title;
      $('#heroSubtitle').textContent = slide.subtitle;
      content.classList.remove('is-changing');
    }, 380);
  }

  function goHero(i) {
    const slides = $$('.hero__slide');
    const dots = $$('.hero__dot');
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === heroIndex));
    dots.forEach((d, idx) => {
      d.classList.toggle('is-active', idx === heroIndex);
      d.style.animation = 'none';
      void d.offsetWidth;
      d.style.animation = '';
    });
    showHeroText(heroIndex);
    restartHero();
  }

  function startHero() {
    heroTimer = setInterval(() => goHero(heroIndex + 1), HERO_INTERVAL);
  }
  function restartHero() {
    clearInterval(heroTimer);
    startHero();
  }

  /* ============================================================
   *  分类筛选 + 作品网格
   * ============================================================ */
  let currentCategory = 'all';
  let visibleWorks = [];

  function catLabel(key) {
    const c = categories.find((x) => x.key === key);
    return c ? c.label : key;
  }

  function buildFilter() {
    const box = $('#filter');
    categories.forEach((cat) => {
      const count = cat.key === 'all' ? works.length : works.filter((w) => w.category === cat.key).length;
      const btn = document.createElement('button');
      btn.className = 'filter__btn' + (cat.key === 'all' ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.dataset.cat = cat.key;
      btn.innerHTML = cat.label + '<small>' + count + '</small>';
      btn.addEventListener('click', () => {
        currentCategory = cat.key;
        $$('.filter__btn').forEach((b) => b.classList.toggle('is-active', b === btn));
        renderGallery();
      });
      box.appendChild(btn);
    });
  }

  function renderGallery() {
    const box = $('#gallery');
    box.innerHTML = '';
    visibleWorks = (currentCategory === 'all'
      ? works.slice()
      : works.filter((w) => w.category === currentCategory)
    ).sort(sortByUpload);

    if (!visibleWorks.length) {
      const label = catLabel(currentCategory);
      box.innerHTML =
        '<div class="gallery__empty">' +
          '<div class="gallery__empty-mark">' + label + '</div>' +
          '<p class="gallery__empty-en">' + (categories.find(c => c.key === currentCategory)?.en || '') + '</p>' +
          '<p class="gallery__empty-text">作品筹备中，敬请期待</p>' +
        '</div>';
      return;
    }

    visibleWorks.forEach((w, i) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.style.animationDelay = Math.min(i * 60, 480) + 'ms';
      card.dataset.index = i;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', '查看作品：' + w.title);
      card.innerHTML =
        '<img class="card__img" src="' + w.src + '" alt="' + w.title + '" loading="lazy">' +
        (w.code ? '<span class="card__code">' + w.code + '</span>' : '') +
        '<span class="card__zoom">&#43;</span>' +
        '<div class="card__overlay">' +
          '<span class="card__cat">' + catLabel(w.category) + (w.uploadDate ? ' &nbsp;·&nbsp; ' + w.uploadDate : '') + '</span>' +
          '<h3 class="card__title">' + w.title + '</h3>' +
          '<p class="card__meta">' + w.year + ' &nbsp;·&nbsp; ' + w.meta + '</p>' +
        '</div>';
      card.addEventListener('click', () => openLightbox(i));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
      box.appendChild(card);
    });
  }

  /* ============================================================
   *  灯箱大图浏览
   * ============================================================ */
  let lbIndex = 0;
  const lightbox = $('#lightbox');

  function openLightbox(i) {
    lbIndex = i;
    updateLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function updateLightbox() {
    const w = visibleWorks[lbIndex];
    if (!w) return;
    const img = $('#lbImg');
    img.style.opacity = '0';
    img.onload = () => { img.style.transition = 'opacity .3s'; img.style.opacity = '1'; };
    img.src = w.src;
    img.alt = w.title;
    $('#lbTitle').textContent = w.title;
    $('#lbMeta').textContent =
      (w.code ? w.code + ' · ' : '') +
      catLabel(w.category) + ' · ' +
      (w.uploadDate ? w.uploadDate + ' · ' : '') +
      w.year + ' · ' + w.meta;
    $('#lbCount').textContent = (lbIndex + 1) + ' / ' + visibleWorks.length;
  }
  function stepLightbox(d) {
    lbIndex = (lbIndex + d + visibleWorks.length) % visibleWorks.length;
    updateLightbox();
  }

  /* ============================================================
   *  滚动显现动画 + 导航状态
   * ============================================================ */
  function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el) => observer.observe(el));
  }

  function setupHeader() {
    const header = $('#siteHeader');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function setupMobileMenu() {
    const toggle = $('#menuToggle');
    const menu = $('#mobileMenu');
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
    });
    $$('.mobile-menu__link').forEach((a) => a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ============================================================
   *  事件绑定
   * ============================================================ */
  function bindEvents() {
    $('#heroPrev').addEventListener('click', () => goHero(heroIndex - 1));
    $('#heroNext').addEventListener('click', () => goHero(heroIndex + 1));
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => stepLightbox(-1));
    $('#lbNext').addEventListener('click', () => stepLightbox(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    // 页面隐藏时暂停轮播，节省资源
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(heroTimer);
      else restartHero();
    });
  }

  /* ============================================================
   *  初始化
   * ============================================================ */
  function init() {
    fillSiteInfo();
    buildHero();
    buildFilter();
    renderGallery();
    setupReveal();
    setupHeader();
    setupMobileMenu();
    bindEvents();

    // 预加载首图后淡出遮罩
    const first = new Image();
    first.onload = first.onerror = () => {
      setTimeout(() => $('#loader').classList.add('is-hidden'), 250);
    };
    first.src = heroSlides[0].src;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
