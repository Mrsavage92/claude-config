# /web-scaffold

Bootstrap a production-ready React web application with enterprise-quality design from the ground up.

## Phase 0.0 — Product Validation Gate (MANDATORY for new products)

Before scaffolding ANY new product, this skill HALTS unless a fresh BUILD verdict exists.

1. Derive `{slug}` from product name (kebab-case).
2. Read `~/Documents/Claude/outputs/product-validation-{slug}.md`.
3. **Gate does NOT apply to:** a new feature/module inside a product already listed in `~/Documents/Claude/outputs/active-revenue-projects.md`, client work, or a helper CLI.
4. Gate logic for new products:
   - Missing file → HALT, run `/product-validator` first
   - KILL verdict → HALT, surface reasoning
   - VALIDATE-FIRST → HALT, surface interview protocol
   - BUILD (<30 days old) → proceed
   - BUILD (>30 days old) → STALE, re-run `/product-validator`

This gate exists because Tender Writer was scaffolded 6 days before validator caught it. See `~/Documents/Claude/retrospectives/validator-learnings.md`.

---

## When to Use
- Starting a new web project, SaaS, landing page, or dashboard (validator gate applies)
- Always run /web-scope first if starting a new product — scaffold uses SCOPE.md decisions

---

## Process Overview

1. Read Design DNA + Scope
2. Design Brief (if no SCOPE.md)
3. Document Design System Decisions
4. Generate all foundation files
5. Install dependencies + shadcn init
6. Output summary

---

### Step 1 — Read Design DNA + Scope
Read `~/.claude/web-system-prompt.md` in full.
If `SCOPE.md` exists in project root: read it and use its design decisions. Skip Step 2.
If no SCOPE.md: run /web-scope first, then return here.

---

### Step 2 — Design Brief (only if no SCOPE.md)
Decide all of these yourself if the user says "just build it":

1. **Enterprise or expressive?** Professional/B2B tool = enterprise defaults (neutral palette, restrained color). Consumer/creative = expressive defaults.
2. **Tone:** Bold/Confident | Calm/Trustworthy | Playful/Modern | Premium | Technical
3. **Reference site:** pick ONE (linear.app | vercel.com | stripe.com | resend.com | clerk.com)
4. **Color:** For enterprise — near-neutral primary (deep slate/indigo). For expressive — vivid signature hue.
5. **Color job (critical):** "The primary color is used ONLY for [primary CTA buttons] and [active nav indicator]. Nothing else."
6. **Font, mode, border radius**

---

### Step 3 — Design System Decisions (document before coding)

Write these to CLAUDE.md before generating any component:
- Signature color HSL value
- Color job (the one sentence rule)
- Font name
- Mode (dark/light first)
- Border radius

---

### Step 4 — Generate All Files

Generate all foundation files using the templates below. Read reference files for exact code.

**File templates** — Read `references/file-templates.md` for:
- `package.json` (core deps + optional Supabase/TanStack Query)
- `tsconfig.json` + `tsconfig.node.json`
- `vite.config.ts` (always with manualChunks)
- `postcss.config.js`
- `tailwind.config.ts` + `src/styles/index.css`
- `src/lib/utils.ts`, `src/lib/query-client.ts`, `src/hooks/use-theme.ts`
- `src/App.tsx` (lazy-loaded routes, landing + auth + app routes)
- `CLAUDE.md` (design system snapshot)
- `vercel.json` (SPA rewrites — generate at project root, do not defer)
- `.env.example`
- `vitest.config.ts` + `src/tests/setup.ts`
- `src/components/layout/AppLayout.tsx` (skip-nav + TrialBanner)
- `src/components/ui/EmptyState.tsx`
- Landing page build sequence (`src/components/landing/` + `src/pages/Landing.tsx`)

**Component templates** — Read `references/component-templates.md` for:
- `src/components/layout/TrialBanner.tsx` (SaaS with auth — mandatory)
- `src/pages/NotFoundPage.tsx` (404 page + lazy-loaded catch-all route)
- `src/main.tsx` Sentry init (SaaS mandatory, skip for pure landing pages)

**Icon generation** — Read `references/icon-generation.md` for:
- AI-generated app icons (icon-192.png, icon-512.png) and OG image (og-image.png)
- Prompt templates, post-generation checklist

**SEO setup** — Read `references/seo-setup.md` for:
- `src/hooks/useSeo.ts` (per-page SEO hook — call on every page)
- `index.html` base OG + Twitter meta tags
- `public/robots.txt` and `public/sitemap.xml`
- `public/site.webmanifest` + `<link rel="manifest">` in index.html
- Sentry `.env.example` entry

**shadcn/ui CSS overwrite guard (mandatory after shadcn init):**
After running shadcn init, check `src/styles/index.css` for the string `oklch(`. If found, shadcn v4 has overwritten design system tokens. Restore using the Complete Token Set from `~/.claude/web-system-prompt.md`. Apply the project's chosen HSL values. The restored file must contain only HSL space-separated values — no `oklch()`, no `rgb()`, no hex.

---

### Step 5 — Install + shadcn Init

**Tests directory is created at scaffold time, not after pages are built.**

```bash
npm install
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

The `src/tests/` directory is the home for all test files written in Phase 4.5. Create it now so the path exists.

---

### Step 6 — Output
```
Scaffolded: [name]
Style: enterprise | expressive | reference: [site]
Primary: hsl([value]) — used for CTA + active nav only
Font: [choice] | Mode: [dark/light] | Radius: [value]

Files generated: [count]
Landing page: included (built in Phase 4 of /saas-build)

Next: /web-supabase (if backend) → /web-page (landing first)
```

---

## Anti-Patterns

- Skipping SCOPE.md / DESIGN-BRIEF.md reads before scaffolding
- Using hardcoded hex colors in index.css instead of HSL variables
- Forgetting `"types": ["vite/client"]` in tsconfig
- Eager-importing route pages instead of React.lazy
- Building without vercel.json SPA rewrites
- Deferring vitest.config.ts / src/tests/setup.ts to after pages are built
- Using a CSS gradient as the animated background instead of BackgroundGradientAnimation
- Skipping the oklch check after shadcn init

---

## Rules

- vite.config.ts MUST always include manualChunks — no exceptions
- tsconfig.json MUST always include `"types": ["vite/client"]`
- vercel.json MUST be generated at project root — every React Router SPA needs it from day one
- EmptyState component MUST be generated in every scaffold
- AppLayout MUST include skip-nav AND TrialBanner (SaaS with auth)
- TrialBanner MUST be generated in every SaaS scaffold — hidden by subscription_status, not removed
- Sentry MUST be initialised in main.tsx for every SaaS product — skip only for pure landing pages without auth
- CLAUDE.md MUST include the color job sentence
- Landing page route MUST exist in App.tsx from day one (even if page not built yet)
- `useSeo` hook MUST be generated in every scaffold and called on every page
- `NotFoundPage` MUST be generated in every scaffold and registered as the `path="*"` catch-all route
- Auth, settings, and onboarding pages MUST set `noIndex: true` in useSeo
- `public/site.webmanifest` MUST be generated at scaffold time

---

## Related Skills

- `/web-scope` — run before scaffold to generate SCOPE.md
- `/web-design-research` — run if no DESIGN-BRIEF.md before building landing page
- `/web-supabase` — backend setup after scaffold
- `/web-page` — build individual pages after scaffold
- `/web-animations` — Framer Motion techniques referenced in landing build sequence
- `/saas-build` — full orchestration pipeline that calls this skill
