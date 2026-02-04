// assets/js/pages/services/benefits-render.js
import { withAssetBase } from "../../core/paths.js";

/**
 * Benefits render (Analytické služby)
 * - source: /assets/data/benefits.json (via withAssetBase)
 * - mount: #benefitsMount
 */
export async function renderBenefits() {
  const mount = document.getElementById("benefitsMount");
  if (!mount) return;

  try {
    const url = withAssetBase("/assets/data/benefits.json");

    const res = await fetch(url, {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error(`benefits.json fetch failed (${res.status})`);

    const data = await res.json();
    const benefits = Array.isArray(data?.benefits) ? data.benefits : [];

    if (!benefits.length) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = benefits
      .map((b, index) => {
        const isReverse = index % 2 === 1;

        const id = escAttr(String(b?.id || "").trim());
        const title = escHtml(String(b?.title || "").trim());
        const subtitle = escHtml(String(b?.subtitle || "").trim());

        const details = Array.isArray(b?.details) ? b.details : [];
        const image = String(b?.image || "").trim();

        const imageAltRaw = String(b?.imageAlt || "").trim();
        const imageAlt =
          imageAltRaw ||
          (title ? `Ilustrační fotografie: ${stripTags(title)}` : "Ilustrační fotografie");

        // Use asset base for images too (GH Pages safe)
        const imgSrc = image ? withAssetBase(`/assets/images/benefits/${image}`) : "";

        return `
          <section class="benefit ${isReverse ? "benefit--reverse" : ""}" id="${id}" data-benefit>
            <div class="benefit__grid">
              <div class="benefit__text">
                <header class="benefit__header">
                  <h3 class="benefit__title">${title}</h3>
                </header>

                ${subtitle ? `<p class="benefit__subtitle">${subtitle}</p>` : ""}

                ${
                  details.length
                    ? `<ul class="benefit__list">
                        ${details
                          .map((li) => `<li class="benefit__listItem">${escHtml(String(li))}</li>`)
                          .join("")}
                      </ul>`
                    : ""
                }
              </div>

              <div class="benefit__media">
                ${
                  imgSrc
                    ? `<figure class="benefit__mediaFrame">
                        <img
                          class="benefit__image"
                          src="${escAttr(imgSrc)}"
                          alt="${escAttr(imageAlt)}"
                          loading="lazy"
                          decoding="async"
                        />
                      </figure>`
                    : `<div class="benefit__placeholder" aria-hidden="true"></div>`
                }
              </div>
            </div>
          </section>
        `;
      })
      .join("");
  } catch (err) {
    console.error("[GENETIA][benefits][render] failed", err);
    mount.innerHTML = "";
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

function stripTags(html) {
  return String(html).replace(/<[^>]*>/g, "");
}
