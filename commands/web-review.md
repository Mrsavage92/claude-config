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

**All pages (8 criteria, 1 point each):**

| # | Criterion | Excellent (1.0) | Good (0.75) | Needs Work (0.5) | Poor (0) |
|---|---|---|---|---|---|
| 1 | Empty states have a CTA (icon + heading + description + button) | All pages | Most pages | Some pages | None |
| 2 | Dashboard has getting-started track for zero-data users | Present + actionable | Present but vague | Partial | Missing |
| 3 | Typography is hierarchical (not all text-sm) | 3+ levels per page | 2 levels | Mostly uniform | All text-sm |
| 4 | Each page has a signature element (counter, arc, timeline, viz) | All app pages | Most pages | Landing only | None |
| 5 | Spacing is generous (section gaps 24px+, card padding 20px+) | Generous throughout | Mostly generous | Some cramping | Cramped |
| 6 | Cards/sections use alternating backgrounds for rhythm | Consistent rhythm | Mostly | Inconsistent | No variation |
| 7 | Color usage restrained (brand color in max 2 roles per page) | All pages ≤2 | Most pages ≤2 | Some pages >2 | Brand color everywhere |
| 8 | Framer Motion scroll animations on all major sections | All sections animate | Most sections | Landing only | No animations |

**Copy quality (mandatory 9th and 10th criteria — NOT optional, NOT a deduction):**

Read COPY.md (if exists), MARKET-BRIEF.md (if exists), and DESIGN-BRIEF.md personality type. Then:

| # | Criterion | How to score |
|---|---|---|
| 9 | **Copy specificity** — grep ALL page components for generic phrases | Excellent (1.0): zero generic phrases found. Good (0.75): 1-2 minor generics ("Learn More" button). Needs Work (0.5): 3+ generics or hero uses non-differentiator headline. Poor (0): placeholder text present OR hero says "Streamline your [noun]" |
| 10 | **Tone consistency** — verify copy matches DESIGN-BRIEF.md personality | Excellent (1.0): every page matches personality tone. Good (0.75): 1 page drifts. Needs Work (0.5): 2+ pages drift or mixed tones. Poor (0): no evidence personality was considered — reads like default ChatGPT SaaS copy |

**Mandatory grep for criterion 9** (run this, do not skip):
Search all `src/pages/*.tsx` and `src/components/**/*.tsx` for: `Streamline`, `All-in-one`, `Powerful yet simple`, `Take control`, `The modern way to`, `Manage your`, `Collaborate with your team`, `Enterprise-grade`, `Click here`, `Submit`, `Get Started` (without product-specific context), `Learn More` (without target), `Lorem ipsum`, `placeholder`, `TODO`.
Count occurrences. Score per table above.

**Mandatory check for criterion 10:**
Read DESIGN-BRIEF.md personality field. Check 2 sample pages (landing + one app page): does the copy tone match? Enterprise Authority should be formal/third-person. Bold Operator should be punchy/imperative. Health & Care should be warm/reassuring.

Score all 10 criteria: Landing (2 pts) + All pages (8 pts) + Copy (2 pts) = 12 raw points. Normalize to 10/10 scale: `Visual Quality = (raw / 12) × 10`, rounded to nearest 0.5.

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
1. Identify the specific gap (no empty state CTA, cramped spacing, missing skeleton, no signature element, generic copy)
2. Fix it — do not just recommend it
3. **If criteria 9 or 10 scored below Good:** rewrite generic copy using COPY.md (if exists) or MARKET-BRIEF.md differentiator + DESIGN-BRIEF.md personality tone. Replace every flagged generic phrase with product-specific language. This is not cosmetic — generic copy is why products look templated.
4. Use `mcp__magic__21st_magic_component_refiner` on components scoring Poor
5. For landing page hero: if no product visual exists, generate a dashboard mockup using shadcn Card components arranged to look like the actual app UI

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
