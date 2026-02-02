// assets/js/core/paths.js
// Base-path helpers (GitHub Pages + folder routing safe)

function normalizeBase(input) {
  if (!input) return "";
  let base = String(input).trim();

  // remove trailing slash
  if (base.length > 1 && base.endsWith("/")) base = base.slice(0, -1);

  // ensure leading slash for non-empty bases
  if (base && !base.startsWith("/")) base = `/${base}`;

  return base;
}

function detectGitHubRepoBase() {
  const { hostname, pathname } = window.location;

  // Only auto-detect on *.github.io
  if (!hostname.endsWith("github.io")) return "";

  // pathname is like: "/genetia-v2/produkty/" or "/genetia-v2/"
  // first segment => "genetia-v2"
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return "";

  return `/${parts[0]}`;
}

export function getAssetBase() {
  // 1) explicit override (optional)
  const attr = document.documentElement.getAttribute("data-asset-base");
  const override = normalizeBase(attr);
  if (override) return override;

  // 2) auto-detect GitHub Pages repo base
  const ghBase = normalizeBase(detectGitHubRepoBase());
  if (ghBase) return ghBase;

  // 3) default local / normal hosting root
  return "";
}

// Helper to build stable URLs for fetch / assets
export function withAssetBase(path) {
  const base = getAssetBase();
  if (!path) return base || "";

  // ensure path has leading slash
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
