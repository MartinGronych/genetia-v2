// assets/js/contact/map.js
// GENETIA – Google Maps (Kontakt) – PROD
// - Dynamic inline bootstrap loader (oficiální pattern) => importLibrary() spolehlivě
// - loading=async => bez performance warningu
// - importLibrary("maps") + importLibrary("marker")
// - AdvancedMarkerElement s HTML <button> (logo) + a11y (click/Enter/Space)
// - Fallback na klasický google.maps.Marker

const LOG = "[Genetia][MAP]";

const MAPS_API_KEY = "AIzaSyDysMbJoUojF8kutq-R6FRRC2AQFv02rUs";
const MAP_ID = "3f2111e9c014ca11609f9c3b";

// Správné souřadnice – Inovační 122
const GENETIA_POS = { lat: 49.9729909, lng: 14.4754774 };

// Texty do InfoWindow
const GENETIA_TITLE = "Genetia Production";
const GENETIA_GMAPS_URL =
  "https://www.google.com/maps/place/Inova%C4%8Dn%C3%AD+122,+252+41+Zlatn%C3%ADky-Hodkovice-Doln%C3%AD+B%C5%99e%C5%BEany/@49.9729943,14.4728971,17z/data=!3m1!4b1!4m6!3m5!1s0x470b904e424d16b1:0x48444570d4a0bdf!8m2!3d49.9729909!4d14.4754774!16s%2Fg%2F11gmfs43r1";

let _gmapsBootstrapPromise;

/**
 * Oficiální inline bootstrap loader:
 * - nainstaluje google.maps.importLibrary synchronně
 * - samotný JS načte až při prvním importLibrary()
 * - safe singleton (opakované volání nic nerozbije)
 */
function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.importLibrary) return Promise.resolve();
  if (_gmapsBootstrapPromise) return _gmapsBootstrapPromise;

  _gmapsBootstrapPromise = new Promise((resolve, reject) => {
    try {
      ((g) => {
        let h, a, k;
        const p = "The Google Maps JavaScript API";
        const c = "google";
        const l = "importLibrary";
        const q = "__ib__";
        const m = document;
        let b = window;

        b = b[c] || (b[c] = {});
        const d = b.maps || (b.maps = {});
        const r = new Set();
        const e = new URLSearchParams();

        const u = () =>
          h ||
          (h = new Promise((f, n) => {
            a = m.createElement("script");

            // libraries param se skládá z toho, co se importuje přes importLibrary()
            e.set("libraries", [...r].join(","));

            for (k in g) {
              const v = g[k];
              if (v == null) continue;

              // mapIds musí být CSV nebo array -> převedeme na CSV
              const value = Array.isArray(v) ? v.join(",") : String(v);

              e.set(k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()), value);
            }

            e.set("callback", `${c}.maps.${q}`);
            a.src = `https://maps.${c}apis.com/maps/api/js?` + e.toString();

            d[q] = f;
            a.onerror = () => n(new Error(p + " could not load."));

            // loading=async => bez warningu
            a.async = true;

            // CSP nonce (pokud používáš)
            a.nonce = m.querySelector("script[nonce]")?.nonce || "";

            m.head.appendChild(a);
          }));

        if (d[l]) {
          console.warn(p + " only loads once. Ignoring:", g);
        } else {
          d[l] = (f, ...n) => (r.add(f), u().then(() => d[l](f, ...n)));
        }
      })({
        key: apiKey,
        v: "weekly",
        loading: "async",
        mapIds: MAP_ID ? [MAP_ID] : undefined,
      });

      if (window.google?.maps?.importLibrary) resolve();
      else reject(new Error(LOG + " importLibrary not installed by bootstrap"));
    } catch (err) {
      reject(err);
    }
  });

  return _gmapsBootstrapPromise;
}

function buildInfoHtml() {
  return `
    <div class="map-iw">
      <div class="map-iw_addr">
        Inovační 122, <br> Zlatníky-Hodkovice 252 41
      </div>
      <div class="map-iw_actions">
        <a class="map-iw_link"
           href="${GENETIA_GMAPS_URL}"
           target="_blank"
           rel="noopener">
          Otevřít v Google Maps
        </a>
      </div>
    </div>
  `;
}

export async function initContactMap() {
  const el = document.getElementById("contactMap");
  if (!el) {
    console.warn(LOG, "Missing element #contactMap in HTML");
    return;
  }

  // 1) načti bootstrap (nainstaluje importLibrary)
  try {
    await loadGoogleMaps(MAPS_API_KEY);
  } catch (err) {
    console.error(LOG, "Google Maps bootstrap failed", err);
    return;
  }

  // 2) import knihoven
  let Map;
  try {
    ({ Map } = await google.maps.importLibrary("maps"));
  } catch (err) {
    console.error(LOG, "importLibrary('maps') failed", err);
    return;
  }

  let AdvancedMarkerElement = null;
  try {
    const markerLib = await google.maps.importLibrary("marker");
    AdvancedMarkerElement = markerLib?.AdvancedMarkerElement || null;
  } catch {
    AdvancedMarkerElement = null; // fallback OK
  }

  // 3) init map
  const mapOptions = {
    center: GENETIA_POS,
    zoom: 15,
    heading: 0,
    tilt: 0,

    // Pozn.: ve v1 byl gestureHandling dvakrát; zachovávám výsledné chování ("greedy")
    gestureHandling: "greedy",
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,

    fullscreenControl: false,
    streetViewControl: true,
    mapTypeControl: false,
    zoomControl: true,
  };

  if (MAP_ID && MAP_ID !== "VLOZ_SEM_MAP_ID") mapOptions.mapId = MAP_ID;

  let map;
  try {
    map = new Map(el, mapOptions);
  } catch (err) {
    console.error(LOG, "Map init failed (check Map ID?)", err);
    return;
  }

  const iwHeader = document.createElement("div");
  iwHeader.className = "map-iw_header";
  iwHeader.textContent = GENETIA_TITLE;

  // 4) InfoWindow
  const info = new google.maps.InfoWindow({
    headerContent: iwHeader,
    content: buildInfoHtml(),
  });

  const badge = document.createElement("button");
  badge.type = "button";
  badge.className = "map-markerBadge";
  badge.title = GENETIA_TITLE;
  badge.setAttribute("aria-label", `${GENETIA_TITLE} – zobrazit adresu`);
  badge.style.pointerEvents = "auto";
  badge.style.cursor = "pointer";

  const logo = document.createElement("img");
  // v2 folder routing: /kontakt/ → assets jsou o level výš
  logo.src = "../assets/images/logo/GENETIA-LOGO.png";
  logo.alt = "Genetia";
  logo.className = "map-markerBadge_logo";
  badge.appendChild(logo);

  const openInfo = (anchor) => {
    info.close();
    if (anchor) info.open({ map, anchor });
    else info.open({ map, position: GENETIA_POS });
  };

  badge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openInfo();
  });

  badge.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openInfo();
    }
  });

  // 5) Marker (AdvancedMarker -> fallback)
  try {
    if (AdvancedMarkerElement) {
      const advMarker = new AdvancedMarkerElement({
        map,
        position: GENETIA_POS,
        title: GENETIA_TITLE,
        content: badge,
        gmpClickable: true,
      });

      advMarker.addEventListener("gmp-click", (e) => {
        e?.stopPropagation?.();
        openInfo(advMarker);
      });

      // doplníme anchor i při kliknutí na badge
      badge.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openInfo(advMarker);
      });

      badge.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          openInfo(advMarker);
        }
      });

      console.info(LOG, "AdvancedMarkerElement OK");
    } else {
      const marker = new google.maps.Marker({
        map,
        position: GENETIA_POS,
        title: GENETIA_TITLE,
      });

      marker.addListener("click", () => openInfo(marker));
      console.info(LOG, "Fallback Marker OK");
    }
  } catch (err) {
    console.error(LOG, "Marker init failed", err);
  }
}

export default { initContactMap };
