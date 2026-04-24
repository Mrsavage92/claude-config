### Phase 6 — Deploy (run /web-deploy)

**6a. Pre-deploy gates**
Run through the pre-deploy checklist in premium-website.md. All items must pass.

**6b. Vercel deploy (GitHub-connected auto-deploy is the primary method)**

The most reliable deploy path is: GitHub repo connected to Vercel → `git push` triggers auto-deploy. The Vercel CLI (`npx vercel --prod`) is the fallback, not the primary method — it fails silently on Windows with empty error messages.

**Step 1 — Set env vars FIRST (before the first deploy).**

Read `.env` (or `.env.local`) for actual values. For each var that has a real value (not a placeholder), set it in Vercel:

```bash
echo "[value]" | npx vercel env add [VAR_NAME] production 2>&1
```

Repeat for every var in `.env.example` that has an actual value in `.env`. At minimum: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Also `VITE_API_URL` if there is a backend, `VITE_STRIPE_PUBLISHABLE_KEY` if Stripe is integrated.

**Step 2 — Create Vercel project linked to GitHub.**

Delete any stale `.vercel/` directory first, then link:
```bash
rm -rf .vercel
npx vercel link --project [product-slug] --yes 2>&1
```

If the link output says "Connected GitHub repository" — auto-deploy is active. If not, the GitHub integration may need connecting in the Vercel dashboard.

**Monorepo: check for stale `.vercel/project.json`.** Before linking, check if `apps/[product-slug]/.vercel/project.json` exists from a scaffold copy. If it points to the wrong project, delete it.

**Step 3 — First deploy.**

Try the Vercel CLI first:
```bash
npx vercel deploy --prod --yes 2>&1
```

If this returns `"status": "error"` with an empty message (known Windows issue): fall back to git push:
```bash
git push origin main  # or master
```

If GitHub is connected to Vercel, the push triggers an auto-deploy. Wait 30 seconds then verify:
```bash
curl -s -o /dev/null -w "%{http_code}" [production-url]
```

**Step 4 — If the Vercel project is corrupted (repeated empty errors):**

The existing Vercel project may be broken. Create a fresh one with a different name:
```bash
rm -rf .vercel
npx vercel link --project [product-slug]-au --yes 2>&1
```
Re-set env vars on the new project (Step 1), then deploy (Step 3). Update BUILD-LOG.md with the new production URL.

**Step 5 — Capture and record the production URL.**

After a successful deploy, the URL is in the Vercel output or at `https://[project-name].vercel.app`. Write it to BUILD-LOG.md immediately.

**Parallelise 6d + 6f:** Start the bundle audit (6f) at the same time as setting up the smoke test user (6d Step 1). Bundle analysis does not require a live test session, and test user creation does not require the bundle report. Merge both outputs before deciding whether to deploy-fix.

**6d. Automated smoke test — dual browser verification (agent-browser + playwright-cli in parallel)**

Read SCOPE.md to get: the product name, the primary CTA label, the onboarding route, and the core feature page route.

**Step 1 — Create a test user via Supabase MCP (bypasses email confirmation):**
```
supabase.auth.admin.createUser({
  email: "smoke-test+[unix-epoch-seconds, e.g. $(date +%s)]@[product-slug].test",
  password: "SmokeTest123!",
  email_confirm: true
})
```
Save the returned user ID for cleanup.
If Supabase MCP is unavailable: log NEEDS_HUMAN "Create a test account manually at [production-url]/auth to run smoke test, then delete it after. Supabase MCP was unavailable for automated test user creation." and skip to Step 2 using a manually-created account — do not block Phase 6d entirely.

**Step 2 — Run BOTH browser tools in parallel (same time, not sequential):**

**Tool A — `agent-browser` Skill** (interactive flow, 10 checks):
Invoke agent-browser via the Skill tool (it is NOT a bash CLI command). The sequence to execute covers 10 checks:

1. Open [production-url] — verify landing page loads, hero text "[product name]" visible, CTA "[CTA label from SCOPE.md]" visible
2. Click CTA — verify navigation to /auth
3. Sign in with test user credentials — verify redirect to [onboarding-route]
4. Click through all onboarding wizard steps — verify redirect to [main-app-route] on completion
5. Verify trial banner visible ("days remaining" text) — skip if trial model is not free-trial
6. Open [production-url]/[core-feature-route] — verify empty state with CTA renders (not blank)
7. Open [production-url]/settings — verify "Profile" tab visible
8. Open [production-url]/privacy — verify page loads without 404
9. Open [production-url]/terms — verify page loads without 404
10. Set viewport to 375px, open [production-url] — verify no horizontal overflow, hero readable

**Tool B — Puppeteer MCP (screenshot verification, run in parallel with Tool A):**

Use `mcp__puppeteer__puppeteer_navigate` + `mcp__puppeteer__puppeteer_screenshot` for visual verification. Run these in sequence:

```
1. mcp__puppeteer__puppeteer_navigate({ url: "[production-url]" })
   mcp__puppeteer__puppeteer_screenshot({ name: "smoke-desktop", fullPage: false })

2. mcp__puppeteer__puppeteer_navigate({ url: "[production-url]/auth" })
   mcp__puppeteer__puppeteer_screenshot({ name: "smoke-auth", fullPage: false })

3. mcp__puppeteer__puppeteer_navigate({ url: "[production-url]/[core-feature-route]" })
   mcp__puppeteer__puppeteer_screenshot({ name: "smoke-feature", fullPage: false })

4. mcp__puppeteer__puppeteer_navigate({ url: "[production-url]/settings" })
   mcp__puppeteer__puppeteer_screenshot({ name: "smoke-settings", fullPage: false })
```

Read each screenshot with the Read tool to visually verify: renders correctly, no blank pages, no layout breaks, no visible errors. If Puppeteer MCP is unavailable: log NEEDS_HUMAN "Puppeteer MCP unavailable — take manual screenshots of all 4 routes for visual verification."

**Step 3 — Merge findings from both tools:**
- Any check failed by EITHER tool counts as a failure
- Screenshot from playwright-cli serves as visual record even if agent-browser interaction passed
- Cross-check: if agent-browser reports a route as passing but playwright-cli screenshot shows a blank/broken page, treat as failure

**Step 4 — For each failed check:** use /web-fix with the exact failure description, then re-verify via both tools before marking it passed. Do not mark smoke test done until all 10 checks pass both tools.

If agent-browser is unavailable: run playwright-cli only and log NEEDS_HUMAN "agent-browser unavailable — interactive flow checks (login, onboarding, trial banner) need manual verification. playwright-cli screenshots captured."
If playwright-cli is unavailable: run agent-browser only and log NEEDS_HUMAN "playwright-cli unavailable — visual screenshot verification skipped."

**Step 5 — Clean up test user via Supabase MCP:**
```
supabase.auth.admin.deleteUser([saved-user-id])
```

Log: "Phase 6d smoke test complete — all checks passed (agent-browser + playwright-cli)" to BUILD-LOG.md.

**6e. Update CORS**
In monorepo mode: append the new Vercel URL to the existing comma-separated `FRONTEND_URL` env var in Railway — do not replace existing product URLs. In standalone mode: set `FRONTEND_URL` to the production Vercel URL. Either way, backend CORS must never be `*` in production.

Use the Railway GraphQL mutation to update the env var (see `~/.claude/projects/*/memory/reference_railway.md` for the `upsertVariable` mutation template and service/env IDs). If Railway MCP is unavailable: log NEEDS_HUMAN "Update FRONTEND_URL in Railway dashboard to include [production-url] — required for CORS."

**6f. Bundle audit and auto-fix**

Run build and capture output:
```bash
# Unix/Mac/Git Bash
npm run build 2>&1 | grep -E "\.js|\.css|gzip"

# PowerShell (Windows)
npm run build | Select-String -Pattern "\.js|\.css|gzip"
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
1. Identify the chunk in vite.config.ts `manualChunks`
2. Split it further: e.g. if `vendor-supabase` is large, separate `@supabase/auth-ui-react` into its own chunk `vendor-supabase-ui`
3. If a page chunk is large, move its heaviest dependency import to a dedicated chunk
4. Re-run build and verify all chunks are < 250KB gzipped
5. If a chunk cannot be reduced below 250KB after splitting: log as NEEDS_HUMAN with exact module name and size

---
