/**
 * ========================================
 * KONTAKTNÍ STRÁNKA - PAGE MODUL
 * ========================================
 * 
 * Tento soubor se načítá automaticky přes app.js
 * když je data-page="contact"
 */

import { safeInit } from "../core/logger.js";


import { initContactForm } from './kontakt/contact-form.js';
import { initContactMap } from "./kontakt/contact_map.js";


const LOG = "[Genetia][contact]";
/**
 * Inicializace kontaktní stránky
 */
export async function init() {
  try {
    await safeInit("contact:map", initContactMap);
    await safeInit("contact:form", initContactForm);
  } catch (err) {
    console.error(LOG, "Page init failed:", err);
  }
}

export default { init };
  
  // Zde můžeš přidat další inicializace pro kontaktní stránku
  // např. Google Maps, Mapy.cz, atd.
  
