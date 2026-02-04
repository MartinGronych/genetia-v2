// assets/js/core/lucide.js
import { createIcons, icons } from "lucide";

/**
 * Lucide init – stable browser ESM (NO bundler)
 * Uses official `icons` registry from lucide.
 *
 * HTML/JSON must use kebab-case:
 *  <i data-lucide="linkedin"></i>
 *  <i data-lucide="arrow-up"></i>
 */
export function initLucide(root = document) {
  try {
    // NOTE: createIcons scans the document by default.
    // Some builds support scoping; if not, this is still safe to call multiple times.
    createIcons({
      icons,
      nameAttr: "data-lucide",
      attrs: {
        class: "lucide-icon",
        "aria-hidden": "true",
        focusable: "false",
      },
      // keep root if supported by your lucide build; harmless if ignored
      root,
    });
  } catch (err) {
    console.error("[Genetia][lucide] init failed", err);
  }
}
