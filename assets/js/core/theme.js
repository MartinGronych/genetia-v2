export const initTheme = () => {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) { root.dataset.theme = saved; return; }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = prefersDark ? "dark" : "light";
};
export const toggleTheme = () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
};
