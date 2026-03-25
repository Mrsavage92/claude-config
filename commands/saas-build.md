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
Read `CLAUDE.md` and `SCOPE.md` if they exist. Read `~/.claude/web-system-prompt.md`. Check git log for recent work. Determine: is this a fresh start or a resume?

If fresh start: begin at Phase 1.
If resuming: identify the last completed phase and continue from the next one.

Log every phase start and completion to `BUILD-LOG.md` in the project root.

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
2. vite.config.ts MUST include manual chunk splitting (see vite.config.ts template below)
3. tsconfig.json MUST include `"types": ["vite/client"]`
4. CLAUDE.md MUST include: color job definition, design reference site, page inventory summary
5. AppLayout MUST include skip-nav link as first element
6. Generate vercel.json with SPA rewrites at project root (required for React Router — do not wait until deploy)
7. Run `npm install && npx shadcn@latest init && npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea` after generating files

**vite.config.ts template (always use this — fixes the 500KB bundle problem):**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 250,
  },
})
```

Read `vercel-react-best-practices` before generating vite.config.ts — apply bundle splitting, chunk targets, and React.lazy pattern from the start.

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
- Read the page's definition fields: purpose, data, empty state, loading state, error state, signature element
- Confirm the page's design is clear before writing code

**4b. Build the page**
Following /web-page rules:
- Landing page (`/`) is ALWAYS first — no exceptions
- Auth (`/signin`) is ALWAYS second
- App pages follow in SCOPE.md priority order
- Every page gets: loading state, error state, designed empty state with CTA
- Signature color appears max twice per page
- Typography uses the type scale (not everything at text-sm)

**Landing page non-negotiables (enforce these — do not skip):**
- Call `mcp__magic__21st_magic_component_inspiration` for animated background BEFORE writing the hero
- Call `mcp__magic__21st_magic_component_inspiration` for feature cards BEFORE writing the features section
- Animated background: mandatory. CSS grid pattern minimum, 21st.dev animated canvas preferred. `opacity: 0.15-0.25`, `z-index: -1`.
- Product visual mockup: mandatory. Never a gradient blob. Built from shadcn primitives: browser chrome (3 dots + URL bar) + sidebar column + stat cards + data table rows. Wrapped in glow div.
- Hero entrance: Technique 3 STAGGER from web-animations (pill → headline → sub → CTAs → stats → product visual last with 0.6s delay)
- All below-fold sections: `whileInView` + `viewport={{ once: true }}` from web-animations Technique 2/3

**4c. Per-page self-review (run immediately after building — do not skip)**
Score these 11 items. If any item fails, fix it before moving to next page:

```
Per-page review: [page name]
─────────────────────────────────────────────
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner on empty)
[ ] Error state: inline error + retry button
[ ] Color budget: primary color appears <= 2 times on this page
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels used (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all buttons, links, inputs have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button has aria-label="Close", Escape closes
```

Fix any failures. Then log: "Page [name] complete — self-review passed (11/11)" to BUILD-LOG.md. Only then move to the next page.

**4d. App.tsx**
After each page, add the route to App.tsx with React.lazy + Suspense. Keep App.tsx current throughout the build — never leave routes unregistered.

---

### Phase 5 — Quality Gate (run /web-review)

Run the full /web-review audit. Target score: 38+/40.

Additional checks beyond the standard review:
- [ ] Landing page exists at `/`
- [ ] Landing page has animated background (CSS grid minimum, 21st.dev canvas preferred) — not a plain gradient
- [ ] Landing page hero has product visual mockup (browser chrome + sidebar + stat cards + table rows) — not a blob
- [ ] Hero uses Technique 3 STAGGER from web-animations (staggered entrance, product visual loads last)
- [ ] Every empty state on every page has a CTA
- [ ] Brand color audit: count uses of `text-primary`, `bg-primary`, `border-primary`, `ring-primary` across each page file. Flag any page with > 3 total uses.
- [ ] Run `npm run build` — confirm clean build, report chunk sizes
- [ ] Typography check: at least 2 type scale levels used per page (not all text-sm)

If score < 38: fix all issues before deploying. Do not move to Phase 6 until score is 38+.
If score 38-40: proceed to deploy.

Log score and fix summary to BUILD-LOG.md.

---

### Phase 6 — Deploy (run /web-deploy)

Execute the full deploy sequence:

**6a. Pre-deploy gates (all must pass)**
Run `vercel-react-best-practices` checklist before deploying:
- `npm run build` succeeds with no TypeScript errors
- No chunk exceeds 250KB gzipped (if exceeded, add to manualChunks)
- All routes use `React.lazy` + `Suspense`
- All images have `alt`, `loading="lazy"`, explicit dimensions
- Hero image uses `loading="eager"`
- CORS in backend is NOT `*` — must be locked to production domain
- vercel.json exists with SPA rewrites

**6b. Vercel deploy**
```bash
npx vercel --prod --yes
```
Capture the production URL from output.

**6c. Set all env vars in Vercel**
For each var in `.env.example`, set it via:
```bash
npx vercel env add [VAR_NAME] production --value [value] --yes
```
VITE_API_URL is required if there is a backend — set it now, not later.

**6d. Smoke test (run all 5 — do not skip)**
Output this checklist for the human to verify. Do not mark Phase 6 complete until all 5 are confirmed.

```
Smoke Test — [product URL]
──────────────────────────────────────
ACTION REQUIRED: Open [URL] and verify each item below.

[ ] 1. Landing page loads — hero visible, animated background present, CTA visible
[ ] 2. "Start free trial" CTA navigates to /signin
[ ] 3. Sign up creates a Supabase user — check auth.users in Supabase dashboard
[ ] 4. Onboarding flow completes and reaches dashboard
[ ] 5. Core product feature is accessible and shows correct empty state with CTA

For each failure: paste the error and Claude will fix before marking deploy done.
```

If any smoke test fails: fix before marking deploy complete.

**6e. Update CORS**
Update backend CORS `allow_origins` from `*` to the production Vercel URL. Commit and push so Railway auto-deploys.

**6f. Bundle report**
After deploy, record chunk sizes in BUILD-LOG.md:
```
Bundle sizes (gzipped):
  vendor-react:    XX KB
  vendor-motion:   XX KB
  vendor-query:    XX KB
  vendor-supabase: XX KB
  [page chunks]:   XX KB each
  Total:           XX KB
```
Flag any chunk > 250KB. Fix by adding to manualChunks if exceeded.

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
- Read SCOPE.md before every phase — it is the source of truth
- Landing page is always Phase 4 page 1. No exceptions. Ever.
- Per-page self-review is mandatory. It is not optional. It is not a "nice to have."
- Never deploy with a web-review score below 38/40
- BUILD-LOG.md is updated after every completed phase
- The user should be able to walk away after typing the product brief and return to a deployed product
