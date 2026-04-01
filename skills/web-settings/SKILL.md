---
name: web-settings
description: >
  Settings page for SaaS products. Profile section, password change, billing portal
  (Stripe Customer Portal), team management with invite flow, danger zone. Tab layout
  using shadcn Tabs. TanStack Query for data. Supabase writes.
---

# Skill: /web-settings

Every SaaS product needs a settings page. This skill covers the full settings suite: profile, billing, team, and danger zone. One page, tab layout, production-grade.

**shadcn components required:**
```bash
npx shadcn@latest add tabs card input label button badge avatar separator dialog alert
```

---

## Architecture

```
/settings
  Tab: Profile      — name, email, avatar, timezone
  Tab: Billing      — plan status, usage, Stripe Customer Portal link
  Tab: Team         — member list, invite by email, role management, remove member
  Tab: Danger Zone  — delete account
```

---

## Step 1 — SettingsPage Shell

```tsx
// src/pages/SettingsPage.tsx
import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { BillingSettings } from '@/components/settings/BillingSettings'
import { TeamSettings } from '@/components/settings/TeamSettings'
import { DangerSettings } from '@/components/settings/DangerSettings'

export function SettingsPage() {
  useEffect(() => { document.title = 'Settings' }, [])

  return (
    <div className="px-6 py-8 max-w-[860px] mx-auto">
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-1">Dashboard / Settings</p>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileSettings /></TabsContent>
        <TabsContent value="billing"><BillingSettings /></TabsContent>
        <TabsContent value="team"><TeamSettings /></TabsContent>
        <TabsContent value="danger"><DangerSettings /></TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## Step 2 — ProfileSettings

```tsx
// src/components/settings/ProfileSettings.tsx
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function ProfileSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('full_name, company_name, role')
        .eq('owner_id', user!.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const { register, handleSubmit, formState: { isDirty, isSubmitting } } = useForm({
    values: {
      full_name: profile?.full_name ?? '',
      company_name: profile?.company_name ?? '',
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (values: { full_name: string; company_name: string }) => {
      const { error } = await supabase
        .from('organizations')
        .update(values)
        .eq('owner_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const updatePassword = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
    onSuccess: () => toast.success('Password updated'),
    onError: (e: Error) => toast.error(e.message),
  })

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    watch,
    formState: { errors: pwdErrors },
  } = useForm<{ password: string; confirm: string }>()

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your name and company details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...register('full_name', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Company</Label>
                <Input id="company_name" {...register('company_name')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled className="bg-muted/50 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support.</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>Minimum 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handlePwd(async d => {
              await updatePassword.mutateAsync({ password: d.password })
              resetPwd()
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                {...regPwd('password', {
                  required: true,
                  minLength: { value: 8, message: 'Min 8 characters' },
                })}
                className={pwdErrors.password ? 'border-destructive' : ''}
              />
              {pwdErrors.password && (
                <p className="text-xs text-destructive">{pwdErrors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                {...regPwd('confirm', {
                  validate: v => v === watch('password') || 'Passwords do not match',
                })}
                className={pwdErrors.confirm ? 'border-destructive' : ''}
              />
              {pwdErrors.confirm && (
                <p className="text-xs text-destructive">{pwdErrors.confirm.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="outline" disabled={updatePassword.isPending}>
                {updatePassword.isPending ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Step 3 — BillingSettings

```tsx
// src/components/settings/BillingSettings.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export function BillingSettings() {
  const { user } = useAuth()
  const [redirecting, setRedirecting] = useState(false)

  const { data: org } = useQuery({
    queryKey: ['org-billing', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('subscription_status, trial_ends_at, stripe_customer_id, current_plan')
        .eq('owner_id', user!.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const trialDaysLeft = org?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const statusLabel = {
    trial: 'Free Trial',
    active: 'Pro',
    cancelled: 'Cancelled',
    past_due: 'Past Due',
  }[org?.subscription_status ?? 'trial'] ?? 'Free Trial'

  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
    active: 'default',
    trial: 'secondary',
    cancelled: 'destructive',
    past_due: 'destructive',
  }

  async function openBillingPortal() {
    setRedirecting(true)
    try {
      // Call your backend to create a Stripe Billing Portal session
      // Pattern from web-stripe skill:
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: window.location.href }),
      })
      const { url } = await response.json()
      window.location.href = url
    } catch {
      toast.error('Failed to open billing portal')
      setRedirecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
          <CardDescription>Manage your subscription and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{statusLabel}</span>
                <Badge
                  variant={statusVariant[org?.subscription_status ?? 'trial']}
                  className="text-xs"
                >
                  {org?.subscription_status ?? 'trial'}
                </Badge>
              </div>
              {org?.subscription_status === 'trial' && trialDaysLeft !== null && (
                <p className="text-sm text-muted-foreground">
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                    : 'Trial expired'}
                </p>
              )}
              {org?.subscription_status === 'active' && (
                <p className="text-sm text-muted-foreground">Renews automatically</p>
              )}
            </div>

            {org?.subscription_status !== 'active' && (
              <Button size="sm" asChild>
                <a href="/upgrade">Upgrade to Pro</a>
              </Button>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Billing portal</p>
              <p className="text-xs text-muted-foreground">
                View invoices, update payment method, cancel subscription.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={openBillingPortal}
              disabled={redirecting || !org?.stripe_customer_id}
            >
              <CreditCard className="h-3.5 w-3.5" />
              {redirecting ? 'Redirecting...' : 'Manage billing'}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Step 4 — TeamSettings

```tsx
// src/components/settings/TeamSettings.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, UserPlus, Loader2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'invited'
}

export function TeamSettings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['team-members', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('id, email, full_name, role, status')
        .order('created_at', { ascending: true })
      return data ?? []
    },
    enabled: !!user,
  })

  const invite = useMutation({
    mutationFn: async () => {
      // Call backend to send invite email (web-email skill's TeamInviteEmail)
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (!response.ok) throw new Error('Failed to invite member')
    },
    onSuccess: () => {
      setInviteEmail('')
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      toast.success(`Invite sent to ${inviteEmail}`)
    },
    onError: () => toast.error('Failed to send invite'),
  })

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      toast.success('Member removed')
      setRemoveTarget(null)
    },
    onError: () => toast.error('Failed to remove member'),
  })

  function getInitials(name: string | null, email: string) {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email[0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Invite */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Invite team member</CardTitle>
          <CardDescription>They'll receive an email to join your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && invite.mutate()}
            />
            <Select value={inviteRole} onValueChange={(v: 'admin' | 'member') => setInviteRole(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => invite.mutate()}
              disabled={!inviteEmail || invite.isPending}
              className="gap-1.5"
            >
              {invite.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Team members</CardTitle>
          <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul>
              {members.map((member, i) => (
                <li key={member.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center gap-3 px-6 py-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(member.full_name, member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.full_name ?? member.email}
                      </p>
                      {member.full_name && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {member.role}
                      </Badge>
                      {member.status === 'invited' && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Invited
                        </Badge>
                      )}
                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Member actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemoveTarget(member)}
                            >
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Remove confirmation dialog */}
      <Dialog open={!!removeTarget} onOpenChange={open => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{removeTarget?.full_name ?? removeTarget?.email}</strong>? They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => removeTarget && removeMember.mutate(removeTarget.id)}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## Step 5 — DangerSettings

```tsx
// src/components/settings/DangerSettings.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function DangerSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const CONFIRM_PHRASE = 'delete my account'

  async function handleDelete() {
    if (confirmation !== CONFIRM_PHRASE) return
    setDeleting(true)
    try {
      // Soft-delete org record — hard deletion via Supabase admin or backend
      await supabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('owner_id', user!.id)

      await supabase.auth.signOut()
      navigate('/', { replace: true })
      toast.success('Account deleted')
    } catch {
      toast.error('Failed to delete account. Contact support.')
      setDeleting(false)
    }
  }

  return (
    <Card className="border-destructive/30 bg-card">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions. Proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            Delete account
          </Button>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all your data, and cancel any active subscription.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete">
              Type <strong>{CONFIRM_PHRASE}</strong> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder={CONFIRM_PHRASE}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setConfirmation('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmation !== CONFIRM_PHRASE || deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting...' : 'Permanently delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
```

---

## Backend — Billing Portal Endpoint (FastAPI)

```python
# routers/billing.py
from fastapi import APIRouter, Depends
import stripe
from ..dependencies import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

@router.post("/portal")
async def create_portal_session(
    return_url: str,
    user=Depends(get_current_user)
):
    # Fetch stripe_customer_id from your DB
    customer_id = user["stripe_customer_id"]

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return {"url": session.url}
```

Enable in Stripe Dashboard: Billing > Customer portal > Settings

---

## Supabase Schema Requirements

```sql
-- team_members table (if not already in web-supabase schema)
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('active', 'invited')),
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org team"
  ON team_members FOR SELECT
  USING (org_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can manage team members"
  ON team_members FOR ALL
  USING (org_id IN (
    SELECT id FROM organizations
    WHERE owner_id = auth.uid()
  ));
```

---

## Rules

- **Tab layout always** — never separate pages for settings sections
- **Profile tab first** — most common action; billing second
- **Email is read-only** — Supabase auth owns this; surface a "contact support" note
- **Password change is in Profile tab** — not a separate section
- **Billing portal = Stripe redirect** — never build a custom billing UI; always Stripe Customer Portal
- **Delete account requires typed confirmation** — never a single click; phrase must match exactly
- **Danger zone has destructive border** — `border-destructive/30` to signal risk
- **Team invites use backend endpoint** — never write directly to `team_members` from frontend; always via API (for email delivery)
- **TanStack Query for all data** — no `useEffect` fetching
- **`document.title` via `useEffect`** — set to 'Settings' on mount
