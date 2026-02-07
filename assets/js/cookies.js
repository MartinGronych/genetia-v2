/**
 * Cookie Consent Management
 * Handles cookie banner display, user preferences, and consent tracking
 */

/**
 * Safe Consent API wrapper (works in ES modules)
 * - In module scope, calling `gtag()` directly can throw ReferenceError.
 * - This wrapper always pushes into dataLayer.
 */
function consentUpdate(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["consent", "update", payload]);
}

// Cookie configuration
const COOKIE_CONFIG = {
  consentCookieName: "genetia_cookie_consent",
  consentCookieExpiry: 365, // days
  categories: {
    necessary: true, // Always enabled
    analytics: false,
    marketing: false,
  },
};

/**
 * Inject cookie banner + modal markup from /partials/cookies.html
 * Keeps HTML pages clean while still having required DOM IDs.
 */
async function injectCookieMarkup() {
  // already injected?
  if (
    document.getElementById("cookieBanner") ||
    document.getElementById("cookieModal")
  ) {
    return true;
  }

  try {
    // cookies.js is in /assets/js/ -> ../../ goes to site root
    const url = new URL("../../partials/cookies.html", import.meta.url);

    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
    return true;
  } catch (e) {
    console.error("[cookies] inject failed", e);
    return false;
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Ensure markup exists on every page (folder routing safe)
  await injectCookieMarkup();
  initCookieConsent();
});

/**
 * Initialize cookie consent system
 */
function initCookieConsent() {
  const consent = getCookieConsent();

  if (!consent) {
    showCookieBanner();
  } else {
    applyCookiePreferences(consent);
  }

  setupEventListeners();
}

/**
 * Set up all event listeners for cookie consent
 */
function setupEventListeners() {
  // Banner buttons
  const acceptAllBtn = document.getElementById("cookieAcceptAll");
  const settingsBtn = document.getElementById("cookieSettings");

  if (acceptAllBtn) acceptAllBtn.addEventListener("click", acceptAllCookies);
  if (settingsBtn) settingsBtn.addEventListener("click", openCookieModal);

  // Modal buttons
  const modalCloseBtn = document.getElementById("cookieModalClose");
  const modalOverlay = document.getElementById("cookieModalOverlay");
  const rejectAllBtn = document.getElementById("cookieRejectAll");
  const savePreferencesBtn = document.getElementById("cookieSavePreferences");
  const settingsPageBtn = document.getElementById("cookieSettingsBtn");

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeCookieModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeCookieModal);
  if (rejectAllBtn) rejectAllBtn.addEventListener("click", rejectAllCookies);
  if (savePreferencesBtn)
    savePreferencesBtn.addEventListener("click", savePreferences);
  if (settingsPageBtn) settingsPageBtn.addEventListener("click", openCookieModal);

  // Close modal on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCookieModal();
  });
}

/**
 * Show cookie banner
 */
function showCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  setTimeout(() => {
    banner.classList.add("active");
  }, 500);
}

/**
 * Hide cookie banner
 */
function hideCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (banner) banner.classList.remove("active");
}

/**
 * Open cookie settings modal
 */
function openCookieModal() {
  const modal = document.getElementById("cookieModal");
  if (!modal) return;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const consent = getCookieConsent();
  if (consent) loadPreferencesIntoModal(consent);

  const firstInput = modal.querySelector('input[type="checkbox"]:not(:disabled)');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

/**
 * Close cookie settings modal
 */
function closeCookieModal() {
  const modal = document.getElementById("cookieModal");
  if (!modal) return;

  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/**
 * Load current preferences into modal checkboxes
 */
function loadPreferencesIntoModal(consent) {
  const analyticsCheckbox = document.getElementById("cookieAnalytics");
  const marketingCheckbox = document.getElementById("cookieMarketing");

  if (analyticsCheckbox) analyticsCheckbox.checked = !!consent.analytics;
  if (marketingCheckbox) marketingCheckbox.checked = !!consent.marketing;
}

/**
 * Accept all cookies
 */
function acceptAllCookies() {
  const consent = {
    necessary: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString(),
  };

  saveCookieConsent(consent);
  applyCookiePreferences(consent);
  hideCookieBanner();
  closeCookieModal();
}

/**
 * Reject all non-necessary cookies
 */
function rejectAllCookies() {
  const consent = {
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  };

  saveCookieConsent(consent);
  applyCookiePreferences(consent);
  hideCookieBanner();
  closeCookieModal();
}

/**
 * Save custom preferences from modal
 */
function savePreferences() {
  const analyticsCheckbox = document.getElementById("cookieAnalytics");
  const marketingCheckbox = document.getElementById("cookieMarketing");

  const consent = {
    necessary: true,
    analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
    marketing: marketingCheckbox ? marketingCheckbox.checked : false,
    timestamp: new Date().toISOString(),
  };

  saveCookieConsent(consent);
  applyCookiePreferences(consent);
  hideCookieBanner();
  closeCookieModal();
}

/**
 * Save consent to cookie
 */
function saveCookieConsent(consent) {
  const consentString = encodeURIComponent(JSON.stringify(consent));
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_CONFIG.consentCookieExpiry);

  document.cookie = `${COOKIE_CONFIG.consentCookieName}=${consentString}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Get consent from cookie
 */
function getCookieConsent() {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");

    if (name === COOKIE_CONFIG.consentCookieName) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error("[cookies] Error parsing consent cookie:", e);
        return null;
      }
    }
  }

  return null;
}

/**
 * Apply cookie preferences (Consent Mode + optional local cleanup)
 */
function applyCookiePreferences(consent) {
  console.log("[cookies] Applying cookie preferences:", consent);

  // ✅ Google Consent Mode v2 – THIS is the key piece
  consentUpdate({
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    personalization_storage: "denied",
  });

  // Optional: local cleanup of cookies on disable (helps keep things tidy)
  if (!consent.analytics) removeAnalytics();
  if (!consent.marketing) removeMarketing();
}

/**
 * Remove analytics scripts/cookies (optional cleanup)
 */
function removeAnalytics() {
  deleteCookie("_ga");
  deleteCookie("_gid");
  deleteCookie("_gat");
  console.log("[cookies] Analytics disabled (cookies cleaned)");
}

/**
 * Remove marketing scripts/cookies (optional cleanup)
 */
function removeMarketing() {
  deleteCookie("_fbp");
  deleteCookie("fr");
  console.log("[cookies] Marketing disabled (cookies cleaned)");
}

/**
 * Delete a specific cookie
 */
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
}

/**
 * Public API for managing cookies
 */
window.CookieConsent = {
  openSettings: openCookieModal,
  acceptAll: acceptAllCookies,
  rejectAll: rejectAllCookies,
  getConsent: getCookieConsent,
};

// Export for ES modules
export {
  openCookieModal,
  acceptAllCookies,
  rejectAllCookies,
  getCookieConsent,
};
