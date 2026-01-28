/* assets/js/core/lucide.js */

const LOG_PREFIX = "[Genetia] lucide:";

const svg = (paths, { size = 20 } = {}) => `
  <svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg"
    width="${size}" height="${size}" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">
    ${paths}
  </svg>
`;

/**
 * Lucide paths (minimal set for footer socials).
 * Source shapes follow Lucide icon geometry (inline SVG variant).
 */
const ICONS = {
  /* Social */
  linkedin: svg(`
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  `),

  instagram: svg(`
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <path d="M17.5 6.5h.01"></path>
  `),

  github: svg(`
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  `),

  twitter: svg(`
    <path d="M18 2h3l-7 8 8 12h-6l-5-7-6 7H2l8-9L2 2h6l5 7 5-7z"></path>
  `),

  youtube: svg(`
    <path d="M2.5 17.5A4.5 4.5 0 0 0 7 22h10a4.5 4.5 0 0 0 4.5-4.5V6.5A4.5 4.5 0 0 0 17 2H7A4.5 4.5 0 0 0 2.5 6.5v11z"></path>
    <path d="M10 8l6 4-6 4V8z"></path>
  `),

  facebook: svg(`
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  `),

  /* Footer contact */
  mail: svg(`
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="m22 7-10 5L2 7"></path>
  `),

  phone: svg(`
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  `),

  "map-pin": svg(`
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  `),
};

const inferIconNameFromHref = (href) => {
  const h = (href || "").toLowerCase();

  if (h.includes("linkedin.com")) return "linkedin";
  if (h.includes("github.com")) return "github";
  if (h.includes("x.com") || h.includes("twitter.com")) return "twitter";
  if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
  if (h.includes("facebook.com")) return "facebook";
  if (h.includes("instagram.com")) return "instagram";

  return null;
};

const ensureIconInLink = (a, iconName) => {
  if (!a || !iconName) return;
  if (a.querySelector("svg")) return;

  const markup = ICONS[iconName];
  if (!markup) return;

  // Keep existing content if any (but typically footer social links are empty or have span)
  // Insert icon as first child so it is reliably visible.
  a.insertAdjacentHTML("afterbegin", markup);

  // A11Y: if link has no readable text, add aria-label (do not override if already present)
  if (!a.getAttribute("aria-label")) {
    const labelMap = {
      linkedin: "LinkedIn",
      github: "GitHub",
      twitter: "X",
      youtube: "YouTube",
      facebook: "Facebook",
      instagram: "Instagram",
    };
    a.setAttribute("aria-label", labelMap[iconName] || "Sociální síť");
  }
};

export const initLucide = () => {
  // 1) Generic: support [data-lucide="icon-name"] anywhere (future-proof)
  document.querySelectorAll("[data-lucide]").forEach((el) => {
    const name = (el.getAttribute("data-lucide") || "").trim().toLowerCase();
    if (!name || !ICONS[name]) return;
    if (el.querySelector("svg")) return;
    el.insertAdjacentHTML("afterbegin", ICONS[name]);
  });

  // 2) Footer socials: infer icon from href, no HTML changes needed
  const footer = document.querySelector(".site-footer");
  if (!footer) return;

  footer.querySelectorAll("a[href]").forEach((a) => {
    const iconName = inferIconNameFromHref(a.getAttribute("href"));
    if (!iconName) return;
    ensureIconInLink(a, iconName);
  });

  // eslint-disable-next-line no-console
  console.debug(`${LOG_PREFIX} ready`);
};
