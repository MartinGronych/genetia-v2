// assets/js/pages/products/video.js

function getFocusable(root) {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export function initVideoModal() {
  try {
    const openers = Array.from(document.querySelectorAll("[data-video-modal-open]"));
    const modal = document.getElementById("videoModal");
    if (!modal) return;

    const dialog = modal.querySelector(".modal__dialog");
    const overlay = modal.querySelector(".modal__overlay");
    const closers = Array.from(modal.querySelectorAll("[data-video-modal-close]"));
    const player = document.getElementById("videoModalPlayer");

    let lastActive = null;

    const setOpenState = (isOpen) => {
      modal.dataset.open = isOpen ? "true" : "false";
      modal.setAttribute("aria-hidden", isOpen ? "false" : "true");

      // lock body scroll while open
      document.body.style.overflow = isOpen ? "hidden" : "";

      if (!player) return;
      if (isOpen) {
        player.muted = true;
      } else {
        try {
          player.pause();
          player.currentTime = 0;
        } catch (_) {}
      }
    };

    const open = (triggerEl) => {
      lastActive = triggerEl || document.activeElement;
      setOpenState(true);

      setTimeout(() => {
        if (dialog) dialog.focus();
      }, 0);
    };

    const close = () => {
      setOpenState(false);

      if (lastActive && typeof lastActive.focus === "function") {
        setTimeout(() => lastActive.focus(), 0);
      }
    };

    // Openers
    openers.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        open(el);
      });
    });

    // Closers + overlay click
    closers.forEach((el) => el.addEventListener("click", close));
    if (overlay) overlay.addEventListener("click", close);

    // Key handling + focus trap
    document.addEventListener("keydown", (e) => {
      if (modal.getAttribute("aria-hidden") === "true") return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const focusables = getFocusable(dialog);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  } catch (err) {
    // error boundary style: nesmí shodit stránku
    console.error("GENETIA video modal init failed:", err);
  }
}
