# Genetia – Architecture

## Goals
- One global CSS entry (`assets/css/styles.css`) + one page-only CSS (`assets/css/pages/<page>.css`)
- One JS entry (`assets/js/app.js`) with page routing via `data-page`
- Prepared for system-default theme, i18n via JSON, legal via JSON, and state-driven CSS.

## HTML conventions
- `lang` on `<html>`
- `data-page` on `<html>`
- Theme on `<html data-theme="...">` (set early by inline script in `<head>`)

## CSS rules
- `styles.css` imports tokens/base/components/themes.
- `pages/*.css` is layout-only (NO component definitions).
- Use CSS variables for overrides (state-driven CSS).

## JS rules
- Only `app.js` is linked in HTML.
- Page logic lazy-loaded via dynamic `import()`.

## getAssetBase()
- Always use it for fetch paths from both root and subpages.

## Migration workflow
1) Verify `/ui-kit/`
2) Implement/adjust global tokens + components
3) Migrate Genetia v1 → v2 section-by-section
