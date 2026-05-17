# Pre-Deploy Checklist Reference

## Pre-Deploy Checklist

Run before any deploy:

```
[ ] npm run build — no TypeScript errors
[ ] No chunk exceeds 250KB gzipped
[ ] All routes use React.lazy + Suspense
[ ] Each lazy route wrapped in ErrorBoundary
[ ] ProtectedRoute used on all auth-gated routes (no useEffect redirects)
[ ] All images have alt, loading="lazy", explicit dimensions
[ ] Hero image uses loading="eager"
[ ] vercel.json at project root with SPA rewrites
[ ] CORS not * — locked to production domain
[ ] VITE_* env vars set in Vercel dashboard
[ ] Landing page animated background present
[ ] Landing page product visual mockup present (not a blob)
[ ] Auth pages: form labels, error states, redirect-after-login working
[ ] No duplicate component patterns — EmptyState, skeleton, stat card, data table each exist once
[ ] All page title changes use useEffect — none at render scope
[ ] /setup or /onboarding wizard exists — mandatory for all SaaS products with auth
[ ] ProtectedRoute checks onboarding_complete and redirects to /setup if false
[ ] AppLayout trial banner present (days remaining + Upgrade button) when trial model is free-trial
[ ] TrialBanner hidden when subscription_status === 'active' — verified on a paid test account
[ ] Stripe checkout tested end-to-end with test card 4242 4242 4242 4242 — subscription activates and banner disappears
[ ] VITE_STRIPE_PUBLISHABLE_KEY + VITE_STRIPE_PRO_PRICE_ID set in Vercel dashboard
[ ] Stripe webhook endpoint registered in Stripe dashboard — correct prod URL, correct events
[ ] Sentry initialised in main.tsx — VITE_SENTRY_DSN set in Vercel dashboard
[ ] Sentry.ErrorBoundary wraps root <App /> — unhandled render errors are captured
[ ] NotFoundPage exists and registered as path="*" catch-all route in App.tsx
[ ] useSeo hook called on every page — title, description set; auth/settings/onboarding use noIndex: true
[ ] index.html has OG + Twitter meta tags (og:title, og:description, og:image, twitter:card)
[ ] Settings page exists at /settings — profile, billing portal, team tabs all functional
[ ] web-review score 38+/40
```

---

## Performance Requirements

Apply from scaffold onwards — not just at review time:

- `vite.config.ts` MUST have `manualChunks` splitting vendor-react, vendor-motion, vendor-query, vendor-supabase
- All routes in App.tsx MUST use `React.lazy` + `Suspense`
- No `useEffect` for data fetching — TanStack Query only
- All images: `alt`, `loading="lazy"`, explicit `width` + `height`
- Hero image: `loading="eager"` (LCP)
- AnimatedBackground: lazy-loaded (`React.lazy`)
- Font: `display=swap`
- No chunk exceeds 250KB gzipped

---

## Bundle Size Rules

- **Bundle audit auto-fix**: after deploy, run `npm run build` and check chunk sizes. Any chunk > 250KB gzipped: add `manualChunks` in `vite.config.ts`, redeploy. Auto-fix, not just flag.

---

## Deploy Rules (enforced by Phase 6 / web-deploy)

- **Vercel project existence**: confirm the Vercel project exists via MCP before deploying. Create it if missing. Never deploy to a non-existent project.
- **Env vars + mandatory redeploy**: set ALL env vars from `.env.example` in Vercel after initial deploy, then trigger a second deploy. Env vars set after the first deploy do not take effect until the next deploy.
- **Automated smoke test**: run `agent-browser` Skill (10 interactive checks) AND `playwright-cli` (screenshot verification) in parallel. Create test user via Supabase MCP, run both tools simultaneously, merge findings — any failure from either tool is a failure. All 10 checks must pass both tools. Not a manual checklist — automated.
- **CORS**: in monorepo mode — append new Vercel URL to comma-separated `FRONTEND_URL` in Railway, never replace existing URLs. In standalone mode — set `FRONTEND_URL` to the production Vercel URL. Backend CORS must never be `*` in production.

---

## Routing & Auth Rules

- All auth-gated routes MUST use a `ProtectedRoute` wrapper — never `useEffect` redirects
- **`ProtectedRoute` requires THREE checks (all mandatory):**
  - (a) session exists — redirect to `/auth` if null
  - (b) skeleton layout while session loads — never a blank flash (use shadcn Skeleton matching app layout)
  - (c) `onboarding_complete` on the org record — redirect to `/setup` if false
- **`AuthRoute`** (separate component, session-only, no onboarding check) wraps `/setup` and `/reset-password` specifically — using `ProtectedRoute` on `/setup` causes a redirect loop

---

## Webmanifest (enforced at scaffold time)

`public/site.webmanifest` is generated at scaffold time — not deferred. Add to `index.html`:
```html
<link rel="manifest" href="/site.webmanifest" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```
Log NEEDS_HUMAN: "Add icon-192.png and icon-512.png to /public."

---

## Testing Requirements

### Test scaffolding — installed at scaffold time
At scaffold time (`/web-scaffold`), the following are always generated:
- `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react`
- `vitest.config.ts` with jsdom environment + `./src/tests/setup.ts` setupFile
- `src/tests/setup.ts` — contains `import '@testing-library/jest-dom'`
- The `src/tests/` directory exists from day one — never created mid-build

### Phase 4.5 — Core test coverage (before quality gate)
After all pages are built and self-reviewed, before `/web-review`, write three test files:

- `src/tests/auth.test.ts` — 4 scenarios: signup, wrong password, protected route without session, /setup redirect after onboarding done
- `src/tests/onboarding.test.ts` — 3 scenarios: complete wizard, partial completion, trial activation
- `src/tests/core.test.ts` — 2 scenarios: primary query returns empty (expect EmptyState with CTA), primary query errors (expect error state + retry, not white screen)

Use Vitest + `@testing-library/react`. Mock Supabase with `vi.mock('@/lib/supabase')`. All tests must pass before `/web-review` runs. If a test fails: fix the code, not the test.

---

## Stripe / Payments (enforced by Phase 3b)

For any product with paid plans or a trial-to-paid flow — run `/web-stripe` after Supabase setup, before building pages:

- Stripe checkout session: always server-side (FastAPI endpoint or Supabase edge function) — never client-side price creation
- Webhook handler MUST handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- `UpgradeButton` + `PricingCards` components written from `/web-stripe` skill — never ad-hoc checkout buttons
- Trial banner "Upgrade now" CTA wires to checkout session — never to a pricing page link
- Billing tab in `/settings` uses Stripe Customer Portal redirect — never a custom billing UI
- Required env vars: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Webhook endpoint registered in Stripe dashboard before deploy is considered done — log as NEEDS_HUMAN if not yet done
- Smoke test end-to-end with test card `4242 4242 4242 4242` — subscription activates and trial banner disappears
