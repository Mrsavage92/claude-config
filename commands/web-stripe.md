# /web-stripe

Add production-ready Stripe billing to any web-* project. Covers checkout session creation, webhook handling, trial-to-paid upgrade UI, and billing portal. Run after /web-supabase.

## When to Use
- Adding paid plans to any SaaS product
- Implementing the upgrade flow from the /setup onboarding wizard
- Adding the trial banner "Upgrade now" CTA target
- Any time SCOPE.md has a Monetization section with Stripe as the payment model

---

## Process

### Step 1 — Read Context
Read `CLAUDE.md` and `SCOPE.md` — extract:
- Product slug and pricing tiers (starter / pro / enterprise or equivalent)
- Trial model (free-trial-no-card | free-trial-card-required | paid-only)
- Which features are gated behind paid plan

Read `packages/stripe-utils/src/index.ts` if in the au-compliance-platform monorepo — use the existing PRICE_MAP pattern.

### Step 2 — Backend: Checkout Session Endpoint

Add to the FastAPI backend (`services/api/routers/billing.py` or equivalent):

```python
# POST /billing/create-checkout-session
# Creates a Stripe Checkout session for plan upgrade
# Auth: Supabase JWT required
# Body: { price_id: str, success_url: str, cancel_url: str }

import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    req: CheckoutRequest,
    org=Depends(require_org),
):
    try:
        session = stripe.checkout.Session.create(
            customer_email=org["email"],
            line_items=[{"price": req.price_id, "quantity": 1}],
            mode="subscription",
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata={"org_id": str(org["id"])},
            subscription_data={
                "trial_period_days": 0,  # trial already handled in app — no double-trial
                "metadata": {"org_id": str(org["id"])},
            },
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# POST /billing/webhook
# Already exists in billing_webhook.py — verify it handles:
# - checkout.session.completed → set subscription active in cp_subscriptions
# - customer.subscription.deleted → set subscription inactive
# - invoice.payment_failed → flag org for dunning
```

**Webhook handler checklist** — verify `billing_webhook.py` covers these events:
```python
HANDLED_EVENTS = {
    "checkout.session.completed",      # → activate subscription
    "customer.subscription.updated",   # → update plan tier
    "customer.subscription.deleted",   # → deactivate subscription
    "invoice.payment_failed",          # → flag for dunning email
    "invoice.payment_succeeded",       # → extend subscription period
}
```

### Step 3 — Frontend: Stripe Hook

Create `src/hooks/use-stripe.ts`:

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL

interface CheckoutOptions {
  priceId: string
  successPath?: string
  cancelPath?: string
}

export function useStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = async ({ priceId, successPath = '/dashboard', cancelPath = '/settings' }: CheckoutOptions) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data: org } = await supabase
        .from('cp_organizations')
        .select('id')
        .single()

      const res = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-org-id': org?.id ?? '',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}${successPath}?upgraded=true`,
          cancel_url: `${window.location.origin}${cancelPath}`,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Checkout failed')
      window.location.href = json.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return { startCheckout, loading, error }
}
```

### Step 4 — Frontend: UpgradeButton Component

Create `src/components/billing/UpgradeButton.tsx`:

```typescript
import { useStripe } from '@/hooks/use-stripe'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface UpgradeButtonProps {
  priceId: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function UpgradeButton({
  priceId,
  label = 'Upgrade now',
  variant = 'default',
  size = 'default',
  className,
}: UpgradeButtonProps) {
  const { startCheckout, loading, error } = useStripe()

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => startCheckout({ priceId })}
        disabled={loading}
        aria-label={label}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {label}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">{error}</p>
      )}
    </div>
  )
}
```

### Step 5 — Frontend: PricingCards Component

Create `src/components/billing/PricingCards.tsx` — used in /setup Step 3 and /settings billing tab:

```typescript
import { useStripe } from '@/hooks/use-stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

// Import from PRICE_MAP in stripe-utils (monorepo) or define inline (standalone)
// Replace placeholder price IDs before going live
interface PricingTier {
  name: string
  price: string
  description: string
  priceId: string
  features: string[]
  highlighted?: boolean
}

interface PricingCardsProps {
  tiers: PricingTier[]
  onSuccess?: () => void
}

export function PricingCards({ tiers, onSuccess }: PricingCardsProps) {
  const { startCheckout, loading } = useStripe()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiers.map((tier, i) => (
        <motion.div
          key={tier.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className={`relative flex flex-col h-full ${tier.highlighted ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-title">{tier.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-4">
              <ul className="space-y-2 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier.highlighted ? 'default' : 'outline'}
                onClick={() => startCheckout({ priceId: tier.priceId })}
                disabled={loading}
                aria-label={`Choose ${tier.name} plan`}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Get started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
```

### Step 6 — Handle Upgrade Success

In the page that `success_url` lands on (usually /dashboard), check for `?upgraded=true` query param and show a toast:

```typescript
// In Dashboard.tsx or whichever page is the success target
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

// Inside the component:
const [searchParams, setSearchParams] = useSearchParams()

useEffect(() => {
  if (searchParams.get('upgraded') === 'true') {
    toast.success('Welcome to your new plan! All features are now unlocked.')
    setSearchParams({})
  }
}, [searchParams, setSearchParams])
```

### Step 7 — Environment Variables

Add to `.env.example`:
```
STRIPE_SECRET_KEY=sk_test_...          # Railway env var — never commit
STRIPE_WEBHOOK_SECRET=whsec_...       # Railway env var — never commit
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Safe to commit (public key)
```

Add to Vercel dashboard: `VITE_STRIPE_PUBLISHABLE_KEY`
Add to Railway dashboard: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Register webhook in Stripe dashboard → `https://[railway-url]/billing/webhook`
Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`

---

## Rules

- Never commit `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` — Railway env vars only
- `VITE_STRIPE_PUBLISHABLE_KEY` is safe to commit (it's public)
- Always use test mode price IDs during development (`price_test_...`)
- Replace placeholder price IDs in PRICE_MAP before going live — they are never real
- The webhook endpoint must verify the Stripe signature using `stripe.webhook.construct_event()` — never skip this
- Trial period is handled in-app (14-day countdown) — do NOT set `trial_period_days` in Stripe unless you want double-trial
- After checkout.session.completed: update `cp_subscriptions` table — set `status = 'active'`, `plan = tier`, `stripe_customer_id`, `stripe_subscription_id`

## Monorepo Note
In the au-compliance-platform monorepo: the billing webhook router already exists at `services/api/routers/billing_webhook.py`. Do not create a second one. Add the `create-checkout-session` endpoint to that file or a new `billing.py` router, then mount it in `main.py`.
