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

If the deploy fails, open **Logs**. Common issues:

- Instance type was Starter (billing), or `STAFF_SESSION_SECRET` shorter than 32 characters.
- **`ALLOW_FAKE_PAYMENTS=1 is forbidden in production`** — Render → **chote-bade-api** → **Environment** → set `ALLOW_FAKE_PAYMENTS` to `0` or delete it (do not copy from `.env.example`). Redeploy.
- **`PAYMENT_ADAPTER=live requires RAZORPAY_WEBHOOK_SECRET`** (older builds) — redeploy after pulling latest `main`, or add `RAZORPAY_WEBHOOK_SECRET` from Razorpay Dashboard → Webhooks. Checkout works without it; the webhook is only a backup if the browser confirm fails.

### Live Razorpay on Render (optional)

If you set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`, the API auto-switches to live payment (even when `PAYMENT_ADAPTER=fake`). Minimum env:

| Key | Required for boot? | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | Yes (live pay) | `rzp_live_…` or `rzp_test_…` |
| `RAZORPAY_KEY_SECRET` | Yes (live pay) | Never expose on frontends |
| `RAZORPAY_WEBHOOK_SECRET` | No | Recommended after go-live — backup if Checkout.js confirm fails |
| `ALLOW_FAKE_PAYMENTS` | Must be `0` or unset | Never `1` in production |

Customer static site also needs `VITE_RAZORPAY_KEY_ID` (same **Key ID** only) and a rebuild after you add it.

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

After the custom domain is live, reprint QR codes against `https://chotebadecafe.com/t/1` (not the `.onrender.com` URL).

---

## 8. Custom domain — `chotebadecafe.com`

Point **only** the customer Static Site at this domain. Leave the API, Counter, and Admin on `*.onrender.com`.

Right now [chotebadecafe.com](https://chotebadecafe.com/) is still a parked / builder site (“Sip. Relax. Repeat.”). You replace that by changing **DNS**, not by editing this repo.

### A. Add the domain on Render

1. Open [dashboard.render.com](https://dashboard.render.com) and click the customer Static Site **`chote-bade`** (not the API).
2. Open **Settings**.
3. Scroll to **Custom Domains**.
4. Click **Add Custom Domain**.
5. Type `chotebadecafe.com` → **Save**.
6. Click **Add Custom Domain** again and add `www.chotebadecafe.com`.
7. Render shows the exact records to create. Keep that tab open. Typical values:

| Host | Type | Value |
|---|---|---|
| `@` (apex / `chotebadecafe.com`) | **A** | `216.24.57.1` |
| `www` | **CNAME** | `chote-bade.onrender.com` |

If Render shows a different A IP or a verify CNAME, use **Render’s values**, not this table.

Hobby includes 2 custom domains, so apex + `www` is fine.

### B. Change DNS at the registrar

1. Log into wherever you bought the domain (GoDaddy, Namecheap, Google Domains, Hostinger, etc.).
2. Open **DNS** / **DNS Management** / **Advanced DNS** for `chotebadecafe.com`.
3. **Delete** anything that currently serves the placeholder site:
   - `A` records for `@` pointing at a builder / parking IP
   - `AAAA` records (Render is IPv4 only — they break the site)
   - `CNAME` or **Forwarding** for `www` that still points at the old host
   - Do **not** delete `MX` (email) or `TXT` (Google/Microsoft verify) unless you know they are unused
4. Add the two records from step A.
5. Set TTL to **600** seconds (or the lowest the UI allows).
6. Save.

**GoDaddy:** Domain → **DNS** → remove the parked `A` / forwarding → add A `@` and CNAME `www`.

**Namecheap:** Domain → **Advanced DNS** → same two records.

Do **not** change nameservers unless Render or your registrar told you to. Only change **records**.

### C. Wait for SSL

Back on Render → **chote-bade** → **Settings** → **Custom Domains**:

1. Status goes **Waiting for DNS** → **Certificate issued**.
2. This can take 5–60 minutes (sometimes a few hours).
3. Open `https://chotebadecafe.com/` — you should see Chote Bade Café (not “Sip. Relax. Repeat.”).
4. Open `https://www.chotebadecafe.com/` — it should also load (Render can redirect www ↔ apex).

If the old cafe page is still there: DNS has not propagated, or an old `A`/`AAAA` is still present. Recheck the registrar.

### D. Unlock the new origin on the API (required)

Browsers will call the API from `https://chotebadecafe.com`. If that origin is missing from CORS, the menu/login will fail.

1. Render → Web Service **`chote-bade-api`** (or whatever you named the API) → **Environment**.
2. Edit `CORS_ORIGINS`. Keep the three `.onrender.com` UIs **and** add both domain variants, comma-separated, **no trailing slash**:

```text
https://chote-bade.onrender.com,https://chote-bade-counter.onrender.com,https://chotebadecafe-admin.onrender.com,https://chotebadecafe.com,https://www.chotebadecafe.com
```

Use your real Counter/Admin URLs if they differ.

3. Save → **Manual Deploy** → **Deploy latest commit** (env change needs a restart).
4. Do **not** change `VITE_API_URL` on the customer site. It stays the API origin (`https://chotebadecafe.onrender.com` or whatever `/health` returns JSON for).

### E. Phone / PWA

Hard-refresh the customer site (or clear site data). The PWA may still have the old `.onrender.com` shell cached.

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
