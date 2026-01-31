// assets/js/pages/home.js
// Home – page orchestrator (imports only)

import { safeInit } from "../core/logger.js";

// podle tree: assets/js/pages/home/usp-production.js
import { initUspProduction } from "./home/usp-production.js";

const LOG = "[Genetia][home]";

export async function init() {
  try {
    await safeInit("home:usp-production", initUspProduction);
  } catch (err) {
    console.error(LOG, "Page init failed:", err);
  }
}

export default { init };
