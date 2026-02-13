/**
 * ========================================
 * KONTAKTNÍ FORMULÁŘ - JAVASCRIPT MODUL (PROD SAFE)
 * ========================================
 * Fixy:
 * - sjednocení na interests_* (podle aktuálního HTML)
 * - reCAPTCHA v3 přes grecaptcha.ready()
 * - robustní parsing odpovědi (JSON i plain text)
 * + GA4 dataLayer tracking (form_submit, form_error)
 */

const LOG = "[Genetia][contact-form]";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

function whenRecaptchaReady() {
  return new Promise((resolve, reject) => {
    const g = window.grecaptcha;
    if (!g || typeof g.ready !== "function" || typeof g.execute !== "function") {
      reject(new Error("grecaptcha not available"));
      return;
    }
    g.ready(() => resolve(g));
  });
}

/**
 * Helper: bezpečné pushování do dataLayer
 */
function pushDataLayer(eventData) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
}

export function initContactForm(userConfig = {}) {
  const DEFAULT_CONFIG = {
    recaptchaSiteKey: "6LehyWEsAAAAACaW5n_TtkHNq3x0b1Fk7cR-1Uge",
    appsScriptUrl:
      "https://script.google.com/macros/s/AKfycbwvIa4jSdIPU-4EbJaY3V9kFfHcrSqo7wsuAu13yO3KGcD2t57RfgPTZ7di2oCW-2BL/exec",
    recaptchaAction: "submit",
  };

  const config = { ...DEFAULT_CONFIG, ...userConfig };

  if (!config.recaptchaSiteKey || !config.appsScriptUrl) {
    console.error(LOG, "Missing config: recaptchaSiteKey or appsScriptUrl");
    return;
  }

  const form = document.getElementById("contactForm");
  if (!form) {
    console.info(LOG, "No #contactForm on this page");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const messageDiv = document.getElementById("formInlineMessage");

  // ✅ podle aktuálního HTML (interests_*)
  const extraktyCheckbox = form.querySelector('input[name="interests_extrakty"]');
  const analyzyCheckbox = form.querySelector('input[name="interests_analyzy"]');
  const interestsSummary = form.querySelector('input[name="interests_summary"]');

  const recaptchaTokenField = document.getElementById("recaptchaToken");

  function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `form__inline-message form__inline-message--${type}`;
    messageDiv.hidden = false;

    if (type === "success") {
      window.setTimeout(() => {
        messageDiv.hidden = true;
      }, 5000);
    }
  }

  function clearMessage() {
    if (!messageDiv) return;
    messageDiv.hidden = true;
    messageDiv.textContent = "";
  }

  function updateInterestsSummary() {
    const interests = [];
    if (extraktyCheckbox?.checked) interests.push("Výroba konopných extraktů");
    if (analyzyCheckbox?.checked) interests.push("Analytické služby");

    if (interestsSummary) {
      interestsSummary.value = interests.length ? interests.join(", ") : "Neurčeno";
    }
  }

  extraktyCheckbox?.addEventListener("change", updateInterestsSummary);
  analyzyCheckbox?.addEventListener("change", updateInterestsSummary);
  updateInterestsSummary();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    if (!form.checkValidity()) {
      showMessage("Prosím vyplňte všechna povinná pole.", "error");
      form.reportValidity();
      return;
    }

    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot?.value) {
      console.warn(LOG, "Honeypot filled; aborting");
      return;
    }

    const originalText = submitBtn?.textContent || "Odeslat zprávu";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Odesílám...";
    }

    try {
      // reCAPTCHA (bez pádu stránky, když není dostupná)
      let token = "";
      try {
        const g = await whenRecaptchaReady();
        token = await g.execute(config.recaptchaSiteKey, { action: config.recaptchaAction });
      } catch (recaptchaErr) {
        console.warn(LOG, "reCAPTCHA unavailable; continuing without token", recaptchaErr);
      }

      if (recaptchaTokenField) recaptchaTokenField.value = token;

      // FormData + mapování pro Apps Script
      const raw = new FormData(form);
      const mapped = new FormData();

      for (const [key, value] of raw.entries()) {
        if (key === "_replyto") {
          mapped.append("email", value);
          continue;
        }
        mapped.append(key, value);
      }

      const res = await fetch(config.appsScriptUrl, {
        method: "POST",
        body: mapped,
        redirect: "follow",
      });

      const text = await res.text();
      const data = safeJsonParse(text);

      const success =
        (data && (data.success === true || data.ok === true)) ||
        (res.ok && /success|ok/i.test(text));

      if (success) {
        // ✅ GA4 dataLayer tracking - úspěšné odeslání
        pushDataLayer({
          event: "form_submit",
          form_name: "contact_form",
          form_id: "contactForm",
          form_destination: config.appsScriptUrl,
        });

        showMessage("Děkujeme! Vaše zpráva byla úspěšně odeslána.", "success");
        form.reset();
        updateInterestsSummary();
      } else {
        console.warn(LOG, "Submit failed", { status: res.status, body: text });

        // ✅ GA4 dataLayer tracking - chyba odeslání
        pushDataLayer({
          event: "form_error",
          form_name: "contact_form",
          form_id: "contactForm",
          error_message: `HTTP ${res.status}`,
        });

        showMessage("Omlouváme se, při odesílání došlo k chybě. Zkuste to prosím znovu.", "error");
      }
    } catch (err) {
      console.error(LOG, "Submit error", err);

      // ✅ GA4 dataLayer tracking - network/JS chyba
      pushDataLayer({
        event: "form_error",
        form_name: "contact_form",
        form_id: "contactForm",
        error_message: err.message || "Unknown error",
      });

      showMessage("Omlouváme se, při odesílání došlo k chybě. Zkuste to prosím znovu.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  console.info(LOG, "initialized");
}

export default { initContactForm };