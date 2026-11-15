# SNIPP — Ultra-Short Links

Lightweight, privacy-first URL shortener designed to run as a static single-page app.

## Summary
- Shorten long URLs into compact, friendly links.
- Links are stored in Firebase Firestore so short URLs work globally across devices.
- Local history may still be shown in the browser, but the redirect target comes from Firestore.
- QR code generation and download are supported for sharing/scanning.
- Clean path short URLs are supported when deployed (Netlify `/_redirects` or `netlify.toml` used).

## Features
- Generate a short code (custom or auto-generated suffix).
- Copy the shareable short link and open it directly; the redirect destination is stored in Firebase.
- Open the destination via an in-app redirect overlay.
- Show saved history (local only) with click counts.
- Generate QR code for each short link and download it as PNG.
- SPA-friendly routing with 404 fallback and Netlify redirect support.

## Limitations
- Link destinations are stored in Firebase Firestore, so the service requires a valid Firebase project and config.
- Local history is still browser-specific unless you extend the app to sync history from Firestore.

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
4. Copy the short link or open it. Use the QR button to view and download the QR image.

## Firebase setup
- Copy `firebase-config.example.js` to `firebase-config.local.js` and replace the placeholder values with your Firebase Web App config.
- Or create `firebase-env.js` from `firebase-env.example.js` and set `EXPO_PUBLIC_FIREBASE_*` globals before `firebase-setup.js` loads.
- `firebase-config.local.js` and `firebase-env.js` are ignored by `.gitignore`, so your private Firebase config stays local.
- If you use `firebase-env.js`, add this before the module script loader in `index.html`:

```html
<script src="./firebase-env.js"></script>
<script type="module" src="./firebase-setup.js"></script>
```

- Deploy or run locally with a static server.

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