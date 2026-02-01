// assets/js/pages/products/produkty.js
// Produkty – HCP render po ověření + otevření detail modalu

import { safeInit } from "../../core/logger.js";
import { initProductDetailModal } from "./detail.js";

const LOG = "[Genetia][products][produkty]";
const LS_HCP_VERIFIED = "genetia_hcp_verified";
const EVT_HCP_VERIFIED = "genetia:hcp-verified";

function info(...args) {
  console.info(LOG, ...args);
}
function warn(...args) {
  console.warn(LOG, ...args);
}

function assetUrl(path) {
  if (typeof window.getAssetBase === "function") return window.getAssetBase(path);
  return `../${path}`;
}

function isVerified() {
  return localStorage.getItem(LS_HCP_VERIFIED) === "1";
}

function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const PRODUCTS_JSON_URL = () => assetUrl("assets/data/products.json");

function cardTemplate(p) {
  const id = esc(p.id);
  const name = esc(p.name);
  const ratio = esc(p.ratio);
  const desc = esc(p.description);
  const img = assetUrl(p.image);

  return `
    <article class="card hcp-product-card" data-product-id="${id}" tabindex="0">
      <div class="card__body">
        <img src="${img}" alt="${name}" loading="lazy" />
        <h3>${name}</h3>
        <div class="ratio">Poměr: ${ratio}</div>
        <p>${desc}</p>
      </div>
    </article>
  `;
}

async function fetchProducts() {
  const res = await fetch(PRODUCTS_JSON_URL(), { credentials: "same-origin" });
  if (!res.ok) throw new Error(`products.json fetch failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json must be an array");
  return data;
}

let cached = null;
let rendered = false;

export async function initProdukty() {
  const detailModal = initProductDetailModal();

  const mount = document.getElementById("hcp-products-section");
  if (!mount) {
    warn("Missing #hcp-products-section");
    return;
  }

  async function renderProducts() {
    if (!isVerified()) return;
    if (rendered) return;

    cached = cached || (await fetchProducts());
    mount.innerHTML = cached.slice(0, 3).map(cardTemplate).join("");
    rendered = true;
    info("rendered", { count: 3 });
  }

  function openById(id) {
    if (!cached) return;
    const p = cached.find((x) => x.id === id);
    if (!p) return;
    detailModal.openWithProduct(p);
  }

  // klik / enter na kartu
  mount.addEventListener("click", (e) => {
    const card = e.target?.closest?.("[data-product-id]");
    if (!card) return;
    openById(card.dataset.productId);
  });

  mount.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target?.closest?.("[data-product-id]");
    if (!card) return;
    e.preventDefault();
    openById(card.dataset.productId);
  });

  // render on load (když už ověřeno)
  await safeInit("products:produkty:render-on-load", renderProducts);

  // render po ověření
  window.addEventListener(EVT_HCP_VERIFIED, () => {
    safeInit("products:produkty:render-on-verified", renderProducts);
  });

  info("initialized");
}

export default { initProdukty };
