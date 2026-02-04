export const initThemeSwitch = () => {
  // Force light theme, disable switching
  document.documentElement.setAttribute("data-theme", "light");
  localStorage.removeItem("theme");

  // Intentionally no click handlers:
  // theme toggle UI may remain visible, but does nothing.
};
