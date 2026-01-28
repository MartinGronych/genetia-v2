// assets/js/components/tabs.js
// Global Tabs component (v2)
// Behavior:
// - click to switch
// - keyboard: Left/Right, Home/End
// - keeps aria-selected + tabindex in sync
// - toggles [hidden] on panes
// - safe-guards so page never crashes

const LOG_PREFIX = "[Genetia][Tabs]";

function qsa(root, sel) {
  return Array.from(root.querySelectorAll(sel));
}

function getTabsRoots(scope = document) {
  return qsa(scope, "[data-tabs]");
}

function normalizeId(value) {
  return String(value || "").trim();
}

function setupA11y(root, tabs, panesByKey) {
  // Ensure tablist semantics exist
  const tabList = root.querySelector(".tabs__list");
  if (tabList && !tabList.hasAttribute("role")) tabList.setAttribute("role", "tablist");

  // Ensure each tab has tabindex and optional aria-controls
  tabs.forEach((tab) => {
    const key = normalizeId(tab.dataset.tab);
    const pane = panesByKey.get(key);

    // tabindex: only selected tab should be 0
    const selected = tab.getAttribute("aria-selected") === "true";
    tab.setAttribute("tabindex", selected ? "0" : "-1");

    // aria-controls / id linking (optional but nice)
    if (pane) {
      if (!tab.id) tab.id = `tab-${key || Math.random().toString(16).slice(2)}`;
      if (!pane.id) pane.id = `pane-${key || Math.random().toString(16).slice(2)}`;

      tab.setAttribute("aria-controls", pane.id);
      pane.setAttribute("aria-labelledby", tab.id);
    }
  });
}

function setActive(root, key) {
  const tabs = qsa(root, ".tabs__tab[role='tab'], .tabs__tab");
  const panes = qsa(root, ".tabs__pane[role='tabpanel'], .tabs__pane");

  const k = normalizeId(key);
  if (!k) return;

  let found = false;

  tabs.forEach((tab) => {
    const tabKey = normalizeId(tab.dataset.tab);
    const isActive = tabKey === k;

    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    tab.setAttribute("tabindex", isActive ? "0" : "-1");

    if (isActive) found = true;
  });

  panes.forEach((pane) => {
    const paneKey = normalizeId(pane.dataset.pane);
    const isActive = paneKey === k;

    if (isActive) pane.removeAttribute("hidden");
    else pane.setAttribute("hidden", "");
  });

  if (!found) {
    // fallback: if key not found, activate first
    const first = tabs[0];
    if (first) setActive(root, normalizeId(first.dataset.tab));
  }
}

function handleClick(e) {
  const btn = e.target.closest(".tabs__tab");
  if (!btn) return;

  const root = btn.closest("[data-tabs]");
  if (!root) return;

  const key = normalizeId(btn.dataset.tab);
  if (!key) return;

  setActive(root, key);
  btn.focus({ preventScroll: true });
}

function handleKeydown(e) {
  const btn = e.target.closest(".tabs__tab");
  if (!btn) return;

  const root = btn.closest("[data-tabs]");
  if (!root) return;

  const tabs = qsa(root, ".tabs__tab");
  if (!tabs.length) return;

  const currentIndex = tabs.indexOf(btn);
  if (currentIndex < 0) return;

  const key = e.key;

  const moveFocus = (nextIndex) => {
    const next = tabs[nextIndex];
    if (!next) return;
    const nextKey = normalizeId(next.dataset.tab);
    if (!nextKey) return;

    setActive(root, nextKey);
    next.focus({ preventScroll: true });
  };

  if (key === "ArrowRight") {
    e.preventDefault();
    moveFocus((currentIndex + 1) % tabs.length);
  } else if (key === "ArrowLeft") {
    e.preventDefault();
    moveFocus((currentIndex - 1 + tabs.length) % tabs.length);
  } else if (key === "Home") {
    e.preventDefault();
    moveFocus(0);
  } else if (key === "End") {
    e.preventDefault();
    moveFocus(tabs.length - 1);
  }
}

export function initTabs(scope = document) {
  try {
    const roots = getTabsRoots(scope);
    if (!roots.length) return;

    roots.forEach((root) => {
      try {
        const tabs = qsa(root, ".tabs__tab");
        const panes = qsa(root, ".tabs__pane");

        if (!tabs.length || !panes.length) return;

        const panesByKey = new Map();
        panes.forEach((pane) => panesByKey.set(normalizeId(pane.dataset.pane), pane));

        // Ensure initial state (prefer aria-selected="true")
        const selectedTab =
          tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];

        setupA11y(root, tabs, panesByKey);
        setActive(root, normalizeId(selectedTab?.dataset.tab));

        // Bind once per root
        if (!root.__genetiaTabsBound) {
          root.addEventListener("click", handleClick);
          root.addEventListener("keydown", handleKeydown);
          root.__genetiaTabsBound = true;
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} init root failed`, err);
      }
    });
  } catch (err) {
    console.error(`${LOG_PREFIX} init failed`, err);
  }
}

export default initTabs;
