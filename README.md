# High Dive Vault

Production build for highdivevault.com.

## What's in here

- `index.html` — single-page app shell with dark/light/auto theme toggle
- `vault-styles.css` — all styles, light and dark theme
- `vault-app.js` — routing, shelf/search/sheet UI, no dependencies
- `vault-data.js` — 226 bottles across 11 shelves
- `assets/` — logos, favicon, OG card
- `CNAME` — set to `highdivevault.com` for GitHub Pages
- `.nojekyll` — prevents Jekyll processing

## Deploy to GitHub Pages

Upload the contents of this folder directly into the repo root (not the ZIP itself).

Required files at repo root:
- `index.html`
- `vault-app.js`
- `vault-data.js`
- `vault-styles.css`
- `CNAME`
- `.nojekyll`
- `assets/` folder

Then: **GitHub repo Settings → Pages → Deploy from branch → main / (root)**

## Theme system

Defaults to the visitor's OS light/dark preference (`Auto`). The top-bar toggle lets visitors switch to `Light` or `Dark` — choice is saved in `localStorage`.
