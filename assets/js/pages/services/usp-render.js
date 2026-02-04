// assets/js/pages/services/usp-render.js
import { withAssetBase } from "../../core/paths.js";

/**
 * Render USP items into #uspGrid
 * Data source: /assets/data/usp.json (via withAssetBase)
 */
export async function renderUspBar() {
  const grid = document.getElementById("uspGrid");
  if (!grid) return;

  try {
    const url = withAssetBase("/assets/data/usp.json");

    const res = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error(`USP data fetch failed (${res.status})`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    if (!items.length) {
      grid.innerHTML = "";
      return;
    }

    grid.innerHTML = items
      .map((item, index) => {
        const href = item.href || "#";
        const title = escHtml(item.title || "");
        const icon = escAttr(item.icon || "award");

        return `
          <a
            href="${escAttr(href)}"
            class="card usp-item"
            data-usp-item
            style="--usp-index:${index}"
            aria-label="${title}"
          >
            <div class="card__body usp-item__body">
              <span class="usp-item__icon" aria-hidden="true">
                <i data-lucide="${icon}"></i>
              </span>
              <span class="usp-item__title">${title}</span>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (err) {
    console.error("[GENETIA][USP][render] failed", err);
    grid.innerHTML = "";
  }
}

function escHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escAttr(str) {
  return escHtml(str).replaceAll("`", "&#096;");
}
