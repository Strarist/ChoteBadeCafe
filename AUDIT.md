# Audit & hardening

## Done in this pass (ship + rebuild the three Static Sites)

- Join `VITE_API_URL` without a trailing slash (`//auth/staff/login` 404)
- Detect when the API URL is a webpage (HTML) instead of Nest JSON
- Production login fields are empty; demo PINs are not shown
- Customer “Pay online” hidden in production (mock checkout cannot work)
- Fake Razorpay webhooks refused when `NODE_ENV=production`
- CORS origins strip trailing slashes
- Helmet on the API
- Public `/health/integrations` no longer leaks adapter/credential status in production

## You must do on Render after pull

1. Confirm **VITE_API_URL** on each Static Site is the **Web Service** URL  
   (open `https://<web-service>/health` — must be JSON, not the cafe homepage).  
   No trailing slash. Example: `https://chotebadecafe.onrender.com` if that is the API.
2. **Manual Deploy** each Static Site (customer, counter, admin) so the new JS is baked.
3. Redeploy the Web Service once for Helmet / webhook / CORS changes.

## Still open (next hardening rounds)

| Pri | Item |
|---|---|
| P1 | Auth Socket.IO; stop broadcasting order cuids to every client |
| P1 | Rate-limit `POST /auth/staff/login` and `POST /orders` (persist lockout) |
| P1 | Unique staff names; reject `1234` in production; force PIN change |
| P1 | CSP / clickjacking headers on Static Sites |
| P2 | Live Razorpay Checkout.js (replace mock-confirm) |
| P2 | Runtime config so API URL is not only a build-time bake |
| P2 | Staff token as httpOnly cookie or shorter TTL |
