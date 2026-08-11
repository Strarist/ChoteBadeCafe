# Free deploy (no credit card)

**VITE_API_URL is the Web Service, not a Static Site.**  
If Counter/Admin show `Cannot POST //auth/staff/login`, the env has a trailing slash or points at a website. Open `https://<that-host>/health` — you must see JSON. Then rebuild the Static Site.

**Do not use Render → New → Blueprint.** Blueprints often demand billing even when the app can run on Free instances.

Create each service **by hand** and pick **Free** every time.

| Piece | Where | Instance |
|---|---|---|
| Postgres | Render → PostgreSQL | **Free** (expires after 30 days) |
| Redis | **Skip** | Not required. Key Value is often paid-only |
| Nest API | Render → Web Service | **Free** (sleeps after 15 min idle) |
| Customer / Counter / Admin | Render Static Sites **or** Vercel Hobby | **Free** |

No payment method. Sign up with GitHub on [render.com](https://render.com) and optionally [vercel.com](https://vercel.com).

**Caveats (free only)**

- First request after idle can take ~30–60s while the API wakes up.
- Free Postgres is deleted ~30 days after creation unless you upgrade later.
- One free Postgres and one free Key Value per Render workspace.

---

## 0. You already have

- GitHub repo: https://github.com/Strarist/ChoteBadeCafe
- A Render account (Hobby / free workspace)

Open a notes file. You will paste 4 URLs into it.

---

## 1. Free Postgres

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **PostgreSQL**.
2. Name: `chote-bade-db`.
3. Database / user: leave defaults.
4. Region: pick one and **reuse it for every other service** (e.g. Singapore or Frankfurt).
5. **Instance type: Free**.
6. Create. Wait until status is **Available**.
7. Open the database → **Connections** → copy **Internal Database URL**.  
   That is `DATABASE_URL` (use Internal, not External — the API will sit on Render too).

---

## 2. Skip Redis / Key Value

Do **not** create Key Value. On many Hobby accounts it only offers paid instances and asks for a card.

The API runs with an in-memory Socket.IO adapter when `REDIS_URL` is unset. Fine for one free web service.

If you later see **New + → Key Value** with a **Free** card, you can add it then and set `REDIS_URL`. Until then, omit `REDIS_URL` entirely.

---

## 3. Free API (Web Service)

1. **New +** → **Web Service**.
2. Connect GitHub → select **ChoteBadeCafe** → **main**.
3. Settings:

| Field | Value |
|---|---|
| Name | `chote-bade-api` |
| Language | Node |
| Branch | `main` |
| Region | same as the database |
| Root Directory | *leave empty* |
| Build command | see below |
| Start command | see below |
| **Instance type** | **Free** |

**Build command**

```text
corepack enable && pnpm install --frozen-lockfile --prod=false && pnpm --filter @cafe/shared-types build && pnpm exec prisma generate --schema=prisma/schema.prisma && pnpm --filter @cafe/backend build
```

**Start command**

```text
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma && pnpm db:seed && node apps/backend/dist/main.js
```

(`pnpm db:seed` is safe in production: it will not wipe an existing menu or reset PINs.)

4. **Add environment variables** *before* the first deploy:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Postgres URL from step 1 |
| `STAFF_SESSION_SECRET` | 32+ random characters (see below) |
| `ALLOW_FAKE_PAYMENTS` | `0` |
| `PETPOOJA_ADAPTER` | `fake` |
| `PAYMENT_ADAPTER` | `fake` |
| `NOTIFICATION_ADAPTER` | `fake` |
| `PETPOOJA_WEBHOOK_SECRET` | any long random string |
| `CORS_ORIGINS` | `http://localhost:3000` for now — you will replace this in step 5 |

Generate a secret in PowerShell:

```powershell
-join ((48..57 + 65..90 + 97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
```

5. Click **Deploy Web Service**. First build takes a few minutes.
6. When it is Live, open:

```text
https://chote-bade-api.onrender.com/health
```

You want `"database":"up"`. `"redis":"skipped"` is correct when you did not create Key Value. If the first load spins for a minute, that is the free-tier wake-up.

7. Copy the API origin (`https://chote-bade-api.onrender.com`) — no trailing slash. This is `VITE_API_URL`.

If the deploy fails, open **Logs**. Common issues: instance type was Starter (billing), or `STAFF_SESSION_SECRET` shorter than 32 characters.

---

## 4. Free frontends — pick one path

### Path A — all on Render (simplest, still free)

Create **three** Static Sites from the same repo. **New +** → **Static Site** each time.

**Customer**

| Field | Value |
|---|---|
| Name | `chote-bade` |
| Branch | `main` |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @cafe/customer-app build` |
| Publish directory | `apps/customer-app/dist` |

Add env var **`VITE_API_URL`** = the **Web Service** URL (the one whose `/health` is JSON).  
**Not** `chote-bade.onrender.com` or any Static Site. No trailing slash.  
(Redirects / rewrites: **Add Rewrite** → Source `/*` → Destination `/index.html`.)

**Counter**

| Field | Value |
|---|---|
| Name | `chote-bade-counter` |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @cafe/counter-pos build` |
| Publish directory | `apps/counter-pos/dist` |
| `VITE_API_URL` | same API origin |
| Rewrite | `/*` → `/index.html` |

**Admin**

| Field | Value |
|---|---|
| Name | `chote-bade-admin` |
| Build command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @cafe/admin build` |
| Publish directory | `apps/admin/dist` |
| `VITE_API_URL` | same API origin |
| Rewrite | `/*` → `/index.html` |

Copy the three `*.onrender.com` URLs.

### Path B — UIs on Vercel (also free)

Hobby plan, no card required.

For **each** of the three apps, [vercel.com/new](https://vercel.com/new) → import `ChoteBadeCafe` again (three projects).

| Project | Root Directory | Install | Build | Output |
|---|---|---|---|---|
| Customer | `apps/customer-app` | `cd ../.. && corepack enable && pnpm install --frozen-lockfile` | `cd ../.. && pnpm --filter @cafe/customer-app build` | `dist` |
| Counter | `apps/counter-pos` | same install | `cd ../.. && pnpm --filter @cafe/counter-pos build` | `dist` |
| Admin | `apps/admin` | same install | `cd ../.. && pnpm --filter @cafe/admin build` | `dist` |

Env var on all three (Production + Preview):

`VITE_API_URL` = `https://chote-bade-api.onrender.com`

SPA fallback is already in each app’s `vercel.json`.

---

## 5. Unlock the browsers (CORS)

Back on **chote-bade-api** → **Environment**.

Set `CORS_ORIGINS` to the three UI origins, comma-separated, `https://`, **no trailing slash**. Example:

```text
https://chote-bade.onrender.com,https://chote-bade-counter.onrender.com,https://chote-bade-admin.onrender.com
```

Save → **Manual Deploy** → **Deploy latest commit** (env changes need a restart).

---

## 6. Smoke test

1. Customer URL → menu loads (first hit may be slow).
2. QR path: `https://<customer>/t/12` → add an item → pay at counter.
3. Counter URL → login **Cashier** / **3456** → order appears on Pay queue.
4. Admin URL → **Admin** / **1234** → change those PINs immediately.

Then on the API service, you can leave seed in the start command. It will not reset PINs on later deploys.

---

## 7. Table QR codes

Print URLs against the **customer** origin:

```text
https://<customer-host>/t/1
https://<customer-host>/t/2
```

---

## If something asks for a card

| Screen | What to do |
|---|---|
| Blueprint | Cancel. Use steps 1–3 instead. |
| Instance type Starter / Standard | Switch the dropdown to **Free**. |
| “Add payment method to continue” | You picked a paid instance or Blueprint. Go back. |
| Postgres create only shows paid sizes | Scroll — **Free** is a separate instance-type card, not a region. |

Do **not** open `render.yaml` as a Blueprint. That file is leftover IaC; this guide does not use it.

---

## Later (still optional, still paid)

When the cafe is live and you want no sleep + a database that does not expire: upgrade the **API** and **Postgres** instance types only. Frontends can stay free.
