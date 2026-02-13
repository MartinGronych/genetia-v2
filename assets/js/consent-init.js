/**
 * ========================================
 * CONSENT MODE V2 - INITIALIZATION
 * ========================================
 * Tento soubor MUSÍ být načten PŘED Google Tag Manager.
 * Nastavuje výchozí stav consent na "denied" (GDPR compliant).
 *
 * Umístění: /assets/js/consent-init.js
 */

(function () {
  "use strict";

  // Inicializace dataLayer (pokud ještě neexistuje)
  window.dataLayer = window.dataLayer || [];

  // ✅ OPRAVA: gtag musí být GLOBÁLNÍ funkce
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };

  // ========================================
  // CONSENT MODE V2 - DEFAULT STATE (DENIED)
  // ========================================
  // Toto se spustí PŘED načtením GTM a nastaví výchozí stav na "denied".
  // Dokud uživatel neudělí souhlas, GA4/GTM nebudou ukládat cookies.

  gtag("consent", "default", {
    // Analytics
    analytics_storage: "granted",

    // Advertising (i když zatím nepoužíváš, je dobré mít připraveno)
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",

    // Functional cookies (vždy povolené)
    functionality_storage: "granted",
    security_storage: "granted",

    // Personalization (zatím denied)
    personalization_storage: "denied",

    // Region-specific settings
    region: ["CZ", "SK", "EU"], // Platí pro ČR, SK a celou EU

    // Wait period (ms) - kolik času má GTM počkat na update
    wait_for_update: 500,
  });

  // ========================================
  // EARLY CONSENT UPDATE (pokud už má uživatel uložený souhlas)
  // ========================================
  // Pokud uživatel už dřív udělil souhlas, aplikujeme ho OKAMŽITĚ
  // ještě PŘED načtením GTM (aby GTM věděl, že může ukládat cookies).

  (function applyEarlyConsent() {
    const COOKIE_NAME = "genetia_cookie_consent";

    // Získej cookie
    const cookies = document.cookie.split(";");
    let consentCookie = null;

    for (let cookie of cookies) {
      const [name, ...rest] = cookie.trim().split("=");
      if (name === COOKIE_NAME) {
        try {
          consentCookie = JSON.parse(decodeURIComponent(rest.join("=")));
          break;
        } catch (e) {
          console.error("[consent-init] Failed to parse consent cookie:", e);
        }
      }
    }

    // Pokud nemáme consent cookie, nic neděláme (zůstane "denied")
    if (!consentCookie) {
      return;
    }

    // Aplikuj uložený souhlas
    gtag("consent", "update", {
      analytics_storage: consentCookie.analytics ? "granted" : "denied",
      ad_storage: consentCookie.marketing ? "granted" : "denied",
      ad_user_data: consentCookie.marketing ? "granted" : "denied",
      ad_personalization: consentCookie.marketing ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      personalization_storage: "denied",
    });

    // Debug log (můžeš zakomentovat v produkci)
    if (window.location.hostname === "localhost" || window.location.search.includes("debug=1")) {
      console.log("[consent-init] Early consent applied:", consentCookie);
    }
  })();
})();