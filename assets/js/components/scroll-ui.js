/* assets/js/core/scroll-ui.js */

const LOG_PREFIX = "[Genetia] scroll-ui:";

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

const isLongPage = () => {
  const doc = document.documentElement;
  return doc.scrollHeight > window.innerHeight * 1.5;
};

const createScrollTopButton = () => {
  const existing = document.querySelector("[data-scroll-top]");
  if (existing) return existing;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "scroll-top-btn";
  btn.setAttribute("data-scroll-top", "");
  btn.setAttribute("aria-label", "Zpět nahoru");
  btn.setAttribute("title", "Zpět nahoru");

  // A11Y: when hidden, it must not be focusable nor in accessibility tree
  btn.hidden = true;

  // Lucide: arrow-up-to-line
  btn.innerHTML = `
    <svg
      class="scroll-top-btn__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 3h14"></path>
      <path d="m18 13-6-6-6 6"></path>
      <path d="M12 7v14"></path>
    </svg>
  `;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  });

  document.body.appendChild(btn);
  return btn;
};

const applyMinimalHeader = ({ header, inner, brand, nav, toggle, toggleMount }) => {
  // 1) Collapse the header bar itself (removes the white strip)
  header.style.height = "0px";
  header.style.minHeight = "0px";
  header.style.borderBottom = "0";
  header.style.boxShadow = "none";
  header.style.background = "transparent";
  header.style.pointerEvents = "none";
  header.style.overflow = "visible";

  // 2) Hide inner content in a non-destructive way
  inner.style.padding = "0";
  if (nav) nav.style.display = "none";

  if (brand) {
    brand.style.opacity = "0";
    brand.style.pointerEvents = "none";
  }

  // 3) Float hamburger outside the header so it remains visible/clickable
  //    Move button into <body> (preserves click handlers from nav.js)
  if (toggle && toggleMount.parent === header) {
    document.body.appendChild(toggle);
  }

  if (toggle) {
    toggle.classList.add("nav-toggle--floating");
    toggle.style.position = "fixed";
    toggle.style.top = "16px";
    toggle.style.right = "16px";
    toggle.style.zIndex = "var(--z-header)";
    toggle.style.pointerEvents = "auto";
  }
};

const resetMinimalHeader = ({ header, inner, brand, nav, toggle, toggleMount }) => {
  // Restore header styles
  header.style.height = "";
  header.style.minHeight = "";
  header.style.borderBottom = "";
  header.style.boxShadow = "";
  header.style.background = "";
  header.style.pointerEvents = "";
  header.style.overflow = "";

  inner.style.padding = "";
  if (nav) nav.style.display = "";
  if (brand) {
    brand.style.opacity = "";
    brand.style.pointerEvents = "";
  }

  // Return toggle back to original DOM location
  if (toggle) {
    toggle.classList.remove("nav-toggle--floating");
    toggle.style.position = "";
    toggle.style.top = "";
    toggle.style.right = "";
    toggle.style.zIndex = "";
    toggle.style.pointerEvents = "";

    // put it back exactly where it was
    if (toggleMount.nextSibling && toggleMount.nextSibling.parentNode === toggleMount.parent) {
      toggleMount.parent.insertBefore(toggle, toggleMount.nextSibling);
    } else {
      toggleMount.parent.appendChild(toggle);
    }
  }
};

export const initScrollUI = () => {
  const header = document.querySelector(".site-header");
  const inner = header?.querySelector(".site-header__inner");
  const brand = header?.querySelector(".site-brand");
  const nav = header?.querySelector(".site-nav");
  const toggle = header?.querySelector("[data-nav-toggle]");

  if (!header || !inner || !toggle) return;

  const mqlUnder1024 = window.matchMedia("(max-width: 1023.98px)");
  const scrollTopBtn = createScrollTopButton();

  // Remember original mount point for the toggle so we can restore precisely
  const toggleMount = {
    parent: toggle.parentNode,
    nextSibling: toggle.nextSibling,
  };

  let ticking = false;
  let isMinimalApplied = false;

  const applyState = () => {
    ticking = false;

    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const halfViewport = window.innerHeight * 0.5;

    const under1024 = mqlUnder1024.matches;
    const shouldMinimal = under1024 && y > halfViewport;

    if (shouldMinimal && !isMinimalApplied) {
      applyMinimalHeader({ header, inner, brand, nav, toggle, toggleMount });
      isMinimalApplied = true;
    } else if (!shouldMinimal && isMinimalApplied) {
      resetMinimalHeader({ header, inner, brand, nav, toggle, toggleMount });
      isMinimalApplied = false;
    }

    // Back-to-top: appears at the same threshold (50% viewport) on long pages
    const showTop = isLongPage() && y > halfViewport;

    // Visual class (existing)
    scrollTopBtn.classList.toggle("is-visible", showTop);

    // A11Y-safe toggle: hidden removes it from focus + accessibility tree
    scrollTopBtn.hidden = !showTop;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(applyState);
  };

  applyState();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("orientationchange", requestUpdate, { passive: true });

  if (mqlUnder1024.addEventListener) {
    mqlUnder1024.addEventListener("change", requestUpdate);
  } else {
    // Safari fallback
    mqlUnder1024.addListener(requestUpdate);
  }

  // eslint-disable-next-line no-console
  console.debug(`${LOG_PREFIX} ready`);
};
