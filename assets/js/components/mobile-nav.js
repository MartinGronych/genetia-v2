// assets/js/components/mobile-nav.js
// Mobile nav controller (A11Y + reliable open/close)
// - single source of truth: aria-hidden on [data-mobile-nav]
// - aria-expanded on [data-nav-toggle]
// - overlay is clickable ONLY when open
// - ESC closes
// - restores focus

const LOG = "[GENETIA][mobile-nav]";

function q(sel, root = document) {
  return root.querySelector(sel);
}

function qa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setOverlayTabindex(overlayBtn, isOpen) {
  if (!overlayBtn) return;
  overlayBtn.tabIndex = isOpen ? 0 : -1;
}

function isOpen(navEl) {
  return navEl?.getAttribute("aria-hidden") === "false";
}

/**
 * Keeps a CSS-friendly state for hamburger -> X animation.
 * CSS can target: .nav-toggle[data-state="open"]
 */
function setToggleVisualState(toggleBtn, open) {
  if (!toggleBtn) return;
  toggleBtn.setAttribute("data-state", open ? "open" : "closed");
}

function openNav({ navEl, toggleBtn, overlayBtn, panelEl }) {
  if (!navEl || !toggleBtn) return;

  navEl.setAttribute("aria-hidden", "false");
  toggleBtn.setAttribute("aria-expanded", "true");
  setToggleVisualState(toggleBtn, true);
  setOverlayTabindex(overlayBtn, true);

  // focus panel (dialog)
  if (panelEl) {
    // wait a tick so CSS transitions don't fight focus ring
    requestAnimationFrame(() => {
      try {
        panelEl.focus({ preventScroll: true });
      } catch (_) {}
    });
  }

  document.documentElement.classList.add("is-mobile-nav-open");
}

function closeNav({ navEl, toggleBtn, overlayBtn, panelEl, restoreFocusEl }) {
  if (!navEl || !toggleBtn) return;

  navEl.setAttribute("aria-hidden", "true");
  toggleBtn.setAttribute("aria-expanded", "false");
  setToggleVisualState(toggleBtn, false);
  setOverlayTabindex(overlayBtn, false);

  document.documentElement.classList.remove("is-mobile-nav-open");

  // restore focus to toggle (or provided element)
  const target = restoreFocusEl || toggleBtn;
  requestAnimationFrame(() => {
    try {
      target.focus({ preventScroll: true });
    } catch (_) {}
  });

  // If panel was focused, blur it
  if (panelEl && document.activeElement === panelEl) {
    try {
      panelEl.blur();
    } catch (_) {}
  }
}

export function initMobileNav() {
  const navEl = q("[data-mobile-nav]");
  const toggleBtn = q("[data-nav-toggle]");
  const overlayBtn = q("[data-nav-close]", navEl);
  const panelEl = q(".mobile-nav__panel", navEl);

  if (!navEl || !toggleBtn) {
    console.debug(LOG, "No mobile nav on page");
    return;
  }

  // Ensure initial A11Y state is consistent
  if (!navEl.hasAttribute("aria-hidden")) navEl.setAttribute("aria-hidden", "true");
  if (!toggleBtn.hasAttribute("aria-expanded")) toggleBtn.setAttribute("aria-expanded", "false");
  if (panelEl) panelEl.tabIndex = -1;

  // sync initial visual state (hamburger vs X)
  setToggleVisualState(toggleBtn, isOpen(navEl));
  setOverlayTabindex(overlayBtn, isOpen(navEl));

  const restoreFocusEl = toggleBtn;

  const onToggle = (e) => {
    e.preventDefault();
    if (isOpen(navEl)) {
      closeNav({ navEl, toggleBtn, overlayBtn, panelEl, restoreFocusEl });
    } else {
      openNav({ navEl, toggleBtn, overlayBtn, panelEl });
    }
  };

  const onClose = (e) => {
    e.preventDefault();
    if (!isOpen(navEl)) return;
    closeNav({ navEl, toggleBtn, overlayBtn, panelEl, restoreFocusEl });
  };

  toggleBtn.addEventListener("click", onToggle);
  overlayBtn?.addEventListener("click", onClose);

  // Close on ESC
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!isOpen(navEl)) return;
    closeNav({ navEl, toggleBtn, overlayBtn, panelEl, restoreFocusEl });
  });

  // Prevent clicks “through” when closed (just in case some CSS leaves it visible)
  navEl.addEventListener("click", (e) => {
    if (!isOpen(navEl)) {
      // if nav is closed, never trap interactions
      e.stopPropagation();
    }
  });


}

export default { initMobileNav };
