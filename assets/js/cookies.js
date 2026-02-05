/**
 * Cookie Consent Management
 * Handles cookie banner display, user preferences, and consent tracking
 */

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
 * Resolve site base using getAssetBase() (required for fetch routing on GitHub Pages).
 * We derive site base from asset base by stripping trailing "/assets".
 */
function getSiteBase() {
  try {
    // Prefer project helper if available
    const assetBase =
      typeof window.getAssetBase === "function" ? window.getAssetBase() : null;

    if (assetBase && typeof assetBase === "string") {
      // Normalize: remove trailing slash
      const normalized = assetBase.replace(/\/+$/, "");
      // If ends with "/assets" remove it to get site base
      const siteBase = normalized.replace(/\/assets$/, "");
      return siteBase || ".";
    }
  } catch (e) {
    // fall through
  }

  // Fallback: try to infer from current location (GitHub Pages safe-ish)
  // e.g. https://domain.tld/repo/kontakt/ -> /repo
  const path = window.location.pathname || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 0) {
    return `/${parts[0]}`;
  }
  return ".";
}

/**
 * Inject cookie banner + modal markup from /partials/cookies.html
 * Keeps HTML pages clean while still having required DOM IDs.
 */
async function injectCookieMarkup() {
  // už je na stránce / už injektované
  if (
    document.getElementById("cookieBanner") ||
    document.getElementById("cookieModal")
  ) {
    return true;
  }

  try {
    // Robustní cesta nezávislá na /kontakt/, /produkty/, GitHub Pages atd.
    // cookies.js je v /assets/js/, takže ../../ míří do web rootu
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
  // Check if user has already made a choice
  const consent = getCookieConsent();

  if (!consent) {
    // Show cookie banner if no consent exists
    showCookieBanner();
  } else {
    // Apply saved preferences
    applyCookiePreferences(consent);
  }

  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up all event listeners for cookie consent
 */
function setupEventListeners() {
  // Banner buttons
  const acceptAllBtn = document.getElementById("cookieAcceptAll");
  const settingsBtn = document.getElementById("cookieSettings");

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener("click", acceptAllCookies);
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", openCookieModal);
  }

  // Modal buttons
  const modalCloseBtn = document.getElementById("cookieModalClose");
  const modalOverlay = document.getElementById("cookieModalOverlay");
  const rejectAllBtn = document.getElementById("cookieRejectAll");
  const savePreferencesBtn = document.getElementById("cookieSavePreferences");
  const settingsPageBtn = document.getElementById("cookieSettingsBtn");

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeCookieModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", closeCookieModal);
  }

  if (rejectAllBtn) {
    rejectAllBtn.addEventListener("click", rejectAllCookies);
  }

  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener("click", savePreferences);
  }

  if (settingsPageBtn) {
    settingsPageBtn.addEventListener("click", openCookieModal);
  }

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCookieModal();
    }
  });
}

/**
 * Show cookie banner
 */
function showCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (banner) {
    // Small delay for better UX
    setTimeout(() => {
      banner.classList.add("active");
    }, 500);
  }
}

/**
 * Hide cookie banner
 */
function hideCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (banner) {
    banner.classList.remove("active");
  }
}

/**
 * Open cookie settings modal
 */
function openCookieModal() {
  const modal = document.getElementById("cookieModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Load current preferences
    const consent = getCookieConsent();
    if (consent) {
      loadPreferencesIntoModal(consent);
    }

    // Focus first interactive element
    const firstInput = modal.querySelector('input[type="checkbox"]:not(:disabled)');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

/**
 * Close cookie settings modal
 */
function closeCookieModal() {
  const modal = document.getElementById("cookieModal");
  if (modal) {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

/**
 * Load current preferences into modal checkboxes
 */
function loadPreferencesIntoModal(consent) {
  const analyticsCheckbox = document.getElementById("cookieAnalytics");
  const marketingCheckbox = document.getElementById("cookieMarketing");

  if (analyticsCheckbox) {
    analyticsCheckbox.checked = consent.analytics || false;
  }

  if (marketingCheckbox) {
    marketingCheckbox.checked = consent.marketing || false;
  }
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

  console.log("All cookies accepted");
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

  console.log("Non-essential cookies rejected");
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

  console.log("Cookie preferences saved:", consent);
}

/**
 * Save consent to cookie
 */
function saveCookieConsent(consent) {
  const consentString = JSON.stringify(consent);
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
        console.error("Error parsing consent cookie:", e);
        return null;
      }
    }
  }

  return null;
}

/**
 * Apply cookie preferences (load analytics, marketing scripts, etc.)
 */
function applyCookiePreferences(consent) {
  console.log("Applying cookie preferences:", consent);

  // Analytics cookies
  if (consent.analytics) {
    loadAnalytics();
  } else {
    removeAnalytics();
  }

  // Marketing cookies
  if (consent.marketing) {
    loadMarketing();
  } else {
    removeMarketing();
  }
}

/**
 * Load analytics scripts (Google Analytics, etc.)
 */
function loadAnalytics() {
  console.log("Analytics enabled");
}

/**
 * Remove analytics scripts
 */
function removeAnalytics() {
  // Remove Google Analytics cookies if they exist
  deleteCookie("_ga");
  deleteCookie("_gid");
  deleteCookie("_gat");

  console.log("Analytics disabled");
}

/**
 * Load marketing scripts (Facebook Pixel, etc.)
 */
function loadMarketing() {
  console.log("Marketing enabled");
}

/**
 * Remove marketing scripts
 */
function removeMarketing() {
  // Remove Facebook Pixel cookies if they exist
  deleteCookie("_fbp");
  deleteCookie("fr");

  console.log("Marketing disabled");
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
export { openCookieModal, acceptAllCookies, rejectAllCookies, getCookieConsent };
