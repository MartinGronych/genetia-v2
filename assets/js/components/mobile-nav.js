/* assets/js/components/mobile-nav.js */

let lastActive = null;

const getFocusable = (root) =>
  Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);

export const initMobileNav = () => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !nav) return;

  const panel = nav.querySelector(".mobile-nav__panel") || nav;
  const overlay = nav.querySelector(".mobile-nav__overlay");

  if (!nav.id) nav.id = "mobile-nav";
  toggle.setAttribute("aria-controls", nav.id);

  // Initial state
  nav.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("data-state", "closed");
  toggle.setAttribute("aria-label", "Open menu");

  const isOpen = () => nav.getAttribute("aria-hidden") === "false";

  const open = () => {
    if (isOpen()) return;

    lastActive = document.activeElement;

    nav.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("data-state", "open");
    toggle.setAttribute("aria-label", "Close menu");

    document.documentElement.style.overflow = "hidden";

    // focus first link/control inside panel
    const first = getFocusable(panel)[0];
    first?.focus?.();
  };

  const close = () => {
    if (!isOpen()) return;

    nav.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("data-state", "closed");
    toggle.setAttribute("aria-label", "Open menu");

    document.documentElement.style.overflow = "";
    lastActive?.focus?.();
  };

  const toggleMenu = () => (isOpen() ? close() : open());

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  }

  // Close on link click
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });

  // ESC + focus trap
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = getFocusable(panel);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // If user resizes to desktop, force-close (desktop has no hamburger)
  const onResize = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) close();
  };
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
};
