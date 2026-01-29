// ==================================================
// GENETIA v2 – USP Production (rendered from JS)
// - Two columns: WHY (left) + HOW (right)
// - Icons removed (left + right), keep step number + dot (+ dashed via CSS)
// - Timeline reveal + hide on scroll preserved (IntersectionObserver + .is-visible)
// - Error-safe (web nesmí spadnout)
// ==================================================

const USP_PRODUCTION_DATA = {
  title: "Proč si vybrat Genetia Production",
  intro:
    "Výroba dle farmaceutických standardů, vědecký přístup a flexibilita nám umožňují dodávat produkty nejvyšší kvality s důrazem na bezpečnost a inovaci.",

  // LEFT COLUMN (WHY)
  whyItems: [
    {
      title: "Certifikace GMP I a GMP II",
      text:
        "Naše výroba probíhá podle nejvyšších evropských farmaceutických standardů, což zaručuje plnou sledovatelnost, konzistenci a bezpečnost každé šarže.",
    },
    {
      title: "Spolupráce s regulačními orgány a akademickou sférou",
      text:
        "Aktivně spolupracujeme s regulačními institucemi, univerzitami a výzkumnými centry, abychom byli vždy krok před legislativními změnami.",
    },
    {
      title: "Vlastní výzkum a vývoj",
      text:
        "Disponujeme interním oddělením R&D, které se zaměřuje na nové extrakční technologie, optimalizaci formulací kanabinoidů a stabilitu produktů.",
    },
    {
      title: "Rychlost a flexibilita",
      text:
        "Díky propojení všech procesů pod jednou střechou dokážeme nabídnout krátké dodací lhůty a individuální přístup od návrhu po sériovou výrobu.",
    },
    {
      title: "Kvalita podložená vědou",
      text:
        "Každý produkt prochází důkladnou analytickou kontrolou s validovanými postupy. Garantujeme farmaceutickou jistotu v každém miligramu.",
    },
  ],

  // RIGHT COLUMN (HOW)
  howItems: [
    {
      step: "01",
      title: "Výzkum a vývoj",
      text:
        "Interní výzkum a vývoj zaměřený na stabilitu, čistotu a reprodukovatelnost výsledků.",
    },
    {
      step: "02",
      title: "Certifikace a regulace",
      text:
        "Procesy odpovídající EU-GMP a aktivní komunikace s regulačními orgány.",
    },
    {
      step: "03",
      title: "Výroba a škálování",
      text:
        "Škálovatelná výroba s důrazem na konzistenci šarží a kontrolu kvality.",
    },
    {
      step: "04",
      title: "Analytická kontrola",
      text: "Validované analytické metody a dokumentace každého kroku.",
    },
    {
      step: "05",
      title: "Uvolnění a distribuce",
      text:
        "Finální kontrola, uvolnění produktu a příprava pro distribuční praxi.",
    },
  ],
};

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initTimelineReveal(mount) {
  const steps = Array.from(mount.querySelectorAll(".usp-prod_step"));
  if (!steps.length) return;

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    steps.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const getDelayMs = (el) => {
    const idx = steps.indexOf(el);
    return Math.max(0, idx) * 120;
  };

  try {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;

          if (e.isIntersecting) {
            el.style.transitionDelay = `${getDelayMs(el)}ms`;
            el.classList.add("is-visible");
          } else {
            el.style.transitionDelay = "0ms";
            el.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -18% 0px",
      }
    );

    steps.forEach((el) => io.observe(el));
  } catch (_) {
    // Fallback
    steps.forEach((el) => el.classList.add("is-visible"));
  }
}

export function initUspProduction() {
  try {
    const section = document.querySelector("[data-usp-production]");
    const mount = document.getElementById("uspProductionMount");
    if (!section || !mount) return;

    const { title, intro, whyItems, howItems } = USP_PRODUCTION_DATA;

    mount.innerHTML = `
      <div class="usp-prod_layout">

        <!-- LEFT COLUMN: WHY -->
        <div class="usp-prod_why">
          <h2 class="fw-bold mb-4" data-i18n="uspProduction.title">${escapeHtml(title)}</h2>
          <p class="text-secondary mb-4 section-intro" data-i18n="uspProduction.intro">
            ${escapeHtml(intro)}
          </p>

          <div class="usp-prod_why-card">
            <div class="usp-prod_why-list">
              ${whyItems
                .map(
                  (it, idx) => `
                    <div class="usp-prod_why-item">
                      <!-- icon removed by request -->
                      <div class="usp-prod_why-body">
                        <h5 class="usp-prod_why-title" data-i18n="uspProduction.why.${idx}.title">${escapeHtml(
                          it.title
                        )}</h5>
                        <p class="usp-prod_why-text" data-i18n="uspProduction.why.${idx}.text">${escapeHtml(
                          it.text
                        )}</p>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: HOW -->
        <div class="usp-prod_how">
          <h3 class="usp-prod_how-title" data-i18n="uspProduction.howTitle">Jak pracujeme</h3>
          <p class="usp-prod_how-intro" data-i18n="uspProduction.howIntro">
            Postup, který zajišťuje konzistentní kvalitu a plnou kontrolu nad výrobou.
          </p>

          <div class="usp-prod_timeline">
            ${howItems
              .map(
                (it, idx) => `
                  <div class="usp-prod_step">
                    <div class="usp-prod_step-badge">
                      <div class="usp-prod_step-num">#${escapeHtml(it.step)}</div>
                      <div class="usp-prod_step-dot" aria-hidden="true"></div>
                    </div>

                    <div class="usp-prod_step-content">
                      <div class="usp-prod_step-head">
                        <!-- right icon removed by request -->
                        <h5 data-i18n="uspProduction.how.${idx}.title">${escapeHtml(it.title)}</h5>
                      </div>
                      <p data-i18n="uspProduction.how.${idx}.text">${escapeHtml(it.text)}</p>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>

      </div>
    `;

    // Preserve reveal/hide behavior for right timeline items
    initTimelineReveal(mount);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[genetia][usp-production] init failed:", err);
  }
}
