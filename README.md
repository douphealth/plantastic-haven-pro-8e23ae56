# PlantasticHaven ProCare

PlantasticHaven ProCare is the account-backed companion app for the public plant diagnosis, care-plan, and PDF experience.

## Product model

- Public: diagnosis, 7-day care plan, printable PDF, guides.
- Free account: dashboard, up to 15 tracked plants, care calendar, 5 AI plant-identification scans per month, community reading and up to 5 posts per month.
- Pro: one-time Stripe purchase that removes free limits and unlocks premium care sequences.

Pro access is **server verified**. The browser cannot set `subscription_tier`.

## Required frontend environment

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase-anon-or-publishable-key>
```

## Required Supabase Edge Function secrets

Configure these in the Supabase project before deployment:

```bash
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_PRO_PRICE_ID=<the-one-time-7.99-price-id>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-signing-secret>
APP_URL=https://procare.plantastichaven.com
OPENAI_API_KEY=<openai-api-key>
```

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.

## Stripe webhook

Create a Stripe webhook endpoint pointing to:

```text
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

Subscribe to:

```text
checkout.session.completed
```

The webhook function has `verify_jwt = false` because Stripe does not send a Supabase JWT; it verifies the raw request using Stripe's signature instead.

## Deployment order

1. Apply Supabase migrations.
2. Set Edge Function secrets.
3. Deploy `create-payment`, `check-payment`, `stripe-webhook`, and `plant-identifier`.
4. Configure the Stripe webhook and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Deploy the frontend with the two `VITE_SUPABASE_*` variables.
6. Run a Stripe test-mode purchase end to end before enabling a live price.

## Local validation

```bash
npm install
npx --no-install tsc -p tsconfig.app.json --noEmit
npm test
npm run build
```

## Payment safety

- Checkout price is read server-side from `STRIPE_PRO_PRICE_ID`; the browser cannot choose a cheaper price.
- Checkout sessions are bound to the authenticated Supabase user.
- Pro is granted only for a completed, paid Checkout session containing the configured Pro price.
- Stripe webhook signatures are verified.
- The success page does not claim Pro until server verification succeeds.
- Database permissions prevent authenticated clients from updating their own subscription tier.
