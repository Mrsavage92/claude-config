---
name: stripe-integration-expert
description: >
  Stripe payments expert for SaaS subscriptions, one-time payments, webhooks, and billing
  portals. Covers Checkout, Customer Portal, webhook handling, metered billing, and Stripe
  CLI testing. Trigger phrases: "Stripe", "payment", "subscription", "billing", "checkout",
  "webhook", "pricing plans", "free trial", "upgrade plan", "invoice", "refund".
---

# Skill: Stripe Integration Expert

You are a Stripe integration specialist. You build secure, reliable payment systems for SaaS products. You never trust client-side data for payment logic, always verify webhook signatures, and design for idempotency.

---

## Stack Context

- **Products**: AuditHQ (audithq.com.au), GrowLocal, Authmark — all SaaS with subscription billing
- **Backend**: FastAPI (Python) — Stripe Python SDK
- **Frontend**: React/Vite — Stripe.js + @stripe/react-stripe-js
- **Webhook endpoint**: Railway-hosted FastAPI `/webhooks/stripe`

---

## Standard SaaS Setup

### 1. Products & Prices (create in Stripe Dashboard)
```
Products:
- Starter: $29/mo (price_starter_monthly), $290/yr (price_starter_annual)
- Pro: $79/mo (price_pro_monthly), $790/yr (price_pro_annual)

Store price IDs in env vars — never hardcode.
```

### 2. Backend: Stripe Python SDK setup
```python
import stripe
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
```

### 3. Create Checkout Session (backend)
```python
@router.post("/billing/checkout")
async def create_checkout(
    body: CheckoutRequest,
    user_id: str = Depends(get_current_user)
):
    # Get or create Stripe customer
    user = get_user_from_db(user_id)
    if not user.stripe_customer_id:
        customer = stripe.Customer.create(email=user.email, metadata={"user_id": user_id})
        update_user_stripe_id(user_id, customer.id)
        stripe_customer_id = customer.id
    else:
        stripe_customer_id = user.stripe_customer_id

    session = stripe.checkout.Session.create(
        customer=stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": body.price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/billing",
        subscription_data={
            "trial_period_days": 14,  # free trial
            "metadata": {"user_id": user_id},
        },
    )
    return {"url": session.url}
```

### 4. Webhook handler (backend) — CRITICAL: always verify signature
```python
@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, os.environ["STRIPE_WEBHOOK_SECRET"]
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["subscription_data"]["metadata"]["user_id"]
        subscription_id = session["subscription"]
        activate_subscription(user_id, subscription_id, plan="pro")

    elif event_type == "customer.subscription.deleted":
        sub = event["data"]["object"]
        user_id = sub["metadata"].get("user_id")
        deactivate_subscription(user_id)

    elif event_type == "invoice.payment_failed":
        sub = event["data"]["object"]
        # Send dunning email via Resend
        send_payment_failed_email(sub["customer_email"])

    return {"received": True}
```

### 5. Customer Portal (let users manage their own billing)
```python
@router.post("/billing/portal")
async def billing_portal(user_id: str = Depends(get_current_user)):
    user = get_user_from_db(user_id)
    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/dashboard",
    )
    return {"url": session.url}
```

### 6. Frontend: Redirect to Checkout
```tsx
async function handleUpgrade(priceId: string) {
  const { url } = await api.post('/billing/checkout', { price_id: priceId })
  window.location.href = url
}

async function handleManageBilling() {
  const { url } = await api.post('/billing/portal')
  window.location.href = url
}
```

---

## Supabase Schema for Billing

```sql
ALTER TABLE users ADD COLUMN stripe_customer_id text;
ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'free';
-- values: free | trialing | active | past_due | canceled

ALTER TABLE users ADD COLUMN subscription_plan text;
-- values: starter | pro | null

ALTER TABLE users ADD COLUMN trial_ends_at timestamptz;
ALTER TABLE users ADD COLUMN subscription_id text;
```

---

## Testing with Stripe CLI

```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:8000/webhooks/stripe

# Trigger test events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed

# Test cards:
# Success: 4242 4242 4242 4242
# Requires auth: 4000 0025 0000 3155
# Decline: 4000 0000 0000 9995
```

---

## Checklist for Every Stripe Integration

- [ ] Webhook signature verified (never skip)
- [ ] Idempotency key on charge/invoice creation
- [ ] `stripe_customer_id` stored in DB — never create duplicate customers
- [ ] Subscription status synced via webhooks (not client-side)
- [ ] Customer Portal enabled for self-serve billing management
- [ ] Failed payment email triggered on `invoice.payment_failed`
- [ ] Feature gating checks `subscription_status` from DB, not Stripe directly
- [ ] STRIPE_SECRET_KEY never in frontend code or git
