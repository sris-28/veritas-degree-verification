# VERITAS — Academic Degree Verification System

A secure, professional front-end for verifying the authenticity of academic
degrees: cross-checking certificates against a centralized registry, scanning
QR codes, generating tamper-evident integrity hashes, and giving applicants a
clear personal status dashboard — with a built-in help chatbot throughout.

## Run it

No build step, no backend, no dependencies to install.

1. Unzip this folder.
2. Open it in VS Code (or any editor) and start **Live Server** on `index.html`
   — or just double-click `index.html` to open it in a browser.
3. That's it. All "server" data is a seeded mock registry (`js/data.js`) and
   everything else is stored locally in your browser (`localStorage`), so it
   works fully offline except for two optional CDN libraries (Google Fonts,
   and the QR camera scanner on the Verify page — both degrade gracefully
   without internet).

## Pages

- `index.html` — landing page: what VERITAS does, how it works, features.
- `auth.html` — sign in / create a profile (demo auth, local only).
- `dashboard.html` — your profile, verification progress stepper, submit a
  degree for cross-checking, your verification history, recent activity.
- `verify.html` — search the registry by certificate ID, or scan a QR code
  with your camera; shows a trust score, registry details, and a SHA-256
  integrity fingerprint.
- `institutions.html` — searchable directory of accredited partner
  institutions.

## Try it end to end

On the dashboard, submit a degree using one of these sample certificate IDs
to see the different outcomes the registry can return:

| Certificate ID           | Result   |
|---------------------------|----------|
| `VRT-2021-NITD-88213`     | Verified |
| `VRT-2023-NITD-90112`     | Pending review |
| `VRT-2017-KLSI-77300`     | Flagged (integrity mismatch) |
| anything else              | No match found |

## Notable features

- **Centralized registry cross-check** — every submission is matched against
  a mock institutional database (`js/data.js`), the same way a real system
  would check against university-held records instead of trusting a PDF.
- **Real SHA-256 integrity hashing** — `js/utils.js` uses the browser's
  native Web Crypto API to generate a genuine cryptographic fingerprint of
  each matched record, demonstrating real tamper-evidence (not a fake demo
  hash).
- **QR scanning and generation** — scan a certificate's QR with your camera
  on the Verify page (`html5-qrcode`), and every verified result renders its
  own shareable QR code (`qrcode.js`).
- **Status dashboard** — a progress ring and stepper show exactly what's
  done and what's left, plus a running activity feed.
- **VERITAS Assist** — a floating, rule-based help chatbot (no API key
  needed) available on every page to explain next steps, hashing, QR codes,
  flagged results, and more.
- **Institution directory** — searchable list of accredited partners.
- **Downloadable verification report** — print/save any verification result
  as a PDF via the browser's print dialog.
- **Light/dark theme**, fully responsive from small phones to large
  desktops, and keyboard-accessible focus states throughout.

## Notes

- This is a front-end demo: "authentication" and the "centralized registry"
  are both simulated locally for the purposes of this build. Wiring it to a
  real backend would mean replacing `js/data.js`'s static arrays with API
  calls to an authenticated registry service, and `js/auth.js`'s local
  session with real account creation.
