# Soft Steps security

## Threat model
Curious kids on a shared device. Soft Steps does **not** host child accounts or learning data in the cloud, and has **no in-app purchases** / payment collection.

## Frontend
- Parent PIN: PBKDF2-SHA256 (210k iterations for new hashes), random salt, constant-time compare
- PIN lockout persisted in `localStorage` with escalating delays
- Grown-up session: random token in `sessionStorage`, 15 min absolute / 5 min idle
- Routine builder / AAC editor unlock requires the same PIN
- Backups: AES-GCM encrypted with PIN-derived key; PIN hashes stripped from payload
- CSP + Permissions-Policy + frame busting
- No Stripe / checkout / payment API

## Ops tips
- Change the default PIN (`1234`) immediately
- Soft Steps never asks for card numbers or payment info
