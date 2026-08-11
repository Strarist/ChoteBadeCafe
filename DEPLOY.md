# Deploy — Chote Bade cafe stack

One VPS (or cafe LAN server) runs the whole system:

| URL | App |
|---|---|
| `https://<host>/` | Customer site + QR ordering |
| `https://<host>/counter/` | Counter POS |
| `https://<host>/admin/` | Admin |
| `https://<host>/api/...` | Nest API (same origin) |
| `https://<host>/socket.io` | Realtime |

Kitchen tickets still go to PetPooja. This stack does not ship a kitchen screen.

## 1. Server

- Ubuntu 22.04+ (or similar), 2 vCPU / 4 GB RAM is enough
- Docker Engine + Docker Compose plugin
- Ports **80** and **443** open
- A DNS **A** record pointing at the VPS (skip DNS if you only need LAN HTTP)

## 2. Configure

```bash
cp .env.production.example .env.production
```

Set at least:

- `SITE_ADDRESS` — your domain (`orders.chotebade.com`) or `:80` for HTTP-only LAN
- `CADDY_EMAIL` — Let's Encrypt contact (ignored for `:80`)
- `POSTGRES_PASSWORD` / `REDIS_PASSWORD` — 16+ random chars
- `STAFF_SESSION_SECRET` — 32+ random chars
- `CORS_ORIGINS` — `https://<your-domain>` (or `http://<lan-ip>` for LAN)
- `PETPOOJA_WEBHOOK_SECRET`

Leave `SEED_ON_BOOT=1` for the first start so placeholder menu + staff PINs exist.

```bash
pnpm deploy:check
```

## 3. Launch

```bash
pnpm deploy:up
```

Caddy requests a TLS cert automatically when `SITE_ADDRESS` is a public domain.

First-boot staff (change in Admin immediately):

| Name | PIN | Role |
|---|---|---|
| Admin | 1234 | admin |
| Manager | 2345 | manager |
| Cashier | 3456 | cashier |

Then set `SEED_ON_BOOT=0` in `.env.production` and recreate the API container so later restarts do not re-run seed:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d api
```

## 4. Smoke

```bash
curl -fsS https://<host>/api/health
curl -fsS https://<host>/api/health/integrations
```

Expect `database` + `redis` = `up`. Open `/`, `/counter/`, `/admin/` on a phone and the till PC.

## 5. Partner webhooks

Point providers at the public API (Caddy strips `/api`):

| Provider | URL |
|---|---|
| Razorpay | `https://<host>/api/payments/webhooks/razorpay` |
| PetPooja order status | `https://<host>/api/petpooja/webhooks/order-status` |
| Aggregator ingress | `https://<host>/api/petpooja/webhooks/aggregator-order` |

Switch adapters when credentials are real:

```
PAYMENT_ADAPTER=live
PETPOOJA_ADAPTER=live
NOTIFICATION_ADAPTER=live
```

`ALLOW_FAKE_PAYMENTS` must stay off. The API refuses to boot in production if it is `1`.

## 6. Day-2

```bash
pnpm deploy:logs          # follow all services
pnpm deploy:down          # stop stack (volumes kept)
```

Apply new code: `git pull` then `pnpm deploy:up` (rebuilds images; Postgres/Redis volumes persist). Migrations run on API start via `prisma migrate deploy`.

Backup Postgres:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  pg_dump -U cafe cafe_orders > backup-$(date +%Y%m%d).sql
```

## LAN-only (no public DNS)

Set:

```
SITE_ADDRESS=:80
CORS_ORIGINS=http://192.168.x.x
```

Staff open `http://192.168.x.x/counter/`. QR codes on tables must use that same origin. Online Razorpay/PetPooja webhooks will not reach a private IP — use a public VPS for those.
