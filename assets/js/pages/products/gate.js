// assets/js/pages/products/gate.js
// Gate modal + HCP verified state (reusable across pages)
//
// - Reusable controller: createGateController()
// - State helpers: isHcpVerified(), setHcpVerified()
// - Products-specific initializer kept: initProductsGate()
//
// A11Y:
// - focus trap
// - ESC closes
// - overlay click closes
// - returns focus to the opener

const LOG = "[GENETIA][gate]";
const LS_HCP_VERIFIED = "genetia_hcp_verified"; // "1" | null
const EVT_HCP_VERIFIED = "genetia:hcp-verified";

const q = (sel, root = document) => root.querySelector(sel);

function info(...args) {
  console.info(LOG, ...args);
}
function warn(...args) {
  console.warn(LOG, ...args);
}

export function isHcpVerified() {
  try {
    return localStorage.getItem(LS_HCP_VERIFIED) === "1";
  } catch (_) {
    return false;
  }
}

export function setHcpVerified() {
  try {
    localStorage.setItem(LS_HCP_VERIFIED, "1");
  } catch (_) {}
  window.dispatchEvent(new CustomEvent(EVT_HCP_VERIFIED));
}

export function emitHcpVerified() {
  window.dispatchEvent(new CustomEvent(EVT_HCP_VERIFIED));
}

/**
 * Creates an accessible modal controller for the existing gate modal markup.
 * Expects:
 * - .modal__dialog
 * - .modal__overlay
 * Optional:
 * - [data-modal-close]
 */
export function createGateModalController(modalRoot) {
  const dialog = q(".modal__dialog", modalRoot);
  const overlay = q(".modal__overlay", modalRoot);
  const closeBtns = modalRoot.querySelectorAll("[data-modal-close]");

  if (!dialog || !overlay) {
    warn("Missing .modal__dialog or .modal__overlay");
    return null;
  }

  let lastActive = null;

  const getFocusable = () => {
    const selectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(dialog.querySelectorAll(selectors.join(",")));
  };

  const setOpen = (open) => {
    modalRoot.setAttribute("aria-hidden", open ? "false" : "true");
    modalRoot.style.display = open ? "block" : "none";
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      api.close();
      return;
    }

    if (e.key === "Tab") {
      const items = getFocusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const api = {
    open() {
      lastActive =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      setOpen(true);
      (getFocusable()[0] || dialog).focus?.();
      document.addEventListener("keydown", onKeyDown);
    },
    close() {
      try {
        document.activeElement?.blur?.();
      } catch (_) {}
      setOpen(false);
      document.removeEventListener("keydown", onKeyDown);
      lastActive?.focus?.();
    },
  };

  overlay.addEventListener("mousedown", () => api.close());
  closeBtns.forEach((b) => b.addEventListener("click", () => api.close()));

  dialog.setAttribute("tabindex", "-1");
  setOpen(false);

  return api;
}

/**
 * Reusable gate controller bound to DOM (modal + buttons).
 * Expects IDs & selectors used across pages:
 * - #gateModal
 * - [data-gate-open] (optional on a page)
 * - [data-gate-accept]
 * - [data-gate-deny]
 *
 * You can provide callbacks for accept/deny.
 */
export function createGateController({
  modalId = "gateModal",
  onAccept = null,
  onDeny = null,
} = {}) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) {
    warn(`Missing #${modalId}`);
    return null;
  }

  const modal = createGateModalController(modalEl);
  if (!modal) return null;

  const acceptBtn = q("[data-gate-accept]", modalEl);
  const denyBtn = q("[data-gate-deny]", modalEl);

  if (!acceptBtn || !denyBtn) {
    warn("Missing [data-gate-accept] or [data-gate-deny] inside gate modal");
  }

  const api = {
    open: () => modal.open(),
    close: () => modal.close(),
    isVerified: () => isHcpVerified(),
    verify: () => setHcpVerified(),
    setHandlers(next) {
      if (next?.onAccept) onAccept = next.onAccept;
      if (next?.onDeny) onDeny = next.onDeny;
    },
  };

  acceptBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    api.verify();
    api.close();
    try {
      onAccept?.();
    } catch (err) {
      warn("onAccept handler failed", err);
    }
  });

  denyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    api.close();
    try {
      onDeny?.();
    } catch (err) {
      warn("onDeny handler failed", err);
    }
  });

  return api;
}

// Products-only helper (kept for backwards compatibility)
function unlockHcpSection() {
  const pane = document.getElementById("pro-odborniky");
  if (!pane) {
    warn("Missing #pro-odborniky");
    return;
  }
  pane.classList.remove("hcp-locked");
}

// Products page initializer (uses the reusable controller)
export function initProductsGate() {
  const gate = createGateController({
    onAccept: () => {
      unlockHcpSection();
      info("verified stored → unlocked");
    },
    onDeny: () => {
      // root homepage from /produkty/
      window.location.href = "../";
    },
  });

  if (!gate) return;

  // auto-unlock if already verified
  if (gate.isVerified()) {
    unlockHcpSection();
    emitHcpVerified();
    info("already verified → unlocked");
  }

  // products page might have an opener button
  const openBtn = q("[data-gate-open]");
  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (gate.isVerified()) {
      unlockHcpSection();
      emitHcpVerified();
      return;
    }
    gate.open();
  });

  info("initialized");
}

export default { initProductsGate };
