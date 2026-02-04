// assets/js/pages/certifications.js
// Certifikace – page orchestrator (open modal from CTA only)

import { LOG, safeInit } from "../core/logger.js";

const PAGE_LOG = "[GENETIA][certifications]";

export async function init() {
  await safeInit("certifications:details", initCertificationsDetails);
}

async function initCertificationsDetails() {
  const triggers = Array.from(document.querySelectorAll("[data-cert-open][data-cert-id]"));
  if (!triggers.length) {
    LOG.warn(`${PAGE_LOG} no [data-cert-open] triggers found`);
    return;
  }

  const modal = document.getElementById("cert-modal");
  const openTrigger = document.querySelector('[data-open-modal="cert-modal"]');
  const modalTitle = document.getElementById("cert-modal-title");
  const contentHost = modal?.querySelector("[data-cert-modal-content]");

  if (!modal || !openTrigger || !contentHost || !modalTitle) {
    LOG.warn(`${PAGE_LOG} modal wiring missing`, {
      modal: !!modal,
      openTrigger: !!openTrigger,
      contentHost: !!contentHost,
      modalTitle: !!modalTitle
    });
    return;
  }

  const CERTS = getCertificationsData();

  triggers.forEach((btn) => {
    // Ensure correct a11y attrs on the trigger (safe, non-visual)
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-controls", "cert-modal");

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const id = String(btn.getAttribute("data-cert-id") || "").trim();
      const card = btn.closest("[data-cert-card][data-cert-id]");

      // Fill from map, fallback from card if missing
      const data = CERTS[id] || deriveFallbackDataFromCard(card, id);

      // Fill modal
      modalTitle.textContent = data.title || "Detail certifikace";
      contentHost.innerHTML = renderCertificationDetail(data);

      // Re-render lucide icons if available
      try {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
      } catch (_) {}

      // Open modal via global component (focus trap etc.)
      openTrigger.click();
    });
  });

  // Optional: if you later want aria-expanded on triggers, reset on close
  const obs = new MutationObserver(() => {
    const hidden = modal.getAttribute("aria-hidden");
    if (hidden === "true") {
      triggers.forEach((b) => b.setAttribute("aria-expanded", "false"));
    }
  });
  obs.observe(modal, { attributes: true, attributeFilter: ["aria-hidden"] });

  LOG.info(`${PAGE_LOG} ready`, { triggers: triggers.length });
}

/* =========================
   Data + rendering
========================= */

function getCertificationsData() {
  return {
    "gmp-release": {
      kicker: "GMP certifikát",
      title: "Propouštění šarží léčivého přípravku",
      badges: ["GMP 1", "Exkluzivně v ČR"],
      text:
        "Certifikát opravňující k propouštění šarží v souladu se standardy GMP 1." +
        "Zajišťuje konzistentní, dohledatelné a validované propouštění šarží dle GMP.",
      noticeTitle: "Poznámka",
      noticeText:
        "Na vyžádání připravíme přehled rozsahu certifikace a související dokumentace pro vaše interní compliance.",
      ctaHref: "../kontakt/#contactForm",
      ctaLabel: "Zeptejte se na audit / dokumentaci"
    },

    "gmp-lab": {
      kicker: "GMP certifikát",
      title: "Kontrolní laboratoř",
      badges: ["GMP 1"],
      text:
        "Certifikát pro kontrolní laboratoř v souladu se standardy GMP 1.",
      ctaHref: "../kontakt/#contactForm",
      ctaLabel: "Kontaktovat laboratoř"
    },

    "gmp-api-pack": {
      kicker: "GMP certifikát",
      title: "Balení léčivé látky",
      badges: ["GMP 2"],
      text:
        "Certifikát opravňující k balení léčivé látky v souladu se standardy GMP 2." +
        "Pokrytí zahrnuje kontrolované prostředí, značení, dohledatelnost a řízení šarží.",
      ctaHref: "../kontakt/#contactForm",
      ctaLabel: "Zeptejte se na kapacity a podmínky"
    },

    "gmp-api-extract": {
      kicker: "GMP certifikát",
      title: "Extrakce léčivé látky",
      badges: ["GMP 2"],
      text:
        "Povolení k extrakci léčivé látky v souladu se standardy GMP 2." +
        "Zaměřujeme se na stabilní proces, dokumentaci a konzistentní parametry kvality.",
      ctaHref: "../kontakt/#contactForm",
      ctaLabel: "Probrat požadavky na proces"
    }
  };
}

function deriveFallbackDataFromCard(card, id) {
  if (!card) {
    return {
      id,
      kicker: "Certifikace",
      title: "Detail certifikace",
      badges: [],
      text: "Detail bude doplněn.",
      ctaHref: "../kontakt/#contactForm",
      ctaLabel: "Kontakt"
    };
  }

  const title =
    card.querySelector(".card-title")?.textContent?.trim() ||
    "Detail certifikace";

  const kicker =
    card.querySelector(".card-kicker")?.textContent?.trim() ||
    "Certifikace";

  const text =
    card.querySelector(".card-text")?.textContent?.trim() ||
    "Detail bude doplněn.";

  const badges = Array.from(card.querySelectorAll(".badge"))
    .map((b) => b.textContent?.trim())
    .filter(Boolean);

  return {
    id,
    kicker,
    title,
    badges,
    text,
    ctaHref: "../kontakt/#contactForm",
    ctaLabel: "Kontakt"
  };
}

function renderCertificationDetail(data) {
  const esc = escapeHtml;

  const kicker = data.kicker ? `<p class="page-kicker">${esc(data.kicker)}</p>` : "";
  const title = data.title ? `<h4 class="section-title">${esc(data.title)}</h4>` : "";
  const text = data.text ? `<p class="section-intro">${esc(data.text)}</p>` : "";

  const badges =
    Array.isArray(data.badges) && data.badges.length
      ? `
        <div class="cluster" aria-label="Označení certifikace">
          ${data.badges
            .map((label) => {
              const clean = String(label || "").trim();
              const cls =
                clean.toLowerCase().includes("exkluzivně")
                  ? "badge badge--star"
                  : clean.toLowerCase().includes("gmp 1") || clean.toLowerCase().includes("gmp 2")
                    ? "badge"
                    : "badge";
              return `<span class="${cls}">${esc(clean)}</span>`;
            })
            .join("")}
        </div>
      `
      : "";

  const notice =
    data.noticeTitle || data.noticeText
      ? `
        <div class="card">
          <div class="card__body stack">
            ${data.noticeTitle ? `<h5 class="card-title">${esc(data.noticeTitle)}</h5>` : ""}
            ${data.noticeText ? `<p class="card-text">${esc(data.noticeText)}</p>` : ""}
          </div>
        </div>
      `
      : "";

  const cta =
    data.ctaHref
      ? `
        <div class="cluster">
          <a class="btn btn--primary" href="${esc(data.ctaHref)}">${esc(data.ctaLabel || "Kontakt")}</a>
        </div>
      `
      : "";

  return `
    <div class="stack--md">
      ${kicker}
      ${badges}
      ${title}
      ${text}
      ${notice}
      ${cta}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default { init };
