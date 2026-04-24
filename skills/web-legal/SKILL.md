# /web-legal

Legal compliance skill for the web-* suite. Covers cookie consent banner (GDPR/CCPA), privacy policy page, terms of service page, and PostHog recording opt-in wiring.

**Call this skill when:** any product targets EU/AU/CA users, collects analytics, or uses session recording.

**Stack:** Custom consent hook → localStorage → PostHog opt-in/out wiring. No third-party cookie library needed.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- Which markets? (EU → GDPR, CA → CCPA, AU → Privacy Act 1988)
- What cookies/tracking are used? (PostHog analytics, Stripe, session recording)
- Is session recording enabled in PostHog? (if yes, must be opt-in)
- Does the product collect personal data beyond email/name? (extra disclosure required)

---

## Phase 1 — Consent Hook

Create `src/hooks/use-consent.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'

type ConsentState = 'pending' | 'accepted' | 'declined'

interface ConsentPreferences {
  analytics: boolean
  recording: boolean
}

const CONSENT_KEY = 'cookie-consent'

function getStoredConsent(): { state: ConsentState; prefs: ConsentPreferences } | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useConsent() {
  const stored = getStoredConsent()

  const [state, setState] = useState<ConsentState>(stored?.state ?? 'pending')
  const [prefs, setPrefs] = useState<ConsentPreferences>(
    stored?.prefs ?? { analytics: false, recording: false }
  )

  const save = useCallback((newState: ConsentState, newPrefs: ConsentPreferences) => {
    const payload = { state: newState, prefs: newPrefs }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload))
    setState(newState)
    setPrefs(newPrefs)
  }, [])

  const acceptAll = useCallback(() => {
    save('accepted', { analytics: true, recording: true })
  }, [save])

  const declineAll = useCallback(() => {
    save('declined', { analytics: false, recording: false })
  }, [save])

  const saveCustom = useCallback((p: ConsentPreferences) => {
    save(p.analytics || p.recording ? 'accepted' : 'declined', p)
  }, [save])

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY)
    setState('pending')
    setPrefs({ analytics: false, recording: false })
  }, [])

  return {
    state,
    prefs,
    isPending: state === 'pending',
    acceptAll,
    declineAll,
    saveCustom,
    resetConsent,
  }
}
```

---

## Phase 2 — Cookie Banner Component

Create `src/components/legal/CookieBanner.tsx`:

```tsx
import { useState } from 'react'
import { useConsent } from '@/hooks/use-consent'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'motion/react'
import { Cookie, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CookieBanner() {
  const { isPending, prefs, acceptAll, declineAll, saveCustom } = useConsent()
  const [showCustom, setShowCustom] = useState(false)
  const [customPrefs, setCustomPrefs] = useState(prefs)

  if (!isPending) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
      >
        <div className="rounded-xl border bg-background/95 backdrop-blur p-5 shadow-xl">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">We use cookies</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use analytics cookies to improve your experience. You can choose which cookies to allow.{' '}
                <Link to="/privacy" className="underline hover:no-underline">Privacy Policy</Link>
              </p>

              {showCustom && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="text-sm">Analytics</Label>
                      <p className="text-xs text-muted-foreground">PostHog — usage patterns and page views</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={customPrefs.analytics}
                      onCheckedChange={v => setCustomPrefs(p => ({ ...p, analytics: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="recording" className="text-sm">Session recording</Label>
                      <p className="text-xs text-muted-foreground">PostHog — screen recordings for UX improvement (inputs masked)</p>
                    </div>
                    <Switch
                      id="recording"
                      checked={customPrefs.recording}
                      onCheckedChange={v => setCustomPrefs(p => ({ ...p, recording: v }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Button size="sm" onClick={acceptAll}>Accept all</Button>
                <Button size="sm" variant="outline" onClick={declineAll}>Decline</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs"
                  onClick={() => showCustom ? saveCustom(customPrefs) : setShowCustom(true)}
                >
                  {showCustom ? 'Save preferences' : 'Customise'}
                  {showCustom ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

Mount once in AppLayout:
```tsx
// In AppLayout.tsx or App.tsx
import { CookieBanner } from '@/components/legal/CookieBanner'
import { ConsentEffect } from '@/components/legal/ConsentEffect'

// Inside render:
<>
  {children}
  <CookieBanner />
  <ConsentEffect />
</>
```

---

## Phase 3 — Consent Effect (wire to PostHog)

Create `src/components/legal/ConsentEffect.tsx`:

```tsx
import { useEffect } from 'react'
import { useConsent } from '@/hooks/use-consent'
import { posthog } from '@/lib/analytics'

export function ConsentEffect() {
  const { state, prefs } = useConsent()

  useEffect(() => {
    if (state === 'pending') return

    if (prefs.analytics) {
      posthog.opt_in_capturing()
    } else {
      posthog.opt_out_capturing()
    }

    if (prefs.recording) {
      posthog.startSessionRecording()
    } else {
      posthog.stopSessionRecording()
    }
  }, [state, prefs.analytics, prefs.recording])

  return null
}
```

If PostHog is not installed: omit the posthog calls. The consent hook still works standalone.

---

## Phase 4 — Privacy Policy Page

Create `src/pages/PrivacyPage.tsx`:

```tsx
import { Link } from 'react-router-dom'

const COMPANY = 'YourCompany'
const PRODUCT = 'YourProduct'
const EMAIL = 'privacy@yourproduct.com'
const LAST_UPDATED = '24 April 2026'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="prose prose-gray max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>

        <h2>1. Who we are</h2>
        <p>{COMPANY} operates {PRODUCT} ("{PRODUCT}", "we", "us"). This policy explains how we collect, use, and protect your personal data.</p>

        <h2>2. Data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address and name when you sign up.</li>
          <li><strong>Usage data:</strong> pages visited, features used, session duration (if analytics consent given).</li>
          <li><strong>Payment data:</strong> handled entirely by Stripe. We do not store card numbers.</li>
        </ul>

        <h2>3. How we use your data</h2>
        <ul>
          <li>To operate and improve the service.</li>
          <li>To send transactional emails (account, billing, product updates).</li>
          <li>To analyse usage patterns (only with analytics consent).</li>
        </ul>

        <h2>4. Legal basis (EU/UK users)</h2>
        <p>We process data under: (a) contract performance — to deliver the service; (b) legitimate interests — security and fraud prevention; (c) consent — analytics and session recording.</p>

        <h2>5. Cookies and tracking</h2>
        <p>We use PostHog for analytics. Analytics and session recording require your consent, which you can manage via the cookie banner or <button className="underline text-primary" onClick={() => { localStorage.removeItem('cookie-consent'); window.location.reload() }}>reset your preferences</button>.</p>

        <h2>6. Data retention</h2>
        <p>Account data is retained while your account is active. Analytics data is retained for 12 months. You can request deletion at any time.</p>

        <h2>7. Your rights</h2>
        <p>Under GDPR/CCPA/Privacy Act, you have the right to access, correct, delete, or export your data. Email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>

        <h2>8. Third-party processors</h2>
        <ul>
          <li><strong>Supabase</strong> — database hosting (EU region available)</li>
          <li><strong>Stripe</strong> — payments</li>
          <li><strong>Resend</strong> — transactional email</li>
          <li><strong>PostHog</strong> — analytics (EU region available)</li>
          <li><strong>Vercel</strong> — hosting</li>
        </ul>

        <h2>9. Contact</h2>
        <p>Questions? <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      </div>
    </div>
  )
}
```

---

## Phase 5 — Terms of Service Page

Create `src/pages/TermsPage.tsx`:

```tsx
const COMPANY = 'YourCompany'
const PRODUCT = 'YourProduct'
const EMAIL = 'legal@yourproduct.com'
const LAST_UPDATED = '24 April 2026'

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="prose prose-gray max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>

        <h2>1. Acceptance</h2>
        <p>By using {PRODUCT}, you agree to these terms. If you disagree, do not use the service.</p>

        <h2>2. Description of service</h2>
        <p>{PRODUCT} is a software-as-a-service platform. We reserve the right to modify features with reasonable notice.</p>

        <h2>3. Accounts</h2>
        <p>You are responsible for maintaining the security of your account and all activity under it. Notify us immediately of any unauthorised access.</p>

        <h2>4. Acceptable use</h2>
        <p>You must not: violate laws, scrape the service, reverse engineer it, or use it to harm others.</p>

        <h2>5. Payment and billing</h2>
        <p>Subscription fees are charged monthly in advance. Cancellation takes effect at the end of the billing period. No refunds for partial months.</p>

        <h2>6. Data ownership</h2>
        <p>You own your data. We process it solely to deliver the service. See our <a href="/privacy">Privacy Policy</a>.</p>

        <h2>7. Limitation of liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.</p>

        <h2>8. Termination</h2>
        <p>We may terminate accounts that violate these terms. You may cancel at any time via Settings → Billing.</p>

        <h2>9. Governing law</h2>
        <p>These terms are governed by the laws of [Your Jurisdiction].</p>

        <h2>10. Contact</h2>
        <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      </div>
    </div>
  )
}
```

---

## Phase 6 — Register Routes

In `App.tsx`, register as public routes (no auth required):

```tsx
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'

// Inside Routes:
<Route path="/privacy" element={<PrivacyPage />} />
<Route path="/terms" element={<TermsPage />} />
```

Add links to Footer:
```tsx
<Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</Link>
<Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</Link>
```

---

## Checklist

- [ ] `CookieBanner` mounted in AppLayout (not per-page)
- [ ] `ConsentEffect` mounted alongside banner — wires PostHog opt-in/out
- [ ] `useConsent` reads from localStorage on mount — banner not shown if already decided
- [ ] Analytics consent → PostHog `opt_in_capturing()`
- [ ] Recording consent → PostHog `startSessionRecording()`
- [ ] `/privacy` route registered and publicly accessible (no auth)
- [ ] `/terms` route registered and publicly accessible (no auth)
- [ ] Footer links to /privacy and /terms
- [ ] Privacy policy names all third-party processors
- [ ] "Reset preferences" button in privacy policy (and in Settings)
- [ ] Smoke test: banner appears on fresh localStorage, disappears after choice

---

## Notes

- GDPR: analytics requires opt-in (EU standard); Stripe is covered under "contract performance" — no consent needed
- CCPA: California users must be able to opt-out of "sale" of data — for most SaaS, analytics doesn't qualify as "sale", so opt-out is sufficient
- Privacy Act 1988 (AU): similar to GDPR in practice — opt-in for non-essential tracking is safest default
- Never use `httpOnly` or `Secure` cookie attributes from client JS — these are set server-side
- PostHog's `opt_out_capturing()` stores a `posthog_opt_out` cookie to persist the choice — do not overwrite it with your own consent cookie
- Replace `COMPANY`, `PRODUCT`, `EMAIL`, `LAST_UPDATED` placeholders before deploy — these are not optional
