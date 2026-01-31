// assets/js/pages/contact.js
// Kontakt – page orchestrator (imports only)

import { safeInit } from "../core/logger.js";

// podle tree: assets/js/pages/kontakt/contact_map.js + contact_form.js
import { initContactMap } from "./kontakt/contact_map.js";
import { initContactForm } from "./kontakt/contact_form.js";

const LOG = "[Genetia][contact]";

export async function init() {
  try {
    await safeInit("contact:map", initContactMap);
    await safeInit("contact:form", initContactForm);
  } catch (err) {
    console.error(LOG, "Page init failed:", err);
  }
}

export default { init };
