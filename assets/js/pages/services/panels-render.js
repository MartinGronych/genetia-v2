// assets/js/pages/services/panels-render.js
import { withAssetBase } from "../../core/paths.js";
import { initLucide } from "../../core/lucide.js";

/* ==================================================
   Panels Grid render (from panels.json)
   - Data: /assets/data/panels.json
   - Static list (no modal)
   - IMPORTANT: re-init lucide after each render (incl. MQ re-render)
================================================== */

const esc = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function toKebabCase(name = "") {
  const s = String(name).trim();
  if (!s) return "";
  if (s.includes("-")) return s.toLowerCase();
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/* ===============================
   ICON RENDER
================================ */

function renderGroupIcon(rawIcon = "") {
  const icon = toKebabCase(rawIcon);

  // Mikrobiologie → lucide worm
  if (icon === "bacteria" || icon === "worm" || icon === "microbiology") {
    return `<i data-lucide="worm" aria-hidden="true"></i>`;
  }

  if (!icon) return "";
  return `<i data-lucide="${esc(icon)}" aria-hidden="true"></i>`;
}

/* ===============================
   ITEM CARD
================================ */

function itemCardHTML(item, groupId) {
  const id = item?.id || "";
  const title = item?.title || "";
  const subtitle = (item?.subtitle || "").trim();
  const badge = (item?.badge || "").trim();

  const isViroid = groupId === "viroidni" || id === "hlvd-viroid";

  return `
    <div
      class="panel-card panel-card--chip"
      data-panel-id="${esc(id)}"
      role="listitem"
      aria-label="${esc(title)}"
    >
      <span class="panel-chipText">
        <span class="panel-title">${esc(title)}</span>

        ${
          badge
            ? `<span class="badge badge--accent">${esc(badge)}</span>`
            : subtitle
              ? `<span class="panel-subtitle">${esc(subtitle)}</span>`
              : ""
        }
      </span>
    </div>
  `;
}

/* ===============================
   GROUP
================================ */

function groupHTML(group) {
  const groupId = (group?.id || "").trim();
  const title = group?.title || "";
  const subtitle = group?.subtitle || "";
  const icon = group?.icon || "";
  const items = Array.isArray(group?.items) ? group.items : [];

  return `
    <section class="panels-group panels-group--${esc(groupId)}" aria-label="${esc(title)}">
      <header class="panels-group_header">
        <div class="panels-group_icon" aria-hidden="true">
          ${renderGroupIcon(icon)}
        </div>

        <div class="panels-group_headText">
          <h3 class="panels-group_title">${esc(title)}</h3>
          ${subtitle ? `<p class="panels-group_subtitle">${esc(subtitle)}</p>` : ""}
        </div>
      </header>

      <div class="panels-group_items" role="list">
        ${items.map((it) => itemCardHTML(it, groupId)).join("")}
      </div>
    </section>
  `;
}

/* ===============================
   LAYOUT
================================ */

function buildPanelsLayout(groups, isDesktop) {
  const order = [
    "farmakognosticke",
    "fyzikalni",
    "mikrobiologie",
    "limitni",
    "obsah",
    "viroidni",
  ];

  const rightIds = new Set(["limitni", "obsah", "viroidni"]);
  const byId = new Map(groups.map((g) => [String(g.id || "").trim(), g]));

  const main = [];
  const right = [];

  for (const id of order) {
    const g = byId.get(id);
    if (!g) continue;

    const html = groupHTML(g);
    if (isDesktop && rightIds.has(id)) right.push(html);
    else main.push(html);

    byId.delete(id);
  }

  for (const g of byId.values()) {
    main.push(groupHTML(g));
  }

  if (isDesktop && right.length) {
    main.push(
      `<div class="panels-col panels-col--right">${right.join("")}</div>`,
    );
  } else if (!isDesktop && right.length) {
    main.push(...right);
  }

  return main.join("");
}

/* ===============================
   INIT
================================ */

export async function renderPanels({ gridId = "testPanelsGrid" } = {}) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  try {
    const res = await fetch(withAssetBase("/assets/data/panels.json"), {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error(`panels.json fetch failed (${res.status})`);

    const data = await res.json();
    const groups = Array.isArray(data?.groups) ? data.groups : [];

    const mqDesktop = window.matchMedia("(min-width: 1024px)");

    const render = () => {
      grid.innerHTML = buildPanelsLayout(groups, mqDesktop.matches);
      // IMPORTANT: icons are inserted dynamically → init lucide on the new subtree
      initLucide(grid);
    };

    render();

    if (!grid.dataset.panelsMqBound) {
      const handler = () => render();
      mqDesktop.addEventListener
        ? mqDesktop.addEventListener("change", handler)
        : mqDesktop.addListener(handler);
      grid.dataset.panelsMqBound = "1";
    }
  } catch (err) {
    console.error("[GENETIA][panels][render] failed", err);
    grid.innerHTML = "";
  }
}
