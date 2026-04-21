# Component Templates — web-scaffold

## `src/components/layout/TrialBanner.tsx`

Generated in every SaaS scaffold with auth. Hidden when subscription is active. Trial model from SCOPE.md determines default trial days.

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UpgradeButton } from '@/components/billing/UpgradeButton'

interface OrgRecord {
  trial_ends_at: string | null
  subscription_status: string | null
}

export function TrialBanner() {
  const [org, setOrg] = useState<OrgRecord | null>(null)

  useEffect(() => {
    supabase
      .from('organizations')
      .select('trial_ends_at, subscription_status')
      .single()
      .then(({ data }) => setOrg(data))
  }, [])

  if (!org) return null
  if (org.subscription_status === 'active') return null
  if (!org.trial_ends_at) return null

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86_400_000)
  )

  if (daysLeft === 0) {
    return (
      <div className="flex items-center justify-center gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm">
        <span className="text-destructive font-medium">Your trial has expired.</span>
        <UpgradeButton priceId={import.meta.env.VITE_STRIPE_PRO_PRICE_ID} label="Upgrade now" size="sm" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-muted/40 px-4 py-2 text-sm">
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> left in your free trial.
      </span>
      <UpgradeButton priceId={import.meta.env.VITE_STRIPE_PRO_PRICE_ID} label="Upgrade now" size="sm" variant="outline" />
    </div>
  )
}
```

**Rules:**
- Hidden when `subscription_status === 'active'` — never shown to paying customers
- Shown on ALL app pages inside AppLayout — never page-specific
- Upgrade link uses `VITE_STRIPE_PRO_PRICE_ID` env var — replace placeholder before go-live
- Trial expiry urgency: 0 days uses destructive color; 1-7 uses default warning tone; 8+ uses muted
- If product uses free-trial-no-card model, `trial_ends_at` is set at signup — no card required until upgrade

---

## `src/pages/NotFoundPage.tsx` — 404

```tsx
// src/pages/NotFoundPage.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  useEffect(() => { document.title = 'Page not found' }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-muted-foreground/20 mb-4 select-none">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="gap-2">
          <Link to="/"><ArrowLeft className="h-4 w-4" />Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
```

Register in `App.tsx` as the catch-all route:
```tsx
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
)

// Always last route in router
<Route path="*" element={
  <Suspense fallback={null}>
    <NotFoundPage />
  </Suspense>
} />
```

---

## `src/main.tsx` — Sentry error monitoring (SaaS products mandatory)

Add Sentry before `createRoot`. Skip for pure landing pages without auth.

```tsx
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: import.meta.env.PROD,
})

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary fallback={<p className="p-8 text-destructive">Something went wrong. Please refresh.</p>}>
    <App />
  </Sentry.ErrorBoundary>
)
```

**Package:** `npm install @sentry/react`

**Rules:**
- `enabled: import.meta.env.PROD` — never sends events in dev
- Wrap root `<App />` in `<Sentry.ErrorBoundary>` — catches all unhandled React render errors
- `tracesSampleRate: 0.2` — 20% of transactions traced (keeps free tier comfortable)
- `replaysOnErrorSampleRate: 1.0` — always capture replay on error (critical for debugging)
