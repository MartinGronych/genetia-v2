import { toggleTheme } from "../core/theme.js";

export const initThemeSwitch = () => {
  const buttons = document.querySelectorAll("[data-theme-toggle]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => toggleTheme());
  });
};
