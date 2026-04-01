# /web-scope

Map every page, design decision, and data dependency before writing a single line of code. Produces SCOPE.md — the build contract that all other /web-* skills read.

## When to Use
- Always. Run this before /web-scaffold on any new product.
- When requirements change mid-build and you need to re-plan.

## Why This Exists
Building without a scope produces: forgotten landing pages, empty pages with no CTAs, wrong color choices, pages that look good with data but broken with none. This skill prevents all of that by forcing every decision upfront.

---

## Process

### Step 0 — Read DESIGN-BRIEF.md (if it exists)

Before making any design decisions, check if `DESIGN-BRIEF.md` exists in the project root (or `apps/[product-slug]/` in monorepo).

**If DESIGN-BRIEF.md exists:** Read it in full. All design decisions in Steps 2b and 2c below are ALREADY LOCKED by the brief. Do not re-decide them — import the values directly:
- Personality type, mode (dark/light-first), color system (primary/background/surface/accent HSL values), typography, reference sites, 21st.dev components selected, LottieFiles animations, marketing site tier and page structure.
- Skip Steps 2b and 2c entirely. Jump from Step 2a straight to Step 3, using the locked design values from DESIGN-BRIEF.md.
- The marketing site page structure (/, /features, /pricing, /auth) comes from the brief's "Marketing Site Structure" section — use that as the public page list in SCOPE.md.

**If DESIGN-BRIEF.md does not exist:** Proceed normally through all steps. But flag at the end: "Note: /web-design-research was not run. Design decisions were made without competitor research or 21st.dev sourcing. Run /web-design-research before the next product to get differentiated designs."

---

### Step 1 — Extract the Brief
Read the user's product description. Extract:
- Product name
- What it does (one sentence)
- Who it's for (one sentence — be specific)
- Core value: what does the user accomplish that they couldn't before?
- Business model: free trial + paid? freemium? one-time?
- Pricing tiers (if known)
- **Trial model** (decide if not stated): `free-trial-no-card` | `free-trial-card-required` | `freemium` | `paid-only`. Default to `free-trial-no-card` if unclear.
- **Onboarding data**: what information must the user provide before they can use the product? (e.g. business name, industry, location — product-specific). List the fields.
- **Dashboard gate**: what must be true before a user can reach the dashboard? (e.g. onboarding complete + plan selected, or just onboarding complete for trial)

### Step 2 — Design Brief (decide all of these before touching CSS)

**2a. Enterprise or Expressive?**
Ask internally: is this used by professionals in a work context (lawyers, accountants, ops teams, developers)? If yes: enterprise. If consumer/creative/lifestyle: expressive.

Enterprise defaults:
- Near-neutral primary (deep slate, dark indigo, charcoal) — NOT vivid color
- Brand/signature color used for ONE job only: primary CTA button + active nav state
- Status indicators: muted dot + text, never colored badge fills
- Spacing: generous (24px+ section gaps)
- Typography: high contrast weights (700 heading / 400 body), tight tracking

Expressive defaults:
- Vivid signature color used more broadly
- Gradient fills acceptable on hero/marketing sections
- More motion, more personality

**2b. Single reference site**
Pick ONE site that matches the target aesthetic. Be specific about what to borrow:
- Linear.app → sidebar pattern, muted status dots, border-only cards
- Stripe.com → typography scale, section rhythm, trust signals
- Vercel dashboard → data density, neutral palette, icon usage
- Resend.com → developer-focused, clean auth, minimal color

**2c. Decide these 5 things:**
1. Font: Inter (neutral/enterprise) | Plus Jakarta Sans (modern SaaS) | Geist (developer) | Space Grotesk (playful)
2. Mode: dark-first or light-first
3. Border radius: sharp 0.25rem | standard 0.5rem | rounded 0.75rem
4. Primary color HSL: [decide now, write it down]
5. Color job: "primary color is used ONLY for [CTA buttons] and [active nav indicator]"

### Step 3 — Page Inventory

List EVERY page the product needs. For each page, fill in all 5 fields:

**Format:**
```
## [Route] — [Page Name]
Layer: public | app
Purpose: [one sentence — what does this page help the user accomplish?]
Primary data: [what API/query feeds this page? "none" if static]
Empty state: [what does a brand-new user see? what CTA is shown?]
Loading state: [skeleton layout | spinner | none for static pages]
Error state: [what if the API fails? inline error + retry button?]
Signature element: [what one thing makes this page visually interesting?]
```

**Mandatory public pages (always required — build these first):**
- `/` — Landing page: hero, features, how it works, pricing, CTA, footer
- `/auth` — Auth: sign in + sign up on same page, split layout or centered card

**Mandatory app pages for any product with auth (always required):**
- `/setup` or `/onboarding` — Multi-step wizard. Runs once after signup, before dashboard. Collects the onboarding data fields identified in Step 1. Final step: plan selection (Stripe Checkout) or trial activation. Redirect to `/dashboard` only after complete. **This page is not optional — every SaaS product with auth must have it.**
- `/dashboard` — Summary: KPIs, recent activity, urgent actions. Shows getting-started track if onboarding is somehow incomplete.

**Common app pages (include what applies):**
- `/[core-feature]` — The primary product feature (varies by product)
- `/settings` — Profile + billing: grouped sections, autosave pattern

### Step 4 — Component Inventory

List reusable components needed across pages. Identify these specifically:
- **Modal base:** will any page need modals? Define the base pattern once.
- **Empty state:** standard format used everywhere (muted icon circle + heading + description + CTA button)
- **Status indicator:** how are ok/warning/critical/info states shown? (decide the pattern once)
- **Data table:** standard table pattern with loading skeleton
- **Stat card:** KPI card pattern used on dashboard

### Step 5 — Write SCOPE.md

Write `SCOPE.md` to the project root with this structure:

```markdown
# [Product Name] — Build Scope

## Design Brief
- Style: enterprise | expressive
- Reference: [one site]
- Font: [choice]
- Mode: dark-first | light-first
- Radius: [value]
- Primary color: hsl([H] [S]% [L]%)
- Color job: primary used ONLY for [X] and [Y]

## Page Inventory

### Public Layer (build first)
[Each page with all 5 fields]

### App Layer
[Each page with all 5 fields, in build priority order]

## Monetization & Trial
- **Trial model:** [free-trial-no-card | free-trial-card-required | freemium | paid-only]
- **Trial length:** [X days, or N/A]
- **Onboarding data collected:** [list the fields — e.g. "business name, industry, suburb, website URL"]
- **Dashboard gate:** [what must be true before /dashboard is accessible — e.g. "onboarding complete + trial activated"]
- **Upgrade gate:** [which features are paywalled — e.g. "AI responses, competitor tracking locked to paid plan"]
- **Trial banner:** AppLayout shows persistent top banner when trial active: "X days left — Upgrade now"

## Component Decisions
- Modal base: [pattern]
- Empty state: [pattern]
- Status indicator: [pattern]
- Data table: [pattern]

## Build Order
1. Landing page (/)
2. Auth (/auth)
3. Onboarding (/setup) — always 3rd for SaaS with auth
4. [core feature page]
5. [supporting pages in priority order]
6. Settings (last — least critical path)
```

### Step 6 — Output Summary

```
SCOPE.md written to project root.

Product: [name]
Style: enterprise | expressive
Reference: [site]
Pages: [N] total ([X] public, [Y] app)

Build order:
  1. / — Landing page
  2. /auth — Auth
  [etc.]

Design decisions locked:
  Font: [choice]
  Primary: hsl([value]) — used for CTA buttons + active nav only
  Mode: [dark/light]-first

Next: /web-scaffold
```

## Rules
- Never skip SCOPE.md. If the user says "just build it" — make every decision yourself and write the scope anyway. Future sessions need it.
- Landing page and auth are non-negotiable. Every product has them.
- If you cannot define the empty state for a page, do not include it in the build. Undefined pages become empty pages.
- The design brief decisions in SCOPE.md are locked for the project. Do not re-decide per-page.
