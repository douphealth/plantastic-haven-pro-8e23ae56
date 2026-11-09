# Production rollout

Do this only when you intend to change the live app. The steps are ordered. Nothing in this pull request has been applied to production Supabase, the live Stripe account, or https://procare.plantastichaven.com/.

## Credentials required before you start

- Supabase CLI logged in to project `sesleusxaskzjtlifzgp`, or the dashboard for that project.
- Database migration rights on that project (the database password or the Supabase access token with migration permission).
- Permission to set Edge Function secrets and deploy functions:
  - `STRIPE_SECRET_KEY` (live secret or the restricted live key that can create Checkout sessions, read Checkout sessions, PaymentIntents, Charges, and refunds)
  - `STRIPE_PRO_PRICE_ID` (the existing live Pro price, currently expected to be `price_1UMt4LByiix0wtyT4iQ0dYbc`)
  - `STRIPE_WEBHOOK_SECRET` (the signing secret of the live webhook endpoint)
  - `APP_URL=https://procare.plantastichaven.com`
  - `OPENAI_API_KEY` or `AI_API_KEY`, plus optional `AI_BASE_URL`, `AI_MODEL`, and `AI_VISION_MODEL` if photo identification should call a vision model
- Stripe dashboard access to the live account to confirm the webhook endpoint and its events. Do not replace the live price.
- A Stripe **test** key with Checkout Sessions write, PaymentIntents write, Charges read, Refunds write, and `stripecli_session_write` if you want `stripe listen` to forward webhooks. The restricted test keys used for this pull request do not have all of those permissions. See the PR report.

## Order

1. Deploy the frontend only after the database migration in step 2, or accept that the garden still works without the new columns and the catalog dropdown stays empty until the migration is applied. The client retries an insert without `water_interval_days` if that column is missing.
2. Apply migrations to the production database, in filename order. The new ones are:
   - `supabase/migrations/20261109120000_pro_workspace_integrity.sql`
   - `supabase/migrations/20261109213000_plant_catalog_seed.sql`
   From the repo: `supabase link --project-ref sesleusxaskzjtlifzgp` then `supabase db push`.
   Confirm `select count(*) from public.plants` returns 12 and that only the ZZ plant has `water_frequency_days = 14`.
3. Deploy these Edge Functions with JWT verification left as it is in `supabase/config.toml` (`stripe-webhook` stays `verify_jwt = false`):
   - `create-payment`
   - `check-payment`
   - `stripe-webhook`
   - `plant-identifier`
4. Set the secrets listed above. Do not put any Stripe secret in a `VITE_` variable.
5. In the live Stripe dashboard, keep the existing Pro price. Point the webhook endpoint at `https://sesleusxaskzjtlifzgp.supabase.co/functions/v1/stripe-webhook` and subscribe only to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`
   Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` if it changed.
6. Publish the frontend to the existing Cloudflare Pages project. Do not point it at a different Supabase project.

## Verification after rollout

1. Signed out: finish a diagnosis and confirm "What to do today" is filled on the care plan and the PDF page.
2. Create a new account, or use an existing free account. Open My Garden, choose Swiss cheese plant, and confirm the light and water text match the NC State citation shown on the form. The reminder interval is your choice because that species has no published day count. Choose ZZ plant and confirm the reminder defaults to 14 days.
3. Pay with a live card only if you intend a real charge. Otherwise repeat the test-mode checklist against the deployed functions with a test key that has the missing permissions below. After payment, `/payment-success` should say Pro is active and `/dashboard` should open.
4. In Stripe test mode, refund that payment in full. Reload `/dashboard`. Pro should be removed. The same should happen for a lost or open dispute. A won dispute can restore Pro.
5. On the identifier, submit a description that names `Monstera deliciosa` only if the AI key is configured. Save it and confirm the garden plant is linked to the catalog entry. A photo request should fail clearly if the vision model or key is not configured.
6. Open Settings and allow browser notifications. Put a plant's next water date in the past. Reload the dashboard and confirm the in-app reminder lists it. A browser notification can appear only while the site is open. No email is sent.

## What the restricted test keys could not do

These were the exact permission names returned by Stripe on 2026-11-09. They are test-mode permissions, not live charges.

Key ending `IzGR`, account `acct_1M7z1GGCqwm95OGX`:

- Missing `balance_read`
- Missing `checkout_session_write` (Checkout could not be started)
- Missing `payment_intent_write`
- Missing `webhook_read`
- Present: product read, product write, and price write. A test product and a $7.99 price were created in test mode only.

Key ending `fyBD`, account `acct_1T9WAQJgYDMnnbtB` (sandbox used for the Checkout walk):

- Missing `balance_read`
- Missing `payment_intent_write` for creating a PaymentIntent directly
- Missing `stripecli_session_write`, so `stripe listen` could not forward webhooks
- Refund creation was accepted only as an approval request (`human approval`) and did not refund the charge
- Present: products, prices, Checkout Sessions, webhook endpoint list, PaymentIntent read, and Charge read

`supabase start` on this machine failed while the database image ran `/app/bin/migrate`: `Realtime.Repo` timed out after 15 seconds (`DbSetupError`, container exit 1). The SQL files themselves applied on a separate Postgres 17 container after stubbing `auth` and `storage` roles.
