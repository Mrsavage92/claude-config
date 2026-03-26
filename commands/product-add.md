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

**`SCOPE.md`** — write a complete SCOPE.md following this structure:

```markdown
# [Product Name] — Scope

## Design Decisions
- **Style:** Enterprise calm — trust and reliability
- **Font:** Inter
- **Primary color:** [suggest based on product type]
- **COLOR JOB:** [define one job for the primary color]
- **Reference site:** [suggest a relevant reference]
- **Tone:** [Professional/Calm/Trustworthy]

## Page Inventory (build order)

### / — Landing
- **Purpose:** Convert visitors to free trial signups
- **Data:** Static + stats
- **Empty state:** N/A (marketing page)
- **Loading state:** N/A
- **Error state:** N/A
- **Signature element:** ProductMockup showing [product's key UI]

### /signin — Auth
- **Purpose:** Sign in / sign up
- **Data:** Supabase Auth
- **Empty state:** N/A
- **Loading state:** Spinner
- **Error state:** Inline error message
- **Signature element:** Clean centered card

[Add remaining pages from the Pages input following this format]
```

### Step 6 — Update PRICE_MAP

Read `packages/stripe-utils/src/index.ts`. Find the `PRICE_MAP` object. Add placeholder price IDs for this product:

```typescript
// [Product Name]
[prefix_clean]_starter: 'price_[prefix_clean]_starter',
[prefix_clean]_pro:     'price_[prefix_clean]_pro',
[prefix_clean]_agency:  'price_[prefix_clean]_agency',
```

Replace `price_[prefix_clean]_*` with a comment `// TODO: Replace with real Stripe price ID before launch`.

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

## Session 4-N — Pages (web-page per page)
[List each page]

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
