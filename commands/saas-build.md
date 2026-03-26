# /saas-build

Full autonomous SaaS build pipeline from idea to deployed product. Runs the complete sequence without waiting for prompts between steps.

## When to Use
- Starting any new SaaS product from scratch
- User provides a product idea, name, or brief
- Replaces manually chaining /web-scope → /web-scaffold → /web-supabase → /web-page × N → /web-review → /web-deploy

## What This Does
Executes the full build loop autonomously. Only stops for genuine blockers that require human action (external credentials, domain registration, Stripe live mode). Does NOT pause to ask "shall I proceed?" between steps.

---

## Autonomous Build Loop

### Phase 0 — Orient

Read these files in full — they are the source of truth for the entire build:
1. `~/.claude/commands/premium-website.md` — all suite rules, landing page non-negotiables, performance requirements, per-page quality bar, and pre-deploy checklist. Everything in that file applies automatically to every phase below.
2. `~/.claude/web-system-prompt.md` — Design DNA. Read before generating any UI.
3. `CLAUDE.md` (project root, if exists) — project-specific overrides.
4. `SCOPE.md` (project root, if exists) — page inventory and design decisions.

**Monorepo detection:** Check if the working directory contains `turbo.json` or an `apps/` directory. If yes, this is a monorepo build.
- In monorepo mode: the frontend lives in `apps/[product-slug]/`. All Phase 2-6 file operations target that subdirectory.
- The backend is the shared FastAPI service at `services/api/` — do NOT scaffold a new backend or create a new Railway service. Note the existing Railway URL from `CLAUDE.md` for VITE_API_URL.
- If `apps/[product-slug]/` already exists (created by `/product-add`): skip Phase 2 directory creation, only fill in the files.
- If `apps/[product-slug]/` does not exist: run `/product-add` first, then scaffold.

Check git log for recent work. Determine: is this a fresh start or a resume?

If fresh start: begin at Phase 1.
If resuming: identify the last completed phase and continue from the next one.

Log every phase start and completion to `BUILD-LOG.md` in the project root (or `apps/[product-slug]/BUILD-LOG.md` in monorepo mode).

---

### Phase 1 — Scope (run /web-scope)

Execute the full /web-scope process:
1. Extract brief from user input
2. Make all design decisions (enterprise vs expressive, font, color, reference site)
3. Produce complete page inventory with all 5 fields per page
4. Write SCOPE.md to project root
5. Write initial BUILD-LOG.md

Do not proceed to Phase 2 until SCOPE.md exists and every page has all 5 fields defined.

**Stop condition:** if the product description is too vague to define pages, ask ONE clarifying question. One question only. Then continue.

---

### Phase 2 — Scaffold (run /web-scaffold)

Execute the full /web-scaffold process using decisions from SCOPE.md:
1. Generate all foundation files (package.json, tsconfig, vite.config, tailwind.config, index.css, main.tsx, App.tsx, CLAUDE.md)
2. Apply bundle splitting from premium-website performance rules (vendor-react, vendor-motion, vendor-query, vendor-supabase chunks)
3. tsconfig.json MUST include `"types": ["vite/client"]`
4. CLAUDE.md MUST include: color job definition, design reference site, page inventory summary
5. AppLayout MUST include skip-nav link as first element
6. Generate vercel.json with SPA rewrites at project root
7. Run `npm install && npx shadcn@latest init && npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea`

Log: "Phase 2 complete — scaffold generated" to BUILD-LOG.md.

---

### Phase 3 — Backend (run /web-supabase) — skip if no backend

If the product needs Supabase:
1. Get project URL and anon key via Supabase MCP
2. Apply schema migrations
3. Write RLS policies for all tables
4. Generate TypeScript types
5. Write src/lib/supabase.ts with hardcoded values
6. Write useAuth hook and ProtectedRoute component

If FastAPI backend: note the Railway service URL needed in BUILD-LOG.md as a blocker item for the user.

Log: "Phase 3 complete — backend configured" to BUILD-LOG.md.

---

### Phase 4 — Pages (run /web-page per page, in SCOPE.md build order)

This is the core loop. For EACH page in SCOPE.md build order:

**4a. Pre-build check**
- Re-read SCOPE.md (full file) — the source of truth for page definitions and build order
- Re-read CLAUDE.md — confirm the COLOR JOB sentence and design decisions are fresh in context
- Confirm the page's design brief (purpose, data, empty state, loading state, error state, signature element) is clear before writing code

**4b. Build the page**
Follow /web-page rules. Apply all landing page non-negotiables from premium-website.md for the `/` page.
- Landing page (`/`) is ALWAYS first — no exceptions
- Auth (`/signin`) is ALWAYS second
- Onboarding (`/setup` or `/onboarding`) is ALWAYS third for any SaaS product with auth — no exceptions. If SCOPE.md does not include it, add it now before continuing.
- App pages follow in SCOPE.md priority order after onboarding

**4c. Per-page self-review**
Run the 12-item checklist from premium-website.md. Fix any failures. Log: "Page [name] complete — self-review passed (12/12)" to BUILD-LOG.md. Only then move to the next page.

**4d. App.tsx**
After each page, add the route with React.lazy + Suspense. Never leave routes unregistered.

---

### Phase 5 — Quality Gate (run /web-review)

Run the full /web-review audit. Target score: 38+/40.

Verify the pre-deploy checklist from premium-website.md is fully green before proceeding.

If score < 38: fix all issues. Do not move to Phase 6 until score is 38+.

Log score and fix summary to BUILD-LOG.md.

---

### Phase 6 — Deploy (run /web-deploy)

**6a. Pre-deploy gates**
Run through the pre-deploy checklist in premium-website.md. All items must pass.

**6b. Vercel deploy**
```bash
npx vercel --prod --yes
```
Capture the production URL from output.

**6c. Set all env vars in Vercel**
For each var in `.env.example`:
```bash
npx vercel env add [VAR_NAME] production --value [value] --yes
```
VITE_API_URL is required if there is a backend — set it now, not later.

**6d. Smoke test (present to user — do not skip)**

Read SCOPE.md to get: the product name, the primary CTA label on the landing page, and the name of the core feature page. Use these in the checklist below — do not hardcode generic text.

```
Smoke Test — [product name] ([product URL])
──────────────────────────────────────────────────────
ACTION REQUIRED: Open [URL] in a browser and verify each item.
Report back which pass and which fail — Claude will fix failures before marking deploy done.

[ ] 1. Landing page loads — hero visible, animated background present, [CTA label from SCOPE.md] button visible
[ ] 2. Primary CTA navigates to /signin (or /signup)
[ ] 3. Sign up — complete a full signup. Confirm user appears in Supabase auth.users dashboard.
[ ] 4. Onboarding/setup — complete the /setup wizard fully (all steps including plan selection or trial activation). Confirm it redirects to /dashboard on completion. This step is MANDATORY — if /setup does not exist, it is a build failure.
[ ] 5. Trial banner — after onboarding, confirm the AppLayout shows a trial banner (days remaining + Upgrade button) if trial model is free-trial.
[ ] 6. [Core feature page from SCOPE.md] — loads and shows correct empty state with CTA.
[ ] 6. Settings page — loads and form submits without error.

For each failure: paste the error or screenshot and Claude will fix before marking done.
```

**6e. Update CORS**
In monorepo mode: append the new Vercel URL to the existing comma-separated `FRONTEND_URL` env var in Railway — do not replace existing product URLs. In standalone mode: set `FRONTEND_URL` to the production Vercel URL. Either way, backend CORS must never be `*` in production.

**6f. Bundle report**
```
Bundle sizes (gzipped):
  vendor-react:    XX KB
  vendor-motion:   XX KB
  vendor-query:    XX KB
  vendor-supabase: XX KB
  [page chunks]:   XX KB each
  Total:           XX KB
```
Flag any chunk > 250KB.

---

### Phase 7 — Handoff

Write final BUILD-LOG.md entry:

```markdown
## Build Complete — [timestamp]

**Product:** [name]
**URL:** [production URL]
**Score:** [web-review score]/40

### What was built
[list of all pages]

### Remaining human actions required
- [ ] Register domain and point DNS to Vercel
- [ ] Switch Stripe to live mode and replace test price IDs
- [ ] [any other items that needed credentials]

### Architecture notes
[anything non-obvious about the build that future sessions should know]
```

---

## Stop Conditions (the only times autonomous execution pauses)

| Condition | Action |
|---|---|
| Domain registration needed | Log as NEEDS_HUMAN, continue with .vercel.app URL |
| Stripe live price IDs needed | Log as NEEDS_HUMAN with test prices in place |
| Railway auth token needed | Log as NEEDS_HUMAN, document which env vars to set |
| External API key not in env | Log as NEEDS_HUMAN with exact variable name needed |
| Same error 3 times | Log as STUCK, explain what was tried |
| Ambiguous product requirements | Ask ONE clarifying question, then continue |

Never stop for:
- "Shall I proceed to the next page?"
- "Ready to move to /web-review?"
- "Should I deploy now?"
- "Is this design direction correct?" (make the decision, log the reasoning)

---

## Rules
- Phase 0 reads premium-website.md — all suite rules are inherited automatically. Do not duplicate them here.
- Read SCOPE.md before every phase — it is the source of truth for page definitions.
- Landing page is always Phase 4 page 1. No exceptions. Ever.
- Per-page self-review is mandatory. It is not optional.
- Never deploy with a web-review score below 38/40
- BUILD-LOG.md is updated after every completed phase
- The user should be able to walk away after typing the product brief and return to a deployed product
