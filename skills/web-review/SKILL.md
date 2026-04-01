# /web-review

Comprehensive audit of a web project against enterprise design, accessibility, and performance standards. Auto-fixes all issues. Targets 38+/40.

## When to Use
- After all pages are built (final quality gate before /web-deploy)
- When visual quality feels off and you need to diagnose why
- As a check after any significant change

## Scoring Philosophy
Score what a real user experiences, not just what the code does. A page that technically renders but feels empty, confusing, or visually thin scores low on Visual Quality regardless of whether the tokens are correct. Do not inflate scores. A 34/40 that should be 28/40 results in shipping a bad product.

---

## Process

### Step 1 — Read Context
Read `~/.claude/web-system-prompt.md`.
Read `SCOPE.md` if it exists — use page definitions to verify every page was built as planned.
Read `CLAUDE.md` for the color job definition.
Read `src/styles/index.css` and `tailwind.config.ts`.

### Step 2 — Run All Checks in Parallel

#### A. Design System Compliance (target: 10/10)

Scan all files in `src/components/` and `src/pages/`:

CRITICAL (each costs 2 points):
- Hardcoded colors: hex `#`, `rgb()`, `hsl()` outside index.css
- Direct Tailwind color classes: `text-white`, `text-black`, `bg-white`, `bg-black`, `text-gray-*`, `bg-gray-*`
- Inline `style={{}}` with color or spacing values

SHOULD FIX (each costs 1 point):
- Magic number spacing: `p-[13px]`, `mt-[37px]` — replace with scale
- TypeScript `any` usage
- Components over 150 lines
- `key={index}` on any dynamic list

**Color budget audit (new — critical for enterprise design):**
For each page file, count occurrences of `text-primary`, `bg-primary`, `border-primary`, `ring-primary`. If any page has > 3 total: flag as CRITICAL. Enterprise design = restraint. The primary color doing too many jobs is a design system failure.

#### B. Visual Quality (target: 10/10)

Score this honestly. Ask: "Would a designer at Linear, Stripe, or Vercel be proud of this?" If uncertain, score lower.

For each page component:

**Landing page (2 points):**
- Does the hero have a real product visual (screenshot, mockup, UI preview in a frame)? Not just a gradient blob.
- Is the headline at display or hero size with negative letter-spacing?

**All pages (1 point each):**
- Are empty states designed with a CTA? (Icon in muted circle + heading + description + button — not just text)
- Does the dashboard have a getting-started track for new users with zero data?
- Is typography hierarchical? (Not everything at text-sm)
- Does each page have one "signature element" that makes it visually interesting?
- Is spacing generous? (Not cramped — section gaps 24px+, card padding 20px+)
- Do all cards/sections use alternating backgrounds for visual rhythm?
- Is the color usage restrained? (Brand color in 2 places max per page)
- Are Framer Motion scroll animations on all major sections?

Score each: Excellent (1.0) / Good (0.75) / Needs Work (0.5) / Poor (0) across 10 criteria.

#### C. Accessibility (target: 10/10)

**Automated scan (run first):**

Option A — dev server running:
```bash
npx axe-core-cli http://localhost:5173 --exit
```

Option B — no dev server (static analysis fallback):
```bash
# Missing alt on img tags
grep -rn "<img" src/ | grep -v 'alt='
# Icon buttons missing aria-label
grep -rn "aria-label" src/components/ | grep -v "aria-label"
# Inputs missing labels
grep -rn "<input" src/ | grep -v "aria-label\|htmlFor"
```

Flag any violations from either method as CRITICAL automatically — they map directly to WCAG failures.

CRITICAL (each costs 2 points):
- `<img>` tags missing `alt` attribute
- Icon-only buttons/links missing `aria-label`
- Modal close buttons missing `aria-label="Close"`
- Form `<input>` or `<textarea>` without `<label>` or `aria-label`
- Interactive `<div>` without `role="button"` and `tabIndex`

SHOULD FIX (each costs 1 point):
- Missing `focus-visible:ring-2 focus-visible:ring-ring` on any interactive element
- `<button>` inside `<a>` or vice versa
- Missing skip-nav link in AppLayout
- Missing `aria-live` region for mutation success/error feedback
- Decorative icons missing `aria-hidden="true"`

#### D. Performance (target: 10/10)

Read `vercel-react-best-practices` for the full checklist. Run `npm run build` and capture output.

CRITICAL (each costs 2 points):
- Any chunk exceeds 250KB gzipped
- `key={index}` on any dynamic list (already caught in A, counts here too)
- Data fetching inside `useEffect` instead of TanStack Query
- Hero image missing `loading="eager"` (hurts LCP)

SHOULD FIX (each costs 1 point):
- `vite.config.ts` missing `manualChunks` (vendor splitting)
- Missing `React.lazy` on any route-level component
- Images without `alt`, `loading="lazy"`, and explicit `width`+`height`
- `vendor-react`, `vendor-motion`, `vendor-query`, `vendor-supabase` chunks not split
- AnimatedBackground not lazy-loaded (canvas/WebGL blocks main thread)
- Font missing `display=swap` (causes FOUT / CLS)

#### E. Completeness Check (bonus/penalty)

- Landing page exists at `/`: required — if missing, Visual Quality score is capped at 6/10
- Every page in SCOPE.md was built: verify against App.tsx routes
- vercel.json exists with SPA rewrites: required for deploy
- CORS is not `*`: flag as deploy blocker

### Step 3 — Score Report

```
/web-review Results — [Project Name]
──────────────────────────────────────────
Design System:    [score]/10
Visual Quality:   [score]/10  [honest assessment — do not inflate]
Accessibility:    [score]/10
Performance:      [score]/10
Overall:          [score]/40

CRITICAL (fix before deploy):
  ⚠ [file:line] — [issue] → [fix]

SHOULD FIX:
  • [file:line] — [issue] → [fix]

NICE TO HAVE:
  • [enhancement] — [impact]

Completeness:
  Landing page: [exists / MISSING]
  CORS locked: [yes / NO — deploy blocker]
  vercel.json: [exists / MISSING]
  Bundle sizes: [list chunks with gzip sizes]
```

### Step 4 — Auto-Fix All CRITICAL Issues
Without asking, fix every CRITICAL item:
- Replace hardcoded colors with semantic tokens
- Add missing aria-labels and alt attributes
- Add focus rings
- Fix modal accessibility (aria-label="Close", Escape handler)
- Split vendor bundle in vite.config.ts if missing
- Add vercel.json if missing
- Create EmptyState components to replace any inline empty states without CTAs

### Step 5 — Fix All SHOULD FIX Items
Fix everything that doesn't require a new design decision.

### Step 6 — Visual Quality Upgrades (if Visual Quality < 8/10)

For each page scoring below 0.75 average:
1. Identify the specific gap (no empty state CTA, cramped spacing, missing skeleton, no signature element)
2. Fix it — do not just recommend it
3. Use `mcp__magic__21st_magic_component_refiner` on components scoring Poor
4. For landing page hero: if no product visual exists, generate a dashboard mockup using shadcn Card components arranged to look like the actual app UI

### Step 7 — Re-score After Fixes
After all fixes: re-run the scoring. Report the final score.

If score is still below 38/40: identify what would need to change to reach 38 and flag it clearly.

## Quality Gate Loop

When invoked from `/saas-build` Phase 5, this skill runs inside an explicit loop. Follow these rules:

**Exit condition:** score >= 38 AND pre-deploy checklist fully green. Only then proceed to deploy.

**Fix loop:** for each failure after scoring:
1. Run `/web-fix` targeting the exact component and failure reason
2. After all fixes: commit with `fix: quality gate — [N] issues resolved`
3. Re-run the full audit (return to Step 1 of Process)

**Hard stop:** if after 5 loop iterations the score is still < 38, log `STUCK` with the current score and every remaining failure, then STOP. Do NOT proceed to deploy. A score below 38 means the product is not ready. List all remaining failures and halt — do not skip or override this rule.

**Log each iteration to BUILD-LOG.md:**
```
Phase 5 attempt [N] — score [X]/40 — [N failures] remaining
```

---

## Quality Thresholds

- **38-40:** Ship it. This is the target.
- **32-37:** Fix criticals, re-review before deploy. Do not deploy at this score.
- **< 32:** Major rework needed. Do not deploy. Identify the root cause (usually: missing landing page, empty pages with no CTAs, or color system violations).

## Rules
- Never report a score higher than what is actually true
- Visual Quality is scored against "would a Linear/Stripe designer be proud?" — not "does it technically render?"
- Landing page absence caps Visual Quality at 6/10 regardless of other page quality
- A 40/40 is achievable. It means: correct tokens, real empty states with CTAs, restrained color, generous spacing, accessible, fast bundles, and a product visual on the landing page hero.
