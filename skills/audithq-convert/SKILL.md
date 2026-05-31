---
name: audithq-convert
description: "AuditHQ inbound conversion — the Day 0/3/7/14 email drip after free-scan email capture, free-to-paid upgrade nudges anchored on the visible 3-suite→9-suite gap, and result-page CRO. Owns the AuditHQ funnel logic; delegates email copy to market-emails, page copy to market-copy, and layout CRO to page-cro. Triggers: 'convert free scan visitors', 'drip email sequence', 'Day 0 email', 'Day 3 email', 'email capture on result page', 'free to paid upgrade', 'upgrade nudge', 'result page CRO', 'nurture the free scan leads', 'inbound email sequence', 'how do I convert the quick scan users'. NOT for: finding and contacting new prospects (use audithq-outbound); activating the n8n send pipeline (use audithq-pipeline); generic email sequences unrelated to AuditHQ (use market-emails)."
---

# AuditHQ Convert — Inbound Drip, Free-to-Paid, Result-Page CRO

This is the other half of the funnel from `audithq-outbound`. Outbound brings strangers to the free scan; this skill converts the people who run a scan and leave an email into paying Solo subscribers. The entire mechanism is one lever: **they can see 3 of their 9 suites, and the 6 they can't see are the ones they now suspect are worse.** Curiosity, made specific by their own results, is what converts — not discounts, not urgency.

## Locked context (do not re-derive or contradict)

- **The funnel (Option C):** free 3-suite Quick Scan at `/free-scan` (Marketing + Technical + GEO — score + top-5 findings, **no PDF, no signup to run it**). Email is captured **on the result page, after they see the score** (peak curiosity). The full 9-suite report + PDF + action plan is **paid only**. There is **no** free credit, no L2 tier — don't invent one.
- **Conversion target:** Solo at **A$49/mo** (or A$490/yr). That's the price anchor for the drip. Direction is up, never discount.
- **Positioning:** *"Code finds the issues. Evidence proves them. AI explains them."* Never "AI-powered". No dev jargon — the reader is a business owner.
- **Brand:** AuditHQ only. Never reference Orbit Digital.

## What already exists (verify before building — don't rebuild live infra)

There is a **live drip already running** in the product: a `quick-scan-drip` Supabase edge function fired by pg_cron every 5 minutes, advancing leads through `drip_step` 0→3 on the `quick_scans` table (Day 0 on capture, then +3d, +4d, +7d). Email capture writes there; inbound leads also flow through a live `lead-capture` edge function into `inbound_leads`.

So before writing anything, **check what's deployed** in `C:\Users\Adam\audit-genius\supabase\functions\` (`quick-scan-drip`, `lead-capture`) and the migration history. Your job is usually to **improve the copy/timing/angle of an existing sequence**, not to architect a new one. If the user asks for the drip "from scratch", confirm whether they mean rewrite-the-emails or rebuild-the-mechanism — they almost always mean the former.

## The drip sequence (locked schedule, your job is the angle + copy)

Every email must reference **their** specific domain, score, and at least one of their actual findings. A generic nurture email is a failure here — the whole edge is that you're holding their real results.

| Day | Job of the email | Angle | Subject pattern | Pitch level |
|---|---|---|---|---|
| **0** (on capture) | Confirm + recap what they saw; plant the "3 of 9" seed | *Here's what we found — and it's 3 of your 9 suites* | "What we found on {domain}" | none |
| **3** | One-finding deep-dive — the single worst thing, why it costs them | *The one thing holding {domain} back* | "The one thing slowing {domain} down" | none, pure value |
| **7** | Benchmark — their score vs similar businesses; create gap-awareness | *Sites like yours usually score X* | "How does {domain} compare?" | soft |
| **14** | Soft offer — the full 9-suite picture, price anchor, clear CTA | *Want the other 6 suites?* | "The rest of {domain}'s audit" | direct, A$49/mo |

**Principles across all four:**
- **Specificity is the conversion.** "Your contact page loads in 6 seconds" converts; "improve your site speed" doesn't.
- **The gap is the product.** Always make the 6 unseen suites feel concrete — name them (Security, Privacy, Social, Reputation, Employer Brand, AI Readiness) and say findings exist there that they can't see yet.
- **No manufactured urgency.** No fake countdowns, no "price goes up tonight." The motivation is *their own curiosity about their own site*, which is more durable.
- **One CTA per email.** Day 0–7: "see your scan again" / "read the finding." Day 14: "unlock the full 9-suite report — A$49/mo."

Delegate the actual sentence-level copy to `Skill('market-emails')` — pass it this table, the specific findings, and the no-jargon rule. This skill owns the *sequence logic and angle*; market-emails owns the *prose*.

## Free → paid upgrade nudges (in-product + result page)

Beyond the timed emails, the upgrade nudge lives wherever the 3-of-9 gap is visible:

- **On the result page:** show the 6 locked suites by name, greyed, each with a "🔒 N findings" count drawn from a real (cheap) signal if available — never a fake number. The lock count is the entire persuasion; an empty lock converts nothing.
- **In-app (if they later sign in):** anchor the prompt on what they *can't* see — "You've seen 3 suites. The other 6 found {N} more issues on {domain}." Then the A$49/mo CTA.
- **Never** deceptive: don't claim findings that don't exist, don't fake the count, don't imply the free scan was the full thing.

Delegate placement/layout mechanics to `Skill('page-cro')`; delegate result-page and in-app copy to `Skill('market-copy')`. This skill owns *the gap-strategy and what to anchor on*.

## Result-page CRO

The result page is the highest-leverage surface in the whole funnel — it's where curiosity peaks and the email is captured. When asked to improve it:

1. **Lead with the score** — a single number they want to improve.
2. **Show the 3 free findings in full** — real value, builds trust.
3. **Then the locked 6 suites** with their find-counts — the gap.
4. **Email capture sits right at the gap** — "Want the full 9-suite report? Drop your email." Framed as unlocking, never as "sign up."
5. **One primary CTA.** Don't compete the email capture against five other buttons.

For a full structural teardown, delegate to `Skill('market-funnel')` (whole-funnel) or `Skill('page-cro')` (single page) — pass them this funnel logic so they don't redesign the locked Option-C structure.

## Compliance

Every email in the sequence needs a functional unsubscribe link + sender identification (business name + postal address) — Australian Spam Act 2003. Inbound leads consented by entering their email, so risk is lower than cold outbound, but the legal requirement is identical. The live `quick-scan-drip` function already renders a footer; **verify it's present** when you touch the templates, and never ship a drip email without it.

Standard footer:

```
—
AuditHQ · {postal address}
You're getting this because you ran a free scan on {domain}. Unsubscribe: {link}
```

## What this skill owns vs delegates

- **Owns:** the 4-step drip schedule + angle, the 3-of-9 gap strategy, the upgrade-nudge anchoring, result-page funnel logic, the compliance check.
- **Delegates:** email prose → `market-emails`; result-page/in-app copy → `market-copy`; layout/CRO mechanics → `page-cro`; whole-funnel teardown → `market-funnel`. If the user wants to *find new prospects* → `audithq-outbound`. If they want to *turn on the automated send pipeline* → `audithq-pipeline`.

## Output format

When asked to build/improve the drip, return:

```
## AuditHQ drip — {what changed}
Pre-flight: {what's already deployed, from checking the repo}

### Day 0 — {subject}
{body w/ {domain}/{score}/{finding} merge fields + footer}
### Day 3 — {subject}
...
### Day 7 — {subject}
...
### Day 14 — {subject}  [CTA: A$49/mo Solo]
...

Compliance: {unsubscribe + sender-ID present? PASS/FIX}
Delegated: {what you handed to market-emails / page-cro and why}
```
