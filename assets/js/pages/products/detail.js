// assets/js/pages/products/detail.js
// Product detail modal (A11Y + render from product object + image zoom overlay)

const LOG = "[Genetia][products][detail]";

function q(sel, root = document) {
  return root.querySelector(sel);
}

function esc(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function assetUrl(path) {
  if (typeof window.getAssetBase === "function") return window.getAssetBase(path);
  return `../${path}`;
}

function createModalController(modalRoot, { onEscape } = {}) {
  const dialog = q(".modal__dialog", modalRoot);
  const overlay = q(".modal__overlay", modalRoot);

  if (!dialog || !overlay) {
    console.warn(LOG, "missing dialog/overlay");
    return null;
  }

  const closeEls = modalRoot.querySelectorAll("[data-product-modal-close]");
  let lastActive = null;

  const focusables = () => {
    const selectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(dialog.querySelectorAll(selectors.join(",")));
  };

  const setOpen = (open) => {
    modalRoot.setAttribute("aria-hidden", open ? "false" : "true");
    modalRoot.style.display = open ? "block" : "none";
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      const handled = typeof onEscape === "function" ? onEscape() : false;
      if (handled) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      api.close();
      return;
    }

    if (e.key === "Tab") {
      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const api = {
    open() {
      lastActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
      (focusables()[0] || dialog).focus?.();
      document.addEventListener("keydown", onKeyDown);
    },
    close() {
      try {
        document.activeElement?.blur?.();
      } catch (_) {}
      setOpen(false);
      document.removeEventListener("keydown", onKeyDown);
      lastActive?.focus?.();
    },
  };

  overlay.addEventListener("mousedown", () => api.close());
  closeEls.forEach((el) => el.addEventListener("click", () => api.close()));

  dialog.setAttribute("tabindex", "-1");
  setOpen(false);

  return api;
}

function renderComposition(dl, composition) {
  dl.innerHTML = "";
  if (!composition || typeof composition !== "object") return;

  Object.entries(composition).forEach(([k, v]) => {
    const row = document.createElement("div");
    row.className = "product-modal__listRow";

    const dt = document.createElement("dt");
    dt.className = "product-modal__listKey";
    dt.textContent = k;

    const dd = document.createElement("dd");
    dd.className = "product-modal__listVal";
    dd.textContent = v;

    row.appendChild(dt);
    row.appendChild(dd);
    dl.appendChild(row);
  });
}

function renderForms(ul, forms = []) {
  ul.innerHTML = "";
  forms.forEach((label) => {
    const li = document.createElement("li");
    li.className = "product-modal__chip";
    li.textContent = label;
    ul.appendChild(li);
  });
}

export function initProductDetailModal() {
  const modalRoot = document.getElementById("productModal");
  if (!modalRoot) {
    console.warn(LOG, "missing #productModal");
    return { openWithProduct: () => {}, close: () => {} };
  }

  // Zoom overlay refs
  const zoomRoot = q("#productZoom", modalRoot);
  const zoomImg = q("#productZoomImage", modalRoot);
  const zoomOpenBtn = q("[data-product-zoom-open]", modalRoot);
  const zoomCloseEls = modalRoot.querySelectorAll("[data-product-zoom-close]");

  let zoomOpen = false;
  let lastZoomFocus = null;

  const closeZoom = () => {
    if (!zoomRoot) return;
    zoomRoot.setAttribute("aria-hidden", "true");
    zoomRoot.removeAttribute("data-open");
    zoomOpen = false;
    lastZoomFocus?.focus?.();
  };

  const openZoom = () => {
    if (!zoomRoot || !zoomImg) return;
    lastZoomFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    zoomRoot.setAttribute("aria-hidden", "false");
    zoomRoot.setAttribute("data-open", "true");
    zoomOpen = true;
    const closeBtn = q(".product-zoom__close", zoomRoot);
    closeBtn?.focus?.();
  };

  // Main modal controller – ESC closes zoom first
  const controller = createModalController(modalRoot, {
    onEscape() {
      if (zoomOpen) {
        closeZoom();
        return true;
      }
      return false;
    },
  });

  if (!controller) return { openWithProduct: () => {}, close: () => {} };

  // Wire zoom interactions
  zoomOpenBtn?.addEventListener("click", () => openZoom());
  zoomOpenBtn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openZoom();
    }
  });

  zoomCloseEls.forEach((el) => el.addEventListener("click", () => closeZoom()));

  const els = {
    title: q("#productModalTitle", modalRoot),
    ratio: q("#productModalRatio", modalRoot),
    desc: q("#productModalDesc", modalRoot),
    img: q("#productModalImage", modalRoot),
    comp: q("#productModalComposition", modalRoot),
    extraction: q("#productModalExtraction", modalRoot),
    carrier: q("#productModalCarrier", modalRoot),
    cert: q("#productModalCertification", modalRoot),
    pkg: q("#productModalPackage", modalRoot),
    container: q("#productModalContainer", modalRoot),
    eRecept: q("#productModalERecept", modalRoot),
    forms: q("#productModalForms", modalRoot),
  };

  function openWithProduct(p) {
    if (!p) return;

    // ensure zoom closed when switching products
    if (zoomOpen) closeZoom();

    const name = esc(p.name);
    els.title.textContent = name;
    els.ratio.textContent = p.ratio ? `Poměr ${p.ratio}` : "";
    els.desc.textContent = p.description || "";

    const src = assetUrl(p.image);

    if (els.img) {
      els.img.src = src;
      els.img.alt = name;
    }

    if (zoomImg) {
      zoomImg.src = src;
      zoomImg.alt = name;
    }

    renderComposition(els.comp, p.composition);
    if (els.extraction) els.extraction.textContent = p.extraction || "";
    if (els.carrier) els.carrier.textContent = p.carrier || "";
    if (els.cert) els.cert.textContent = p.certification || "";
    if (els.pkg) els.pkg.textContent = p.package || "";
    if (els.container) els.container.textContent = p.container || "";
    if (els.eRecept) els.eRecept.textContent = p.eRecept || "";

    renderForms(els.forms, p.forms || []);

    controller.open();
  }

  return {
    openWithProduct,
    close() {
      if (zoomOpen) closeZoom();
      controller.close();
    },
  };
}

export default { initProductDetailModal };
