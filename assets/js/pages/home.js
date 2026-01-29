// GENETIA v2 – Home page orchestrator

import { initUspProduction } from "./home/usp-production.js";

function safeInit(initFn, name) {
  if (typeof initFn !== "function") return;

  try {
    initFn();
  } catch (err) {
    console.warn(`[genetia][home] ${name} failed:`, err);
  }
}

export const initHome = () => {
  
  safeInit(initUspProduction, "usp-production");

  
};
