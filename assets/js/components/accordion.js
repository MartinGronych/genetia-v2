// assets/js/components/accordion.js
// Genetia v2 – Accordion
// Direct migration from v1 faq-fade.js (working logic)

const LOG_PREFIX = "[Genetia][Accordion]";

export function initAccordion() {
  const items = document.querySelectorAll(".accordion__item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");

    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // close others
      items.forEach((other) => {
        if (other !== item) closeItem(other);
      });

      if (isOpen) closeItem(item);
      else openItem(item);
    });
  });
}

function openItem(item) {
  const panel = item.querySelector(".accordion__panel");
  const btn = item.querySelector(".accordion__trigger");

  item.classList.add("open");
  btn.setAttribute("aria-expanded", "true");

  panel.style.display = "block";
  const height = panel.scrollHeight + "px";

  requestAnimationFrame(() => {
    panel.style.maxHeight = height;
  });
}

function closeItem(item) {
  const panel = item.querySelector(".accordion__panel");
  const btn = item.querySelector(".accordion__trigger");

  btn.setAttribute("aria-expanded", "false");

  const height = panel.scrollHeight + "px";
  panel.style.maxHeight = height;

  requestAnimationFrame(() => {
    panel.style.maxHeight = "0";
  });

  item.classList.remove("open");

  panel.addEventListener(
    "transitionend",
    () => {
      if (!item.classList.contains("open")) {
        panel.style.display = "none";
      }
    },
    { once: true }
  );
}

export default initAccordion;
