const prefix = "[GENETIA]";
export const LOG = {
  info: (msg, data) => console.info(`${prefix} ${msg}`, data ?? ""),
  warn: (msg, data) => console.warn(`${prefix} ${msg}`, data ?? ""),
  error: (msg, err) => console.error(`${prefix} ${msg}`, err ?? "")
};
export const safeInit = async (scope, fn) => {
  try { await fn(); LOG.info(`${scope} initialized`); }
  catch (err) { LOG.error(`${scope} init failed`, err); }
};
window.addEventListener("error", (e) => LOG.error("window error", e?.error || e?.message));
window.addEventListener("unhandledrejection", (e) => LOG.error("unhandled rejection", e?.reason));
