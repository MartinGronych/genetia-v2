// assets/js/pages/products.js
// Products – page orchestrator (imports only)

import { safeInit } from "../core/logger.js";

import { initProductsGate } from "./products/gate.js";
import { initProdukty } from "./products/produkty.js";
import { initVideoModal } from "./products/video.js";

const LOG = "[Genetia][products]";

export async function init() {
  try {
    await safeInit("products:gate", initProductsGate);
    await safeInit("products:produkty", initProdukty);
    await safeInit("products:video-modal", initVideoModal);
  } catch (err) {
    console.error(LOG, "Page init failed:", err);
  }
}

export default { init };



