// assets/js/pages/home/products-carousel.js

import { withAssetBase } from "../../core/paths.js";
import { LOG } from "../../core/logger.js";

const SCOPE = "home:products-carousel";
const SS_DEEPLINK = "genetia_product_deeplink";
const LS_HCP_VERIFIED = "genetia_hcp_verified";

const q = (sel, root = document) => root.querySelector(sel);

function storeDeeplinkFromQuery() {
  try {
    const url = new URL(window.location.href);
    const slug = url.searchParams.get("product");
    if (slug) sessionStorage.setItem(SS_DEEPLINK, slug);
  } catch (_) {}
}

function isHcpVerifiedLocal() {
  return localStorage.getItem(LS_HCP_VERIFIED) === "1";
}

function getProductsUrl() {
  // homepage -> /produkty/
  return "./produkty/";
}

import { getAssetBase } from "../../core/paths.js";

function redirectToProducts() {
  const base = getAssetBase(); // "" lokál, "/genetia-v2" na GH Pages
  window.location.href = `${base}/produkty/`;
}

function redirectToHome() {
  window.location.href = "./";
}

function normalizeProducts(data) {
  // supports both: array OR { products: [...] }
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : [];
  return arr
    .map((p) => ({
      slug: String(p.slug ?? p.id ?? "").trim(),
      name: String(p.name ?? p.title ?? "").trim(),
      ratio: String(p.ratio ?? "").trim(),
      image: String(p.image ?? p.preview ?? "").trim(),
    }))
    .filter((p) => p.slug && p.name);
}

function buildEyeIconSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" focusable="false">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
      <line x1="2" y1="2" x2="22" y2="22"></line>
    </svg>
  `;
}

function renderCarouselMarkup(mount, { titleText, leadText, ctaText }) {
  mount.innerHTML = `
    <div class="home-products__header">
      <h2 class="home-products__title">${titleText}</h2>
      <p class="home-products__lead">${leadText}</p>
    </div>

    <div class="home-products__stage" data-home-products-stage>
      <button class="home-products__arrow home-products__arrow--prev btn btn--ghost"
        type="button" aria-label="Předchozí produkt" data-carousel-prev></button>

      <ul class="home-products__list" aria-label="Produkty" role="list" data-carousel-list></ul>

      <button class="home-products__arrow home-products__arrow--next btn btn--ghost"
        type="button" aria-label="Další produkt" data-carousel-next></button>

      <div class="home-products__swipe" aria-hidden="true" data-carousel-swipe></div>

      <div class="home-products__lock carousel-lock" data-carousel-lock>
        <button class="home-products__eye btn btn--ghost" type="button"
          aria-label="Odemknout odborné informace" data-carousel-eye>
          ${buildEyeIconSvg()}
        </button>
      </div>
    </div>

    <div class="home-products__dots" role="tablist" aria-label="Přepnout produkt" data-carousel-dots></div>

    <div class="home-products__cta">
      <button class="btn btn--primary home-products__cta-btn" type="button" data-home-products-cta>
        ${ctaText}
      </button>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createItem(product) {
  const li = document.createElement("li");
  li.className = "home-products__item";
  li.dataset.slug = product.slug;

  const imgSrc =
    product.image && !/^https?:\/\//.test(product.image)
      ? withAssetBase(product.image)
      : product.image;

  li.innerHTML = `
    <article class="card home-product-card" aria-label="${escapeHtml(product.name)}">
      <div class="card__body home-product-card__body">
        <h3 class="home-product-card__title">${escapeHtml(product.name)}</h3>
        <div class="home-product-card__imageWrap" aria-hidden="true">
          ${
            imgSrc
              ? `<img class="home-product-card__image" src="${imgSrc}" alt="" loading="lazy" decoding="async">`
              : ""
          }
        </div>
        <p class="home-product-card__ratio"><span class="home-product-card__ratioLabel">Poměr:</span> ${escapeHtml(product.ratio || "—")}</p>
      </div>
    </article>
  `;
  return li;
}

function applyClasses(items) {
  items[0].className = "home-products__item hide";
  items[1].className = "home-products__item prev";
  items[2].className = "home-products__item act";
  items[3].className = "home-products__item next";
  items[4].className = "home-products__item new-next";
}

function renderDots(dotsEl, count) {
  dotsEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "home-products__dot";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Produkt ${i + 1}`);
    b.dataset.index = String(i);
    dotsEl.appendChild(b);
  }
}

function setActiveDot(dotsEl, idx) {
  const dots = Array.from(dotsEl.querySelectorAll(".home-products__dot"));
  dots.forEach((d, i) => {
    const active = i === idx;
    d.setAttribute("aria-selected", active ? "true" : "false");
    d.tabIndex = active ? 0 : -1;
    d.classList.toggle("is-active", active);
  });
}

function lockStage(stageEl) {
  stageEl.classList.add("is-locked");
}

function unlockStage(stageEl) {
  stageEl.classList.remove("is-locked");
  const lock = q("[data-carousel-lock]", stageEl);
  lock?.remove();
}

/**
 * Swipe that DOES NOT block vertical scroll:
 * - We only act when horizontal movement dominates
 * - We never set pointer capture
 * - CSS has touch-action: pan-y
 */
function enablePointerSwipe(swipeEl, { onNext, onPrev, isLocked }) {
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let decided = false;
  let isHorizontal = false;

  const THRESHOLD = 34; // px
  const DECIDE_AT = 8; // px

  swipeEl.addEventListener("pointerdown", (e) => {
    if (isLocked()) return;
    tracking = true;
    decided = false;
    isHorizontal = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  swipeEl.addEventListener("pointermove", (e) => {
    if (!tracking) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!decided) {
      if (Math.abs(dx) < DECIDE_AT && Math.abs(dy) < DECIDE_AT) return;
      decided = true;
      isHorizontal = Math.abs(dx) >= Math.abs(dy);
      return;
    }
    // still no-op; we only act on pointerup
  });

  swipeEl.addEventListener("pointerup", (e) => {
    if (!tracking) return;
    tracking = false;

    if (!decided || !isHorizontal) return;

    const dx = e.clientX - startX;
    if (dx <= -THRESHOLD) onNext();
    if (dx >= THRESHOLD) onPrev();
  });

  swipeEl.addEventListener("pointercancel", () => {
    tracking = false;
  });
}

async function loadProductsJson() {
  const url = withAssetBase("assets/data/products.json");
  const res = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`products.json HTTP ${res.status}`);
  return await res.json();
}

export async function initHomeProductsCarousel() {
  storeDeeplinkFromQuery();

  const mount = q(".home-products__carousel");
  if (!mount) {
    // homepage without carousel section
    return;
  }

  renderCarouselMarkup(mount, {
    titleText: "Naše produkty pro lékárny",
    leadText:
      "Standardizované léčebné extrakty a formulace připravené pro distribuci.",
    ctaText: "Odborné informace",
  });

  const stage = q("[data-home-products-stage]", mount);
  const list = q("[data-carousel-list]", mount);
  const swipe = q("[data-carousel-swipe]", mount);
  const prevBtn = q("[data-carousel-prev]", mount);
  const nextBtn = q("[data-carousel-next]", mount);
  const dotsEl = q("[data-carousel-dots]", mount);
  const eyeBtn = q("[data-carousel-eye]", mount);
  const ctaBtn = q("[data-home-products-cta]", mount);

  if (!stage || !list || !swipe || !prevBtn || !nextBtn || !dotsEl || !ctaBtn) {
    LOG.warn(`${SCOPE} markup missing required parts`);
    return;
  }

  // Gate controller is loaded lazily so a bug inside gate.js won't crash homepage.
  let gate = null;
  try {
    const mod = await import("../products/gate.js");
    if (typeof mod?.createGateController === "function") {
      gate = mod.createGateController({
        onAccept: () => {
          // zůstaň na homepage, jen odemkni carousel UI
          syncLock(); // odstraní overlay + odebere is-locked
          stage?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
          // volitelně: fokus na carousel pro klávesnici
          stage?.focus?.();
        },
        onDeny: () => {
          // nic nemusíš dělat, jen zavřít modal (už se zavírá v gate.js)
          // redirectToHome();  // můžeš klidně odstranit
        },
      });
    }
  } catch (err) {
    LOG.warn(`${SCOPE} gate module failed to load, using fallback`, err);
    gate = null;
  }

  let products = [];
  try {
    products = normalizeProducts(await loadProductsJson());
  } catch (err) {
    LOG.warn(`${SCOPE} failed to load products.json`, err);
    return;
  }

  const view = products.slice(0, 3);
  if (view.length < 3) {
    LOG.warn(`${SCOPE} need at least 3 products for homepage carousel`);
    return;
  }

  const pool = view.concat(view);
  let current = 0;
  const getIndex = (i, len) => (i + len) % len;

  function rebuild() {
    list.innerHTML = "";
    for (let i = -2; i <= 2; i++) {
      const idx = getIndex(current + i, pool.length);
      list.appendChild(createItem(pool[idx]));
    }
    const items = Array.from(list.children);
    if (items.length === 5) applyClasses(items);

    renderDots(dotsEl, view.length);
    setActiveDot(dotsEl, current % view.length);
  }

  function next() {
    const items = Array.from(list.children);
    if (items.length < 5) return;

    current = getIndex(current + 1, view.length);

    items[0].remove();
    items[1].className = "home-products__item hide";
    items[2].className = "home-products__item prev";
    items[3].className = "home-products__item act";
    items[4].className = "home-products__item next";

    const newIdx = getIndex(current + 2, pool.length);
    const newItem = createItem(pool[newIdx]);
    newItem.className = "home-products__item new-next";
    list.appendChild(newItem);

    setActiveDot(dotsEl, current % view.length);
  }

  function prev() {
    const items = Array.from(list.children);
    if (items.length < 5) return;

    current = getIndex(current - 1, view.length);

    items[4].remove();
    items[3].className = "home-products__item new-next";
    items[2].className = "home-products__item next";
    items[1].className = "home-products__item act";
    items[0].className = "home-products__item prev";

    const newIdx = getIndex(current - 2, pool.length);
    const newItem = createItem(pool[newIdx]);
    newItem.className = "home-products__item hide";
    list.insertBefore(newItem, list.firstChild);

    setActiveDot(dotsEl, current % view.length);
  }

  const locked = () => !isHcpVerifiedLocal();

  function syncLock() {
    if (locked()) lockStage(stage);
    else unlockStage(stage);
  }

  syncLock();
  rebuild();

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (locked()) return;
    prev();
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (locked()) return;
    next();
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li || locked()) return;
    if (li.classList.contains("next")) next();
    if (li.classList.contains("prev")) prev();
  });

  dotsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".home-products__dot");
    if (!btn || locked()) return;
    const target = Number(btn.dataset.index || "0");
    if (Number.isNaN(target)) return;
    while (current % view.length !== target) next();
  });

  mount.addEventListener("keydown", (e) => {
    if (locked()) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  });

  enablePointerSwipe(swipe, { onNext: next, onPrev: prev, isLocked: locked });

  eyeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    gate?.open?.();
  });

  ctaBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isHcpVerifiedLocal()) {
      redirectToProducts();
      return;
    }
    gate?.open?.();
  });

  LOG.info(`${SCOPE} ready`);
}

export default { initHomeProductsCarousel };
