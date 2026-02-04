// assets/js/components/theme-switch.js
// Light-only mode: theme toggle is intentionally disabled.
// Keeps UI intact, but removes broken import and prevents runtime errors.

export const initThemeSwitch = () => {
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  if (!buttons.length) return;

  // Optional: make sure nothing persists
  localStorage.removeItem("theme");
  document.documentElement.dataset.theme = "light";

  // Disable switching (do not attach click handlers).
};

