# /web-deploy

Deploy a web project to Vercel (frontend) and/or Railway (backend) with full environment configuration, smoke testing, and CORS lockdown.

## When to Use
- After /web-review scores 38+/40
- First-time deploy or pushing updates to production

## Pre-Deploy Gate
Do NOT deploy if:
- `npm run build` fails
- /web-review score is below 38/40
- CORS is still `*` in the backend
- Any CRITICAL issues from /web-review are unresolved

---

## Process

### Step 1 — Build Verification
```bash
npm run build
```
Capture and report all chunk sizes. If any chunk exceeds 250KB gzipped: add it to `vite.config.ts` manualChunks before deploying. Fix the bundle, not the warning limit.

Confirm TypeScript passes with zero errors. Fix any errors — do not deploy with TypeScript failures.

### Step 2 — Pre-Deploy Checklist (all must pass)

```
Pre-Deploy Gate
──────────────────────────────────────
[ ] npm run build succeeds — zero errors
[ ] No chunk > 250KB gzipped
[ ] vercel.json exists with SPA rewrites
[ ] CORS is NOT "*" — locked to specific origin(s)
[ ] All VITE_* env vars documented in .env.example
[ ] /web-review score is 38+/40
[ ] Landing page exists at "/"
```

If any item fails: fix it before proceeding.

### Step 3 — CORS Lockdown (backend only — do before frontend deploy)

Update `main.py` to support comma-separated multi-product `FRONTEND_URL`. This pattern is required — single-origin string breaks when a second product deploys to the same backend:
```python
import os

# Supports comma-separated list: "https://product-a.vercel.app,https://product-b.vercel.app"
_frontend_urls = [u.strip() for u in os.getenv("FRONTEND_URL", "").split(",") if u.strip()]
_allowed_origins = (
    _frontend_urls + ["http://localhost:5173", "http://localhost:3000"]
    if _frontend_urls
    else ["*"]
)

app.add_middleware(CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

To add a new frontend to an existing backend: append to `FRONTEND_URL` with a comma — do not replace the existing value.

Commit and push so Railway auto-deploys the CORS fix before the frontend goes live.

### Step 4 — Vercel Deploy

**Monorepo projects:** The frontend lives in `apps/[product-slug]/`. Vercel must be told where to find it — pass `--root-directory` or configure in the Vercel dashboard under Project Settings > General > Root Directory.

**First deploy — link repo for continuous deployment (do this once):**
```bash
# Push to GitHub first if not already
git add -A && git commit -m "chore: pre-deploy cleanup" && git push origin main

# Standalone project:
npx vercel --prod --yes

# Monorepo — specify the app subdirectory:
npx vercel --prod --yes --root-directory apps/[product-slug]
```

After first deploy, Vercel will create a GitHub integration. All future `git push origin main` → auto-deploy. No manual `npx vercel --prod` needed again.

**If not using GitHub (local deploy only):**
```bash
npx vercel --prod --yes
```

Capture the production URL from output. Note both the unique deploy URL and the aliased project URL (https://[project].vercel.app).

**If first deploy:** Vercel will auto-detect Vite. Confirm:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `apps/[product-slug]` (monorepo) or project root (standalone)

**Confirm GitHub auto-deploy is wired:**
After first deploy, verify at vercel.com/[project]/settings/git that the GitHub repo is connected and `main` branch triggers production deploys.

### Step 5 — Set All Environment Variables in Vercel

For every variable in `.env.example`, set it now. Do not skip any.

```bash
npx vercel env add VITE_API_URL production --value https://[railway-url] --yes
```

If Railway URL is unknown: log as NEEDS_HUMAN in BUILD-LOG.md with exact steps:
```
NEEDS_HUMAN: Set VITE_API_URL in Vercel
  1. Get Railway production URL from Railway dashboard
  2. Run: npx vercel env add VITE_API_URL production --value [url] --yes
  3. Run: npx vercel --prod --yes  (redeploy with env var)
```

### Step 6 — Update FRONTEND_URL in Railway (backend only)

Set or append the Vercel production URL in Railway FRONTEND_URL:

**Standalone product (first deploy to this backend):**
```bash
railway variables --set "FRONTEND_URL=https://[vercel-url]"
```

**Monorepo (backend already serves other products):** Append — do not replace:
```bash
# Get current value first, then append with comma
railway variables --set "FRONTEND_URL=https://[existing-url],https://[new-vercel-url]"
```

If Railway token not available: log as NEEDS_HUMAN with exact steps, including whether this is append or replace.

### Step 7 — Smoke Test (6 checks — all required)

Read `SCOPE.md` to get: the product name, the primary CTA label on the landing page, and the name of the core feature page. Use these in the checklist below.

Output this checklist for the human to verify. Do not mark deploy complete until all 6 are confirmed.

```
Smoke Test — [product name] ([product URL])
──────────────────────────────────────
ACTION REQUIRED: Open [URL] and verify each item below.
Report back which pass and which fail before this deploy is marked done.

[ ] 1. Landing page loads — hero visible, animated background present, [CTA label from SCOPE.md] button visible
[ ] 2. Primary CTA navigates to /signin (or /signup)
[ ] 3. Sign up — complete a full signup. Confirm user appears in Supabase auth.users dashboard.
[ ] 4. Onboarding/setup — complete the onboarding flow. Confirm it reaches the dashboard.
[ ] 5. [Core feature page from SCOPE.md] — loads and shows correct empty state with CTA.
[ ] 6. Settings page — loads and form submits without error.

For each failure: paste the error or screenshot and Claude will fix before marking done.
```

If any smoke test fails: investigate and fix before marking deploy done. A deployed product that doesn't work is worse than no product.

### Step 8 — Bundle Report

Include in deploy output:
```
Bundle sizes (gzipped):
  vendor-react:    XX KB
  vendor-motion:   XX KB
  vendor-query:    XX KB
  vendor-supabase: XX KB
  [page chunks]:   XX KB each
  Total:           XX KB
```

Target: total gzipped < 500KB. All individual chunks < 250KB.

### Step 9 — Output

```
Deployed: [product name]
──────────────────────────────────────────
Frontend URL:  https://[project].vercel.app
Backend URL:   https://[service].railway.app (if applicable)
Custom domain: [if configured / pending DNS]

Build: passed (0 errors)
/web-review: [score]/40
Smoke test: [5/5 passed / X failed — see above]
CORS: locked to [url]

Environment variables set:
  VITE_API_URL: [set / NEEDS_HUMAN]
  [others]: [set / NEEDS_HUMAN]

Remaining human actions:
  [ ] Register domain [domain.com.au] — point DNS CNAME to cname.vercel-dns.com
  [ ] Switch Stripe to live mode — replace test price IDs in PRICE_MAP
  [ ] [any other credential-dependent items]
```

Update BUILD-LOG.md with deploy summary.

## Rules
- Never deploy with /web-review score below 38/40
- Never deploy with CORS as `*` in production backend
- Never deploy with TypeScript errors
- VITE_API_URL must be set in Vercel if the app has a backend — not documented as "to do later"
- Smoke test is not optional — it is the difference between "deployed" and "working"
- vercel.json with SPA rewrites is always required for React Router apps on Vercel
