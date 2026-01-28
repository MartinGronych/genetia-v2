// assets/js/components/modal.js
import { LOG } from "../core/logger.js";

let activeModal = null;
let lastActiveElement = null;

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusableElements(modal) {
  return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTORS))
    .filter(el => el.offsetParent !== null);
}

function trapFocus(e) {
  if (!activeModal || e.key !== "Tab") return;

  const focusable = getFocusableElements(activeModal);
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const isShift = e.shiftKey;

  if (isShift && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!isShift && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function onKeydown(e) {
  if (!activeModal) return;

  if (e.key === "Escape") {
    closeModal(activeModal);
  }
}

function openModal(modal) {
  if (!modal || activeModal === modal) return;

  lastActiveElement = document.activeElement;
  activeModal = modal;

  modal.setAttribute("aria-hidden", "false");

  const focusable = getFocusableElements(modal);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    modal.setAttribute("tabindex", "-1");
    modal.focus();
  }

  document.addEventListener("keydown", trapFocus);
  document.addEventListener("keydown", onKeydown);

  LOG.info("Modal opened");
}

function closeModal(modal) {
  if (!modal || activeModal !== modal) return;

  modal.setAttribute("aria-hidden", "true");
  activeModal = null;

  document.removeEventListener("keydown", trapFocus);
  document.removeEventListener("keydown", onKeydown);

  if (lastActiveElement && typeof lastActiveElement.focus === "function") {
    lastActiveElement.focus();
  }

  LOG.info("Modal closed");
}

export function initModal() {
  const openTriggers = document.querySelectorAll("[data-open-modal]");
  const closeTriggers = document.querySelectorAll("[data-close-modal]");

  openTriggers.forEach(trigger => {
    const id = trigger.getAttribute("data-open-modal");
    const modal = document.getElementById(id);

    if (!modal) return;

    trigger.addEventListener("click", e => {
      e.preventDefault();
      openModal(modal);
    });
  });

  closeTriggers.forEach(trigger => {
    const modal = trigger.closest(".modal");
    if (!modal) return;

    trigger.addEventListener("click", e => {
      e.preventDefault();
      closeModal(modal);
    });
  });

  LOG.info("Modal initialized");
}
