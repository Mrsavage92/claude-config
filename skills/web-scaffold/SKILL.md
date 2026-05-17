# /web-scaffold

Bootstrap a production-ready React web application with enterprise-quality design from the ground up. Supports two framework paths: **Next.js 15 App Router** (default for marketing-led SaaS — see Step 0.5) and **Vite 6 + React Router 7** (for app-shell-first products without a marketing site).

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

0.5. **Framework choice** (Next.js App Router vs Vite + React Router 7) — MANDATORY first step
1. Read Design DNA + Scope
2. Design Brief (if no SCOPE.md)
3. Document Design System Decisions
4. Generate all foundation files (framework-specific templates)
5. Install dependencies + shadcn init (v4 with `registry:base`)
6. Output summary

---

### Step 0.5 — Framework choice (MANDATORY — answer before any code is generated)

Read `SCOPE.md` if present — if it contains `framework: nextjs` or `framework: vite`, USE THAT and skip the question. Otherwise ask:

```
Framework choice for this build:

  [A] Next.js 15 App Router  (RECOMMENDED for marketing-led SaaS)
      - Marketing site + app shell in one codebase
      - PPR (Partial Prerendering) default in Next.js 16
      - Native @vercel/og, next/font foundry loaders, RSC streaming
      - First-class Speculation Rules + cross-doc View Transitions
      - Pick this if the product ships a public marketing page

  [B] Vite 6 + React Router 7  (for app-shell-first products)
      - Faster HMR, full bundle control, no RSC overhead
      - Pick this if the product is a dashboard / data tool / SPA-only
      - No public marketing surface
```

Default to **[A] Next.js** unless the user explicitly picks Vite, or SCOPE.md says `app-shell-first: true`.

Write the choice to `SCOPE.md` under `framework: nextjs | vite`. Every downstream skill reads this — `/web-page`, `/web-supabase`, `/web-deploy`, `/web-evolve` all branch on it.

**Path-specific templates:**
- **Next.js path** → read `references/nextjs-templates.md` for file templates, install commands, `app/` structure, `next/font` config, OG generation, Speculation Rules + cross-doc View Transitions setup.
- **Vite path** → read `references/file-templates.md` for `vite.config.ts`, `src/App.tsx` lazy routing, `vercel.json` SPA rewrites, `src/pages/` structure.

The two paths produce different file trees. Do NOT mix `app/` (Next.js App Router) with `src/pages/` (Vite SPA) — pick one, stick with it.

---

### Step 0.7 — Extract reference tokens via /style-mirror (MANDATORY before any code gen)

`tokens.lock.json` is the design system, NOT "premium SaaS defaults". This step is the lever that prevents the "every scaffold looks the same" failure mode.

1. Read `SCOPE.md` `## References` section (produced by `/web-scope`). Expect 2–3 URLs.
2. If missing → HALT with: `"SCOPE.md is missing the ## References section. Run /web-scope first — references are mandatory at scope time, not optional (refinement-contract.md §1)."`
3. Pick the **primary** reference (the first URL or one tagged `— primary`).
4. Fire:
   ```
   Skill('style-mirror', args='extract | urls: [<primary-url>] | save_to_slug: {project-slug}')
   ```
   This writes `.evolution/extracts/{primary-slug}.json` AND `tokens.lock.json` at project root (because exactly one URL is passed — see /style-mirror schema).
5. For secondary/tertiary references, fire additional `extract` calls in parallel — each writes `.evolution/extracts/{slug}.json` (no tokens.lock.json since not primary).
6. Verify `tokens.lock.json` exists at project root before proceeding. If extraction failed (unreachable URL, etc.) → HALT, ask user to pick a different reference.

**Effect on Step 1 onward:** `tokens.lock.json` at project root activates replication mode in the impeccable Context Gathering Protocol AND in every refinement skill. All subsequent Step 4 templates (Tailwind v4 `@theme {}`, foundry font picks, motion stack initialization) consume the extracted tokens rather than the suite's default values.

**Skip this step ONLY if:**
- `tokens.lock.json` already exists at project root (someone already ran `/style-mirror` apply-mode OR a prior scaffold).
- SCOPE.md explicitly opts out via `references_skip: true` (rare — only for truly net-new design directions where extraction would be misleading; surface this to user as a warning before accepting).

---

### Step 1 — Read Design DNA + Scope

**TOKENS LOCK GATE (read first):** If `tokens.lock.json` exists at the project root, replication mode is active. Generate `index.css`, `tailwind.config.ts`, font @imports, and the design-token system from the lock — not from `web-system-prompt.md` defaults. Do NOT scaffold the standard shadcn HSL variable set if the lock specifies different colors/space/radius. Do NOT install Framer Motion or add Visual Signature Elements unless the lock proves the reference uses them. After scaffolding, the generated `index.css` must round-trip back to the lock.
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

Generate all foundation files using the templates below. Path depends on Step 0.5 choice — read the right reference file.

**Next.js path** (`framework: nextjs`) — Read `references/nextjs-templates.md` for:
- `package.json` (Next.js 15, React 19, Tailwind v4, motion, lenis, gsap, shadcn v4 CLI)
- `tsconfig.json` + `next.config.ts` (PPR experimental flag, image domains, foundry font loader)
- `tailwind.config.ts` is GONE in v4 — config lives in `app/globals.css` under `@theme {}`
- `app/layout.tsx` (foundry `next/font` setup, `viewport` export, Speculation Rules `<script type="speculationrules">`, cross-doc View Transitions meta + CSS `@view-transition { navigation: auto; }`)
- `app/globals.css` (`@import "tailwindcss"` + `@theme inline { --color-* OKLCH tokens }`)
- `app/(marketing)/page.tsx` + `app/(marketing)/layout.tsx` (landing route group)
- `app/(app)/layout.tsx` (auth-gated route group with AppLayout + TrialBanner)
- `app/opengraph-image.tsx` (`@vercel/og` template at root, per-route overrides)
- `app/robots.ts` + `app/sitemap.ts`
- `app/manifest.ts` (typed PWA manifest)
- `instrumentation.ts` (Sentry init + RSC error capture)
- `middleware.ts` (auth gate, redirects)
- `registry.json` (shadcn `registry:base` payload — design system as portable resource)
- `CLAUDE.md` (design system snapshot + `framework: nextjs` marker)

**Vite path** (`framework: vite`) — Read `references/file-templates.md` for:
- `package.json` (core deps + optional Supabase/TanStack Query)
- `tsconfig.json` + `tsconfig.node.json`
- `vite.config.ts` (always with manualChunks)
- `postcss.config.js`
- `app/globals.css` with `@import "tailwindcss"` + `@theme {}` (Tailwind v4 even on Vite path)
- `src/lib/utils.ts`, `src/lib/query-client.ts`, `src/hooks/use-theme.ts`
- `src/App.tsx` (lazy-loaded React Router 7 routes, landing + auth + app routes)
- `vercel.json` (SPA rewrites — generate at project root, do not defer)
- `index.html` head: Speculation Rules `<script type="speculationrules">` for client-side prefetch
- `src/components/layout/AppLayout.tsx` (skip-nav + TrialBanner)
- `src/components/ui/EmptyState.tsx`
- `api/og.tsx` Vercel Edge Function for OG generation (since no `next/og`)
- Landing page build sequence (`src/components/landing/` + `src/pages/Landing.tsx`)

**Both paths** (path-agnostic):
- `.env.example`
- `vitest.config.ts` + `src/tests/setup.ts` (or `__tests__/` for Next.js)

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

**Next.js path:**
```bash
npx create-next-app@latest {project-slug} --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd {project-slug}
npm install motion lenis gsap @vercel/og
npm install --save-dev @types/node
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea spinner kbd button-group input-group field item empty
# Emit registry.json (registry:base) so the design system is portable + MCP-accessible
npx shadcn@latest registry build
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Vite path:**
```bash
npm create vite@latest {project-slug} -- --template react-ts
cd {project-slug}
npm install
npm install react-router@latest motion lenis gsap
npm install -D tailwindcss@latest postcss autoprefixer @tailwindcss/postcss
npx tailwindcss init -p
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs table select textarea spinner kbd button-group input-group field item empty
npx shadcn@latest registry build
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Both paths:** the test directory home for files written in Phase 4.5 — `__tests__/` (Next.js) or `src/tests/` (Vite). Create at scaffold time so the path exists.

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
