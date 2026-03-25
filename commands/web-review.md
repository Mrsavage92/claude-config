# /web-review

Audit existing UI against enterprise design standards and auto-fix all issues found.

## When to Use
- Before deploying any web project
- After a build session to catch quality issues
- When something "feels off" but you can't pinpoint it
- Regular quality check during development

## Process

### Step 1 — Read Design DNA
Read `~/.claude/web-system-prompt.md`. Read `src/styles/index.css` and `tailwind.config.ts` to understand the project's design system.

### Step 2 — Run All Checks in Parallel

#### A. Design System Compliance
Scan all files in `src/components/` and `src/pages/` for:
- Hardcoded colors (hex `#`, rgb(), hsl() outside index.css) - CRITICAL
- Direct Tailwind color classes: `text-white`, `text-black`, `bg-white`, `bg-black`, `text-gray-*`, `bg-gray-*` - CRITICAL
- Inline styles (`style={{}}`) with color or spacing values
- Magic number spacing (`p-[13px]`, `mt-[37px]`) - replace with scale values
- TypeScript `any` type usage
- Components exceeding 150 lines

#### B. Visual Quality Check (the Awwwards test)
For each page component, evaluate:
- Does the hero make a strong first impression? (gradient/texture/animation/bold type)
- Is there a consistent visual rhythm? (alternating backgrounds, consistent spacing)
- Are all interactive elements visually distinct on hover?
- Is typography scale being used (display/hero/title) or defaulting to generic sizes?
- Are Framer Motion scroll animations applied to all major sections?
- Does dark mode look as good as light mode?

Score each page: Excellent / Good / Needs Work / Poor

#### C. Web Interface Guidelines Compliance
Scan all component and page files for violations of these rules:
- Every interactive element must have a visible hover state (`hover:` variant)
- Every focusable element must have a visible focus ring (`focus-visible:ring-2 focus-visible:ring-ring`)
- No default export components — named exports only
- No components over 150 lines — flag for split
- `cn()` from `@/lib/utils` used for all conditional classes (never string concatenation)
- Framer Motion `whileInView` present on all major section components
- `viewport={{ once: true }}` set on all Framer Motion scroll triggers
- `React.lazy` + `Suspense` used for all route-level components in App.tsx
- `darkMode: 'class'` in tailwind.config.ts and `.dark` class variants activate via CSS variables

#### D. Accessibility Scan
Scan all files for WCAG 2.2 violations:
- `<img>` tags missing `alt` attribute — CRITICAL
- Icon-only buttons/links missing `aria-label` — CRITICAL
- Form `<input>` and `<textarea>` without associated `<label>` or `aria-label` — CRITICAL
- Interactive elements that cannot receive keyboard focus (missing `tabIndex` or wrong element type)
- Missing `role` on non-semantic interactive elements (e.g., `<div onClick>` without `role="button"`)
- Color contrast: check that `text-muted-foreground` on `bg-background` meets 4.5:1 ratio in both modes
- Decorative images should have `alt=""` (empty string, not missing)
- `<button>` inside `<a>` or vice versa (invalid nesting)

#### E. Performance Check (Vite SPA rules)
Scan for:
- Data fetching inside `useEffect` (use SWR or React Query instead)
- `key={index}` on dynamic lists (use stable IDs)
- Missing `React.lazy` on route-level components
- Images without `loading="lazy"` and explicit dimensions
- Barrel imports that prevent tree-shaking

### Step 3 — Score Report

Output a score card:
```
/web-review Results — [Project Name]
─────────────────────────────────
Design System:    [score]/10
Visual Quality:   [score]/10
Accessibility:    [score]/10
Performance:      [score]/10
Overall:          [score]/40

CRITICAL (fix now):
  ⚠ src/components/Hero.tsx:23 — hardcoded #1a1a1a, use text-foreground
  ⚠ src/pages/Pricing.tsx — no scroll animations on feature section

SHOULD FIX:
  • src/components/Card.tsx:45 — magic number p-[13px], use p-3
  • src/pages/About.tsx — missing alt on team member images

NICE TO HAVE:
  • Hero could use gradient mesh background for more visual impact
  • Pricing cards lack hover elevation effect
```

### Step 4 — Auto-Fix All CRITICAL Issues
Without asking, fix all CRITICAL items immediately:
- Replace hardcoded colors with semantic tokens
- Add missing alt attributes
- Add missing focus states
- Fix aria label gaps

### Step 5 — Fix SHOULD FIX Items
Fix all "should fix" items unless they require new design decisions.

### Step 6 — Report NICE TO HAVE
List enhancement opportunities but don't implement — these are for the user to prioritise.

### Step 7 — Visual Upgrade Pass (if score < 7/10 on Visual Quality)
If visual quality is low, offer to:
1. Add gradient mesh to hero background
2. Add Framer Motion scroll animations to sections that lack them
3. Use `mcp__magic__21st_magic_component_refiner` on the lowest-quality components
4. Improve typography hierarchy (increase heading sizes, tighten letter-spacing)

## Quality Thresholds
- Score 35-40: Ship it
- Score 28-34: Fix criticals, ship with plan
- Score < 28: Do not ship — needs visual rework
