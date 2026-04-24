### Phase 3 — Backend Setup (parallel dispatch)

Phases 3a, 3b, and 3c are independent of each other — Supabase schema, Stripe price creation, and email template setup do not depend on each other's outputs. Determine which apply (read SCOPE.md for monetization model and email requirements), then dispatch all applicable phases simultaneously:

| Phase | Condition to run |
|---|---|
| 3a (Supabase) | Product needs auth or database |
| 3b (Stripe) | Any paid plan or trial-to-paid flow exists |
| 3c (Email) | Product has auth, team invites, or email flows |

Run all applicable phases in parallel. If only one applies, run it alone. Do not run 3a → wait → 3b → wait → 3c sequentially when all three can run at once.

After all three complete: verify that `src/lib/supabase.ts` exists (if Phase 3 ran), `.env.example` has all required vars, and BUILD-LOG.md has entries for each completed phase.

---

### Phase 3a — Supabase (run /web-supabase) — skip if no backend

If the product needs Supabase:
1. Get project URL and anon key via Supabase MCP. If Supabase MCP is unavailable and no project URL is known: log NEEDS_HUMAN "Provide Supabase project URL and anon key to continue Phase 3a" and skip Phase 3a entirely — do not attempt to scaffold auth without a real project URL.
2. Apply schema migrations
3. Write RLS policies for all tables
4. Generate TypeScript types
5. Write `src/lib/supabase.ts` with hardcoded values — the anon key is safe to commit (it is public by design; RLS policies enforce access control)
6. Write `useAuth` hook and `ProtectedRoute` component. ProtectedRoute must: (a) check session — redirect to `/auth` if null; (b) show a skeleton layout while session is loading; (c) check `onboarding_complete` on the org record — redirect to the onboarding route defined in SCOPE.md (field: `onboarding_route`, default `/setup`) if false. All three checks are required.
7. Write `AuthRoute` component (session-only check, no onboarding_complete guard) — wraps `/setup` and `/reset-password`
8. Register `/reset-password` route in App.tsx as a lazy-loaded stub pointing to a placeholder component — full `ResetPasswordPage.tsx` is built in Phase 4 (so it gets the per-page self-review pass). Mark it in SCOPE.md as a required auth page if not already present.

If FastAPI backend: note the Railway service URL needed in BUILD-LOG.md as a blocker item for the user. The FastAPI service itself is pre-existing in `services/api/` — do not scaffold a new one.

Log: "Phase 3a complete — Supabase configured" to BUILD-LOG.md.

---

### Phase 3b — Stripe (run /web-stripe) — skip if no paid plans

**How to determine if this phase runs:** Read `SCOPE.md` and look for a Monetization or Trial section. If resuming a build, also check `BUILD-LOG.md` — if it contains "Phase 3b complete", skip this phase. Run this phase if ANY of these are true:
- Trial model is `free-trial` or `paid-only`
- Any pricing tier exists beyond a permanent free plan
- SCOPE.md mentions Stripe, subscription, upgrade, or billing

Skip this phase only if the product is explicitly free with no upgrade path.

If the product has any paid plan or trial-to-paid flow:
1. Read `~/.claude/commands/web-stripe.md` in full
2. **Auto-create Stripe test price (requires STRIPE_SECRET_KEY in env):**
   **Check Stripe CLI availability first:** `stripe --version 2>&1`. If command not found: skip CLI approach, use the curl fallback below.
   If Stripe CLI is available AND `STRIPE_SECRET_KEY` is in env:
   ```bash
   stripe prices create \
     --unit-amount [price in cents from SCOPE.md, e.g. 4900 for $49] \
     --currency [currency from SCOPE.md, default: usd] \
     --recurring[interval]=month \
     --product-data[name]="[Product Name] Pro" \
     --lookup-key "[product-slug]-pro-monthly"
   ```
   Capture the `id` field from output (format: `price_xxx`). This is `VITE_STRIPE_PRO_PRICE_ID`.
   **If Stripe CLI unavailable:** use the Stripe REST API directly to create the price:
   ```bash
   curl -s https://api.stripe.com/v1/prices \
     -u "$STRIPE_SECRET_KEY:" \
     -d "unit_amount=[price in cents]" \
     -d "currency=[currency from SCOPE.md, default: usd]" \
     -d "recurring[interval]=month" \
     -d "product_data[name]=[Product Name] Pro"
   ```
   Capture the publishable key:
   ```bash
   curl -s https://api.stripe.com/v1/account \
     -u "$STRIPE_SECRET_KEY:" \
     | grep -o '"pk_test_[^"]*"' | tr -d '"'
   ```
   Write both values to `.env.local` and Vercel env vars (Phase 6c).
   If the curl returns empty: the secret key is live mode (`sk_live_`) — get the live publishable key from stripe.com/apikeys and log as NEEDS_HUMAN.
   If `STRIPE_SECRET_KEY` is not in env: log NEEDS_HUMAN: "Add STRIPE_SECRET_KEY to env — then re-run Phase 3b to auto-create price ID."
3. Create Stripe checkout session endpoint in FastAPI (or Supabase edge function for standalone)
4. Create webhook handler — verify signature first. **Python:** `stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)`. **JavaScript/Node:** `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`. Then handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Reject any request that fails signature verification with 400.
5. Write `UpgradeButton` component and `PricingCards` component
6. Wire trial banner "Upgrade now" CTA to checkout session
7. Add `VITE_STRIPE_PUBLISHABLE_KEY` + `VITE_STRIPE_PRO_PRICE_ID` to `.env.example`
8. Add webhook endpoint to `.env.example` as `STRIPE_WEBHOOK_SECRET`

Log NEEDS_HUMAN: "Set STRIPE_WEBHOOK_SECRET — register [product-url]/api/webhooks/stripe in Stripe dashboard for: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"

Log: "Phase 3b complete — Stripe integrated" to BUILD-LOG.md.

---

### Phase 3c — Email (run /web-email) — skip if no transactional email

**How to determine if this phase runs:** Run if ANY of these are true:
- Trial model is `free-trial` (requires trial-ending reminders)
- Product has team invites (requires invite email)
- Product has auth with password reset (requires reset email)
- SCOPE.md mentions welcome email, notifications, or email flows

Skip only if the product is a pure landing page with no auth.

1. Read `~/.claude/skills/web-email/SKILL.md` in full
2. Set up Resend integration in `services/api/email_service.py` (or equivalent)
3. Write React Email templates: welcome, trial-ending (if free-trial), team-invite (if team features), password-reset, invoice (if paid)
4. Wire welcome email to auth signup trigger
5. If trial model is `free-trial`: write `services/api/trial_reminders.py` — cron job that queries orgs where `trial_ends_at` is 7, 3, or 1 day away and sends the trial-ending template. Deploy as Railway cron (`0 9 * * *`).
6. Add `RESEND_API_KEY` to `.env.example`

Log NEEDS_HUMAN: "Add RESEND_API_KEY — verify sending domain at resend.com/domains before emails will deliver"

Log: "Phase 3c complete — email configured" to BUILD-LOG.md.

---
