# Soft Steps security

## Threat model
Curious kids on a shared device; accidental network exposure of the local payment API. Soft Steps does **not** host child accounts or learning data in the cloud.

## Frontend
- Parent PIN: PBKDF2-SHA256 (210k iterations for new hashes), random salt, constant-time compare
- PIN lockout persisted in `localStorage` with escalating delays
- Grown-up session: random token in `sessionStorage`, 15 min absolute / 5 min idle
- Routine builder unlock requires the same PIN (math/hold shortcuts removed)
- Backups: AES-GCM encrypted with PIN-derived key; PIN hashes stripped from payload
- Payments: no card fields; Stripe Checkout URL host allowlist; `credentials: 'omit'`
- CSP + Permissions-Policy + frame busting

## Backend (`server/`)
- Bind `127.0.0.1` by default
- Origin allowlist for checkout POSTs
- Body size caps; reject card/secret field names
- Per-IP rate limits (checkout / webhook / health)
- Stripe webhook signature verification
- Never returns payment method details to clients

## Ops tips
- Change the default PIN (`1234`) immediately
- Set `FRONTEND_ORIGIN` / `FRONTEND_ORIGIN_PROD` for deployed SPAs
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` only on the API host
- Set `TRUST_PROXY=1` only behind a known reverse proxy
