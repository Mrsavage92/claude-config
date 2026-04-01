---
name: web-onboarding
description: >
  Multi-step onboarding wizard for SaaS products. Progress bar, step data collection,
  Supabase writes to organizations table, trial activation on final step, redirect to
  /dashboard on completion. Mandatory for all SaaS products with auth.
---

# Skill: /web-onboarding

Every SaaS product with auth MUST have an onboarding wizard at `/setup` or `/onboarding`. This is the gateway that collects business profile data, activates the trial, and gates the dashboard behind completion. `ProtectedRoute` redirects here when `onboarding_complete = false`.

**shadcn components required:**
```bash
npx shadcn@latest add progress card input label select textarea button
```

---

## Architecture

```
/setup
  Step 1 — Profile        (name, role, company name)
  Step 2 — Business info  (industry, team size, use case — product-specific)
  Step 3 — Plan / Trial   (Stripe Checkout or free trial activation)
  → Redirect to /dashboard
```

- Each step writes to Supabase `organizations` table immediately on Next — never batch at the end
- Final step sets `onboarding_complete = true` on the org record
- `ProtectedRoute` checks this field — if false, redirect to `/setup`
- AppLayout `TrialBanner` reads `trial_ends_at` set during Step 3

---

## Step 1 — OnboardingPage Shell

```tsx
// src/pages/OnboardingPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { StepProfile } from '@/components/onboarding/StepProfile'
import { StepBusiness } from '@/components/onboarding/StepBusiness'
import { StepPlan } from '@/components/onboarding/StepPlan'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const STEPS = ['Profile', 'Business', 'Plan']

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Record<string, unknown>>({})

  const progress = ((step + 1) / STEPS.length) * 100

  async function handleStepComplete(stepData: Record<string, unknown>) {
    const merged = { ...data, ...stepData }
    setData(merged)

    // Write partial data to org immediately — never lose progress
    if (user) {
      await supabase
        .from('organizations')
        .update(stepData)
        .eq('owner_id', user.id)
    }

    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    }
    // Final step handled by StepPlan directly (Stripe redirect or trial activation)
  }

  async function handleComplete() {
    if (user) {
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14)

      await supabase
        .from('organizations')
        .update({
          onboarding_complete: true,
          trial_ends_at: trialEnd.toISOString(),
          subscription_status: 'trial',
        })
        .eq('owner_id', user.id)
    }
    navigate('/dashboard', { replace: true })
  }

  const stepVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Step {step + 1} of {STEPS.length}
          </p>
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`text-xs font-medium ${
                  i === step ? 'text-foreground' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/40'
                }`}
              >
                {s}
                {i < STEPS.length - 1 && <span className="ml-2 text-muted-foreground/30">—</span>}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {step === 0 && (
              <StepProfile
                defaultValues={data}
                onComplete={handleStepComplete}
              />
            )}
            {step === 1 && (
              <StepBusiness
                defaultValues={data}
                onComplete={handleStepComplete}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <StepPlan
                defaultValues={data}
                onComplete={handleComplete}
                onBack={() => setStep(1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## Step 2 — StepProfile

```tsx
// src/components/onboarding/StepProfile.tsx
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StepProfileProps {
  defaultValues: Record<string, unknown>
  onComplete: (data: Record<string, unknown>) => Promise<void>
}

export function StepProfile({ defaultValues, onComplete }: StepProfileProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      full_name: defaultValues.full_name as string ?? '',
      company_name: defaultValues.company_name as string ?? '',
      role: defaultValues.role as string ?? '',
    },
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Tell us about yourself</CardTitle>
        <CardDescription>This helps us personalise your experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              placeholder="Alex Smith"
              {...register('full_name', { required: 'Required' })}
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              placeholder="Acme Corp"
              {...register('company_name', { required: 'Required' })}
              className={errors.company_name ? 'border-destructive' : ''}
            />
            {errors.company_name && (
              <p className="text-xs text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Your role</Label>
            <Select onValueChange={v => setValue('role', v)} defaultValue={defaultValues.role as string}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">Founder / CEO</SelectItem>
                <SelectItem value="product">Product Manager</SelectItem>
                <SelectItem value="engineer">Engineer</SelectItem>
                <SelectItem value="marketer">Marketer</SelectItem>
                <SelectItem value="ops">Operations</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## Step 3 — StepBusiness (adapt fields to product)

```tsx
// src/components/onboarding/StepBusiness.tsx
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft } from 'lucide-react'

interface StepBusinessProps {
  defaultValues: Record<string, unknown>
  onComplete: (data: Record<string, unknown>) => Promise<void>
  onBack: () => void
}

export function StepBusiness({ defaultValues, onComplete, onBack }: StepBusinessProps) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      industry: defaultValues.industry as string ?? '',
      team_size: defaultValues.team_size as string ?? '',
      use_case: defaultValues.use_case as string ?? '',
    },
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">About your business</CardTitle>
        <CardDescription>Helps us configure the right defaults for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Select onValueChange={v => setValue('industry', v)} defaultValue={defaultValues.industry as string}>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS / Software</SelectItem>
                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                <SelectItem value="agency">Agency / Consulting</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="real_estate">Real Estate</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="team_size">Team size</Label>
            <Select onValueChange={v => setValue('team_size', v)} defaultValue={defaultValues.team_size as string}>
              <SelectTrigger id="team_size">
                <SelectValue placeholder="How many people?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Just me</SelectItem>
                <SelectItem value="2_10">2-10</SelectItem>
                <SelectItem value="11_50">11-50</SelectItem>
                <SelectItem value="51_200">51-200</SelectItem>
                <SelectItem value="200_plus">200+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adapt this field to the product — what do they want to achieve? */}
          <div className="space-y-1.5">
            <Label htmlFor="use_case">What are you hoping to achieve?</Label>
            <Textarea
              id="use_case"
              placeholder="Describe your main goal in 1-2 sentences..."
              rows={3}
              {...register('use_case')}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" />Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## Step 4 — StepPlan (trial activation or Stripe Checkout)

```tsx
// src/components/onboarding/StepPlan.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Check, Zap } from 'lucide-react'

// Import from web-stripe skill if Stripe is configured
// import { createCheckoutSession } from '@/lib/stripe'

interface StepPlanProps {
  defaultValues: Record<string, unknown>
  onComplete: () => Promise<void>
  onBack: () => void
}

const PRO_FEATURES = [
  'Unlimited projects',
  'Advanced analytics',
  'Team collaboration',
  'Priority support',
  'API access',
]

export function StepPlan({ onComplete, onBack }: StepPlanProps) {
  const [loading, setLoading] = useState(false)

  async function startTrial() {
    setLoading(true)
    try {
      await onComplete()
    } finally {
      setLoading(false)
    }
  }

  // Uncomment when Stripe is configured
  // async function upgradeToPro() {
  //   setLoading(true)
  //   await createCheckoutSession({
  //     priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
  //     successUrl: `${window.location.origin}/dashboard?upgraded=true`,
  //     cancelUrl: `${window.location.origin}/setup`,
  //   })
  // }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Start your free trial</CardTitle>
        <CardDescription>14 days free. No credit card required.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan card */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Pro Plan</p>
              <p className="text-sm text-muted-foreground">Everything you need to get started</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              14-day trial
            </Badge>
          </div>

          <ul className="space-y-2">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={startTrial}
            className="w-full gap-2"
            disabled={loading}
          >
            <Zap className="h-4 w-4" />
            {loading ? 'Setting up your account...' : 'Start free trial'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            No credit card required. Cancel any time.
          </p>
        </div>

        <div className="flex justify-start">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Supabase Schema Requirements

The `organizations` table MUST have these columns (from web-supabase schema):

```sql
-- Required for onboarding flow
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS team_size text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS use_case text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';
```

---

## ProtectedRoute — onboarding gate

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['org', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('onboarding_complete')
        .eq('owner_id', user!.id)
        .single()
      return data
    },
    enabled: !!user,
    staleTime: 60_000,
  })

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  // Gate: redirect to setup if onboarding not complete
  if (org && !org.onboarding_complete) {
    return <Navigate to="/setup" replace />
  }

  return <>{children}</>
}
```

---

## App.tsx Route Registration

```tsx
// Add to App.tsx alongside other lazy routes
const OnboardingPage = React.lazy(() =>
  import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage }))
)

// Route — NOT behind ProtectedRoute (user needs auth but hasn't completed onboarding)
// Wrap in its own auth check that only redirects to /auth if no session
<Route
  path="/setup"
  element={
    <AuthRoute>
      <Suspense fallback={<PageSkeleton />}>
        <OnboardingPage />
      </Suspense>
    </AuthRoute>
  }
/>
```

`AuthRoute` — checks session only (no onboarding gate):

```tsx
export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSkeleton />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}
```

---

## Rules

- **Always at `/setup` or `/onboarding`** — saas-build enforces this as a build failure if missing
- **Write on each step completion** — never batch-write all data at the end; users abandon wizards
- **Final step MUST activate trial or present Stripe Checkout** — never let users skip to dashboard
- **ProtectedRoute MUST check `onboarding_complete`** — redirect to `/setup` if false
- **Progress bar is mandatory** — users need to know where they are
- **Step animations: slide in/out with AnimatePresence** — Framer Motion, 220ms
- **Back buttons on all steps except Step 1**
- **Adapt Step 2 (Business) fields to the specific product** — do not use generic placeholders
- **Do not use `useEffect` for org writes** — always write inside the `onComplete` async handler
- **Max 4 steps** — more than 4 steps and users abandon. Combine questions if needed.
