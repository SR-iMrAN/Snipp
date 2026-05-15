# SNIPP — Ultra-Short Links

Lightweight, privacy-first URL shortener designed to run as a static single-page app.

## Summary
- Shorten long URLs into compact, friendly links.
- History is stored locally in the browser (`localStorage`).
- Links generated for sharing include the destination encoded in the URL so they work across devices (no backend required).
- QR code generation and download supported for sharing/scanning.
- Clean path short URLs are supported when deployed (Netlify `/_redirects` or `netlify.toml` used).

## Features
- Generate a short code (custom or auto-generated suffix).
- Copy the shareable short link (the real redirect target is embedded in the link via `?u=` encoding).
- Open the destination via an in-app redirect overlay.
- Show saved history (local only) with click counts.
- Generate QR code for each short link and download it as PNG.
- SPA-friendly routing with 404 fallback and Netlify redirect support.

## Limitations
- History and click counts are stored in the browser's `localStorage` on the device where links are created.
- To make short links persistent across browsers/devices (history synced), you'll need a server/backend or a cloud storage service.

## Local development
1. Install a static server (e.g. `serve`) and run with SPA fallback:

```bash
# from project root
npx serve -s .
```

2. Open the site at the address reported by `serve` (usually `http://localhost:5000`).

Note: Some simple dev servers that do not support SPA fallbacks will return `Cannot GET /<code>` for clean-path short URLs. Use a server with SPA fallback or test with the `#hash` form during development.

## Deploying to Netlify
- Make sure `_redirects` and/or `netlify.toml` are present at project root. Example `_redirects` entry:

```
/* /index.html 200
```

- Set the publish directory to the project root (or ensure the build output includes `index.html` and redirect files).
- Deploy via the Netlify UI or CLI.
- After deployment, clean path short links like `https://your-site.net/<code>` will work.

## Usage (quick)
1. Paste a long URL into the input.
2. Optionally enter a custom code (letters, numbers, underscore, dash).
3. Click **Generate Short Link**.
4. Copy the link or open it. Use the QR button to view and download the QR image.

## Error handling
- If an invalid or unknown code is visited, the app shows an in-page error overlay with a link back to Home.
- If you see a Netlify `404` for path URLs, confirm `_redirects`/`netlify.toml` exist and the site is publishing the project root.

## Files of interest
- `index.html` — main app (UI + client-side routing)
- `_redirects` — Netlify redirect rules (SPA fallback)
- `netlify.toml` — optional Netlify configuration
- `404.html` — fallback that redirects to the app when Netlify returns 404

## Owner / Contact
Developed by Sifatur Rahman Imran
- Portfolio / contact: https://sr-imran.github.io/sri/
- GitHub: https://github.com/SR-iMrAN

## Next steps / Improvements
- Add a backend (API + DB) to persist links and let multiple users/devices manage the same short links.
- Add analytics and link management (edit/delete) on a centralized dashboard.

---
Generated and maintained in this workspace. If you want I can also add a small `package.json` and a `start` script for easier local testing.