// Brandon Fonville Creative Studio — new-studio
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Ambient mouse light: updates --mx / --my for body::before spotlight
(function initAmbientLight() {
  const rootEl = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  rootEl.style.setProperty("--mx", "50%");
  rootEl.style.setProperty("--my", "32%");

  let raf = 0;
  let nextX = 50;
  let nextY = 32;

  const onMove = (e) => {
    if (reduceMotion.matches) return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    nextX = (e.clientX / w) * 100;
    nextY = (e.clientY / h) * 100;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      rootEl.style.setProperty("--mx", `${nextX.toFixed(2)}%`);
      rootEl.style.setProperty("--my", `${nextY.toFixed(2)}%`);
      raf = 0;
    });
  };

  window.addEventListener("pointermove", onMove, { passive: true });
})();

// Theme
const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const storedTheme = localStorage.getItem("bfc-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
if (initialTheme === "dark") root.setAttribute("data-theme", "dark");
else root.removeAttribute("data-theme");

themeBtn?.addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";
  if (isDark) {
    root.removeAttribute("data-theme");
    localStorage.setItem("bfc-theme", "light");
  } else {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("bfc-theme", "dark");
  }
});

// Fullscreen menu
const menu = document.getElementById("siteMenu");
const menuToggle = document.getElementById("menuToggle");
const menuPanel = menu?.querySelector(".menu-panel");
const menuInner = menu?.querySelector(".menu-inner");
const menuBottom = menu?.querySelector(".menu-bottom");
const menuBottomTrack = menu?.querySelector(".menu-bottom-track");

/**
 * Uniformly scale the content-sized menu composition to fit the viewport.
 * Absolute centering (left/top 50% + translate -50%) keeps the unit on-page.
 * Horizontal motion stays inside `.menu-bottom` only — never widens the page.
 */
function menuIsMobileLayout() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function fitMenuToViewport() {
  if (!menu || !menuPanel || !menuInner) return;

  // Mobile uses a normal document flow stack — clear desktop fit inline styles.
  if (menuIsMobileLayout()) {
    menuInner.style.setProperty("--menu-scale", "1");
    menuInner.style.top = "";
    menuInner.style.transform = "";
    if (menuBottom) {
      menuBottom.style.width = "";
      menuBottom.style.minWidth = "";
    }
    resetMenuBottomScroll(true);
    return;
  }

  menuInner.style.setProperty("--menu-scale", "1");
  menuInner.style.top = "46%";
  if (menuBottom) {
    menuBottom.style.width = "";
    menuBottom.style.minWidth = "";
  }

  const availW = menuPanel.clientWidth;
  const panelH = menuPanel.clientHeight;
  if (availW < 80 || panelH < 80) return;

  const chromeH = menu.querySelector(".menu-chrome")?.offsetHeight || 56;
  const bottomH = menuBottom?.offsetHeight || 0;
  const availH = Math.max(panelH - chromeH - bottomH - 24, 120);

  const center = menuInner.querySelector(".menu-center");
  const stageW = Math.max(center?.scrollWidth || 0, menuInner.scrollWidth || 0, 1);
  const stageH = Math.max(menuInner.scrollHeight, menuInner.offsetHeight, 1);

  let scale = Math.min(availW / stageW, availH / stageH, 1);
  if (!Number.isFinite(scale) || scale <= 0) scale = 1;
  if (scale < 1) scale *= 0.92;
  else scale = Math.min(scale, 0.98);
  scale = Math.floor(scale * 1000) / 1000;
  menuInner.style.setProperty("--menu-scale", String(scale));

  // Fit only — do not auto-scroll to `.is-current` (that stuck the strip on reopen).
  // Open / mouseleave own the left-edge reset.
}

function scheduleMenuFit() {
  requestAnimationFrame(() => {
    fitMenuToViewport();
    requestAnimationFrame(fitMenuToViewport);
  });
}

function menuBottomCanScroll() {
  return Boolean(
    menuBottom &&
      menuBottomTrack &&
      window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 721px)").matches
  );
}

function menuBottomClampX(x) {
  if (!menuBottom || !menuBottomTrack) return 0;
  const bw = menuBottom.clientWidth;
  const tw = menuBottomTrack.scrollWidth;
  if (bw < 8 || tw < 8) return 0;
  // maxX = 0 (full left); minX = bw - tw (full right / last item flush).
  const minX = Math.min(0, bw - tw);
  const maxX = 0;
  return Math.min(maxX, Math.max(minX, x));
}

function setMenuBottomX(x, instant) {
  if (!menuBottomTrack) return;
  const clamped = menuBottomClampX(x);
  if (instant) {
    const prev = menuBottomTrack.style.transition;
    menuBottomTrack.style.transition = "none";
    menuBottomTrack.style.setProperty("--menu-bottom-x", `${clamped}px`);
    // Force reflow so the next transition animates from this value.
    void menuBottomTrack.offsetWidth;
    menuBottomTrack.style.transition = prev || "";
  } else {
    menuBottomTrack.style.setProperty("--menu-bottom-x", `${clamped}px`);
  }
}

function resetMenuBottomScroll(instant) {
  setMenuBottomX(0, instant);
}

function focusMenuBottomPage(page, instant) {
  if (!menuBottomCanScroll() || !page) return;
  const bw = menuBottom.clientWidth;
  const tw = menuBottomTrack.scrollWidth;
  if (bw < 8 || tw < 8) return;

  const pad = 16;
  const pageLeft = page.offsetLeft;
  const pageWidth = page.offsetWidth;
  const pageRight = pageLeft + pageWidth;
  const pageCenter = pageLeft + pageWidth / 2;

  const pages = [...menuBottomTrack.querySelectorAll(".menu-page")];
  const isLast = pages[pages.length - 1] === page;

  // Last title (“Start a Project”): flush the track end so the full phrase shows.
  if (isLast && tw > bw) {
    setMenuBottomX(bw - tw, instant);
    return;
  }

  // Prefer centering the hovered title in the strip.
  let x = bw / 2 - pageCenter;

  // Keep the full label in view when it fits.
  if (pageWidth <= bw - pad * 2) {
    const minXForPage = bw - pad - pageRight;
    const maxXForPage = pad - pageLeft;
    x = Math.min(maxXForPage, Math.max(minXForPage, x));
  } else {
    // Label wider than strip: pin its start into view.
    x = pad - pageLeft;
  }

  // Clamp via setMenuBottomX (allows x=0 full left and full right for last item).
  setMenuBottomX(x, instant);
}

function initMenuBottomScroll() {
  if (!menuBottom || !menuBottomTrack) return;

  menuBottomTrack.querySelectorAll(".menu-page").forEach((page) => {
    page.addEventListener("mouseenter", () => focusMenuBottomPage(page, false));
    page.addEventListener("focus", () => focusMenuBottomPage(page, false));
  });

  // Leave the strip → return to the left edge (Home), not the current page.
  menuBottom.addEventListener("mouseleave", () => resetMenuBottomScroll(false));
}

function openMenu() {
  if (!menu || !menuToggle) return;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("menu-open");
  document.body.classList.add("menu-open");
  resetMenuBottomScroll(true);
  scheduleMenuFit();
}
function closeMenu() {
  if (!menu || !menuToggle) return;
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  menuInner?.style.setProperty("--menu-scale", "1");
  if (menuInner) {
    menuInner.style.top = "";
    menuInner.style.transform = "";
  }
  if (menuBottom) {
    menuBottom.style.width = "";
    menuBottom.style.minWidth = "";
  }
  resetMenuBottomScroll(true);
}
menuToggle?.addEventListener("click", () => {
  if (menu?.classList.contains("is-open")) closeMenu();
  else openMenu();
});
menu?.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", closeMenu));
menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.classList.contains("is-open")) closeMenu();
});
window.addEventListener("resize", () => {
  if (menu?.classList.contains("is-open")) scheduleMenuFit();
});
if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    if (menu?.classList.contains("is-open")) scheduleMenuFit();
  });
}
initMenuBottomScroll();

// Home entrance + project flipper
const home = document.querySelector(".home");
if (home) {
  requestAnimationFrame(() => {
    home.classList.add("is-ready");
    document.documentElement.classList.add("home-ready");
  });
}

/**
 * Nudge the CSS-sized wordmark to the brand measure via scale.
 * CSS already sizes from 100cqw / 6.05 (Bebas metrics); this only
 * corrects subpixel / font-swap drift and never overshoots width.
 */
function fitHomeBrandName() {
  const wrap = document.querySelector(".home-brand-name");
  const text = document.querySelector(".home-brand-name-text");
  const brand = document.querySelector(".home-brand");
  if (!wrap || !text || !brand) return;

  const available = wrap.clientWidth || brand.clientWidth;
  if (available < 40) return;

  // Reset scale to measure natural CSS size.
  brand.style.setProperty("--brand-scale", "1");
  text.style.fontSize = "";

  const widthOf = () => {
    const range = document.createRange();
    range.selectNodeContents(text);
    const rects = range.getClientRects();
    let w = 0;
    for (let i = 0; i < rects.length; i++) w = Math.max(w, rects[i].width);
    return w || text.scrollWidth || text.getBoundingClientRect().width;
  };

  const natural = widthOf();
  if (!natural) return;

  // Fill the measure; never exceed available (prevents Chrome clip).
  let scale = available / natural;
  if (!Number.isFinite(scale) || scale <= 0) scale = 1;
  // Allow tiny upscale from the conservative 6.05em CSS; clamp hard.
  scale = Math.min(Math.max(scale, 0.85), 1.02);
  if (natural * scale > available) scale = available / natural;

  brand.style.setProperty("--brand-scale", String(Math.floor(scale * 1000) / 1000));
}

function initHomeBrandFit() {
  if (!document.querySelector(".home-brand-name-text")) return;
  let scheduled = false;
  const run = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fitHomeBrandName();
    });
  };
  const afterFonts = async () => {
    try {
      if (document.fonts?.load) {
        await document.fonts.load('1em "Bebas Neue"');
        await document.fonts.load('700 1em "Bebas Neue"');
      }
      if (document.fonts?.ready) await document.fonts.ready;
    } catch (_) { /* fall through */ }
    run();
    // Late swap / cached font paint
    requestAnimationFrame(run);
    setTimeout(run, 120);
    setTimeout(run, 400);
  };
  afterFonts();
  if (document.fonts?.addEventListener) {
    document.fonts.addEventListener("loadingdone", run);
  }
  window.addEventListener("resize", run, { passive: true });
  window.addEventListener("orientationchange", run, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const brand = document.querySelector(".home-brand");
    if (brand) new ResizeObserver(run).observe(brand);
  }
}
initHomeBrandFit();
window.fitHomeBrandName = fitHomeBrandName;

const FLIPPER_PROJECTS = [
  { id: "maxeimus", title: "Maxeimus", tag: "Identity" },
  { id: "scopesignal", title: "ScopeSignal", tag: "Product" },
  { id: "tradeverified", title: "TradeVerified", tag: "Product" },
  { id: "knightsplay", title: "Knights Play", tag: "Wayfinding" },
  { id: "ashfordvale", title: "Ashford Vale", tag: "Web" },
  { id: "harborglobal", title: "Harbor Global", tag: "Web" },
];

function initHomeFlipper() {
  const titleEl = document.getElementById("flipperTitle");
  const tagEl = document.getElementById("flipperTag");
  const indexEl = document.getElementById("flipperIndex");
  const works = document.querySelector(".home-works");
  if (!titleEl || !works) return;

  const railIsScrollable = () => window.matchMedia("(max-width: 1100px)").matches;
  const items = [...works.querySelectorAll(".home-work")];
  let i = 0;
  let pauseUntil = 0;
  let scrollSyncing = false;

  const scrollActiveIntoView = (idx, behavior = "smooth") => {
    if (!railIsScrollable()) return;
    const p = FLIPPER_PROJECTS[idx];
    const el = items.find((node) => node.getAttribute("data-project") === p.id);
    if (!el) return;
    scrollSyncing = true;
    const target =
      el.offsetLeft - (works.clientWidth - el.offsetWidth) / 2;
    works.scrollTo({ left: Math.max(0, target), behavior });
    window.setTimeout(() => {
      scrollSyncing = false;
    }, behavior === "smooth" ? 420 : 80);
  };

  const setActive = (idx, { fromScroll = false, scrollIntoView = true } = {}) => {
    i = ((idx % FLIPPER_PROJECTS.length) + FLIPPER_PROJECTS.length) % FLIPPER_PROJECTS.length;
    const p = FLIPPER_PROJECTS[i];
    const num = String(i + 1).padStart(3, "0");
    titleEl.textContent = p.title;
    if (tagEl) tagEl.textContent = p.tag;
    if (indexEl) indexEl.textContent = `0 ( ${num} ) 0`;
    works.classList.add("is-dimming");
    items.forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-project") === p.id);
    });
    if (!fromScroll && scrollIntoView) scrollActiveIntoView(i);
  };

  const nearestIndex = () => {
    const center = works.scrollLeft + works.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((el) => {
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        const id = el.getAttribute("data-project");
        const idx = FLIPPER_PROJECTS.findIndex((p) => p.id === id);
        if (idx >= 0) best = idx;
      }
    });
    return best;
  };

  setActive(0, { scrollIntoView: false });
  requestAnimationFrame(() => scrollActiveIntoView(0, "auto"));

  setInterval(() => {
    if (Date.now() < pauseUntil) return;
    setActive(i + 1);
  }, 2800);

  items.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (railIsScrollable() && window.matchMedia("(hover: none)").matches) return;
      const id = el.getAttribute("data-project");
      const idx = FLIPPER_PROJECTS.findIndex((p) => p.id === id);
      if (idx >= 0) {
        pauseUntil = Date.now() + 4000;
        setActive(idx, { scrollIntoView: false });
      }
    });
  });

  let scrollTick = false;
  works.addEventListener(
    "scroll",
    () => {
      if (!railIsScrollable() || scrollSyncing) return;
      pauseUntil = Date.now() + 4500;
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        scrollTick = false;
        const idx = nearestIndex();
        if (idx !== i) setActive(idx, { fromScroll: true });
      });
    },
    { passive: true }
  );

  works.addEventListener(
    "pointerdown",
    () => {
      if (railIsScrollable()) pauseUntil = Date.now() + 4500;
    },
    { passive: true }
  );
}
initHomeFlipper();

// Contact form
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const packageSelect = document.getElementById("package");

(function preselectPackageFromQuery() {
  if (!packageSelect) return;
  try {
    const wanted = new URLSearchParams(window.location.search).get("package");
    if (!wanted) return;
    const match = [...packageSelect.options].find(
      (opt) => opt.value === wanted || opt.textContent === wanted
    );
    if (match) packageSelect.value = match.value;
  } catch (_) {
    /* ignore */
  }
})();

function setStatus(message, kind) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "form-status" + (kind ? " " + kind : "");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.querySelector('[name="_gotcha"]')?.value) return;
  setStatus("Sending…", "pending");
  if (submitBtn) submitBtn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      form.reset();
      setStatus("Thanks! Your project request has been sent. I'll be in touch shortly.", "success");
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = data?.errors?.map((x) => x.message).join(", ");
      setStatus(msg || "Something went wrong. Please email me directly instead.", "error");
    }
  } catch (err) {
    setStatus("Network error. Please try again or email me directly.", "error");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});
function revealInView() {
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
      el.classList.add("in");
      io.unobserve(el);
    }
  });
}
revealInView();
window.addEventListener("load", revealInView);

// Portfolio (works page)
let caseStudies = {};
const workProjectsEl = document.getElementById("workProjects");

const WORK_PREVIEWS = {
  tradeverified: { src: "assets/work/tv-landing.png", caption: "TradeVerified, Product" },
  scopesignal: { src: "assets/work/ss-demo.png", caption: "ScopeSignal, Product" },
  maxeimus: { src: "assets/work/work-identity.png", caption: "Maxeimus, Identity" },
  bcm: { src: "assets/work/bcm-crest.png", caption: "Blue Collar Millionaire, Mark" },
  knightsplay: { src: "assets/work/kp-wayfinding.png", caption: "Knights Play, Wayfinding" },
  ashfordvale: { src: "assets/work/av-home.png", caption: "Ashford Vale, Web" },
  harborglobal: { src: "assets/work/hg-home.png", caption: "Harbor Global, Web" },
  saltmarsh: { src: "assets/work/sm-home.png", caption: "Saltmarsh · Product Launch" },
};

function initPortfolio() {
  if (typeof WorkStore === "undefined") return;
  let data = WorkStore.load();
  const missing = WorkStore.getMissingProjectIds(data);
  if (missing.length) {
    missing.forEach((id) => {
      data = WorkStore.restoreProject(data, id);
    });
    WorkStore.save(data);
  }
  caseStudies = WorkStore.buildCaseStudies(data.projects);
  if (workProjectsEl) {
    WorkStore.renderWorkSection(workProjectsEl, data.projects);
    bindCaseStudyTriggers();
    observeReveals(workProjectsEl);
  }
  initWorkIndex(data.projects);
}

function initWorkIndex(projects) {
  const listEl = document.getElementById("workIndexList");
  const previewEl = document.getElementById("workIndexPreview");
  const imgEl = document.getElementById("workIndexImg");
  const captionEl = document.getElementById("workIndexCaption");
  if (!listEl || !previewEl || !imgEl) return;

  const items = projects.map((p, i) => {
    const preview = WORK_PREVIEWS[p.id] || {
      src: (p.items && p.items[0] && p.items[0].src) || "",
      caption: [p.title, p.tag].filter(Boolean).join(", "),
    };
    const num = String(i + 1).padStart(2, "0");
    return { id: p.id, title: p.title, tag: p.tag || "", preview, num };
  });

  listEl.innerHTML = items
    .map(
      (item) => `
      <button type="button" class="work-index__item" role="listitem" data-project="${item.id}" data-src="${item.preview.src}" data-caption="${item.preview.caption}">
        <span class="work-index__num">${item.num}</span>
        <span class="work-index__title">${item.title}</span>
        <span class="work-index__meta">${item.tag}</span>
      </button>`
    )
    .join("");

  const indexRoot = document.getElementById("workIndex");
  let activeBtn = null;

  const showPreview = (btn) => {
    if (!btn) return;
    const src = btn.getAttribute("data-src");
    const caption = btn.getAttribute("data-caption") || "";
    if (!src) return;
    if (imgEl.getAttribute("src") !== src) {
      imgEl.style.opacity = "0";
      imgEl.onload = () => { imgEl.style.opacity = ""; };
      imgEl.src = src;
    }
    if (captionEl) captionEl.textContent = caption;
    previewEl.classList.add("is-live");
    indexRoot?.classList.add("is-hovering");
    listEl.querySelectorAll(".work-index__item").forEach((el) => el.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeBtn = btn;
  };

  listEl.querySelectorAll(".work-index__item").forEach((btn) => {
    btn.addEventListener("mouseenter", () => showPreview(btn));
    btn.addEventListener("focus", () => showPreview(btn));
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-project");
      if (id) openCaseStudy(id);
    });
  });

  indexRoot?.addEventListener("mouseleave", () => {
    indexRoot.classList.remove("is-hovering");
    if (activeBtn) activeBtn.classList.add("is-active");
  });

  if (items[0]) showPreview(listEl.querySelector(".work-index__item"));
}

function observeReveals(container) {
  if (!container) return;
  container.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });
  revealInView();
}

const caseModal = document.getElementById("caseModal");
const caseEls = {
  eyebrow: document.getElementById("caseEyebrow"),
  title: document.getElementById("caseTitle"),
  sub: document.getElementById("caseSub"),
  facts: document.getElementById("caseFacts"),
  gallery: document.getElementById("caseGallery"),
  overview: document.getElementById("caseOverview"),
  outcome: document.getElementById("caseOutcome"),
};
let lastFocused = null;

function getProjectDeepLinkId() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("project");
    if (fromQuery && caseStudies[fromQuery]) return fromQuery;
  } catch (_) { /* ignore */ }
  const hash = (window.location.hash || "").replace(/^#/, "").trim();
  if (hash && caseStudies[hash]) return hash;
  return null;
}

function syncCaseStudyDeepLink(id) {
  if (!caseModal) return;
  const path = window.location.pathname;
  let search = window.location.search;
  try {
    const params = new URLSearchParams(search);
    if (params.has("project")) {
      params.delete("project");
      const next = params.toString();
      search = next ? `?${next}` : "";
    }
  } catch (_) { /* ignore */ }
  const next = id ? `${path}${search}#${id}` : `${path}${search}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current !== next) history.replaceState(null, "", next);
}

function openCaseStudy(id) {
  const data = caseStudies[id];
  if (!data || !caseModal) return;
  caseEls.eyebrow.textContent = data.eyebrow;
  caseEls.title.textContent = data.title;
  caseEls.sub.textContent = data.sub;
  caseEls.facts.innerHTML = data.facts
    .map((f) => `<li><strong>${f.label}:</strong> ${f.value}</li>`)
    .join("");
  caseEls.gallery.innerHTML = data.images
    .map(
      (img) =>
        `<figure><img src="${img.src}" alt="${data.title}: ${img.caption}" loading="lazy" /><figcaption>${img.caption}</figcaption></figure>`
    )
    .join("");
  caseEls.overview.textContent = data.overview;
  caseEls.outcome.textContent = data.outcome;
  lastFocused = document.activeElement;
  caseModal.classList.add("open");
  caseModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  caseModal.querySelector(".case-modal-close")?.focus();
  caseModal.querySelector(".case-modal-scroll").scrollTop = 0;
  syncCaseStudyDeepLink(id);
}

function closeCaseStudy() {
  if (!caseModal) return;
  caseModal.classList.remove("open");
  caseModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (getProjectDeepLinkId()) syncCaseStudyDeepLink(null);
  if (lastFocused) lastFocused.focus();
}

window.openCaseStudy = openCaseStudy;

function bindCaseStudyTriggers() {
  workProjectsEl?.addEventListener("click", (e) => {
    const group = e.target.closest(".work-group[data-project]");
    if (!group) return;
    const clicked = e.target.closest(".work-item, .case-study-btn");
    if (!clicked) return;
    openCaseStudy(group.getAttribute("data-project"));
  });
}

function openCaseStudyFromLocation() {
  const id = getProjectDeepLinkId();
  if (id) openCaseStudy(id);
}

initPortfolio();
openCaseStudyFromLocation();

window.addEventListener("hashchange", () => {
  if (!caseModal) return;
  const id = getProjectDeepLinkId();
  if (id) openCaseStudy(id);
  else if (caseModal.classList.contains("open")) closeCaseStudy();
});

caseModal?.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeCaseStudy)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && caseModal?.classList.contains("open")) closeCaseStudy();
});
