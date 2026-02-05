// assets/js/app.js

import { safeInit } from "./core/logger.js";
// import { initTheme } from "./core/theme.js";
import { initI18n } from "./core/i18n.js";
import "./cookies.js";
import { initLucide } from "./core/lucide.js";
import { initScrollUI } from "./components/scroll-ui.js";
import { initNav } from "./components/nav.js";
import { initMobileNav } from "./components/mobile-nav.js";
import { initThemeSwitch } from "./components/theme-switch.js";
import { initModal } from "./components/modal.js";
import { initCardHover } from "./components/card-hover.js";
import { initTabs } from "./components/tabs.js";
import { initAccordion } from "./components/accordion.js";

import { getAssetBase } from "./core/paths.js";

const page = document.documentElement.dataset.page;

function domReady() {
  if (document.readyState === "loading") {
    return new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }
  return Promise.resolve();
}

/**
 * GitHub Pages (project site) fix:
 * - If base is detected (e.g. "/genetia-v2"), prefix all root-relative internal URLs.
 * - Keeps local/dev unchanged (base === "").
 *
 * We only touch:
 * - a[href], area[href], form[action]
 * - (optional safety) [data-href] not used currently; keep minimal scope
 *
 * A11Y safe: does not change focus/aria, only URL strings.
 */
function applyRepoBaseToRootRelativeLinks(root = document) {
  const base = getAssetBase();
  if (!base) return; // local / normal hosting root => do nothing

  const isAlreadyPrefixed = (val) => val.startsWith(`${base}/`) || val === base;

  const shouldRewrite = (val) => {
    if (!val) return false;

    // ignore in-page anchors
    if (val.startsWith("#")) return false;

    // ignore external-ish schemes
    if (
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("mailto:") ||
      val.startsWith("tel:") ||
      val.startsWith("sms:") ||
      val.startsWith("javascript:")
    ) {
      return false;
    }

    // protocol-relative URLs ("//cdn…") must stay
    if (val.startsWith("//")) return false;

    // rewrite only root-relative paths
    if (!val.startsWith("/")) return false;

    // already has base => do nothing
    if (isAlreadyPrefixed(val)) return false;

    return true;
  };

  const rewrite = (val) => `${base}${val}`;

  // Links (navigation + any other internal root-relative links)
  root.querySelectorAll("a[href], area[href]").forEach((el) => {
    const href = el.getAttribute("href");
    if (!shouldRewrite(href)) return;
    el.setAttribute("href", rewrite(href));
  });

  // Forms (defensive; if you ever add root-relative actions)
  root.querySelectorAll("form[action]").forEach((el) => {
    const action = el.getAttribute("action");
    if (!shouldRewrite(action)) return;
    el.setAttribute("action", rewrite(action));
  });
}

(async () => {
  // Ne-DOM init (může běžet hned)
  // await safeInit("theme", initTheme);
  await safeInit("i18n", initI18n);

  // DOM jistota pro ikony + UI komponenty (footer je na každé stránce)
  await domReady();

  await safeInit("lucide", () => initLucide(document));
  await safeInit("scroll-ui", initScrollUI);

  // Nav init (může renderovat z nav.json a vytvořit href="/sekce/")
  await safeInit("nav", initNav);

  // Po renderu navigace opravíme root-relative odkazy pro GitHub project base
  await safeInit("links:base-prefix", () => applyRepoBaseToRootRelativeLinks(document));

  // Mobile nav (A11Y chování zůstává)
  await safeInit("mobile-nav", initMobileNav);

  await safeInit("theme-switch", initThemeSwitch);
  await safeInit("modal", initModal);
  await safeInit("card-hover", initCardHover);
  await safeInit("tabs", initTabs);
  await safeInit("accordion", initAccordion);

  // 👇 JEDINÉ místo, kde se řeší stránka
  if (page) {
    await safeInit(`page:${page}`, async () => {
      const mod = await import(`./pages/${page}.js`);
      await mod.init?.();

      // Pokud stránkový modul injektuje HTML (modaly/sekce),
      // opravíme i nově přidané root-relative odkazy:
      applyRepoBaseToRootRelativeLinks(document);

      // a pak znovu spustíme lucide:
      await safeInit("lucide:after-page", () => initLucide(document));
    });
  }

  // Footer year (DOM už je ready)
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
