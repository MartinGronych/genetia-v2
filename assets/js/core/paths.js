export const getAssetBase = () => {
  const path = window.location.pathname;
  const isRoot =
    path === "/" ||
    (path.endsWith("/index.html") && path.split("/").filter(Boolean).length === 1);
  return isRoot ? "assets/" : "../assets/";
};

export const toAssetUrl = (path) => {
  const base = getAssetBase();
  // path např. "assets/images/logo/GENETIA-G_logo.webp"
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};