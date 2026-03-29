# /product-add

Onboard a new product into the saas-platform monorepo. Creates all scaffolding so `/autopilot` can run immediately.

## Usage

```
/product-add
Product: [product name]
Prefix: [table prefix, e.g. rm_, ct_ndis_, ti_]
Brief: [1-2 sentence description]
Pages: [comma-separated list of app pages]
```

## What This Does

Creates every file and folder needed to start building a new product — migration stub, FastAPI router dir, agents dir, frontend app dir, PRICE_MAP entry, TASKS.md entry, and a ready-to-run autopilot prompt.

---

## Execution

### Step 1 — Read context

Read `CLAUDE.md` in the project root. Confirm:
- The product prefix does not already exist in the Database Table Prefix Convention table
- The next migration number (check `supabase/migrations/` for the highest existing number)
- The current PRICE_MAP in `packages/stripe-utils/src/index.ts`

### Step 2 — Create Supabase migration stub

Create `supabase/migrations/00N_{product_slug}.sql` (N = next number):

```sql
-- Migration 00N: [Product Name]
-- Prefix: [prefix]_
-- Created: [date]

-- ─── [Product Name] Tables ──────────────────────────────────────────

-- TODO: Define tables here using the [prefix]_ naming convention
-- Example structure (replace with actual schema):

CREATE TABLE IF NOT EXISTS [prefix]_example (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES cp_organizations(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[prefix]_example_org_id ON [prefix]_example(org_id);

-- RLS
ALTER TABLE [prefix]_example ENABLE ROW LEVEL SECURITY;
-- TODO: Write RLS policies before launch (see /web-supabase)
```

### Step 3 — Create FastAPI router directory

Create these files in `services/api/routers/[prefix_clean]/` (strip trailing underscore from prefix):

**`__init__.py`** — empty

**`README.md`**:
```markdown
# [Product Name] API Routes

Prefix: [prefix]_
Base path: /[prefix_clean]/

## Routes

TODO: List routes here as they are built.
```

### Step 4 — Create agents directory

Create these files in `services/agents/[prefix_clean]/`:

**`__init__.py`** — empty

**`README.md`**:
```markdown
# [Product Name] Agents

Cron jobs that run on Railway. Each agent polls Supabase job queues or schedules.

## Agents

TODO: List agents here as they are built.
```

### Step 5 — Create frontend app directory

Create `apps/[product-slug]/` with:

**`CLAUDE.md`**:
```markdown
# [Product Name] — Frontend Context

Read this before building any page. It defines design decisions and the API contract.

## Product
[Brief description]

## Color Job
PRIMARY COLOR DOES ONE JOB: [define what the primary color highlights — e.g. "status indicators only"]
Secondary grays for everything else.

## Pages
[List each page from the Pages input, one per line with: path, purpose, key data]

## API
Backend: https://perfect-adaptation-production.up.railway.app
Auth: Supabase JWT (Bearer token)
All routes prefixed: /[prefix_clean]/

## Design Reference
[To be filled by /web-scope]

## What Not To Build
- No mock data — all data from API
- No extra pages beyond the list above
- No animations except landing page hero (Technique 3 STAGGER)
```

**`SCOPE.md`** — write a complete SCOPE.md following this structure. Every page MUST have all 6 fields filled — do not leave any as "TBD" or omit them:

```markdown
# [Product Name] — Scope

## Design Decisions
- **Style:** Enterprise calm — trust and reliability
- **Font:** Inter
- **Primary color:** [suggest HSL value based on product type]
- **COLOR JOB:** Primary is used ONLY for [e.g. "action buttons and active nav indicator"]. Nothing else.
- **Reference site:** [suggest one: linear.app / stripe.com / vercel.com / clerk.com]
- **Tone:** [Professional/Calm/Trustworthy]
- **CTA label:** [the primary call-to-action label on the landing page, e.g. "Start free trial"]

## Monetization & Trial
- **Trial model:** free-trial-no-card
- **Trial length:** 14 days
- **Onboarding data collected:** [list fields the user must provide at setup — e.g. "business name, industry, suburb, website URL"]
- **Dashboard gate:** onboarding complete + trial activated
- **Upgrade gate:** [list which features are paywalled — e.g. "AI features and exports locked to paid plan"]
- **Trial banner:** AppLayout shows persistent top banner when trial active: "X days left in trial - Upgrade now"

## Page Inventory (build order)

### / — Landing
- **Purpose:** Convert visitors to free trial signups
- **Data:** Static + stats
- **Empty state:** N/A (marketing page)
- **Loading state:** N/A
- **Error state:** N/A
- **Signature element:** ProductMockup showing [describe the product's key UI — e.g. "a compliance dashboard with risk score ring and customer table"]

### /auth — Auth
- **Purpose:** Sign in / sign up
- **Data:** Supabase Auth
- **Empty state:** N/A
- **Loading state:** Spinner on submit button
- **Error state:** Inline error below form
- **Signature element:** Clean centered card with product logo

### /setup — Onboarding Wizard
- **Purpose:** Collect business profile and activate trial before user reaches dashboard
- **Data:** Writes to [prefix]_businesses or equivalent org table; activates trial in cp_organizations
- **Empty state:** N/A (wizard is always populated step-by-step)
- **Loading state:** Spinner on each step's Continue button while saving
- **Error state:** Inline error on the current step — do not advance on error
- **Signature element:** Numbered step indicator showing progress (Step 1 of 3)
- **Steps:** Step 1 — Business details ([fields from Monetization section]). Step 2 — [product-specific setup, e.g. connect accounts]. Step 3 — Choose plan (Stripe Checkout). Redirect to /dashboard on completion.
- **Gate:** ProtectedRoute redirects here if onboarding_complete = false on the org record.

[For EACH page from the Pages input, add a section following exactly this format:]
### /[route] — [Page Name]
- **Purpose:** [one sentence — what the user does here]
- **Data:** [what API routes / tables this page reads from]
- **Empty state:** [what a new user with zero data sees — include CTA label]
- **Loading state:** [skeleton layout or spinner — be specific]
- **Error state:** [inline error + retry button description]
- **Signature element:** [the one visually distinctive element that makes this page memorable]
```

### Step 6 — Update PRICE_MAP

Read `packages/stripe-utils/src/index.ts`. Find the `PRICE_MAP` object. Add a new entry for this product using the correct `ProductId` key format (kebab-case product slug, matching the existing entries):

```typescript
'[product-slug]': {
  starter:    'price_[prefix_clean]_starter',    // TODO: Replace with real Stripe price ID before launch
  pro:        'price_[prefix_clean]_pro',         // TODO: Replace with real Stripe price ID before launch
  enterprise: 'price_[prefix_clean]_enterprise',  // TODO: Replace with real Stripe price ID before launch
},
```

The placeholder values MUST follow the format `price_[prefix_clean]_[tier]` — never use empty strings or `null`. The TODO comments are required so it's obvious these are not real IDs.

### Step 7 — Update CLAUDE.md

Add the new product to the Database Table Prefix Convention table in `CLAUDE.md`:

```
| [Product Name] | [prefix] | [prefix]_example, [prefix]_... |
```

### Step 8 — Create TASKS.md for the product

Create `apps/[product-slug]/TASKS.md`:

```markdown
# [Product Name] — Build Queue

Part of the saas-platform monorepo.
Table prefix: [prefix]_

## Session 1 — Supabase Migration + FastAPI Routes
- [ ] Finalize migration SQL in supabase/migrations/00N_[slug].sql
- [ ] Apply migration via Supabase MCP
- [ ] Write FastAPI router(s) in services/api/routers/[prefix_clean]/
- [ ] Mount router(s) in services/api/main.py
- [ ] Write RLS policies for all [prefix]_ tables

## Session 2 — Agents
- [ ] Write agent(s) in services/agents/[prefix_clean]/
- [ ] Register cron jobs in Railway

## Session 3 — Frontend (web-scaffold + web-supabase)
- [ ] /web-scaffold → apps/[product-slug]/
- [ ] /web-supabase → [prefix]_ tables + RLS

## Session 4-N — Pages (web-page per page, in order)
- [ ] / — Landing page (always first)
- [ ] /auth — Auth (always second)
- [ ] /setup — Onboarding wizard (always third — mandatory for all SaaS products)
- [ ] AppLayout trial banner (persistent top banner showing trial days remaining + Upgrade button)
[List remaining pages from Pages input]

## Session Final — Review + Deploy
- [ ] /web-review (target 38+/40)
- [ ] /web-deploy → Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] Stripe live prices → PRICE_MAP updated
- [ ] Domain registered + DNS
- [ ] Smoke test passed
```

### Step 9 — Output autopilot prompt

Print this ready-to-run session start prompt:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT ADDED: [Product Name]

Files created:
  supabase/migrations/00N_[slug].sql
  services/api/routers/[prefix_clean]/__init__.py
  services/agents/[prefix_clean]/__init__.py
  apps/[product-slug]/CLAUDE.md
  apps/[product-slug]/SCOPE.md
  apps/[product-slug]/TASKS.md
  packages/stripe-utils/src/index.ts (PRICE_MAP updated)
  CLAUDE.md (prefix table updated)

NEXT STEP — Run autopilot to build Session 1:

/autopilot
Project: saas-platform — [Product Name]
Working directory: C:\Users\Adam\Documents\au-compliance-platform
This session goal: Apply Supabase migration + build FastAPI routes for [prefix]_ tables
Context: CLAUDE.md + apps/[product-slug]/TASKS.md + apps/[product-slug]/SCOPE.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Rules

- Never reuse a prefix that already exists in CLAUDE.md
- Migration number must be sequential — check existing files first
- PRICE_MAP placeholders are strings with comments — never hardcode real price IDs
- Do not create duplicate router or agent directories
- SCOPE.md must be complete enough for `/web-scaffold` to run without further input
