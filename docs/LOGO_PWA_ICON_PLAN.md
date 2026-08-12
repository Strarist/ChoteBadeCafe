# Logo & PWA icon system — plan & audit

**Status:** Planned (not fully executed). Interim favicon SVG aligned to the in-app Logo mark.

**Audience:** Design + eng. Goal: premium home-screen and browser tab icons that match Chote Bade’s cream / gold / burgundy cafe brand.

---

## Current state (audit)

| Surface | Today | Gap |
|---|---|---|
| In-app wordmark | `Logo.tsx` — gold ring, cup, CB, “Chote Bade” | Strong brand signal in nav |
| Favicon / PWA | `public/favicon.svg` (cream tile + gold mark) | No 192 / 512 PNG; SVG-only install icons are inconsistent on iOS / Android |
| Manifest | `vite.config.ts` → single SVG `purpose: any maskable` | Maskable safe-zone not validated; no `apple-touch-icon` |
| Theme | `#ede6da` cream | OK — keep |

Remote Unsplash photos are unrelated to the logo system but affect “premium” perception on Menu; prefer self-hosted dish photos in a later pass.

---

## Brand rules for icons

1. **Mark first** — gold ring + cup + CB on cream. Wordmark optional on wide splash only.
2. **No glass / purple / neon** — match cafe palette (`cream`, `gold #c9a24b`, `burgundy #5c2a32`, `clay`).
3. **Safe zone** — keep cup inside ~80% of canvas for maskable Android adaptive icons.
4. **One composition** — solid cream (or soft paper grain), not a photo collage.

---

## Deliverables (next sprint)

1. Export master SVG from `Logo.tsx` (already mirrored in `favicon.svg`).
2. Rasterize:
   - `icon-192.png`, `icon-512.png` (any)
   - `icon-512-maskable.png` (safe padding)
   - `apple-touch-icon.png` (180×180)
3. Wire in `vite.config.ts` `manifest.icons` + `index.html` `<link rel="apple-touch-icon">`.
4. Optional splash / OG image (1200×630) for share cards — brand + one cafe photo, no glass chips.
5. Visual QA on: Chrome install, iOS Add to Home Screen, Android adaptive icon shapes.

---

## Acceptance checks

- [ ] Installed PWA icon readable at 48px and 192px
- [ ] Matches nav Logo colors within ~5%
- [ ] No empty / default browser globe on iOS
- [ ] Maskable crop does not clip cup handle or steam

---

## Out of scope here

Homepage / menu UX, cart bar, Lenis, and deploy seed — tracked in the main hardening pass, not this plan.
