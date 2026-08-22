# Cafe order management system

Monorepo for the cafe ordering front-end + payment layer (feeds PetPooja). Not a full POS replacement.

## Apps

| Path | Role | Dev URL |
|---|---|---|
| `apps/customer-app` | Chote Bade customer site (Vite) — brand design + ordering | http://localhost:3000 |
| `apps/counter-pos` | React + Vite counter POS | http://localhost:5173 |
| `apps/backend` | NestJS API + Socket.IO | http://localhost:3001 |

## Packages

| Path | Role |
|---|---|
| `packages/shared-types` | Shared Order / Menu / Payment types + socket event names |
| `packages/database` | Prisma client output (`@cafe/database`) |
| `packages/ui` | Shared design tokens (minimal for now) |

## Secrets

Real env files are gitignored. Only these templates belong in git:

- `.env.example` — local dev
- `.env.production.example` — deploy placeholders

Before the first push: `pnpm check:secrets`. GitHub also runs this on every push/PR.

## Docs for humans

| Doc | What it is |
|---|---|
| [DEPLOY.md](./DEPLOY.md) | VPS / Docker deploy |
| [DEPLOY-CLOUD.md](./DEPLOY-CLOUD.md) | Render free-tier cloud |

Internal audit / design reports are kept out of git on purpose.

## Local setup


1. Copy env: `cp .env.example .env`
2. Start Postgres + Redis: `docker compose up -d`
3. Install: `pnpm install` (runs `prisma generate` via postinstall)
4. Migrate: `pnpm db:migrate`
5. Dev (backend + both frontends): `pnpm dev`

Or run individually:

```bash
pnpm --filter @cafe/backend dev
pnpm --filter @cafe/customer-app dev
pnpm --filter @cafe/counter-pos dev
```

## Admin

- URL: http://localhost:5174
- Roles: `admin` (full), `manager` (ops), `cashier` (counter only — blocked from admin UI)
- Seed PINs: Admin/`1234`, Manager/`2345`, Cashier/`3456` (change before production)

## Integration prerequisites

| Integration | Fake (dev default) | Live prep |
|---|---|---|
| PetPooja | `PETPOOJA_ADAPTER=fake` | Set `PETPOOJA_APP_KEY` / `APP_SECRET` / `ACCESS_TOKEN` / `REST_ID` + `PUBLIC_API_URL` + webhook secret, then `PETPOOJA_ADAPTER=live`. Callbacks: `/petpooja/webhooks/order-status` + `/petpooja/webhooks/push-menu` |
| Razorpay | `PAYMENT_ADAPTER=fake` | Set `RAZORPAY_KEY_ID` / `KEY_SECRET` / `WEBHOOK_SECRET` + `PAYMENT_ADAPTER=live`; configure webhook events (`payment.captured`, `payment.failed`, `order.paid`); see [DEPLOY.md](./DEPLOY.md) |
| WhatsApp/SMS | `NOTIFICATION_ADAPTER=fake` | Set BSP + SMS keys + `NOTIFICATION_ADAPTER=live` (impl pending provider choice) |

Readiness: `GET /health/integrations`

```bash
node scripts/smoke-prep.js
node scripts/audit-flow.js
```

## Production deploy

**Free cloud (no credit card):** create Free Render services by hand — do **not** use Blueprint. See [DEPLOY-CLOUD.md](./DEPLOY-CLOUD.md).

**Single VPS (Docker + Caddy):** see [DEPLOY.md](./DEPLOY.md). Short version:

```bash
cp .env.production.example .env.production
# fill secrets + SITE_ADDRESS
pnpm deploy:check
pnpm deploy:up
```

| Path | App |
|---|---|
| `/` | Customer |
| `/counter/` | Counter POS |
| `/admin/` | Admin |
| `/api/*` | Nest API |

