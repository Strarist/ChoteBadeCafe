# Chote Bade — site polish, mobile UX & hardening

A readable guide for students and engineers: what we changed, why it mattered, and how to verify before GitHub / deploy.

---

## 1. Big picture

| Area | Problem | Fix |
|---|---|---|
| Mobile scroll | Lenis at 4.2s duration caused stutter | Native scroll on touch; shorter Lenis on desktop |
| Cart chrome | Always-on oversized FAB, empty cart noise | Bottom **CartBar** only when items &gt; 0 |
| Navbar | Heavy glassmorphism | Solid cream **site-header** |
| Menu photos | Sharp square tiles | Rounded `.menu-photo` + hover only on fine pointers |
| Deployed menu empty | Seed gated / skipped | Entrypoint always runs idempotent `pnpm db:seed` |
| PWA icon | SVG-only | Favicon mark + PNG icons + plan for full icon system |

Homepage + Menu remain the judgment pages — most effort went there.

---

## 2. Architecture (short)

```
Customer (Vite)  →  GET /menu  →  Nest API  →  Postgres menu_items
                 →  Orders / Razorpay checkout
```

Menu **images** are not in the DB. Names from the API map to Unsplash URLs in `menuCatalog.ts`. Empty menu JSON ⇒ seed/sync. Blank squares ⇒ image CDN / mapping.

---

## 3. Mobile UX details

### Scroll & load feel
- File: `apps/customer-app/src/hooks/useSmoothScroll.ts`
- `(pointer: coarse)` or `prefers-reduced-motion` → native scroll (no Lenis rAF).
- Desktop Lenis duration ~1.15s (was 4.2).
- Cart / mobile nav call `getLenis()?.stop()` while open.

### Cart
- New: `CartBar.tsx` — fixed bottom bar, ink surface, shows count + ₹subtotal.
- Hidden when cart empty or drawer open.
- Menu “View your table” FAB removed.
- Drawer: solid cream panel (less blur), compact CTAs (`!py-2.5 text-sm`).
- Empty “Browse menu” navigates to `/menu`.

### Navbar
- Classes: `.site-header` / `.site-header-scrolled` — paper cream, hairline border, light shadow when scrolled.
- No `backdrop-filter` on the main bar.
- Mobile sheet: solid cream, not frosted glass.

### Menu photos
- `.menu-photo { border-radius: 1.25rem; … }`
- Image zoom only under `@media (hover: hover) and (pointer: fine)`.

### Homepage (mobile)
- Brand name “Chote Bade” as hero-level signal on small screens.
- Tighter spacing, smaller primary CTA, removed glass chip overlay on hero photo.
- Steam animations hidden on the smallest viewports.

---

## 4. Deployed empty menu — root cause & fix

**Cause:** Migrations create empty `menu_items`. Seed was optional (`SEED_ON_BOOT=1` only). PetPooja menu sync is still a **fake** catalog upsert — it does not import a live POS menu.

**Fix:** `deploy/api-entrypoint.sh` always runs `pnpm db:seed` after migrate. In production, seed is idempotent (fills empty menu / default staff once; does not wipe).

**Ops one-liner (existing empty DB):**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api pnpm db:seed
# or Render shell: pnpm db:seed
curl -fsS https://<host>/api/menu   # expect a JSON array, not []
```

Render start should already include `pnpm db:seed` (see `DEPLOY-CLOUD.md`).

---

## 5. Logo & PWA icons

See **[LOGO_PWA_ICON_PLAN.md](./LOGO_PWA_ICON_PLAN.md)** for the full design/export checklist.

**Interim shipped:**
- `favicon.svg` aligned to Logo mark (cream + gold ring + CB cup)
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- Manifest + `index.html` apple-touch links

**Still open:** true maskable safe-zone export, size-optimized rasters, optional OG share card.

---

## 6. How to test before push

```bash
# Infra
docker compose up -d
pnpm db:migrate:deploy   # if needed
pnpm db:seed

# Apps
pnpm dev
```

Checklist:
1. Phone or DevTools mobile: Home + Menu feel smooth (no rubbery Lenis).
2. Empty cart → no bottom bar; add item → compact bottom bar appears.
3. Navbar looks solid cream, not frosted glass.
4. Menu photos have rounded corners.
5. `GET http://127.0.0.1:3001/menu` returns items.
6. Install / Add to Home Screen shows cafe mark (not generic globe).
7. Razorpay path still works (netbanking Success in test mode).

Typecheck:

```bash
pnpm --filter @cafe/customer-app exec tsc --noEmit -p tsconfig.app.json
pnpm --filter @cafe/backend exec tsc --noEmit
```

---

## 7. Key files touched

| Concern | Paths |
|---|---|
| Scroll | `src/hooks/useSmoothScroll.ts` |
| Cart bar / layout | `CartBar.tsx`, `Layout.tsx`, `CartDrawer.tsx` |
| Navbar | `Header.tsx`, `index.css` (`.site-header*`) |
| Menu / home | `MenuPage.tsx`, `HomePage.tsx`, `index.css` (`.menu-photo`) |
| Seed on deploy | `deploy/api-entrypoint.sh`, `DEPLOY.md` |
| Icons | `public/*`, `vite.config.ts`, `index.html`, `docs/LOGO_PWA_ICON_PLAN.md` |

---

## 8. Explicitly not done (honest backlog)

- Self-hosted dish photography (replace Unsplash)
- Live PetPooja menu adapter
- Full logo design sprint (maskable QA on real devices)
- Route-level code splitting
- Rate limits / Socket.IO auth (see root `AUDIT.md`)

Ship mobile + seed + chrome polish first; then icon polish + media hosting.
