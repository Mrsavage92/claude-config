# /web-rbac

Role-Based Access Control skill for the web-* suite. Covers org roles (owner/admin/member), Supabase RLS enforcement, feature-level permission gates, and workspace switcher UI.

**Call this skill when:** any SaaS product has multiple users per account, team invites, admin panels, or features that differ by role.

**Stack:** Supabase RLS policies → React permission hook → UI permission guards.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- What roles exist? (default: owner, admin, member — add custom if needed)
- What actions are role-gated? (delete account, invite users, manage billing, access admin panel)
- Is this single-user or multi-tenant? (single org per account or workspace switcher needed)
- Are invites required? (email invite flow with token → /web-email must exist)

---

## Phase 1 — Schema

Apply via Supabase MCP `apply_migration`:

```sql
create type org_role as enum ('owner', 'admin', 'member');

create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free',
  subscription_status text not null default 'trialing',
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);

create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role org_role not null default 'member',
  invited_email text,
  invite_token text unique,
  invite_accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

create index org_members_user_id on org_members(user_id);
create index org_members_org_id on org_members(org_id);
create index org_members_invite_token on org_members(invite_token) where invite_token is not null;

-- Store active org on user metadata or session; this table tracks it per user
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_org_id uuid references orgs(id) on delete set null,
  updated_at timestamptz default now()
);
```

---

## Phase 2 — RLS Policies

```sql
-- Orgs: members can read; owners can update/delete
alter table orgs enable row level security;

create policy "Org members can read org" on orgs
  for select using (
    exists (
      select 1 from org_members
      where org_id = orgs.id and user_id = auth.uid()
    )
  );

create policy "Org owners can update org" on orgs
  for update using (
    exists (
      select 1 from org_members
      where org_id = orgs.id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Org members: read own membership; admins/owners can read all; owners can delete
alter table org_members enable row level security;

create policy "Members read own record" on org_members
  for select using (user_id = auth.uid());

create policy "Admins read org members" on org_members
  for select using (
    exists (
      select 1 from org_members om
      where om.org_id = org_members.org_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

create policy "Owners delete members" on org_members
  for delete using (
    exists (
      select 1 from org_members om
      where om.org_id = org_members.org_id
        and om.user_id = auth.uid()
        and om.role = 'owner'
    )
  );

-- Invites: anyone with the token can read (for accepting invite)
create policy "Invite token holders can read" on org_members
  for select using (
    invite_token is not null and invite_accepted_at is null
  );

-- user_preferences: owner only
alter table user_preferences enable row level security;
create policy "Users own their preferences" on user_preferences
  for all using (auth.uid() = user_id);
```

---

## Phase 3 — Permission Hook

Create `src/hooks/use-permissions.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

type OrgRole = 'owner' | 'admin' | 'member'

interface OrgMembership {
  orgId: string
  role: OrgRole
}

const ROLE_WEIGHT: Record<OrgRole, number> = { owner: 3, admin: 2, member: 1 }

function hasMinRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[requiredRole]
}

export function usePermissions(orgId: string | null) {
  const { user } = useAuth()

  const { data: membership } = useQuery({
    queryKey: ['org-membership', orgId, user?.id],
    enabled: !!orgId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', orgId!)
        .eq('user_id', user!.id)
        .single()
      if (error) return null
      return data as { role: OrgRole }
    },
  })

  const role = membership?.role ?? 'member'

  return {
    role,
    isOwner: role === 'owner',
    isAdmin: hasMinRole(role, 'admin'),
    isMember: hasMinRole(role, 'member'),
    can: {
      inviteMembers: hasMinRole(role, 'admin'),
      removeMembers: hasMinRole(role, 'admin'),
      manageBilling: role === 'owner',
      deleteOrg: role === 'owner',
      editSettings: hasMinRole(role, 'admin'),
      viewAuditLog: hasMinRole(role, 'admin'),
    },
  }
}
```

---

## Phase 4 — Permission Gate Component

Create `src/components/auth/PermissionGate.tsx`:

```tsx
import { usePermissions } from '@/hooks/use-permissions'
import { useActiveOrg } from '@/hooks/use-active-org'

interface PermissionGateProps {
  action: keyof ReturnType<typeof usePermissions>['can']
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ action, fallback = null, children }: PermissionGateProps) {
  const { activeOrgId } = useActiveOrg()
  const { can } = usePermissions(activeOrgId)
  return can[action] ? <>{children}</> : <>{fallback}</>
}
```

Usage:
```tsx
<PermissionGate action="inviteMembers">
  <InviteMemberButton />
</PermissionGate>

<PermissionGate action="manageBilling" fallback={<UpgradePrompt />}>
  <BillingSection />
</PermissionGate>
```

---

## Phase 5 — Active Org Hook + Workspace Switcher

Create `src/hooks/use-active-org.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

export function useActiveOrg() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: orgs } = useQuery({
    queryKey: ['user-orgs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('org_members')
        .select('org_id, role, orgs(id, name, slug, plan)')
        .eq('user_id', user!.id)
        .not('invite_accepted_at', 'is', null)
      return data ?? []
    },
  })

  const { data: prefs } = useQuery({
    queryKey: ['user-prefs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('active_org_id')
        .eq('user_id', user!.id)
        .maybeSingle()
      return data
    },
  })

  const activeOrgId = prefs?.active_org_id ?? orgs?.[0]?.org_id ?? null
  const activeOrg = orgs?.find(m => m.org_id === activeOrgId)?.orgs ?? null

  const switchOrg = useMutation({
    mutationFn: async (orgId: string) => {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: user!.id, active_org_id: orgId, updated_at: new Date().toISOString() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-prefs'] })
    },
  })

  return { orgs: orgs ?? [], activeOrg, activeOrgId, switchOrg: switchOrg.mutate }
}
```

Create `src/components/nav/WorkspaceSwitcher.tsx`:

```tsx
import { useActiveOrg } from '@/hooks/use-active-org'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
  const { orgs, activeOrg, activeOrgId, switchOrg } = useActiveOrg()

  if (!activeOrg) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs">{activeOrg.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm truncate max-w-[120px]">{activeOrg.name}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Workspaces</DropdownMenuLabel>
        {orgs.map(m => {
          const org = Array.isArray(m.orgs) ? m.orgs[0] : m.orgs
          return (
            <DropdownMenuItem
              key={m.org_id}
              className="gap-2"
              onClick={() => switchOrg(m.org_id)}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">{org?.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{org?.name}</span>
              {m.org_id === activeOrgId && <Check className="h-3.5 w-3.5" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Phase 6 — Invite Flow

Create `src/lib/invites.ts`:

```typescript
import { supabase } from '@/lib/supabase'

export async function createInvite(orgId: string, email: string, role: 'admin' | 'member') {
  const token = crypto.randomUUID()

  const { error } = await supabase.from('org_members').insert({
    org_id: orgId,
    invited_email: email,
    role,
    invite_token: token,
  })

  if (error) throw error
  return token
}

export async function acceptInvite(token: string, userId: string) {
  const { data: invite, error: fetchError } = await supabase
    .from('org_members')
    .select('*')
    .eq('invite_token', token)
    .is('invite_accepted_at', null)
    .single()

  if (fetchError || !invite) throw new Error('Invalid or expired invite')

  const { error } = await supabase
    .from('org_members')
    .update({ user_id: userId, invite_accepted_at: new Date().toISOString(), invite_token: null })
    .eq('id', invite.id)

  if (error) throw error
  return invite.org_id
}
```

Wire to `/web-email` invite email — the email body links to `/invite?token={token}`.

---

## Checklist

- [ ] `org_role` enum created: owner, admin, member
- [ ] `orgs` table with RLS
- [ ] `org_members` table with RLS (read own + admins read all + owners delete)
- [ ] `user_preferences.active_org_id` for workspace state
- [ ] `usePermissions(orgId)` hook — never use role string directly in components
- [ ] `PermissionGate` component wraps all role-gated UI
- [ ] `WorkspaceSwitcher` in AppLayout sidebar/navbar (if multi-workspace)
- [ ] Invite token is a UUID — not guessable, expires when accepted
- [ ] RLS protects every table that holds org-scoped data

---

## Notes

- Never pass `role` as a prop and gate in JSX — always gate via `usePermissions` which reads from DB
- `org_members.invite_accepted_at` distinguishes pending vs accepted invites
- For products where one user = one org (no team feature): simplify — just store `org_id` on profiles and skip the membership table
- Admin-only pages should also protect the route with a server-side RLS check, not just a client-side component gate
- If a user belongs to 0 orgs after signup, auto-create an org in the onboarding wizard (Phase 3 of /web-onboarding)
