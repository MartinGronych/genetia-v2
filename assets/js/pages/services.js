// assets/js/pages/services.js
import { LOG } from "../core/logger.js";

import { renderUspBar } from "./services/usp-render.js";
import { initUspReveal } from "./services/usp-reveal.js";
import { renderBenefits } from "./services/benefits-render.js";
import { renderPanels } from "./services/panels-render.js";

export async function init() {
  LOG.info("services init start");

  try {
    await renderUspBar();
    initUspReveal();

    await renderBenefits();
    await renderPanels();

    LOG.info("services init done");
  } catch (err) {
    LOG.error("services init failed", err);
  }
}

export default { init };