---
name: audithq-outbound
description: "Founder-led, audit-anchored outbound for AuditHQ, targeting DIGITAL MARKETING AGENCIES / SEO freelancers / marketing consultants (white-label ICP, locked 2026-06-02 Decision 42 — NOT end-SMBs). Finds ICP-fit agency prospects, runs a live AuditHQ quick-scan on a sample/client site to prove the white-label deliverable, and drafts a personalised LinkedIn connection-note and compliance-ready email pitching the productized audit (A$499–799) + white-label subscription. Human-in-the-loop — presents drafts for approval, never sends autonomously. Triggers: 'find me prospects', 'who should I reach out to', 'outbound for AuditHQ', 'build my prospect list', 'find agencies to contact', 'personalised DM', 'audit-anchored cold email', 'LinkedIn message for AuditHQ', 'prospect for AuditHQ customers'. NOT for: activating or scheduling the n8n automation pipeline (use audithq-pipeline); writing a drip sequence for people who already signed up (use audithq-convert); generic cold email with no scan data (use cold-email)."
---

# AuditHQ Outbound — Founder-Led, Audit-Anchored Prospecting

This is AuditHQ's primary acquisition motion. The premise is load-bearing: **a real, branded audit beats any benefit claim.** You are selling a digital marketing agency / freelance SEO consultant a *white-label deliverable* — a finished, 9-suite, client-ready audit report in THEIR name that they use to win new clients, retain existing ones, and surface upsell work. The live scan IS the pitch: you run AuditHQ on a real site (one of their clients, a sample, or their own) and show them the depth and polish of the report they'd be handing over. They already pay for Ahrefs/SEMrush and assemble audits by hand; you hand them a finished one in minutes.

**ICP REVERSAL — locked 2026-06-02 (Decision 42).** This skill formerly targeted SMB owners directly. That motion produced A$0 MRR over a year and is RETIRED. The buyer is now the **agency/marketer**, never the end-SMB. Do not target SMB owners; do not auto-skip agencies — they are the target.

You draft. The human sends. This skill never sends anything autonomously — it produces approval-ready drafts and tracks who's where in the follow-up sequence.

## Locked context (do not re-derive or contradict)

- **Product:** AuditHQ scans a website across 9 suites (~516 checks). Positioning, verbatim where it matters: *"Code finds the issues. Evidence proves them. AI explains them."* The engine finds problems with code; AI only writes the explanation. **Never** call it "AI-powered" or imply AI does the finding.
- **ICP:** digital marketing agencies, SEO/web freelancers, and consultants (1–10 people) who do client-facing website work and would white-label an audit deliverable. Sweet spot = small enough to lack an in-house audit stack, established enough to have paying clients and tool budget (they already buy Ahrefs/SEMrush ~US$120–200/mo). Global — AU + UK + US English-speaking markets. **Not** big agencies with their own audit tooling; **not** end-SMBs.
- **The offer you hand over:** the **productized "Certified Site Audit" (A$499 single / A$799 with a 30-min white-label debrief)** — you run the full 9-suite audit on their client's site, they get a branded PDF to put in a client proposal. Each sale seeds a subscription upsell (their client wants ongoing monitoring → agency upgrades to **Studio A$149 / Agency A$299 / Scale A$499/mo** white-label plan). The cold-open proof is a **live scan you ran** (`https://audithq.com.au/scan/{public_token}`) on a sample or one of their client sites — "this is the report, branded as you, in minutes." Lead with the deliverable, not "your own site is broken." Full plan: `audit-genius/docs/GTM-90-DAY-2026-06-02.md`.
- **No dev jargon in any message.** Banned in customer-facing copy: "deterministic", "synthesis", "agentic", "architecture", "crawl", "headers", "schema markup" (translate the last three to plain English). The reader runs a business; they are not a developer.

## When this fires

Use this skill when the user wants to find people to contact, build a prospect list, or write outreach that's anchored on a real audit of the target's site. If they hand you a single URL ("draft outreach for acmelaw.com.au"), skip discovery and start at the fit check. If they want to *send at volume through automation*, that's `audithq-pipeline`. If they want to nurture people who already did a free scan, that's `audithq-convert`.

## The procedure

Work one prospect at a time, in this order. Each step gates the next — don't draft a message for a site you haven't scanned, and don't spend a scan on a business that fails the fit check.

### 1. ICP fit check (do this BEFORE scanning — a scan costs time and API budget)

**You are qualifying an AGENCY, not the business being audited.** The candidate is a digital marketing agency / SEO or web freelancer / marketing consultant. The site you scan to make the pitch is one of *their clients'* (or a sample), not the agency's own product.

**Hard fit floor.** Skip candidates that are: big agencies likely to have an in-house audit stack (50+ staff, named enterprise clients), pure-play tools/SaaS that compete with AuditHQ, or anyone with no evidence of paying clients (a parked "agency" landing page with no portfolio/case studies). When unsure, a small established agency or working freelance consultant with a visible client list is the target.

Then score the surviving candidate 0–5, one point each:

1. **Is a real agency/consultant** — has a professional site positioning website/SEO/marketing *services* (not a product, not an SMB selling to consumers).
2. **Has paying clients** — visible portfolio, case studies, client logos, testimonials, or a "/work" / "/clients" page. This proves they have accounts to white-label reports for.
3. **Right size (1–10 people)** — small enough to lack in-house audit tooling and to feel the value of a done-for-you deliverable; freelancers and boutique agencies score here. Solo consultants who resell audits DO score (they're tool-buyers, not the SMB we retired).
4. **Reachable at a decision-maker** — named founder/principal + email or LinkedIn. Owner-operated is ideal (they make the buy decision).
5. **Audit-relevant offering** — they already sell SEO/audits/web work, so a 9-suite white-label report (esp. the AI-readiness/GEO angle they probably don't offer yet) plugs straight into their services.

**Score 4–5:** proceed. **Score 3:** proceed if reachability is strong. **Score ≤2:** skip and say why. Auto-skips: 50+ staff agencies with in-house stacks, competing audit tools, "agencies" with no client evidence, and end-SMBs (retired ICP).

### 2. Discover prospects (only if the user didn't supply one)

You're looking for: **business name + website URL + a contact path (owner name + email OR LinkedIn).** Sources, in rough order of yield — each with how to actually extract the contact, not just where to look:

- **LinkedIn (primary)** — search `"digital marketing agency"` / `"SEO consultant"` / `"SEO freelancer"` + region (AU/UK/US), filter under ~10 staff. *Extract:* founder/principal name from the profile; the connection-request-with-note is the DM path (see §5 — you cannot cold-DM non-connections for free).
- **Agency directories / marketplaces** — Clutch, DesignRush, Semrush Agency Partners, GoodFirms, Sortlist; filter by SEO/digital-marketing + small team. *Extract:* agency name + site + often a contact email in one place — highest yield per minute.
- **SEO/marketing communities** — public member lists or active posters in r/SEO, r/digital_marketing, r/agency, SEO Discords/Slacks, "SEO Freelancers" Facebook groups. *Extract:* their linked site → contact page.
- **WebSearch** for `"digital marketing agency" {city} -site:clutch.co` or `"freelance SEO consultant" {country}` to surface independent agency sites directly. *Extract:* email from contact page, founder name from About; note one of their visible *client* sites as the scan target for the cold-open.

Use the `WebSearch` tool for live queries. Record each candidate as a row in the tracker (Step 6) before scanning. If you cannot find any contact path after checking the site + one search, skip the candidate (an unreachable prospect fails fit-check item 4).

### 3. Run a live Quick Scan on their site

The finding is the whole pitch, so this step is non-negotiable — **never fabricate a finding.** Detect the available method, in order:

1. **Derive the live endpoint from the product source (do this first — don't trust a memorised URL).** The free scan is a public, no-auth POST. Get the real base + request/response shape by reading the caller in the AuditHQ repo, because a hard-coded project ref goes stale silently:

   ```bash
   # The endpoint base and the exact fetch live here — read them, don't guess:
   #   C:\Users\Adam\audit-genius\src\lib\constants.ts   → API_BASE (= {SUPABASE_URL}/functions/v1)
   #   C:\Users\Adam\audit-genius\src\lib\quickScan.ts   → startQuickScan(): method, body shape, response fields
   #   C:\Users\Adam\audit-genius\src\lib\supabase.ts    → which env var holds SUPABASE_URL
   ```

   Then call it. **Verified live 2026-06-01** — the endpoint requires the Supabase anon key (it's public — shipped to every browser — so this is safe; read it from `VITE_SUPABASE_ANON_KEY` in the repo `.env`, never paste a literal here). Without the auth header you get `401 Missing authorization header`; `turnstile_token:null` is accepted (only a present-but-invalid token 403s):

   ```bash
   ANON=$(grep -oE 'VITE_SUPABASE_ANON_KEY=[A-Za-z0-9._-]+' C:/Users/Adam/audit-genius/.env | cut -d= -f2)
   curl -X POST {API_BASE}/quick-scan \
     -H "Content-Type: application/json" \
     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
     -d '{"url":"https://prospect-domain.com","turnstile_token":null}'
   # → 200 { "public_token": "...", ... }
   ```

   The response field is **`public_token`**. Read the scan result at `{API_BASE}/quick-scan/{public_token}` (same data the page at `/scan/{public_token}` renders) — that's where the suite scores + findings live. The endpoint IP-rate-limits, so don't loop it hard. **If you could not read the caller files / .env** (repo moved/unreadable), do not invent a URL or key — drop to method 2 or 3.
2. **Browser the public page.** If the API isn't reachable from this environment, open the live free-scan page (confirm the canonical domain from `audithq.app` / the repo's deploy config — don't assume), submit the URL, and read the rendered result.
3. **Graceful manual fallback.** If neither works here, output the exact steps for Adam to run the scan in his browser and paste back the 3 findings + score. Do **not** invent results to keep moving — a made-up finding detonates the entire trust premise of the motion. Stop and ask.

Capture: overall score, the three suite scores (Marketing/Technical/GEO), and the top findings with their severity.

### 4. Map the 3 worst findings → a plain-English hook

You ran the scan on one of the agency's **client sites** (or a sample). Pick the three findings that are (a) highest severity, (b) most concrete, and (c) most obviously tied to *losing business*. Translate each into one plain-English sentence — these are exactly the lines the agency would relay to their own client, so they double as proof of how client-ready the white-label report is. Favour the **AI-readiness / GEO** finding when present — it's the angle the agency probably can't audit today and the strongest door-opener. The pattern: **what's broken → what it costs the client**, no jargon.

| Raw finding (engine language) | Plain-English hook (use this) |
|---|---|
| "No meta description on 6 key pages" | "Google is guessing what your pages are about, so you're getting skipped in search." |
| "LCP 5.8s on mobile" | "Your site takes about 6 seconds to load on a phone — most people leave before it finishes." |
| "Missing structured data / not AI-citable" | "When someone asks ChatGPT for a {trade} in {city}, your business doesn't come up." |
| "No SSL on checkout" / mixed content | "Customers see a 'not secure' warning before they can pay you." |
| "No Google Business Profile link / NAP mismatch" | "Your address shows up three different ways online, so Maps doesn't trust which is real." |

One hook leads the message. The other two are the proof that you actually looked.

### 5. Draft the two messages

Produce **both** a LinkedIn message and an email for every agency prospect. Each opens with a specific observation (never "I help businesses with their websites"), names the agency and the client site you scanned, shows the lead finding as proof of the report's depth, and ends with a single low-friction CTA: **the white-label offer** — "want the full branded report for {client} to put in your next pitch?" or the productized **Certified Site Audit (A$499)**. The scan link (`https://audithq.com.au/scan/{public_token}`) is the *proof*, not the ask. Lead with what the agency gains (a finished, branded, client-ready deliverable + the AI-readiness angle they can't offer yet), not "your site is broken." Honest, specific, short.

- **LinkedIn:** you cannot cold-DM a non-connection for free — send a **connection request with a one-line personalised note** (≤300 chars, mention the client-site finding), then send the full message *after they accept*. Both under ~120 words, conversational, non-spammy. Not subject to the Spam Act.
- **Email:** subject line + body under ~180 words. **Must pass the compliance gate in Step 5a before you present it as ready.**

For final wordsmithing of the email body, delegate to `Skill('cold-email')` — pass it the findings, the white-label angle, the CTA (productized audit / branded report), and the no-jargon rule. For LinkedIn phrasing, delegate to `Skill('linkedin-post')`. This skill owns *what to say* (the scan→finding→white-label-value mapping); those skills polish *how it reads*.

#### 5a. Spam Act compliance gate (HARD BLOCK — email only)

Australian Spam Act 2003 applies to every commercial email. Before you present an email draft as send-ready, both must be present:

1. **Functional unsubscribe** — a real way to opt out, in the email (e.g. "Reply STOP and I won't email again" for a hand-sent founder email, or a real unsubscribe link if sent through Resend).
2. **Accurate sender identification** — the sender's real name, the business name (AuditHQ), and a physical/postal contact address.

If either is missing, **do not** label the email "ready to send." Show exactly what's missing and the footer block to add. A founder email sent by hand still needs both. (LinkedIn DMs are exempt — no gate.)

Standard compliant footer:

```
—
{Sender name}, AuditHQ
{Postal address}
Don't want to hear from me again? Just reply STOP and you're off the list.
```

### 6. Present for approval + track follow-up state

Never say "sent" or "ready to send" — say **"ready for your review."** The human approves, edits, or rejects. On approval, you update the tracker; you do not fire any send mechanism (that's `audithq-pipeline`'s job, and only after compliance + a test batch).

Maintain a lightweight tracker at `C:\Users\Adam\Documents\Claude\outputs\audithq-outbound-tracker.md` (there's no CRM). **On the first run, if the file doesn't exist, create it** with the header row below, then append. Read it at the start of every run and surface anyone overdue for a bump. State machine:

`Identified → Scanned → Drafted → Approved → Sent → Replied → Closed-Won / Closed-Lost`

Tracker format (header + one example row so the shape is unambiguous):

```
| Date       | Agency              | Site / contact             | Fit | Client site scanned + lead finding        | Stage   | Next action (date)        |
|------------|---------------------|----------------------------|-----|-------------------------------------------|---------|---------------------------|
| 2026-06-02 | Brightpost SEO (4-person, Sydney) | brightpostseo.com.au / Mia (LI) | 5/5 | scanned client {x} — not AI-citable       | Drafted | Conn-request on approval (06-02) |
```

**Follow-up rule:** if a prospect is `Sent` with no reply after 3 business days, surface them and draft a one-line bump that adds a *second* finding from the same scan ("forgot to mention — your site also..."). One bump only; if still silent after that, mark `Closed-Lost` and move on. Persistence past two touches reads as spam and isn't worth the reputation cost.

**Cadence guardrail (protect deliverability + account).** Cold email from a young/low-volume sending domain gets throttled or spam-foldered if you spike — cap **cold founder sends at ~20/day** and ramp slowly; keep the one-bump-max rule. LinkedIn: **~15–20 connection requests/day** (LinkedIn soft-caps ~100–200/week before flagging); send the full pitch only after accept (~25–40% accept on a personalised note) → ~3–6 real conversations/day. Do NOT mass-DM. If a run exceeds the cap, queue overflow in the tracker as `Drafted` for the next day. Compliance gate B1 (postal address) blocks all email until fixed — until then, run the LinkedIn channel only.

## Output format

For each prospect, return exactly this block:

```
### {Agency name} — fit {N}/5
**Agency:** {agency site} · **Contact:** {name / LinkedIn / email}
**Client site scanned:** {client url} → {score}/100, lead finding: {plain-English hook}

**LinkedIn connection note (≤300 chars):**
{one-line note referencing the client-site finding}

**LinkedIn message (send after accept):**
{draft — white-label value + productized-audit CTA}

**Email** — COMPLIANCE: {PASS / BLOCKED: missing X}
Subject: {subject}
{body, including compliant footer}

**Tracker:** {stage} → next: {action} ({date})
```

If COMPLIANCE is BLOCKED, the email is not presented as ready — list the fix and stop there for that prospect.

---

## Worked example — boutique SEO agency (the new ICP)

**Candidate:** Brightpost SEO, a 4-person SEO/content agency in Sydney. Found via LinkedIn ("SEO agency" + Sydney, <10 staff). Site `brightpostseo.com.au` has a `/work` page listing client logos; founder "Mia Tran" reachable on LinkedIn; `hello@brightpostseo.com.au` on the contact page.

**Fit check:** real agency selling SEO services ✓, has paying clients (visible /work logos) ✓, right size (4 people, no in-house audit stack) ✓, reachable (founder on LinkedIn + email) ✓, audit-relevant (sells SEO, doesn't yet offer AI-readiness) ✓ → **5/5, proceed.**

**Scan (run on ONE of their client sites, not the agency's own):** picked a client from their /work page, ran AuditHQ → 58/100. Lead finding: *that client isn't AI-citable — when someone asks ChatGPT/Perplexity for their category, they don't come up.* Supporting: slow on mobile; thin metadata. (This is proof of the deliverable's depth — and an angle Brightpost can sell their client.)

**LinkedIn connection note (≤300 chars):**
> Hi Mia — ran a deep audit on one of Brightpost's clients and found something you could turn into an easy upsell (they're invisible to ChatGPT/Perplexity). Mind if I send it over? It's a white-label report you could brand as Brightpost.

**LinkedIn message (after accept):**
> Thanks Mia. Quick context: I run AuditHQ — agencies use it to hand clients a finished, branded 9-suite audit (SEO + technical + security + the AI-readiness piece most tools skip) in minutes instead of building it by hand. I ran it on {client} so you can see the output: audithq.com.au/scan/{public_token}. The "not findable by AI" angle is a clean upsell into your retainers. Two ways agencies use it: a one-off branded audit (A$499) to win a pitch, or a white-label plan from A$149/mo across your client roster. Want me to send the full {client} report branded as Brightpost so you can see the deliverable?

**Email — COMPLIANCE: PASS (assuming postal address present; otherwise BLOCKED)**
> Subject: an easy upsell hiding in one of Brightpost's client sites
>
> Hi Mia,
>
> I run AuditHQ — agencies white-label it to hand clients a finished 9-suite audit report (SEO, technical, security, privacy, and the AI-readiness piece most audit tools don't cover yet) in their own branding, in minutes.
>
> I ran it on one of your clients so you can judge the output, not take my word for it: audithq.com.au/scan/{public_token}. The standout — they're not citable by ChatGPT or Perplexity yet, which is a clean upsell into a retainer.
>
> Agencies use it two ways: a one-off branded "Certified Site Audit" (A$499) to win a pitch, or a white-label plan from A$149/mo across the client roster. Happy to send the full branded report for that client so you can see exactly what you'd be handing over.
>
> —
> Adam Savage, AuditHQ
> {postal address}
> Don't want to hear from me again? Just reply STOP and you're off the list.

**Tracker:** Drafted → next: connection-request on approval (2026-06-02)

---

## What this skill owns vs delegates

- **Owns:** agency ICP fit scoring, the scan→finding→white-label-value mapping, the compliance gate decision, follow-up state.
- **Delegates:** email body polish → `cold-email`; LinkedIn phrasing → `linkedin-post`; if the user pivots to "automate sending this at volume" → `audithq-pipeline`; if they want to nurture free-scan signups → `audithq-convert`.
