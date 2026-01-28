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

(async () => {
  await safeInit("theme", initTheme);
  await safeInit("i18n", initI18n);
  await safeInit("lucide", initLucide);
  await safeInit("scroll-ui", initScrollUI);
  await safeInit("nav", initNav);
  await safeInit("mobile-nav", initMobileNav);
  await safeInit("theme-switch", initThemeSwitch);
  await safeInit("modal", initModal);
  await safeInit("card-hover", initCardHover);
  await safeInit("initTabs", initTabs);
  document.addEventListener("DOMContentLoaded", () => {
    safeInit("accordion", initAccordion);
  });

  switch (page) {
    case "home":
      (await import("./pages/home.js")).initHome();
      break;
    case "contact":
      (await import("./pages/contact.js")).initContact();
      break;
    case "services":
      (await import("./pages/services.js")).initServices();
      break;
    case "products":
      (await import("./pages/products.js")).initProducts();
      break;
    case "certifications":
      (await import("./pages/certifications.js")).initCertifications();
      break;
    case "research":
      (await import("./pages/research.js")).initResearch();
      break;
    case "legal":
      (await import("./pages/legal.js")).initLegal();
      break;
    case "ui-kit":
      (await import("./pages/ui-kit.js")).initUiKit();
      break;
    default:
      break;
  }
})();
