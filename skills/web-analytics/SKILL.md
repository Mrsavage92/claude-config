# /web-analytics

Product analytics skill for the web-* suite. Covers PostHog setup, event taxonomy, feature flags, session recording consent, and funnel analysis.

**Call this skill when:** any SaaS product needs event tracking, user behaviour analysis, funnel visibility, or feature flags.

**Stack:** PostHog JS SDK → Supabase user identity → React context provider.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- Which pages need funnel tracking? (auth, onboarding, core feature, upgrade)
- Are feature flags needed? (A/B tests, gradual rollouts)
- Is session recording required? (requires consent banner — see /web-legal)
- What are the 5 core events for this product? (define before writing a single `posthog.capture()`)

---

## Phase 1 — Install + Init

```bash
npm install posthog-js
```

Add to `.env.example`:
```
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://app.posthog.com
```

Create `src/lib/analytics.ts`:

```typescript
import posthog from 'posthog-js'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  if (!import.meta.env.VITE_POSTHOG_KEY) return

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false,      // we track manually per route
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,        // GDPR safe default
    },
    persistence: 'localStorage',
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug()
    },
  })
}

// Typed event catalogue — all captures go through here, never raw strings in components
export const track = {
  pageView: (path: string) => posthog.capture('$pageview', { $current_url: path }),

  // Auth
  signUpStarted: () => posthog.capture('sign_up_started'),
  signUpCompleted: (method: 'email' | 'google' | 'github') => posthog.capture('sign_up_completed', { method }),
  signInCompleted: (method: string) => posthog.capture('sign_in_completed', { method }),

  // Onboarding
  onboardingStepCompleted: (step: number, stepName: string) =>
    posthog.capture('onboarding_step_completed', { step, step_name: stepName }),
  onboardingCompleted: () => posthog.capture('onboarding_completed'),

  // Core feature — replace with product-specific events from SCOPE.md
  featureUsed: (feature: string, properties?: Record<string, unknown>) =>
    posthog.capture('feature_used', { feature, ...properties }),

  // Upgrade
  upgradeClicked: (source: string) => posthog.capture('upgrade_clicked', { source }),
  upgradedToPro: (plan: string) => posthog.capture('upgraded_to_pro', { plan }),

  // Errors
  errorShown: (error: string, context?: string) => posthog.capture('error_shown', { error, context }),
}

export { posthog }
```

---

## Phase 2 — Provider + Route Tracking

Create `src/providers/AnalyticsProvider.tsx`:

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, track, posthog } from '@/lib/analytics'

let initialized = false

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    if (!initialized) {
      initAnalytics()
      initialized = true
    }
  }, [])

  useEffect(() => {
    track.pageView(location.pathname + location.search)
  }, [location])

  return <>{children}</>
}
```

Wrap in `src/App.tsx` inside `<BrowserRouter>`:
```tsx
<BrowserRouter>
  <AnalyticsProvider>
    {/* routes */}
  </AnalyticsProvider>
</BrowserRouter>
```

---

## Phase 3 — User Identity (tie events to Supabase user)

In `src/hooks/use-auth.ts`, after successful auth:

```typescript
import { posthog } from '@/lib/analytics'

// On sign in:
posthog.identify(user.id, {
  email: user.email,
  created_at: user.created_at,
})

// On sign out:
posthog.reset()
```

For org-level grouping (multi-tenant products):
```typescript
posthog.group('org', orgId, {
  name: orgName,
  plan: subscription_tier,
  created_at: org.created_at,
})
```

---

## Phase 4 — Feature Flags

```typescript
import { posthog } from '@/lib/analytics'

// Check flag synchronously (after posthog.loaded)
const isNewDashboard = posthog.isFeatureEnabled('new-dashboard-v2')

// React hook
import { useFeatureFlagEnabled } from 'posthog-js/react'

function MyComponent() {
  const showNewUI = useFeatureFlagEnabled('new-dashboard-v2')
  return showNewUI ? <NewDashboard /> : <OldDashboard />
}
```

For PostHog React provider (needed for `useFeatureFlagEnabled`):
```bash
npm install posthog-js
```

Wrap in App.tsx:
```tsx
import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'

// posthog already initialized in AnalyticsProvider
<PostHogProvider client={posthog}>
  {children}
</PostHogProvider>
```

---

## Phase 5 — Key Funnels to Define in PostHog

After setup, create these funnels in PostHog dashboard:

| Funnel | Steps |
|--------|-------|
| Activation | `sign_up_completed` → `onboarding_completed` → `feature_used` |
| Conversion | `upgrade_clicked` → `upgraded_to_pro` |
| Retention | `sign_in_completed` on days 1, 7, 30 |
| Onboarding drop-off | each `onboarding_step_completed` step → completion |

---

## Phase 6 — Session Recording Consent

If GDPR/CCPA compliance is required, recording must be opt-in. Wire to the cookie consent system from `/web-legal`:

```typescript
import { posthog } from '@/lib/analytics'

// Call when user accepts analytics cookies
export function enableRecording() {
  posthog.startSessionRecording()
}

// Call when user declines
export function disableRecording() {
  posthog.stopSessionRecording()
  posthog.opt_out_capturing()
}
```

---

## Checklist

- [ ] `VITE_POSTHOG_KEY` set in `.env.local` and Vercel env vars
- [ ] `initAnalytics()` called once on app load
- [ ] Route changes fire `track.pageView()`
- [ ] User identity set via `posthog.identify()` on auth
- [ ] `posthog.reset()` called on sign out
- [ ] All captures go through typed `track.*` — no raw strings in components
- [ ] Core 5 events defined in `track` object before any coding
- [ ] Session recording uses `maskAllInputs: true`
- [ ] Funnels created in PostHog dashboard post-deploy

---

## Notes

- PostHog is self-hostable (posthog.com/docs/self-host) if data residency matters
- EU data residency: use `api_host: 'https://eu.posthog.com'`
- `capture_pageview: false` is intentional — automatic captures miss SPA route changes; manual is accurate
- Never log PII in event properties (no email addresses, no full names, no IPs)
- For server-side events (Edge Functions, webhooks): use PostHog's Python/Node library with the project API key
