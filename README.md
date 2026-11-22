# PlantasticHaven Pro

Production URL: https://procare.plantastichaven.com

Two product surfaces:

- **Free, no-account tools:** diagnosis, 7-day rescue care plan, PDF export, plant-care guides.
- **Pro lifetime workspace ($7.99 one-time):** dashboard, saved garden, care calendar, AI plant identifier, plant journal and health tracking, and saved lesson progress.

## Architecture (since 2026-11-22)

One Cloudflare Worker, `plantastic-procare-selfhosted-proxy`, on the route `procare.plantastichaven.com/*`, serves both:

- the built React app (`dist/`, Workers static assets, SPA fallback), and
- a small API under `/api/*` (`worker/src/index.ts`).

There is **no database and no third-party auth**. The previous Supabase project no longer exists.

- **Stripe is the system of record for Pro.** A buyer enters an email and pays with Stripe Checkout using the server-configured price. On `/payment-success`, the Worker re-reads that Checkout Session from Stripe and checks:
  - the session is complete and paid
  - it is in USD and the amount is above zero
  - it contains the Pro price
  - the charge is not fully refunded and not under an open or lost dispute

  Only then does it return a license signed with HMAC (`LICENSE_SECRET`).
- **The browser stores that license.** About every 12 hours the app sends it to `/api/entitlement`, which re-checks Stripe. A refund or chargeback therefore removes Pro without needing a webhook.
- **Restore on another device:** `/restore` (or Settings) emails a one-hour signed link via Brevo. The form gives the same answer whether or not the email bought Pro.
- **Pro workspace data** (garden, photos, journal, lesson progress) lives in the browser's localStorage (`src/lib/localDb.ts`). Settings offers backup download and upload.
- **AI identifier:** `/api/identify` runs Cloudflare Workers AI. It re-checks the license with Stripe first and allows about 25 requests per purchase per day.

| Endpoint | Purpose |
|---|---|
| `POST /api/checkout {email}` | Creates Stripe Checkout. If the email already owns Pro, returns 409 and emails a restore link instead of charging again. |
| `POST /api/verify {sessionId}` | Verifies a completed checkout and returns `{isPro, license, email}`. |
| `POST /api/entitlement {license}` | Re-checks the license against Stripe. |
| `POST /api/restore {email}` | Emails a restore link when a paid purchase exists. Always returns `{ok:true}`. |
| `POST /api/restore/confirm {token}` | Exchanges a restore link for a license. |
| `POST /api/identify {license, description?, image?}` | AI plant identification (Pro only). |
| `POST /api/procare-lead {email}` | Newsletter capture to Brevo list 8. |

## Configuration

`wrangler.jsonc` holds the route, assets and plain vars, including `STRIPE_PRICE_ID=price_1TJZHkGCqwm95OGXjymU2Vuw` (PlantasticHaven Pro, $7.99, account `acct_1M7z1GGCqwm95OGX`).

Secrets (set with `npx wrangler@4 secret put NAME`, never committed):

- `STRIPE_SECRET_KEY`: a restricted live key with these permissions:
  - Checkout Sessions: write
  - Checkout Sessions, PaymentIntents, Charges and Disputes: read
- `LICENSE_SECRET`: 48 or more random bytes. Rotating it signs every device out of Pro; buyers restore by email.
- `BREVO_API_KEY`: used for restore emails and newsletter capture. `RESTORE_FROM_EMAIL` must be a verified sender in that Brevo account.

## Develop, verify, deploy

Use Node.js 20.

```bash
npm ci
npm run dev            # UI only; /api needs the Worker
npm run lint && npm test && npm run build
npx wrangler@4 dev     # full app + API locally (needs a .dev.vars with the secrets above)
npx wrangler@4 deploy  # after npm run build; needs a Cloudflare token with Workers edit rights
```

CI runs lint, tests and build on every push and pull request.

Never grant Pro from a browser flag, a client-chosen price, or an unverified success redirect.
