---
name: audithq-outbound
description: "Founder-led, audit-anchored outbound for AuditHQ. Finds ICP-fit SMB prospects, runs a live AuditHQ quick-scan on each prospect's website, extracts the 3 most damaging findings, and drafts a personalised LinkedIn DM and compliance-ready email anchored on those real findings. Human-in-the-loop — presents drafts for approval, never sends autonomously. Triggers: 'find me prospects', 'who should I reach out to', 'outbound for AuditHQ', 'build my prospect list', 'personalised DM', 'audit-anchored cold email', 'LinkedIn message for AuditHQ', 'cold outreach with a scan', 'find SMBs to contact', 'prospect for AuditHQ customers'. NOT for: activating or scheduling the n8n automation pipeline (use audithq-pipeline); writing a drip sequence for people who already signed up (use audithq-convert); generic cold email with no scan data (use cold-email)."
---

# AuditHQ Outbound — Founder-Led, Audit-Anchored Prospecting

This is AuditHQ's primary acquisition motion while MRR is below A$2K. The premise is simple and load-bearing: **a real finding from the prospect's own website beats any benefit claim.** You are not selling "a website audit tool" — you are showing a business owner something concretely broken on *their* site that is costing them customers, and offering the fastest way to see the rest. The live scan IS the pitch.

You draft. The human sends. This skill never sends anything autonomously — it produces approval-ready drafts and tracks who's where in the follow-up sequence.

## Locked context (do not re-derive or contradict)

- **Product:** AuditHQ scans a website across 9 suites (~516 checks). Positioning, verbatim where it matters: *"Code finds the issues. Evidence proves them. AI explains them."* The engine finds problems with code; AI only writes the explanation. **Never** call it "AI-powered" or imply AI does the finding.
- **ICP:** SMB owners with a website who don't pay a digital marketer — sole traders, small SaaS founders, e-commerce operators, professional services (lawyers, accountants, dentists, clinics, trades). Global product, Australia is the beachhead. English-language sites only for now.
- **The offer you link to:** the **free 3-suite Quick Scan at `/free-scan`** (Marketing + Technical + GEO — score + top-5 findings, no PDF, no signup). The full 9-suite report is paid (A$49/mo Solo). **Never offer the full report for free.** The visible "you're seeing 3 of 9" gap is the hook, not a thing to give away.
- **No dev jargon in any message.** Banned in customer-facing copy: "deterministic", "synthesis", "agentic", "architecture", "crawl", "headers", "schema markup" (translate the last three to plain English). The reader runs a business; they are not a developer.

## When this fires

Use this skill when the user wants to find people to contact, build a prospect list, or write outreach that's anchored on a real audit of the target's site. If they hand you a single URL ("draft outreach for acmelaw.com.au"), skip discovery and start at the fit check. If they want to *send at volume through automation*, that's `audithq-pipeline`. If they want to nurture people who already did a free scan, that's `audithq-convert`.

## The procedure

Work one prospect at a time, in this order. Each step gates the next — don't draft a message for a site you haven't scanned, and don't spend a scan on a business that fails the fit check.

### 1. ICP fit check (do this BEFORE scanning — a scan costs time and API budget)

Score the candidate 0–5. Add one point for each that's true:

1. **Has a real website** they appear to own and care about (not a Facebook page, not a Linktree, not a parked domain).
2. **No in-house marketer / agency on retainer** — solo, family business, or small team. (Tell: generic `info@` email, owner's name on the About page, no "marketing@" contact, site clearly built once and left alone.)
3. **Money depends on the website** — it takes bookings, sells, or is the main way customers find them. A dentist's booking page qualifies; a hobby blog doesn't.
4. **Reachable** — you can find a name + either a contact email or a LinkedIn profile for the owner/principal.
5. **Plausibly fixable problems** — the site looks dated, slow, or thin on first glance. (You'll confirm with the scan; this is the eyeball pre-check.)

**Score 4–5:** proceed. **Score 3:** proceed only if reachability is strong. **Score ≤2:** skip and say why — don't burn a scan. Enterprises, agencies, other audit tools, and anyone already running an obvious marketing stack are auto-skips.

### 2. Discover prospects (only if the user didn't supply one)

You're looking for: **business name + website URL + a contact path (owner name + email OR LinkedIn).** Sources, in rough order of yield — each with how to actually extract the contact, not just where to look:

- **Google Maps / local directories** — search a vertical + suburb (`"bookkeeper Ipswich QLD"`, `"family law Geelong"`). *Extract:* the listing's website link → open the site → grab the email from the contact/footer; the owner's name is usually on the About page. If only a generic `info@` exists, that's still a valid send target — note "no named owner" in the tracker.
- **LinkedIn** — search the owner title + region (`"founder" "Sunshine Coast" accountant`). *Extract:* the person's name + company from the profile; cross-reference their company website for the email. The profile itself is the DM path (no email needed for the LinkedIn variant).
- **Industry association / member lists** — a state law society directory, a trades register, a chamber-of-commerce member page. *Extract:* these list business name + site + often a direct email in one place — highest yield per minute.
- **WebSearch** for `"{vertical} {city}" -site:linkedin.com -site:facebook.com` to surface independent sites directly. *Extract:* open each result, pull email from the contact page, owner name from About.

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

Pick the three findings that are (a) highest severity, (b) most concrete (has a number or a named, checkable thing), and (c) most obviously tied to *losing business*. Then translate each into one sentence a business owner feels in their gut. The pattern: **what's broken → what it costs them**, no jargon.

| Raw finding (engine language) | Plain-English hook (use this) |
|---|---|
| "No meta description on 6 key pages" | "Google is guessing what your pages are about, so you're getting skipped in search." |
| "LCP 5.8s on mobile" | "Your site takes about 6 seconds to load on a phone — most people leave before it finishes." |
| "Missing structured data / not AI-citable" | "When someone asks ChatGPT for a {trade} in {city}, your business doesn't come up." |
| "No SSL on checkout" / mixed content | "Customers see a 'not secure' warning before they can pay you." |
| "No Google Business Profile link / NAP mismatch" | "Your address shows up three different ways online, so Maps doesn't trust which is real." |

One hook leads the message. The other two are the proof that you actually looked.

### 5. Draft the two messages

Produce **both** a LinkedIn DM and an email for every prospect. Each opens with the specific observation (never a generic "I help businesses with their websites"), names the business or domain, states the lead finding and its cost, optionally stacks one more, and ends with a single low-friction CTA: the free 3-suite scan link. Honest, specific, short.

- **LinkedIn DM:** under ~120 words, no link dump, conversational. Not subject to the Spam Act, but it must still be honest and non-spammy — no fake "we already work together" framing.
- **Email:** subject line + body under ~180 words. **Must pass the compliance gate in Step 5a before you present it as ready.**

For final wordsmithing of the email body, delegate to `Skill('cold-email')` — pass it the findings, the hook, the CTA (free 3-suite scan), and the no-jargon rule. For LinkedIn phrasing/formatting, delegate to `Skill('linkedin-post')`. This skill owns *what to say* (the scan→finding→cost mapping); those skills polish *how it reads*.

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
| Date       | Business            | URL                        | Fit | Lead finding                    | Stage   | Next action (date)        |
|------------|---------------------|----------------------------|-----|---------------------------------|---------|---------------------------|
| 2026-06-01 | Harborline Family Law | harborlinefamilylaw.com.au | 5/5 | Not found in AI/Google search   | Drafted | Send on approval (06-01)  |
```

**Follow-up rule:** if a prospect is `Sent` with no reply after 3 business days, surface them and draft a one-line bump that adds a *second* finding from the same scan ("forgot to mention — your site also..."). One bump only; if still silent after that, mark `Closed-Lost` and move on. Persistence past two touches reads as spam and isn't worth the reputation cost.

**Cadence guardrail (protect deliverability).** Cold email from a young/low-volume sending domain gets throttled or spam-foldered if you spike. Cap **cold founder sends at ~20/day** and ramp slowly; keep the one-bump-max rule above. LinkedIn DMs: cap ~20–25/day to stay under LinkedIn's automation radar. If a run would exceed the cap, queue the overflow in the tracker as `Drafted` for the next day rather than presenting them all as send-ready today.

## Output format

For each prospect, return exactly this block:

```
### {Business name} — fit {N}/5
**URL:** {url}   **Scanned:** {overall score}/100 (M {x} · T {y} · GEO {z})
**Lead finding:** {plain-English hook}
**Supporting:** {finding 2}; {finding 3}

**LinkedIn DM:**
{draft}

**Email** — COMPLIANCE: {PASS / BLOCKED: missing X}
Subject: {subject}
{body, including compliant footer}

**Tracker:** {stage} → next: {action} ({date})
```

If COMPLIANCE is BLOCKED, the email is not presented as ready — list the fix and stop there for that prospect.

---

## Worked example 1 — suburban law firm

**Candidate:** Harborline Family Law, Geelong VIC. Found via Google Maps ("family law Geelong"). Site `harborlinefamilylaw.com.au`, About page names the principal "Megan Doyle", contact is `info@harborlinefamilylaw.com.au`. LinkedIn profile found for Megan.

**Fit check:** real site ✓, no marketer (generic info@, owner-run) ✓, money depends on it (intake comes through the site) ✓, reachable (email + LinkedIn) ✓, looks dated ✓ → **5/5, proceed.**

**Scan:** 54/100 (Marketing 48 · Technical 51 · GEO 39). Top findings: (1) no meta descriptions on practice-area pages; (2) mobile load 6.1s; (3) not citable by AI search / no structured data.

**Hooks:** lead with the one a lawyer feels — *"When someone in Geelong asks ChatGPT or Google for a family lawyer, your firm doesn't come up — your site isn't readable to those tools yet."* Supporting: slow on mobile (people bounce before intake), and search engines guessing your pages.

**LinkedIn DM:**
> Hi Megan — I run AuditHQ and I scanned harborlinefamilylaw.com.au this morning (I do this for firms I think are leaving enquiries on the table). Two things stood out: when someone asks Google or ChatGPT for a family lawyer in Geelong, your site doesn't surface yet, and on a phone it takes about 6 seconds to load — most people leave first. I put the free 3-suite scan here if you want to see it yourself: audithq.app/free-scan. No pitch, genuinely thought you'd want to know.

**Email — COMPLIANCE: PASS**
> Subject: Geelong family lawyer searches aren't finding harborlinefamilylaw.com.au
>
> Hi Megan,
>
> I run AuditHQ — we check websites for the things quietly costing businesses enquiries. I scanned harborlinefamilylaw.com.au and one thing jumped out: when someone asks Google or ChatGPT for a family lawyer in Geelong, your site doesn't come up, because it isn't readable to those tools yet. That's fixable.
>
> Two others worth knowing: it takes about 6 seconds to load on a phone (most people leave before it finishes), and your practice-area pages don't tell Google what they're about, so they get skipped in search.
>
> You can run the same free 3-suite scan yourself in about a minute: audithq.app/free-scan. Happy to point you at what to fix first.
>
> Best,
>
> —
> Adam Savage, AuditHQ
> {postal address}
> Don't want to hear from me again? Just reply STOP and you're off the list.

**Tracker:** Drafted → next: send on approval (2026-06-01)

---

## Worked example 2 — small e-commerce store

**Candidate:** Fern & Flask, online candle/homewares store, `fernandflask.com`. Found via WebSearch for independent Shopify-style stores. Owner "Priya" named in Instagram bio linked from the site; contact `hello@fernandflask.com`. No LinkedIn found, but email is solid.

**Fit check:** real site ✓, owner-run, no agency ✓, revenue = the site ✓, reachable (email) ✓, looks fixable ✓ → **5/5, proceed.**

**Scan:** 61/100 (Marketing 58 · Technical 49 · GEO 66). Top findings: (1) "not secure" warning path on a product page (mixed content); (2) no abandoned-cart / email capture; (3) images uncompressed, slow product pages.

**Hooks:** lead with the one that directly blocks a sale — *"On at least one product page customers hit a 'not secure' warning before they can check out — that kills purchases."* Supporting: slow product pages, and no way to win back people who leave without buying.

**LinkedIn DM:** *(no LinkedIn profile found — skip DM, email only, and note it in the tracker)*

**Email — COMPLIANCE: PASS**
> Subject: a "not secure" warning is showing on Fern & Flask checkout
>
> Hi Priya,
>
> I run AuditHQ — we scan online stores for the things quietly costing sales. I ran Fern & Flask and the one I'd fix today: on at least one product page, customers get a browser "not secure" warning before they can pay. Most people won't put their card in after seeing that.
>
> Two more: product pages are slow to load because the images are full-size, and there's nothing capturing emails from people who leave without buying — that's repeat revenue walking out the door.
>
> Same free 3-suite scan you can run yourself in a minute: audithq.app/free-scan. It'll show you exactly which page throws the warning.
>
> —
> Adam Savage, AuditHQ
> {postal address}
> Don't want to hear from me again? Just reply STOP and you're off the list.

**Tracker:** Drafted (email-only, no LI) → next: send on approval (2026-06-01)

---

## What this skill owns vs delegates

- **Owns:** ICP fit scoring, the scan→finding→cost mapping, the compliance gate decision, follow-up state.
- **Delegates:** email body polish → `cold-email`; LinkedIn phrasing → `linkedin-post`; if the user pivots to "automate sending this at volume" → `audithq-pipeline`; if they want to nurture free-scan signups → `audithq-convert`.
