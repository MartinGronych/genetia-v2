import { safeInit } from "./core/logger.js";
import { initTheme } from "./core/theme.js";
import { initI18n } from "./core/i18n.js";
import { initLucide } from "./core/lucide.js";
import { initScrollUI } from "./components/scroll-ui.js";
import { initNav } from "./components/nav.js";
import { initMobileNav } from "./components/mobile-nav.js";
import { initThemeSwitch } from "./components/theme-switch.js";
import { initModal } from "./components/modal.js";
import { initCardHover } from "./components/card-hover.js";
import { initTabs } from "./components/tabs.js";
import { initAccordion } from "./components/accordion.js";

const page = document.documentElement.dataset.page;

function domReady() {
  if (document.readyState === "loading") {
    return new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }
  return Promise.resolve();
}

(async () => {
  // Ne-DOM init (může běžet hned)
  await safeInit("theme", initTheme);
  await safeInit("i18n", initI18n);

  // DOM jistota pro ikony + UI komponenty (footer je na každé stránce)
  await domReady();

  await safeInit("lucide", () => initLucide(document));
  await safeInit("scroll-ui", initScrollUI);
  await safeInit("nav", initNav);
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
      // je bezpečné znovu spustit lucide jen nad celým dokumentem:
      await safeInit("lucide:after-page", () => initLucide(document));
    });
  }

  // Footer year (DOM už je ready)
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
