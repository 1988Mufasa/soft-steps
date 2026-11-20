# Soft Steps secure API

Payment security model: **Soft Steps never touches card data.**

| Layer | Rule |
|-------|------|
| Frontend | No card inputs. Redirects to Stripe Checkout only. |
| This API | Creates Checkout Sessions + verifies webhooks. Rejects any body field that looks like card data. |
| Stripe | Hosts the card form (PCI DSS SAQ A). |

## Setup

```bash
cd server
cp .env.example .env
# Add STRIPE_SECRET_KEY from https://dashboard.stripe.com/apikeys (test mode first)
npm install
npm run dev
```

Frontend (another terminal):

```bash
cd ..
npm run dev
```

Vite proxies `/api` → `http://127.0.0.1:8787`.

## Live checklist

1. Use **test** keys until you are ready (`sk_test_…`).
2. Create Products/Prices in Stripe or let Checkout use `price_data`.
3. Add a webhook endpoint: `https://your-api/api/stripe/webhook` for `checkout.session.completed`.
4. Set `STRIPE_WEBHOOK_SECRET` from the webhook signing secret.
5. Never put `STRIPE_SECRET_KEY` in Vite/`VITE_*` env vars or the mobile app.
