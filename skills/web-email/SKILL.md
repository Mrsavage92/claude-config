---
name: web-email
description: >
  Transactional email system using Resend + React Email. Covers welcome emails, password reset,
  trial ending warnings, invoice/receipt, team invite, and weekly digest templates. FastAPI
  background task integration, Supabase trigger patterns, unsubscribe handling, and email
  preview development workflow. Use whenever a SaaS product needs to send any email.
---

# Skill: /web-email

Every SaaS sends email. This skill covers the full stack: React Email templates, Resend delivery, FastAPI endpoints, and Supabase triggers. One pattern, consistent across all products.

**When to use:**
- Any product that creates a user account (welcome email mandatory)
- Trial model products (trial ending reminder mandatory)
- Products with team invites, billing, or digest reports

**Packages:**
```bash
# Frontend (email preview only)
npm install @react-email/components @react-email/render

# Backend
pip install resend
```

**Resend API key:** Get from resend.com → API Keys. Store as `RESEND_API_KEY` in Railway env vars. Never in frontend.

---

## Step 1 — Email Templates (React Email)

Create templates in the backend repo at `services/api/emails/`. Each template is a `.tsx` file that renders to HTML.

### Base layout (used by all templates)

```tsx
// services/api/emails/components/BaseLayout.tsx
import { Html, Head, Body, Container, Section, Text, Hr, Link } from '@react-email/components'

interface BaseLayoutProps {
  children: React.ReactNode
  previewText: string
}

export function BaseLayout({ children, previewText }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', margin: 0 }}>
        {/* Preview text (hidden, shows in inbox) */}
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', color: 'transparent' }}>
          {previewText}
        </div>
        <Container style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          {/* Logo */}
          <Section style={{ padding: '32px 0 24px' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              ProductName
            </Text>
          </Section>

          {/* Card */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '40px' }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ padding: '24px 0' }}>
            <Hr style={{ borderColor: '#e2e8f0', margin: '0 0 16px' }} />
            <Text style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              ProductName · 123 Street, City · {' '}
              <Link href="{{{unsubscribe_url}}}" style={{ color: '#94a3b8' }}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

### Template 1 — Welcome email

```tsx
// services/api/emails/welcome.tsx
import { Text, Button, Section } from '@react-email/components'
import { BaseLayout } from './components/BaseLayout'

interface WelcomeEmailProps {
  firstName: string
  productName: string
  dashboardUrl: string
  trialDays?: number
}

export function WelcomeEmail({ firstName, productName, dashboardUrl, trialDays = 14 }: WelcomeEmailProps) {
  return (
    <BaseLayout previewText={`Welcome to ${productName} - let's get started`}>
      <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
        Welcome to {productName}, {firstName}
      </Text>
      <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        Your {trialDays}-day free trial is now active. No credit card needed until your trial ends.
      </Text>
      <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        Here's what to do first:
      </Text>
      <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '2', margin: '0 0 32px' }}>
        1. Complete your profile setup<br />
        2. Connect your first data source<br />
        3. Invite your team members
      </Text>
      <Button
        href={dashboardUrl}
        style={{
          backgroundColor: '#6366f1', color: '#ffffff', borderRadius: '6px',
          fontSize: '14px', fontWeight: '600', padding: '12px 24px',
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        Go to Dashboard
      </Button>
      <Text style={{ fontSize: '13px', color: '#94a3b8', margin: '24px 0 0' }}>
        Questions? Reply to this email - we read every one.
      </Text>
    </BaseLayout>
  )
}
```

### Template 2 — Trial ending (3 days before expiry)

```tsx
// services/api/emails/trial-ending.tsx
import { Text, Button } from '@react-email/components'
import { BaseLayout } from './components/BaseLayout'

interface TrialEndingEmailProps {
  firstName: string
  daysLeft: number
  upgradeUrl: string
  productName: string
}

export function TrialEndingEmail({ firstName, daysLeft, upgradeUrl, productName }: TrialEndingEmailProps) {
  const urgent = daysLeft <= 1

  return (
    <BaseLayout previewText={`Your ${productName} trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}>
      <Text style={{ fontSize: '24px', fontWeight: '700', color: urgent ? '#dc2626' : '#0f172a', margin: '0 0 8px' }}>
        {urgent ? 'Last chance' : `${daysLeft} days left in your trial`}
      </Text>
      <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        Hi {firstName}, your {productName} free trial {urgent ? 'expires tomorrow' : `ends in ${daysLeft} days`}.
        Upgrade now to keep access to everything you've set up.
      </Text>
      <Button
        href={upgradeUrl}
        style={{
          backgroundColor: urgent ? '#dc2626' : '#6366f1',
          color: '#ffffff', borderRadius: '6px',
          fontSize: '14px', fontWeight: '600', padding: '12px 24px',
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        Upgrade Now
      </Button>
    </BaseLayout>
  )
}
```

### Template 3 — Team invite

```tsx
// services/api/emails/team-invite.tsx
import { Text, Button } from '@react-email/components'
import { BaseLayout } from './components/BaseLayout'

interface TeamInviteEmailProps {
  inviterName: string
  orgName: string
  role: string
  acceptUrl: string
  expiresHours?: number
}

export function TeamInviteEmail({ inviterName, orgName, role, acceptUrl, expiresHours = 48 }: TeamInviteEmailProps) {
  return (
    <BaseLayout previewText={`${inviterName} invited you to join ${orgName}`}>
      <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
        You're invited to {orgName}
      </Text>
      <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        {inviterName} has invited you to join <strong>{orgName}</strong> as a <strong>{role}</strong>.
      </Text>
      <Button
        href={acceptUrl}
        style={{
          backgroundColor: '#6366f1', color: '#ffffff', borderRadius: '6px',
          fontSize: '14px', fontWeight: '600', padding: '12px 24px',
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        Accept Invitation
      </Button>
      <Text style={{ fontSize: '13px', color: '#94a3b8', margin: '24px 0 0' }}>
        This invitation expires in {expiresHours} hours. If you weren't expecting this, you can ignore it.
      </Text>
    </BaseLayout>
  )
}
```

### Template 4 — Password reset

```tsx
// services/api/emails/password-reset.tsx
import { Text, Button } from '@react-email/components'
import { BaseLayout } from './components/BaseLayout'

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <BaseLayout previewText="Reset your password">
      <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
        Reset your password
      </Text>
      <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        Click the button below to reset your password. This link expires in 1 hour.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: '#6366f1', color: '#ffffff', borderRadius: '6px',
          fontSize: '14px', fontWeight: '600', padding: '12px 24px',
          textDecoration: 'none', display: 'inline-block',
        }}
      >
        Reset Password
      </Button>
      <Text style={{ fontSize: '13px', color: '#94a3b8', margin: '24px 0 0' }}>
        If you didn't request this, ignore this email. Your password won't change.
      </Text>
    </BaseLayout>
  )
}
```

### Template 5 — Invoice / receipt

```tsx
// services/api/emails/invoice.tsx
import { Text, Button, Row, Column } from '@react-email/components'
import { BaseLayout } from './components/BaseLayout'

interface InvoiceEmailProps {
  firstName: string
  amount: string
  plan: string
  period: string
  invoiceUrl: string
  invoiceNumber: string
}

export function InvoiceEmail({ firstName, amount, plan, period, invoiceUrl, invoiceNumber }: InvoiceEmailProps) {
  return (
    <BaseLayout previewText={`Your ${plan} receipt - ${amount}`}>
      <Text style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
        Payment confirmed
      </Text>
      <Text style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px' }}>
        Hi {firstName}, thanks for your payment. Here's your receipt.
      </Text>
      {/* Receipt table */}
      <Row style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
        <Column><Text style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Plan</Text><Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{plan}</Text></Column>
        <Column><Text style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Period</Text><Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{period}</Text></Column>
        <Column><Text style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Amount</Text><Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '4px 0 0' }}>{amount}</Text></Column>
      </Row>
      <Button href={invoiceUrl} style={{ backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '6px', fontSize: '14px', fontWeight: '600', padding: '10px 20px', textDecoration: 'none' }}>
        Download Invoice #{invoiceNumber}
      </Button>
    </BaseLayout>
  )
}
```

---

## Step 2 — FastAPI Email Service

```python
# services/api/email_service.py
import resend
import os
from react_email import render  # pip install react-email-python (or use subprocess to render)

resend.api_key = os.environ["RESEND_API_KEY"]

FROM_ADDRESS = "ProductName <noreply@yourdomain.com>"

def send_welcome_email(to: str, first_name: str, dashboard_url: str):
    """Send immediately on signup - called from auth webhook or signup endpoint."""
    params = {
        "from": FROM_ADDRESS,
        "to": [to],
        "subject": f"Welcome to ProductName",
        "html": render_welcome(first_name=first_name, dashboard_url=dashboard_url),
        "tags": [{"name": "type", "value": "welcome"}],
    }
    resend.Emails.send(params)


def send_trial_ending_email(to: str, first_name: str, days_left: int, upgrade_url: str):
    """Called by scheduled job 7 days and 1 day before trial_ends_at."""
    params = {
        "from": FROM_ADDRESS,
        "to": [to],
        "subject": f"Your trial ends in {days_left} day{'s' if days_left != 1 else ''}",
        "html": render_trial_ending(first_name=first_name, days_left=days_left, upgrade_url=upgrade_url),
        "tags": [{"name": "type", "value": "trial_ending"}],
    }
    resend.Emails.send(params)


def send_team_invite_email(to: str, inviter_name: str, org_name: str, role: str, accept_url: str):
    params = {
        "from": FROM_ADDRESS,
        "to": [to],
        "subject": f"{inviter_name} invited you to {org_name}",
        "html": render_team_invite(inviter_name=inviter_name, org_name=org_name, role=role, accept_url=accept_url),
        "tags": [{"name": "type", "value": "team_invite"}],
    }
    resend.Emails.send(params)


def send_invoice_email(to: str, first_name: str, amount: str, plan: str, period: str, invoice_url: str, invoice_number: str):
    """Called from Stripe webhook on invoice.payment_succeeded."""
    params = {
        "from": FROM_ADDRESS,
        "to": [to],
        "subject": f"Your {plan} receipt - {amount}",
        "html": render_invoice(first_name=first_name, amount=amount, plan=plan, period=period, invoice_url=invoice_url, invoice_number=invoice_number),
        "tags": [{"name": "type", "value": "invoice"}],
    }
    resend.Emails.send(params)
```

### FastAPI endpoints

```python
# services/api/routers/email.py
from fastapi import APIRouter, BackgroundTasks, Depends
from ..email_service import send_welcome_email, send_trial_ending_email
from ..auth import get_current_user

router = APIRouter(prefix="/email", tags=["email"])

@router.post("/welcome")
async def trigger_welcome(background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    """Called after onboarding completion — not on signup (avoid spamming email confirmation flow)."""
    background_tasks.add_task(
        send_welcome_email,
        to=user.email,
        first_name=user.user_metadata.get("first_name", "there"),
        dashboard_url=f"{os.environ['FRONTEND_URL']}/dashboard"
    )
    return {"status": "queued"}
```

### Trial ending scheduled job (Railway Cron)

```python
# services/api/jobs/trial_reminders.py
"""Run daily via Railway cron: 0 9 * * *"""
from datetime import date, timedelta
from ..database import get_db
from ..email_service import send_trial_ending_email
import os

def send_trial_reminders():
    db = get_db()
    today = date.today()

    for days_left in [7, 3, 1]:
        target_date = today + timedelta(days=days_left)
        orgs = db.execute(
            "SELECT o.id, u.email, u.raw_user_meta_data->>'first_name' as first_name "
            "FROM organizations o JOIN auth.users u ON o.owner_id = u.id "
            "WHERE DATE(o.trial_ends_at) = %s AND o.subscription_status != 'active'",
            [target_date]
        ).fetchall()

        for org in orgs:
            send_trial_ending_email(
                to=org["email"],
                first_name=org["first_name"] or "there",
                days_left=days_left,
                upgrade_url=f"{os.environ['FRONTEND_URL']}/settings/billing"
            )

if __name__ == "__main__":
    send_trial_reminders()
```

---

## Step 3 — Supabase Trigger (alternative to API endpoint)

For simpler products without FastAPI, trigger emails via Supabase Edge Functions:

```sql
-- Trigger welcome email on org creation
CREATE OR REPLACE FUNCTION notify_welcome()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.api_url') || '/email/welcome',
    body := json_build_object('org_id', NEW.id)::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_org_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION notify_welcome();
```

---

## Step 4 — Environment Variables

```
# Railway (backend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourproduct.com

# Resend domain verification
# 1. Go to resend.com/domains → Add Domain
# 2. Add DNS records (SPF, DKIM, DMARC) to GoDaddy/Cloudflare
# 3. Wait for verification (usually <30 min)
# 4. Use verified domain in FROM_ADDRESS
```

**Domain verification is mandatory** — emails from unverified domains go to spam.

---

## Email Trigger Map

| Event | Template | When to send | Mechanism |
|---|---|---|---|
| Signup complete | Welcome | After onboarding wizard | API endpoint call |
| Trial ending | Trial ending | 7 days + 1 day before | Daily cron job |
| Team invite created | Team invite | Immediately on invite | Background task |
| Payment succeeded | Invoice | Stripe webhook | Webhook handler |
| Password reset | Password reset | On request | Supabase Auth built-in |

**Note:** Password reset is handled automatically by Supabase Auth — configure the template in Supabase dashboard → Auth → Email Templates. Do not build a custom endpoint for it.

---

## Rules

- **Welcome email after onboarding wizard, not signup** — user hasn't confirmed they're real until they complete setup
- **Trial emails via cron, not one-time triggers** — days_left logic handles re-sends correctly
- **Invoice emails in Stripe webhook** — `invoice.payment_succeeded` event, not `checkout.session.completed`
- **All emails in background tasks** — never block an API response to send email
- **FROM address must use verified Resend domain** — never a Gmail or personal address
- **No unsubscribe needed for transactional** — only marketing/digest emails need unsubscribe links
- **Preview text always set** — the `previewText` prop controls inbox snippet
- **Test with Resend test mode** — set `RESEND_API_KEY=re_test_...` in dev, never send real emails in development
