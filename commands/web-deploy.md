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
[ ] VITE_SENTRY_DSN in .env.example (errors will be silent in prod if missing)
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

**Primary method — Vercel MCP (preferred, no auth issues on Windows):**

Use the `vercel` MCP server tools to create the deployment:
1. Call the Vercel MCP `createDeployment` (or equivalent) tool with the project directory
2. For monorepo: specify `rootDirectory: apps/[product-slug]`
3. Set `target: production`
4. Capture the production URL from the response

If the project does not yet exist in Vercel, create it first via MCP before deploying.

**Fallback — CLI (use if MCP tools are unavailable):**
```bash
# Push to GitHub first
git add -A && git commit -m "chore: pre-deploy cleanup" && git push origin main

# Standalone:
npx vercel --prod --yes

# Monorepo:
npx vercel --prod --yes --root-directory apps/[product-slug]
```

Capture the production URL. Note both the unique deploy URL and the aliased project URL (https://[project].vercel.app).

**Confirm GitHub auto-deploy is wired (mandatory after first deploy):**
1. Via Vercel MCP or dashboard: open the project Settings → Git
2. Confirm the GitHub repo is connected and `main` branch is set as the production branch
3. If NOT connected: connect it now — do not leave this as a manual follow-up. Without it, every `git push` to main silently does nothing in production.
4. Test: push a trivial whitespace commit to main and confirm a new Vercel deployment appears within 60 seconds

### Step 5 — Set All Environment Variables in Vercel

**Primary method — Vercel MCP:**

For every variable in `.env.example`, use the Vercel MCP `addEnvVar` (or equivalent) tool:
- Target: `production`
- One call per variable
- Include `VITE_SENTRY_DSN` — log NEEDS_HUMAN if DSN not yet created, but do not skip setting other vars

**Fallback — CLI:**
```bash
npx vercel env add VITE_API_URL production --value https://[railway-url] --yes
```

If Railway URL is unknown: log as NEEDS_HUMAN in BUILD-LOG.md:
```
NEEDS_HUMAN: Set VITE_API_URL in Vercel
  1. Get Railway production URL from Railway dashboard
  2. Use Vercel MCP addEnvVar or: npx vercel env add VITE_API_URL production --value [url] --yes
  3. Redeploy: npx vercel --prod --yes
```

**After all env vars are confirmed set: trigger a redeploy.**
Env vars set after the initial deploy do not take effect until the next deploy.
```bash
npx vercel --prod --yes
```
Or via Vercel MCP redeploy. Skip this redeploy only if every env var was set before the Step 4 deploy.

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

**If `railway variables --set` fails or Railway CLI is not authenticated:**
1. Try Railway MCP tool `setEnvVar` if available
2. If neither works: log as NEEDS_HUMAN with exact variable name and value:
   ```
   NEEDS_HUMAN: Update FRONTEND_URL in Railway
   Service: [service name]
   Action: [append / replace]
   New value: [existing-url],[new-vercel-url]
   Steps: Railway dashboard → Service → Variables → FRONTEND_URL → edit
   ```
   Do not skip this step — CORS will block all API calls from the new frontend until it is done.

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
[ ] 5. Trial banner — AppLayout shows trial banner (days remaining + Upgrade button) after onboarding if trial model is free-trial.
[ ] 6. [Core feature page from SCOPE.md] — loads and shows correct empty state with CTA.
[ ] 7. Settings page — loads and form submits without error.

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
