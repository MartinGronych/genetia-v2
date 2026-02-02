// assets/js/core/i18n.js
// i18n loader (GitHub Pages + folder routing safe)

import { withAssetBase } from "./paths.js";
import { LOG } from "./logger.js";

const SCOPE = "i18n";

let messages = {};
let currentLang = "cs";

export async function initI18n(lang = "cs") {
  currentLang = lang;

  try {
    const url = withAssetBase(`assets/data/i18n/${lang}.json`);
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`i18n fetch failed (${res.status})`);
    }

    messages = await res.json();
    LOG.info(`${SCOPE} initialized`, lang);
  } catch (err) {
    LOG.warn(`${SCOPE} load failed, using fallback`, err);
    messages = {};
  }
}

export function t(key, fallback = "") {
  if (!key) return fallback;
  return messages[key] ?? fallback ?? key;
}

export function getCurrentLang() {
  return currentLang;
}
