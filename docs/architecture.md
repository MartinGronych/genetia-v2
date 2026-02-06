# Genetia – Architecture

## Core Goals
- One global CSS entry (`assets/css/styles.css`)
- One page-level CSS (`assets/css/pages/<page>.css`)
- One JS entry (`assets/js/app.js`) with routing via `data-page`
- System-first theming (light/dark ready)
- i18n prepared via JSON
- Legal content driven via JSON
- State-driven CSS using variables

---

## Production Principles
- Always deploy **build-ready files only** (no dev artifacts).
- Never upload directly into production root — use staged deploy when possible.
- Keep the webroot clean (no nested project folders).
- Prefer relative paths to support folder routing.
- Avoid runtime dependencies unless necessary.

---

## HTML Conventions
- `lang` must be present on `<html>`
- `<html data-page="...">` required for JS routing
- Theme set early via inline script to prevent FOUC
- Exactly **one `<h1>` per page**
- Unique `<title>` and `<meta name="description">`
- Canonical defined on every indexable page

---

## CSS Architecture
- `styles.css` imports:
  - tokens
  - base
  - layout
  - components
  - themes

- `pages/*.css` is **layout-only**
  ❗ Never define reusable components here.

- Prefer CSS variables for:
  - themes
  - states
  - overrides

- Avoid deep selector nesting.

---

## JS Architecture
- Only `app.js` is linked in HTML.
- Page modules lazy-loaded via dynamic `import()`.
- No inline scripts except critical bootstrapping.
- Prefer progressive enhancement.

---

## Asset Handling
### getAssetBase()
Always use it for fetch paths from both root and subpages.

Prevents issues like:

/o-spolecnosti/assets/...


instead of:

/assets/...


---

## Routing Strategy
- Folder routing preferred:

/produkty/
/kontakt/
/o-spolecnosti/


NOT:

/produkty.html


Benefits:
- cleaner URLs
- better SEO
- easier scaling

---

## SEO Baseline (Production Minimum)
Every page must have:

- canonical
- meta description
- open graph basics
- indexable robots rules

Required files in root:

/robots.txt
/sitemap.xml
/404.html


---

## Deployment Workflow (Recommended)
1. Upload build to `/deploy` (or staging).
2. Verify assets + routing.
3. Rename `/web` → `/web_old`
4. Rename `/deploy` → `/web`

Result:
- near-zero downtime
- instant rollback possible

---

## Security & Stability
- Enforce HTTPS
- Redirect HTTP → HTTPS
- Avoid exposing server structure
- Remove default hosting files
- Disable unused services when possible

---

## Performance Baseline
- Compress images
- Avoid oversized video
- Minimize blocking JS
- Use system fonts fallback
- Enable caching (server-level if available)

---

## Migration Workflow (v1 → v2)
1. Verify `/ui-kit/`
2. Implement global tokens + components
3. Migrate section-by-section
4. Remove legacy classes
5. Normalize selectors
6. Test responsive behavior
7. Production check before deploy

---

## Golden Rule
> Architecture exists to prevent future chaos.

Every new component must:
- respect tokens
- be reusable
- avoid duplication
- remain predictable