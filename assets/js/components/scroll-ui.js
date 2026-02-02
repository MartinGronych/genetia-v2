/* assets/js/components/scroll-ui.js */

const LOG_PREFIX = "[GENETIA] scroll-ui:";

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
  btn.hidden = true;

  /* Lucide icon placeholder */
  btn.innerHTML = `
    <i
      class="scroll-top-btn__icon"
      data-lucide="arrow-up"
      aria-hidden="true"
    ></i>
  `;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  });

  document.body.appendChild(btn);
  return btn;
};

const applyMinimalHeader = ({ header, inner, brand, nav, toggle }) => {
  header.style.height = "0px";
  header.style.minHeight = "0px";
  header.style.borderBottom = "0";
  header.style.boxShadow = "none";
  header.style.background = "transparent";
  header.style.pointerEvents = "none";
  header.style.overflow = "visible";
  

  inner.style.padding = "0";
  if (nav) nav.style.display = "none";

  if (brand) {
    brand.style.opacity = "0";
    brand.style.pointerEvents = "none";
  }

  if (toggle && toggle.parentNode !== document.body) {
    document.body.appendChild(toggle);
  }

  if (toggle) {
    toggle.classList.add("nav-toggle--floating");
    toggle.style.position = "fixed";
    toggle.style.top = "26px";
    toggle.style.right = "26px";
    toggle.style.zIndex = "var(--z-header)";
    toggle.style.pointerEvents = "auto";
  }
};

const resetMinimalHeader = ({ header, inner, brand, nav, toggle, toggleMount }) => {
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

  if (toggle) {
    toggle.classList.remove("nav-toggle--floating");
    toggle.style.position = "";
    toggle.style.top = "";
    toggle.style.right = "";
    toggle.style.zIndex = "";
    toggle.style.pointerEvents = "";

    const { parent, nextSibling } = toggleMount;

    if (parent) {
      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(toggle, nextSibling);
      } else {
        parent.appendChild(toggle);
      }
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
      applyMinimalHeader({ header, inner, brand, nav, toggle });
      isMinimalApplied = true;
    } else if (!shouldMinimal && isMinimalApplied) {
      resetMinimalHeader({ header, inner, brand, nav, toggle, toggleMount });
      isMinimalApplied = false;
    }

    const showTop = isLongPage() && y > halfViewport;
    scrollTopBtn.classList.toggle("is-visible", showTop);
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
    mqlUnder1024.addListener(requestUpdate);
  }

  console.debug(`${LOG_PREFIX} ready`);
};

export default { initScrollUI };
