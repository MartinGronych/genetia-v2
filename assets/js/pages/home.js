// assets/js/pages/home.js
// Home – page orchestrator (imports only)

import { safeInit } from "../core/logger.js";

// page parts
import { initUspProduction } from "./home/usp-production.js";
import { initHomeProductsCarousel } from "./home/products-carousel.js";

const LOG = "[GENETIA][home]";

export async function init() {
  try {
    await safeInit("home:usp-production", initUspProduction);
    await safeInit("home:products-carousel", initHomeProductsCarousel);
  } catch (err) {
    console.error(LOG, "Page init failed:", err);
  }
}

export default { init };
