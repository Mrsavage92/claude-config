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

**Step 4a — Confirm Vercel project exists (required before any deploy).**
Via Vercel MCP: check whether a project named `[product-slug]` already exists. If it does NOT exist: create it now before deploying. Never skip this check — deploying to a non-existent project produces an orphaned deployment with no custom domain, no env vars, and no GitHub connection.

**Primary method — Vercel MCP (preferred, no auth issues on Windows):**

Use the `vercel` MCP server tools to create the deployment:
1. Call the Vercel MCP `createDeployment` (or equivalent) tool with the project directory
2. For monorepo: specify `rootDirectory: apps/[product-slug]`
3. Set `target: production`
4. Capture the production URL from the response

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
1. Use Vercel MCP `linkGitRepository` (or equivalent) to connect the GitHub repo to the Vercel project
2. Set `main` as the production branch
3. If MCP cannot complete this step: do NOT mark it as done or leave it as a manual follow-up — log it as NEEDS_HUMAN in BUILD-LOG.md with the exact project name and GitHub repo slug
4. Test: push a trivial whitespace commit to main and confirm a new Vercel deployment appears within 60 seconds

**NEEDS_HUMAN format if MCP fails this step:**
```
NEEDS_HUMAN: Link GitHub repo to Vercel project
  Vercel project: [project-name]
  GitHub repo: Mrsavage92/[repo-slug]
  Steps: Vercel dashboard → Project → Settings → Git → Connect Repository → pick repo → set main as production branch
```

This step is NOT optional. A Vercel project without Git integration means every code push is silently ignored in production.

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

### Step 7 — Automated Smoke Test (agent-browser — no human required)

Read `SCOPE.md` to get: the product name, primary CTA label, onboarding route, and core feature page route.

**Step 7a — Create a test user via Supabase MCP (bypasses email confirmation):**
```
supabase.auth.admin.createUser({
  email: "smoke-test+[timestamp]@[product-slug].test",
  password: "SmokeTest123!",
  email_confirm: true
})
```
Save the returned user ID for cleanup. If Supabase MCP is unavailable: log NEEDS_HUMAN to create the account manually and proceed to Step 7b with manual credentials — do not skip the smoke test entirely.

**Step 7b — Run the browser sequence via the `agent-browser` Skill (invoke via Skill tool, not bash):**

10 checks — all required. Take a screenshot at each step:

1. Open `[production-url]` — verify landing page loads, hero text visible, `[CTA label]` button visible
2. Click CTA — verify navigation to `/auth`
3. Sign in with test user credentials — verify redirect to `[onboarding-route]`
4. Click through all onboarding wizard steps — verify redirect to `[main-app-route]` on completion
5. Verify trial banner visible ("days remaining" text) — skip only if trial model is NOT free-trial
6. Open `[production-url]/[core-feature-route]` — verify EmptyState with CTA renders (not blank)
7. Open `[production-url]/settings` — verify "Profile" tab visible
8. Open `[production-url]/privacy` — verify page loads without 404
9. Open `[production-url]/terms` — verify page loads without 404
10. Set viewport to 375px, open `[production-url]` — verify no horizontal overflow, hero readable

**Step 7c — Fix any failed checks:** for each failure, run `/web-fix` with the exact failure description, then re-verify that specific check. Do not mark smoke test done until all 10 pass.

**Step 7d — Clean up test user via Supabase MCP:**
```
supabase.auth.admin.deleteUser([saved-user-id])
```

If agent-browser is unavailable: log NEEDS_HUMAN "Run Phase 6d smoke test manually — sign in at [production-url], complete onboarding, verify trial banner, check all 10 routes. agent-browser was unavailable."

### Step 8 — Bundle Audit and Auto-Fix

Run build and capture output:
```bash
npm run build 2>&1 | grep -E "\.js|\.css|gzip"
```

Report sizes:
```
Bundle sizes (gzipped):
  vendor-react:    XX KB
  vendor-motion:   XX KB
  vendor-query:    XX KB
  vendor-supabase: XX KB
  [page chunks]:   XX KB each
  Total:           XX KB
```

**Auto-fix any chunk > 250KB — do not just flag it:**
1. Identify the offending chunk in `vite.config.ts` `manualChunks`
2. Split further: e.g. if `vendor-supabase` is large, move `@supabase/auth-ui-react` into a separate `vendor-supabase-ui` chunk
3. If a page chunk is large, move its heaviest import into a dedicated chunk
4. Re-run build and verify all chunks are < 250KB gzipped
5. Redeploy after the fix
6. If a chunk cannot be reduced below 250KB after splitting: log NEEDS_HUMAN with exact module name and size

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
