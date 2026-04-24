# /web-supabase-local

Local Supabase development workflow skill for the web-* suite. Covers Supabase CLI setup, local dev stack, migration authoring, seeding, and production sync.

**Call this skill when:** setting up a new project's local dev environment, authoring schema migrations, or needing reproducible local data.

**Stack:** Supabase CLI → Docker → local Postgres + Auth + Storage + Edge Functions.

---

## Phase 0 — Pre-checks

Check if Supabase CLI is installed:
```bash
supabase --version
```

If not found, install:
```bash
# Windows (PowerShell as admin)
winget install Supabase.Supabase

# Mac
brew install supabase/tap/supabase

# Verify
supabase --version
```

Docker Desktop must be running for the local stack.

---

## Phase 1 — Project Initialisation

```bash
# In your project root
supabase init

# Link to your remote Supabase project
supabase login
supabase link --project-ref [your-project-ref]
```

This creates `supabase/` directory:
```
supabase/
├── config.toml          # Local stack config
├── migrations/          # SQL migration files (source of truth)
├── seed.sql             # Test data
└── functions/           # Edge Functions
```

---

## Phase 2 — Start Local Stack

```bash
supabase start
```

Outputs local URLs:
```
API URL:     http://127.0.0.1:54321
DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:  http://127.0.0.1:54323
```

Update `.env.local` with local values:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=[from supabase start output]
```

Keep a separate `.env.production` (or use Vercel env vars) for production values. Never commit either file.

---

## Phase 3 — Migration Workflow

**Rule: never edit the remote database schema directly. All schema changes go through migration files.**

### Create a migration

```bash
# Name it after what it does (kebab-case, past tense)
supabase migration new add-audit-runs-table
```

This creates `supabase/migrations/[timestamp]_add-audit-runs-table.sql`. Write SQL in that file.

### Apply locally

```bash
supabase db reset   # wipes local DB, applies all migrations + seed.sql
```

Or apply without resetting:
```bash
supabase migration up
```

### Push to production

```bash
supabase db push
```

This runs pending migrations on the linked remote project. It does NOT auto-reset remote — it applies only new migrations.

### Check migration status

```bash
supabase migration list
```

Shows which migrations are applied locally vs. remotely.

---

## Phase 4 — Pulling Remote Schema (for existing projects)

If you're joining an existing project that wasn't built with migrations:

```bash
# Pull the current remote schema as a single baseline migration
supabase db pull

# Or pull specific parts
supabase db dump --schema public > supabase/migrations/[timestamp]_baseline.sql
```

After pulling, commit the migration file so all team members apply it.

---

## Phase 5 — Seed Data

Edit `supabase/seed.sql` — runs automatically on `supabase db reset`:

```sql
-- Create test users (use auth.users directly for local only)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', 'alice@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alice Test"}'),
  ('00000000-0000-0000-0000-000000000002', 'bob@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bob Test"}');

-- Create test org
insert into orgs (id, name, slug, plan, subscription_status)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Test Org', 'test-org', 'pro', 'active');

-- Add members
insert into org_members (org_id, user_id, role, invite_accepted_at)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', now()),
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member', now());

-- Add representative test data for the core entity
-- e.g. for AuditHQ:
-- insert into audit_runs (org_id, name, url, status) values ...
```

---

## Phase 6 — Generate TypeScript Types

After any schema change:

```bash
# From local stack (recommended during dev)
supabase gen types typescript --local > src/types/supabase.ts

# From remote (for CI or after push)
supabase gen types typescript --project-id [project-ref] > src/types/supabase.ts
```

Import in `src/lib/supabase.ts`:
```typescript
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

This gives you fully typed query results — no `any` needed.

---

## Phase 7 — Test Edge Functions Locally

```bash
supabase functions serve ai-chat --env-file .env.local
```

Test via curl:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ai-chat' \
  --header 'Authorization: Bearer [local-anon-key]' \
  --header 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## Phase 8 — Recommended .gitignore additions

```
# Supabase local (contains secrets from supabase start output)
.env.local
.env.production
supabase/.temp/
```

Commit to git:
```
supabase/config.toml       ✅ commit
supabase/migrations/       ✅ commit all migration files
supabase/seed.sql          ✅ commit (no real PII — only test data)
supabase/functions/        ✅ commit
```

---

## Daily Workflow

```bash
# Start of day
supabase start
npm run dev

# After pulling changes with new migrations
supabase migration up   # apply new migrations without resetting
# OR
supabase db reset       # full reset with seed data (destroys local data)

# After writing new SQL
supabase migration new [name]
# Write SQL in generated file
supabase db reset       # verify it applies cleanly

# Generate types after schema change
supabase gen types typescript --local > src/types/supabase.ts

# Push schema to production (after testing locally)
supabase db push

# Stop at end of day
supabase stop
```

---

## Checklist

- [ ] Supabase CLI installed and authenticated
- [ ] `supabase/` directory committed (config, migrations, seed, functions)
- [ ] `.env.local` in `.gitignore` — never committed
- [ ] All schema changes go through migration files — no direct Studio edits in production
- [ ] `seed.sql` has realistic test data with UUIDs that match across tables
- [ ] TypeScript types regenerated after every schema change
- [ ] `supabase db push` used for production deploys — never direct SQL in Studio
- [ ] `supabase migration list` checked before pushing to confirm diff

---

## Notes

- `supabase db reset` is destructive — wipes local data. Use `supabase migration up` to apply without resetting
- RLS policies are in migration files too — never set them in Studio and forget to migrate them
- Local Studio at `http://127.0.0.1:54323` is full Supabase Dashboard equivalent — use it for debugging
- `supabase gen types` uses your actual schema — run it as part of a `postmigrate` npm script to keep types in sync automatically
- Edge Functions run in Deno locally — if a function works locally but fails in production, check for Node-specific APIs you're calling
