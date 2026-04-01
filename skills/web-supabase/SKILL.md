# /web-supabase

Add or extend Supabase backend features — schema, RLS, auth, storage, edge functions.

## When to Use
- Adding database tables to a project
- Setting up authentication (email/password, OAuth)
- Implementing Row Level Security policies
- Adding file storage
- Creating Edge Functions for custom backend logic

## Process

### Step 0 — Identify the Supabase Project
Before making any MCP calls, determine which Supabase project to use:
1. Read `CLAUDE.md` in the project root — look for a Supabase project ref or URL
2. If not found, check `src/lib/supabase.ts` for the hardcoded URL
3. If not found, check the local memory file `~/.claude/projects/.../memory/project_*.md`
4. If still not found, run `mcp__claude_ai_Supabase__list_projects` and ask the user which project to use
5. Once identified, use that project's ref for all subsequent MCP calls

### Step 1 — Get Project Context
Use Supabase MCP to get the current project state:
- `mcp__claude_ai_Supabase__get_project` — get project details
- `mcp__claude_ai_Supabase__list_tables` — see existing schema
- `mcp__claude_ai_Supabase__list_migrations` — see migration history
- `mcp__claude_ai_Supabase__get_project_url` — get URL
- `mcp__claude_ai_Supabase__get_publishable_keys` — get anon key

### Step 2 — Schema Design
Use the `database-designer` agent for complex schemas. For simple tables, generate directly.

Rules:
- Always use `uuid` primary keys with `gen_random_uuid()` default
- Always include `created_at timestamptz DEFAULT now()` and `updated_at timestamptz DEFAULT now()`
- Foreign keys always reference `id` column
- Use snake_case for all table and column names
- Add indexes on foreign key columns and frequently-queried columns

```sql
-- Standard table template
CREATE TABLE public.{table_name} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ... columns
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {table_name}_updated_at
  BEFORE UPDATE ON public.{table_name}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Step 3 — Row Level Security (always)
Every table MUST have RLS enabled. Never skip this.

```sql
-- Enable RLS
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- Standard user-owns-data policies
CREATE POLICY "Users can view own data"
  ON public.{table_name} FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON public.{table_name} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON public.{table_name} FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON public.{table_name} FOR DELETE
  USING (auth.uid() = user_id);
```

### Step 4 — Apply Migration
Use `mcp__claude_ai_Supabase__apply_migration` to apply the SQL directly. Never ask the user to run SQL manually.

Name migrations descriptively: `create_{table_name}_table`, `add_{feature}_to_{table}`, `add_rls_{table_name}`

### Step 5 — Generate TypeScript Types
After any schema change:
```
mcp__claude_ai_Supabase__generate_typescript_types
```
Write the output to `src/types/database.types.ts`.

### Step 6 — Update Supabase Client
Read `src/lib/supabase.ts`. If it doesn't exist, create it:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Values from Supabase MCP — anon key is safe to commit
const supabaseUrl = 'https://[project-ref].supabase.co'
const supabaseAnonKey = '[anon-key-from-mcp]'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Step 7 — Auth Setup (if requested)

**Email/Password Auth:**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

**Auth Context Hook** — create `src/hooks/use-auth.ts`:
```typescript
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

**Protected Route Component — THREE checks required:**

```typescript
// src/components/auth/ProtectedRoute.tsx
// Wraps all authenticated app pages (dashboard, settings, etc.)
// Three checks: (a) session exists, (b) skeleton while loading, (c) onboarding complete
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    // (a) No session → redirect to /auth
    if (!loading && !user) {
      navigate('/auth')
      return
    }

    // (c) Check onboarding_complete on org record
    if (!loading && user) {
      supabase
        .from('organizations')
        .select('onboarding_complete')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (!data?.onboarding_complete) {
            navigate('/setup')
          } else {
            setOnboardingChecked(true)
          }
        })
    }
  }, [user, loading, navigate])

  // (b) Skeleton layout while session or onboarding check is in flight — never a blank flash
  if (loading || !onboardingChecked) {
    return (
      <div className="flex h-screen flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex flex-1 gap-4">
          <Skeleton className="h-full w-48" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

**Auth Route Component — session-only, no onboarding check:**

```typescript
// src/components/auth/AuthRoute.tsx
// Wraps /setup and /reset-password only — session required but onboarding_complete NOT checked
// (If we checked onboarding here, /setup would redirect to /setup in a loop)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/auth')
  }, [user, loading, navigate])

  if (loading) return <Skeleton className="h-screen w-full" />
  return user ? <>{children}</> : null
}
```

**Routing rules:**
- All app pages (dashboard, settings, feature pages): use `ProtectedRoute`
- `/setup` and `/reset-password`: use `AuthRoute` (session-only, never `ProtectedRoute`)
- `/auth` and `/` (landing): no wrapper

### Step 8 — Edge Functions (if needed)
Use `mcp__claude_ai_Supabase__deploy_edge_function` for custom backend logic.

Edge functions are useful for:
- Sending emails via Resend
- Processing webhooks (Stripe, etc.)
- Running Claude API calls server-side
- Scheduled jobs

### Step 9 — Output Summary
```
Supabase update complete:
  Tables created: [list]
  RLS policies: [count] policies applied
  TypeScript types: src/types/database.types.ts updated
  Supabase client: src/lib/supabase.ts [created/updated]
  Auth hooks: [created if applicable]
```

## Never
- Ask the user to run SQL manually — always use MCP apply_migration
- Skip RLS on any table
- Use environment variables for Supabase URL/anon key — hardcode in supabase.ts (anon key is public by design)
- Create custom auth tables — always use Supabase's built-in auth.users
