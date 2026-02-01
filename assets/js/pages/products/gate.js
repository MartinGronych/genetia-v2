// assets/js/pages/products/gate.js
// Products – gate (standalone; no products init here)

const LOG = "[Genetia][products][gate]";
const LS_HCP_VERIFIED = "genetia_hcp_verified"; // "1" | null
const EVT_HCP_VERIFIED = "genetia:hcp-verified";

const q = (sel, root = document) => root.querySelector(sel);

function info(...args) {
  console.info(LOG, ...args);
}
function warn(...args) {
  console.warn(LOG, ...args);
}

function emitVerified() {
  window.dispatchEvent(new CustomEvent(EVT_HCP_VERIFIED));
}

function createGateModalController(modalRoot) {
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

function unlockHcpSection() {
  const pane = document.getElementById("pro-odborniky");
  if (!pane) {
    warn("Missing #pro-odborniky");
    return;
  }
  pane.classList.remove("hcp-locked");
}

export function initProductsGate() {
  const modalEl = document.getElementById("gateModal");
  const openBtn = q("[data-gate-open]");
  const acceptBtn = q("[data-gate-accept]");
  const denyBtn = q("[data-gate-deny]");

  if (!modalEl) {
    warn("Missing #gateModal");
    return;
  }

  const modal = createGateModalController(modalEl);
  if (!modal) return;

  // auto-unlock pokud už ověřen
  if (localStorage.getItem(LS_HCP_VERIFIED) === "1") {
    unlockHcpSection();
    emitVerified();
    info("already verified → unlocked");
  }

  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (localStorage.getItem(LS_HCP_VERIFIED) === "1") {
      unlockHcpSection();
      emitVerified();
      return;
    }
    modal.open();
  });

  acceptBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem(LS_HCP_VERIFIED, "1");
    modal.close();
    unlockHcpSection();
    emitVerified();
    info("verified stored → unlocked");
  });
window.dispatchEvent(new CustomEvent("genetia:hcp-verified"));

  denyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.close();
    window.location.href = "../"; // root homepage z /produkty/
  });

  info("initialized");
}

export default { initProductsGate };
