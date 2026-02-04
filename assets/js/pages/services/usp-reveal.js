// assets/js/pages/services/usp-reveal.js

/**
 * Progressive reveal for USP items
 * - scoped to #uspGrid by default (prevents accidental matches elsewhere)
 * - uses IntersectionObserver when available
 * - applies stagger via CSS variable (--usp-index)
 */
export function initUspReveal(root = document) {
  const scope = root.getElementById?.("uspGrid") || root;
  const items = scope.querySelectorAll?.("[data-usp-item]") || [];
  if (!items.length) return;

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const revealAll = () => {
    items.forEach((el) => {
      el.classList.add("is-reveal-ready");
      el.classList.add("is-revealed");
    });
  };

  // No motion / no IO support → reveal immediately
  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const index = Number(el.style.getPropertyValue("--usp-index")) || 0;

        el.style.setProperty("--usp-reveal-delay", `${index * 80}ms`);
        el.classList.add("is-reveal-ready");

        requestAnimationFrame(() => {
          el.classList.add("is-revealed");
        });

        obs.unobserve(el);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15,
    }
  );

  items.forEach((item) => observer.observe(item));
}
