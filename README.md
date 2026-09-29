# PlantasticHaven Pro

Production URL: https://procare.plantastichaven.com

PlantasticHaven has two deliberately separate product surfaces:

- **Free, no-account tools:** diagnosis, 7-day rescue care plan, PDF export, and plant-care guides.
- **Pro lifetime workspace ($7.99 one-time):** dashboard, saved garden, care calendar, AI plant identifier, plant journal/health tracking, community participation, and premium care sequences.

## Local development

Use Node.js 20.

```bash
cp .env.example .env
npm ci
npm run dev
```

The browser receives only the Supabase URL and publishable/anon key. Never put Stripe secrets or the Supabase service-role key in Vite environment variables.

## Required production configuration

### Frontend

Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Supabase Edge Function secrets

The payment functions require:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID=price_1TJZHkGCqwm95OGXjymU2Vuw`
- `APP_URL=https://procare.plantastichaven.com`

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions in the project environment.

Deploy these Edge Functions with JWT verification enabled:

- `create-payment`
- `check-payment`
- `plant-identifier`

Apply all migrations, including the entitlement hardening migration that prevents browser clients from editing `profiles.subscription_tier`.

### Supabase Auth URLs

Configure the production Site URL as:

`https://procare.plantastichaven.com`

Allow redirect URLs used by authentication, including:

`https://procare.plantastichaven.com/settings`

## Stripe flow

1. A signed-in free user clicks **Unlock Pro**.
2. `create-payment` authenticates the Supabase JWT and creates Stripe Checkout using the server-controlled Pro price.
3. Stripe redirects to `/payment-success?session_id=...`.
4. `check-payment` verifies the authenticated user, completed/paid Checkout state, user metadata ownership, and exact Pro line item.
5. Only after successful verification does the service role set `profiles.subscription_tier = 'pro'`.
6. Premium routes independently check the stored entitlement and can re-check Stripe before rendering.

Never grant Pro from a browser flag, localStorage value, arbitrary client price ID, or an unverified success redirect.

## Verification

```bash
npm run lint
npm test
npm run build
```

CI runs the same checks on pushes and pull requests.
