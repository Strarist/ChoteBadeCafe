# Deploy on Render + Vercel

Do **not** put the Nest API on Vercel. It needs a long-running Node process, Postgres, Redis, and Socket.IO. Vercel is serverless and will drop those connections.

**Recommended split**

| Piece | Where | Why |
|---|---|---|
| API + migrations | Render Web Service | Always-on Node, health checks, webhooks |
| Postgres | Render Postgres | `DATABASE_URL` injected |
| Redis | Render Key Value | Socket.IO adapter |
| Customer / Counter / Admin | Vercel (3 Vite projects) | Fast CDN, SPA rewrites |

All-on-Render is also fine: keep the API as below and add 3 Static Sites instead of Vercel.

---

## A. GitHub (already done when you push `main`)

Repo: `ChoteBadeCafe`. Secrets stay out of git (`.env`, `.env.production`). Only `*.example` files are committed.

---

## B. Render — API, database, Redis

### 1. Create the Blueprint

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect the `ChoteBadeCafe` GitHub repo.
3. Render reads `render.yaml` and offers:
   - `chote-bade-db` (Postgres)
   - `chote-bade-redis` (Key Value)
   - `chote-bade-api` (Node web service)
4. Apply. Wait until Postgres is **Available** and the API deploy finishes.

### 2. Fill API env vars (Render → chote-bade-api → Environment)

Set these after the first deploy (Blueprint leaves `CORS_ORIGINS` for you):

| Key | Value |
|---|---|
| `CORS_ORIGINS` | Comma-separated Vercel URLs, e.g. `https://chote-bade.vercel.app,https://chote-bade-counter.vercel.app,https://chote-bade-admin.vercel.app` |
| `SEED_ON_BOOT` | `1` for the first boot only, then `0` |
| Razorpay / PetPooja / WhatsApp | Only when you switch that adapter to `live` |

`STAFF_SESSION_SECRET` and `PETPOOJA_WEBHOOK_SECRET` are auto-generated. Do not set `ALLOW_FAKE_PAYMENTS=1`.

### 3. Confirm the API

```bash
curl -fsS https://chote-bade-api.onrender.com/health
curl -fsS https://chote-bade-api.onrender.com/health/integrations
```

Expect `database` and `redis` = `up`. Copy this API origin — you need it on Vercel as `VITE_API_URL`.

### 4. First-boot staff

If seed ran: Admin/`1234`, Manager/`2345`, Cashier/`3456`. Change PINs in Admin immediately, then set `SEED_ON_BOOT=0` and redeploy.

### 5. Partner webhooks (when going live)

| Provider | URL |
|---|---|
| Razorpay | `https://<api-host>/payments/webhooks/razorpay` |
| PetPooja | `https://<api-host>/petpooja/webhooks/order-status` |

---

## C. Vercel — three frontends

Create **three** projects from the same GitHub repo. Each app gets its own domain.

### 1. Customer site

1. [vercel.com/new](https://vercel.com/new) → import `ChoteBadeCafe`.
2. Project name: `chote-bade` (or your brand).
3. **Root Directory**: `apps/customer-app`.
4. Framework: Vite (auto).
5. Override commands:

| Setting | Value |
|---|---|
| Install | `cd ../.. && corepack enable && pnpm install --frozen-lockfile` |
| Build | `cd ../.. && pnpm --filter @cafe/customer-app build` |
| Output | `dist` |

6. Environment variable (Production + Preview):

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://chote-bade-api.onrender.com` (no trailing slash, no `/api`) |

7. Deploy. SPA routes (`/t/:tableId`, `/order/:id`) are covered by `apps/customer-app/vercel.json`.

### 2. Counter POS

Same repo, **Add New Project** again.

| Setting | Value |
|---|---|
| Root Directory | `apps/counter-pos` |
| Install | `cd ../.. && corepack enable && pnpm install --frozen-lockfile` |
| Build | `cd ../.. && pnpm --filter @cafe/counter-pos build` |
| Output | `dist` |
| `VITE_API_URL` | same Render API origin |

### 3. Admin

| Setting | Value |
|---|---|
| Root Directory | `apps/admin` |
| Install | `cd ../.. && corepack enable && pnpm install --frozen-lockfile` |
| Build | `cd ../.. && pnpm --filter @cafe/admin build` |
| Output | `dist` |
| `VITE_API_URL` | same Render API origin |

### 4. Wire CORS

Once Vercel gives you the three `*.vercel.app` URLs (and any custom domains):

1. Put them all in Render `CORS_ORIGINS` (comma-separated, `https://`, no trailing slash).
2. Redeploy the API (or restart). Socket.IO uses the same list.

### 5. Custom domains (optional)

- Customer: `chotebade.com` / `order.chotebade.com` → Vercel customer project
- Counter: `counter.chotebade.com` → Vercel counter project
- Admin: `admin.chotebade.com` → Vercel admin project
- API can stay on `*.onrender.com`, or add `api.chotebade.com` in Render → Custom Domain, then update every `VITE_API_URL` and rebuild the Vercel projects.

QR codes on tables must use the **customer** origin, e.g. `https://chotebade.com/t/12`.

---

## D. All-on-Render (no Vercel)

If you prefer one vendor:

1. Keep section B as-is.
2. For each frontend: **New** → **Static Site** → same repo.
3. Build commands (from repo root):

```text
# customer
corepack enable && pnpm install --frozen-lockfile && VITE_API_URL=https://<api-host> pnpm --filter @cafe/customer-app build
# publish directory: apps/customer-app/dist

# counter
... && VITE_API_URL=https://<api-host> pnpm --filter @cafe/counter-pos build
# publish: apps/counter-pos/dist

# admin
... && VITE_API_URL=https://<api-host> pnpm --filter @cafe/admin build
# publish: apps/admin/dist
```

4. Rewrite `/*` → `/index.html` on each static site.
5. Put the three static-site URLs in `CORS_ORIGINS`.

---

## E. Go-live checklist

1. `curl` `/health` → both deps `up`.
2. Open customer URL → menu loads.
3. Place a pay-at-counter order → it appears on Counter.
4. Staff login on Counter + Admin (change seed PINs).
5. Confirm Socket.IO updates without refresh.
6. Set `SEED_ON_BOOT=0`.
7. When partners are ready: `PAYMENT_ADAPTER=live` / `PETPOOJA_ADAPTER=live` + real keys on Render only.

---

## F. Why not “Vercel only”?

| Need | Vercel | Render |
|---|---|---|
| Vite SPAs | Excellent | Static Site is fine |
| NestJS + Prisma | Only via hacks / sleep timeouts | Native web service |
| Socket.IO | Unreliable on serverless | Works |
| Postgres + Redis | External add-ons anyway | Native |
| Razorpay / PetPooja webhooks | Need a stable origin | Stable web service |

Use Vercel for the three UIs. Use Render for anything that talks to the database or a webhook.
