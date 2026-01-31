// assets/js/contact/form.js
// Kontakt – form logic (no reCAPTCHA)
// - progressive enhancement (no crash)
// - inline message uses #formInlineMessage (already in HTML)
// - uses v2 markup: .form__error elements + required attributes

const LOG = "[Genetia][FORM]";

function qs(root, sel) {
  return root.querySelector(sel);
}

function setInlineMessage(form, { text, variant }) {
  const box = qs(form, "#formInlineMessage");
  if (!box) return;

  box.textContent = text || "";
  box.hidden = !text;

  // minimal, safe: use data attribute (no CSS required)
  if (variant) box.dataset.variant = variant;
  else delete box.dataset.variant;
}

function setFieldError(form, fieldId, show, message) {
  const p = qs(form, `#error-${fieldId}`);
  if (!p) return;

  if (show) {
    if (message) p.textContent = message;
    p.hidden = false;
  } else {
    p.hidden = true;
  }
}

function isEmail(value) {
  // simple, robust email sanity check (HTML type=email is primary)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function summarizeInterests(form) {
  const checks = form.querySelectorAll(".form__check-input[data-interest]");
  const picked = [];

  checks.forEach((el) => {
    if (el.checked) picked.push(el.getAttribute("data-interest"));
  });

  const summary = picked.length ? picked.join(", ") : "Nezvoleno";
  const hidden = form.querySelector('input[name="interest_summary"]');
  if (hidden) hidden.value = summary;

  return summary;
}

function getSubmitUrl(form) {
  // 1) explicit action
  const action = form.getAttribute("action");
  if (action) return action;

  // 2) data-endpoint
  const endpoint = form.getAttribute("data-endpoint");
  if (endpoint) return endpoint;

  // 3) no endpoint -> we still do UX but don't send
  return "";
}

function disableSubmit(form, disabled) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = Boolean(disabled);
  btn.setAttribute("aria-disabled", String(Boolean(disabled)));
}

function validate(form) {
  // Clear previous errors
  ["name", "email", "message"].forEach((id) => setFieldError(form, id, false));

  const name = qs(form, "#name")?.value?.trim() || "";
  const email = qs(form, "#email")?.value?.trim() || "";
  const message = qs(form, "#message")?.value?.trim() || "";

  let ok = true;

  if (!name) {
    setFieldError(form, "name", true, "Zadejte prosím jméno.");
    ok = false;
  }

  if (!email || !isEmail(email)) {
    setFieldError(form, "email", true, "Zadejte prosím platný e-mail.");
    ok = false;
  }

  if (!message) {
    setFieldError(form, "message", true, "Napište prosím krátkou zprávu.");
    ok = false;
  }

  // Honeypot
  const gotcha = qs(form, '#website, input[name="_gotcha"]')?.value?.trim() || "";
  if (gotcha) ok = false;

  return ok;
}

async function submitForm(form) {
  const url = getSubmitUrl(form);

  // Always compute interest summary (even if not sent)
  summarizeInterests(form);

  if (!url) {
    // No endpoint configured -> still provide UX feedback
    setInlineMessage(form, {
      text: "Formulář je připravený, ale chybí endpoint pro odeslání (action / data-endpoint).",
      variant: "warning",
    });
    return;
  }

  // Build payload
  const fd = new FormData(form);

  // Prefer fetch with JSON? We'll keep it compatible: send as FormData.
  const res = await fetch(url, {
    method: "POST",
    body: fd,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res;
}

export function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) {
    console.warn(LOG, "Missing #contactForm. Form init skipped.");
    return;
  }

  // Update interests summary on change (progressive enhancement)
  form.addEventListener("change", (e) => {
    const t = e.target;
    if (t && t.classList && t.classList.contains("form__check-input")) {
      summarizeInterests(form);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    setInlineMessage(form, { text: "", variant: "" });

    const ok = validate(form);
    if (!ok) {
      setInlineMessage(form, {
        text: "Zkontrolujte prosím zvýrazněná pole.",
        variant: "error",
      });
      return;
    }

    disableSubmit(form, true);
    setInlineMessage(form, { text: "Odesílám…", variant: "info" });

    try {
      await submitForm(form);

      // success UX
      form.reset();
      summarizeInterests(form);

      setInlineMessage(form, {
        text: "Děkujeme! Zpráva byla odeslána.",
        variant: "success",
      });
    } catch (err) {
      console.error(LOG, "Submit failed:", err);
      setInlineMessage(form, {
        text: "Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám napište e-mail.",
        variant: "error",
      });
    } finally {
      disableSubmit(form, false);
    }
  });

  // Initial state
  summarizeInterests(form);
  console.info(LOG, "OK");
}

export default { initContactForm };
