// assets/js/components/nav.js
// Primary + Mobile navigation (Genetia v2)

import { withAssetBase } from "../core/paths.js";
import { LOG } from "../core/logger.js";

/* ==================================================
   Helpers
================================================== */

/**
 * Resolve href for folder routing.
 * - external / absolute links stay untouched
 * - internal section links get trailing slash
 */
function resolveHref(href) {
  if (!href) return "#";

  // absolute or external
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("/")
  ) {
    return href;
  }

  // folder routing (ensure trailing slash)
  return href.endsWith("/") ? href : `${href}/`;
}

/* ==================================================
   Data loading
================================================== */

async function loadNavData() {
  const url = withAssetBase("assets/data/nav.json");

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`nav.json fetch failed (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    LOG.warn("nav.json not available, using HTML fallback", err);
    return null;
  }
}

/* ==================================================
   Render
================================================== */

function renderDesktopNav(listEl, items) {
  if (!listEl || !Array.isArray(items)) return;

  listEl.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.className = "nav-link";
    a.textContent = item.label;
    a.href = resolveHref(item.href);

    li.appendChild(a);
    listEl.appendChild(li);
  });
}

function renderMobileNav(container, items) {
  if (!container || !Array.isArray(items)) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const a = document.createElement("a");

    a.className = "nav-link";
    a.textContent = item.label;
    a.href = resolveHref(item.href);

    container.appendChild(a);
  });
}

/* ==================================================
   Init
================================================== */

export async function initNav() {
  const desktopList = document.querySelector(".site-nav .nav-list");
  const mobileLinks = document.querySelector(".mobile-nav__links");

  const data = await loadNavData();

  // Fallback: HTML already present
  if (!data) {
    LOG.info("nav initialized (HTML fallback)");
    return;
  }

  if (desktopList && Array.isArray(data.primary)) {
    renderDesktopNav(desktopList, data.primary);
  }

  if (mobileLinks && Array.isArray(data.primary)) {
    renderMobileNav(mobileLinks, data.primary);
  }

  LOG.info("nav initialized");
}

export default { initNav };
