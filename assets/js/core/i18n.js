import { getAssetBase } from "./paths.js";
import { LOG } from "./logger.js";
let dictionary = {};
export const initI18n = async () => {
  const lang = document.documentElement.lang || "cs";
  const base = getAssetBase();
  try {
    const res = await fetch(`${base}data/i18n/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`i18n fetch failed (${res.status})`);
    dictionary = await res.json();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const value = key.split(".").reduce((o, k) => o?.[k], dictionary);
      if (typeof value === "string") el.textContent = value;
    });
    LOG.info(`i18n loaded (${lang})`);
  } catch (err) {
    LOG.error("i18n load failed", err);
  }
};
