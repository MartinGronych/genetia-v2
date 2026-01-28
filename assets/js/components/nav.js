/* assets/js/components/nav.js */
import { LOG } from "../core/logger.js";
import { getAssetBase } from "../core/paths.js";

let navDataPromise = null;

const normalizePath = (p) =>
  (p || "").replace(/\/index\.html$/i, "/").replace(/\/+/g, "/");

const getCurrentSlug = () => {
  const path = normalizePath(window.location.pathname);
  const parts = path.split("/").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
};

// pro stránky v rootu: ""
// pro stránky ve složce (např. /ui-kit/): "../"
const getPageBase = () => (getAssetBase() === "assets/" ? "" : "../");

// nav.json může obsahovat "/certifikace/" (legacy) nebo "certifikace/"
// pro náš folder routing chceme relativní href vůči aktuální stránce,
// takže pokud to začne "/" -> odstraníme ho a přidáme pageBase.
const resolveHref = (pageBase, href) => {
  const raw = (href || "").trim();
  const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;
  return `${pageBase}${cleaned}`;
};

const loadNavData = async () => {
  if (navDataPromise) return navDataPromise;

  navDataPromise = (async () => {
    const url = `${getAssetBase()}data/nav.json`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`nav.json fetch failed: ${res.status}`);
    return res.json();
  })().catch((err) => {
    // nav.json je volitelné — když chybí, necháme HTML fallback
    LOG.warn("nav.json not available, using HTML fallback", err);
    return null;
  });

  return navDataPromise;
};

const markCurrentLinks = () => {
  const current = getCurrentSlug();
  if (!current) return;

  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const slug = href.replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
    if (slug && slug === current) a.setAttribute("aria-current", "page");
  });
};

const renderDesktop = (items, pageBase) => {
  const list =
    document.querySelector(".site-nav .nav-list") ||
    document.querySelector("[data-nav-list]");
  if (!list) return;

  const current = getCurrentSlug();

  list.innerHTML = items
    .map((it) => {
      const href = resolveHref(pageBase, it.href);
      const slug =
        (it.href || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
      const isCurrent = slug === current && current !== "";
      const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
      return `<li><a class="nav-link" href="${href}"${ariaCurrent}>${it.label}</a></li>`;
    })
    .join("");
};

const renderMobile = (items, pageBase) => {
  const container =
    document.querySelector(".mobile-nav__links") ||
    document.querySelector("[data-mobile-nav-links]");
  if (!container) return;

  const current = getCurrentSlug();

  container.innerHTML = items
    .map((it) => {
      const href = resolveHref(pageBase, it.href);
      const slug =
        (it.href || "").replace(/\/+$/, "").split("/").filter(Boolean).pop() || "";
      const isCurrent = slug === current && current !== "";
      const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
      return `<a class="nav-link" href="${href}"${ariaCurrent}>${it.label}</a>`;
    })
    .join("");
};

export const initNav = async () => {
  const data = await loadNavData();

  // Podporujeme oba formáty:
  // - { primary: [...] } (původní očekávání)
  // - { items: [...] }   (aktuální nav.json v repu)
  const items = data?.primary?.length ? data.primary : data?.items;

  // Když nav.json není / nemá items, necháme HTML fallback a jen označíme active link
  if (!items?.length) {
    markCurrentLinks();
    return;
  }

  const pageBase = getPageBase();
  renderDesktop(items, pageBase);
  renderMobile(items, pageBase);
};
