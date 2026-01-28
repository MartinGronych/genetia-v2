export const getAssetBase = () => {
  const path = window.location.pathname;
  const isRoot =
    path === "/" ||
    (path.endsWith("/index.html") && path.split("/").filter(Boolean).length === 1);
  return isRoot ? "assets/" : "../assets/";
};
