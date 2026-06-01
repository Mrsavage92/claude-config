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

**This table reflects what the deployed `quick-scan-drip` actually sends (verified 2026-06-01) — not an idealised version. When you change copy, change the deployed function, and keep this table in sync.**

| Day | Job of the email | Angle (deployed) | Subject pattern (deployed) | Pitch level |
|---|---|---|---|---|
| **0** (capture-email) | Confirm + recap; plant the "3 of 9" seed | *Here's what we found* | (in `quick-scan/capture-email`) | none |
| **3** | One-finding deep-dive **+ CTA** | *Here's how to fix "{lead finding}"* | `{domain}: how to fix "{finding}"` | **already pitches** (CTA + price) |
| **7** | Benchmark vs industry avg (hard-coded 72) **+ CTA** | *Sites like yours score 72, you're at {score}* | `{domain}: {score}/100 vs 72 — the {gap}-point gap` | pitches (CTA + price) |
| **14** | Hidden-findings count, last reminder **+ CTA** | *{N}+ findings still hidden* | `{domain}: {N}+ findings still hidden — last reminder` | direct, final |

**Pricing in every CTA is DUAL (verified deployed):** "A$99 one-time · A$49/mo subscription · cancel anytime". Do not write "A$49/mo only" — the one-time A$99 is a real, live entry point and dropping it loses the price-sensitive buyer who won't subscribe.

Note the deployed reality differs from a textbook "no-pitch-until-Day-14" drip: **Day 3 and Day 7 already carry the CTA + price.** That's a legitimate choice (paid-first SMB SaaS pitches earlier). If you want to test pulling the pitch out of Day 3, that's an A/B change to the function — don't just describe it here.

**Principles across all four:**
- **Specificity is the conversion.** "Your contact page loads in 6 seconds" converts; "improve your site speed" doesn't.
- **The gap is the product.** Always make the 6 unseen suites feel concrete — name them (Security, Privacy, Social, Reputation, Employer Brand, AI Readiness) and say findings exist there that they can't see yet.
- **No manufactured urgency.** No fake countdowns, no "price goes up tonight." The motivation is *their own curiosity about their own site*, which is more durable.
- **One CTA per email.** Day 0–7: "see your scan again" / "read the finding." Day 14: "unlock the full 9-suite report — A$49/mo."

**Success signal (optimise toward this, don't guess).** The drip is working if it hits roughly: email-capture → Day-14-click ≥ 8–12%, and capture → paid ≥ 2–4% (paid-first SMB SaaS norms). Track open rate per step to find the drop-off email; if Day 3 opens but Day 7 doesn't, the benchmark angle is the weak link — rewrite that one, not the whole sequence. If capture→paid sits below ~1.5% after 50+ leads, the problem is usually the Day-14 offer clarity or the visible-gap strength, not the earlier emails.

Delegate the actual sentence-level copy to `Skill('market-emails')` — pass it this table, the specific findings, and the no-jargon rule. This skill owns the *sequence logic and angle*; market-emails owns the *prose*. The worked example below is the voice target — match it.

### Worked drip — example domain `harborlinefamilylaw.com.au` (score 54, GEO 39)

Merge fields in `{braces}` are filled from the lead's own scan row. This is the on-brand voice all four emails should hit:

**Day 0 — "What we found on harborlinefamilylaw.com.au"**
> Hi {first_name},
>
> Here's your scan: **harborlinefamilylaw.com.au scored 54/100.** The three things we checked:
> • Marketing 48 • Technical 51 • Getting found in search/AI 39
>
> That last one is the weak spot — when someone asks Google or ChatGPT for a family lawyer in your area, your site doesn't come up the way it should.
>
> One thing to know: this covers **3 of the 9 areas** we check. The other 6 (security, privacy, reputation, social, hiring, and AI-readiness) aren't in this scan — and on a 54, there's usually more in there worth seeing.
>
> Your full findings are saved here: {scan_url}
>
> {footer}

**Day 3 — "The one thing slowing harborlinefamilylaw.com.au down"**
> Hi {first_name},
>
> Following up on your scan with the single fix I'd do first.
>
> Right now your site isn't readable to Google and AI search the way newer sites are — that's the 39/100 on "getting found." In practice: someone searches "family lawyer near me," and you're not in the answer. For a firm that gets clients through search, that's the most expensive gap on the page.
>
> The fix isn't a rebuild — it's telling search engines what each page is and who it's for. Most sites like yours get this sorted in a day.
>
> No pitch today — just the one that matters. {footer}

**Day 7 — "How does harborlinefamilylaw.com.au compare?"**
> Hi {first_name},
>
> Quick context on your 54. Family-law and professional-services sites we scan usually land around 68–72. You're at 54, and the gap is almost entirely in two areas: getting found (39) and a few technical basics (51).
>
> The good news is that's the fixable kind of gap — it's not that your site is bad, it's that a handful of specific things aren't switched on. {scan_url} still has your three areas.
>
> Worth knowing where the other 6 areas sit too? That's the full picture. More on that in a few days. {footer}

**Day 14 — "{N}+ findings still hidden on harborlinefamilylaw.com.au — last reminder"  [CTA: A$99 one-time / A$49/mo]**
> Hi {first_name},
>
> Two weeks ago your scan showed {surface_count} surface issues. The full audit estimated **{est_min}–{est_max} total findings** — which means **{hidden}+ are still hidden** from you. Some are minor; some are quietly losing leads, breaking AI citation, or leaking customer data.
>
> You won't get this email again — one last nudge. The full audit runs in about 3 minutes: evidence per finding, business impact, a 30/60/90 plan, and a PDF you can keep.
>
> See the full report: {scan_url}
> **A$99 one-time · A$49/mo subscription · cancel anytime.**
>
> {footer}

*(This matches the deployed Day-14 "hidden findings count" angle and dual pricing. The earlier "the other 6 suites" framing is also valid — but the deployed function uses the hidden-count angle, so that's the one to A/B against, not silently replace.)*

Notice what makes these convert: every email names the real domain and the real 54/39 numbers, the gap (6 unseen areas) is concrete and repeated, there's zero manufactured urgency, and only Day 14 pitches. Replicate that pattern with each lead's own data.

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

## Compliance — LIVE GAP, fix before scaling sends

Every email in the sequence needs a functional unsubscribe link + sender identification (business name + postal address) — Australian Spam Act 2003. Inbound leads consented by entering their email, so the consent risk is lower than cold outbound, but the §18/§19 footer requirements are identical.

**Verified 2026-06-01 — the deployed `quick-scan-drip` does NOT meet this.** Its `wrap()` footer renders only `— AuditHQ · audithq.com.au` — **no unsubscribe link and no postal address.** Every Day 3/7/14 email currently going out is missing both. This is a real Spam Act gap, not a hypothetical. Before the drip is scaled to meaningful volume:

1. **Add an unsubscribe link** — needs an unsubscribe token per lead + a handler route (mirror the outbound side's `growth-unsubscribe`), plus a `List-Unsubscribe` header on the Resend send.
2. **Add the postal address** to the `wrap()` footer.

This is a code change to the edge function — hand it to `cto-architect` / `senior-backend`; this skill flags it and refuses to call the drip "compliant" until the deployed footer actually carries both. Target footer:

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
