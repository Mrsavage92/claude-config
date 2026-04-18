# /product-validator

Hard gate skill that validates whether a product idea is worth building. Runs BEFORE `/saas-build` — if this hasn't run and produced a BUILD verdict, `/saas-build` MUST refuse to proceed.

## When to Use
- User says "build X", "I want to make X", or describes any product/SaaS idea
- Claude (self) catches itself proposing a new product (CLAUDE.md trigger detection)
- MUST run before `/saas-build`, `/saas-improve`, `/web-scaffold`, `/web-scope`, `/scaffold`, or any build pipeline
- User explicitly asks to validate an idea
- Mid-build if `/saas-build` Phase 0.25 surfaces competitors not listed in the original validation
- Any PIVOT of an existing product (different ICP / value prop / vertical) — prior verdicts do NOT transfer

## When NOT to Use (to prevent false positives)
- A feature inside an already-validated product (e.g. "add Stripe webhooks to AuditHQ") — this is build work inside a validated shell, not a new product
- A bug fix, refactor, or polish task
- A research question asking what the market looks like (answer it, don't gate it)
- Client work (delivering against a signed contract, not productizing it)

**Disambiguation:** if unsure whether something is a product or a feature, read `~/Documents/Claude/outputs/active-revenue-projects.md`. If the work plugs into a project listed there, it's a feature. Otherwise it's a new product.

## What This Does
Answers 8 questions, delivers a trinary verdict (BUILD / KILL / VALIDATE-FIRST), and saves the result to a file that `/saas-build` checks as a hard gate.

---

## The Trinary Verdict

| Verdict | Meaning | Action |
|---|---|---|
| **BUILD** | All gates pass or only 1 weak fail with compensating strengths | Proceed to `/saas-build` |
| **VALIDATE-FIRST** | Idea could be viable but lacks buyer evidence | Do 5 customer interviews, then re-run validator |
| **KILL** | 2+ gate failures OR no defensible moat against paid incumbents | Archive idea, redirect to active revenue project |

---

## Execution Steps

### 1. Parse the Idea
Extract from the user's message:
- **Product name** (or working name)
- **What it does** (one sentence)
- **Who it's for** (target user — specific segment, not "businesses")
- **Pricing hypothesis** (what they'd charge)

### 2. Run the 8 Gates (dispatch WebSearch agents in parallel — model: haiku)

#### Gate 1: Who Pays for This?
Name the paying customer segment — industry, size, role, motivation to buy.
- **FAIL triggers:** answer is "me", "nobody", "developers who want a free tool", or "businesses" (too vague)
- **PASS requires:** a specific buyer you could walk up to and sell this to tomorrow

#### Gate 2: Competitor Landscape (FREE + PAID — both mandatory)
Run TWO parallel WebSearches:

**2a. Free alternatives:**
- `"free {product category} tool"`
- `"best free {what it does}"`
- `"{target user} diy {what it does}"`

**2b. Paid incumbents (CRITICAL — this is what Tender Writer missed):**
- `"AI {product category} software {target geography}"`
- `"{what it does} SaaS {year}"`
- `"best {product category} platform {target industry}"`
- `"{competitor name} alternative"` (for each known competitor)

List every named competitor with URL + funding signal + traction signal.

**FAIL triggers:**
- 3+ free tools cover 80%+ of the functionality
- 3+ paid competitors already exist in the same geography/vertical with funding or traction
- A single funded incumbent exists AND the user has no unfair advantage against them (see Gate 6)

#### Gate 3: What's the Market Gap?
What specifically does this do that existing tools don't?

Valid gaps:
- Serves a niche vertical existing tools ignore (specific industry × region × workflow)
- 10x cheaper than incumbents AND targets a segment they price out of
- Integrates things that currently require 3+ tools stitched together
- AI-native approach to something currently fully manual (NOT automatable by existing AI tools)

Invalid "gaps" that auto-FAIL:
- "It's like X but prettier"
- "Better UX" (not measurable pre-launch)
- "Transparent pricing" (easily copied)
- "Built for SMBs" (so is every incumbent)
- "AI-powered" (everything is now)

#### Gate 4: Revenue Model
How does this make money? Must name:
- Pricing tier structure with actual $ numbers
- Expected MRR per customer
- Expected customer lifetime

Valid models: subscription, per-use credits, marketplace commission, white-label licensing.

**FAIL:** vague "SaaS" without pricing, or model that requires <$10 MRR per customer (support cost exceeds revenue).

#### Gate 5: TAM Sanity Check
Estimate total addressable market via WebSearch:
- Number of potential paying customers in target segment
- Competitor pricing and public customer counts (indicates willingness to pay)
- Existing category revenue size

**FAIL:**
- Fewer than 1,000 potential paying customers
- Realistic 2-year addressable slice under $50K ARR
- Category shrinking (AI may eliminate entire workflows within product's window)

#### Gate 6: Moat / Unfair Advantage (ADDED after Tender Writer)
Given the incumbents from Gate 2, why will THIS specific execution win? The user must name ONE:
- **Proprietary data advantage** (e.g., exclusive dataset, user-generated network effects)
- **Distribution advantage** (e.g., existing audience, partnership, channel)
- **Domain expertise advantage** (user has lived experience incumbents lack)
- **Cost advantage** (structurally 10x cheaper to operate, not just price)
- **Timing advantage** (platform shift creates an opening incumbents can't pivot into)

**FAIL triggers (from Tender Writer retrospective):**
- "First to market" — check: if incumbents launched already, this is not a moat
- "We'll be faster / better / prettier" — not a moat, it's a wish
- "We combine X and Y that nobody combines" — only valid if competitors genuinely don't do both (VERIFY this in Gate 2, don't assume)
- No answer at all → automatic KILL

#### Gate 7: Buyer Pre-Commitment (ADDED — this is what's missing from most ideas)
Has the user talked to 3+ specific humans who:
- Said "yes, I would pay $X/month for exactly this"
- Are in the target buyer segment
- Are named (not "people I know" in aggregate)

**FAIL:** fewer than 3 named pre-committed buyers → verdict becomes **VALIDATE-FIRST** (not KILL — they need to do interviews, not abandon the idea).

This is the single highest-signal gate. A perfect product with no pre-committed buyers loses to a mediocre product with 5.

#### Gate 8: Portfolio Fit (ADDED — protects active revenue projects)
Read `~/.claude/projects/c--Users-Adam--claude-projects/memory/MEMORY.md` and check for active revenue projects.

**FAIL triggers:**
- User has an active project with revenue <$5K/mo that's still scaling → new idea competes for attention → require explicit override ("yes I accept that Tender Writer delays AuditHQ by N weeks")
- User has TWO or more products already without revenue → hard KILL, no third product until one is profitable

**Rule:** no new builds while the current revenue project is under the user's stated revenue goal. The flywheel is finishing things, not starting things.

### 3. Count Results

- **0 FAILs:** BUILD
- **1 FAIL on Gate 7 only:** VALIDATE-FIRST (go interview buyers)
- **1 FAIL elsewhere:** BUILD only if Gate 6 (moat) is exceptionally strong, otherwise KILL
- **2+ FAILs:** KILL — automatic, no exceptions
- **Any FAIL on Gate 6 with no answer:** KILL
- **Any FAIL on Gate 8 hard-trigger:** KILL

### 4. Deliver Verdict

Keep it SHORT. No hedging.

```markdown
## Product Validation: {Product Name}

**Verdict:** BUILD | VALIDATE-FIRST | KILL
**Date:** {YYYY-MM-DD}

**Idea:** {one-sentence summary}

### Gate Results
1. **Who pays:** {answer} — PASS/FAIL
2. **Competitors (free + paid):** {named competitors with URLs} — PASS/FAIL
3. **Market gap:** {gap or "none"} — PASS/FAIL
4. **Revenue model:** {model + $} — PASS/FAIL
5. **TAM:** {estimate} — PASS/FAIL
6. **Moat:** {advantage or "none"} — PASS/FAIL
7. **Pre-committed buyers:** {count with names} — PASS/FAIL
8. **Portfolio fit:** {active revenue projects + opportunity cost} — PASS/FAIL

### Reasoning
{3-5 bullets. Brutally honest. Reference specific competitor URLs and funding.}

### If KILL — Focus Instead On
{Read memory — name the active revenue project. Default: AuditHQ ($10K/mo target).}

### If VALIDATE-FIRST — Interview Protocol
Talk to {5} people in the target segment. Ask:
1. How do you solve {problem} today?
2. What's the most painful part?
3. What would you pay to make it go away?
4. Would you pay $X/month for {described solution}? (commit or no)
5. Can I show you a mockup in 2 weeks?

Return here with ≥3 "yes I'd pay" answers + contact info.
```

### 5. Save Verdict File + Append Retrospective Log

**Step 5a — Save verdict file:**

Save to: `~/Documents/Claude/outputs/product-validation-{slug}.md`

Include the verdict date in the frontmatter or first line so freshness can be checked. All build-gated skills (`/saas-build`, `/saas-improve`, `/web-scaffold`, `/web-scope`, `/scaffold`) HARD-CHECK this file and refuse to proceed without a fresh BUILD verdict.

**Freshness rule:** if the verdict is >30 days old, it is STALE. Market conditions, competitors, and the user's portfolio will have shifted. Re-run the validator before proceeding.

**Step 5b — Append to retrospective log (mandatory on KILL and VALIDATE-FIRST):**

On verdict = KILL, append a line to `~/Documents/Claude/retrospectives/validator-learnings.md`:

```markdown
### {YYYY-MM-DD} — {Product Name} — KILL
- **Idea:** {one sentence}
- **Gate(s) that triggered kill:** {list gate numbers + reasons}
- **Competitors named:** {top 3 with URLs}
- **Would have wasted:** {rough estimate — "6 days" / "2 sessions" / "unknown"}
- **Pattern:** {what class of failure this is — "paid incumbents missed", "no moat", "no buyers", "portfolio conflict", etc.}
```

On verdict = VALIDATE-FIRST, append:

```markdown
### {YYYY-MM-DD} — {Product Name} — VALIDATE-FIRST
- **Idea:** {one sentence}
- **Why not BUILD:** {usually Gate 7 — no pre-committed buyers}
- **Interview plan:** talk to {N} people in {segment}
- **Return condition:** ≥3 named "yes I'd pay $X/mo" commitments
```

This keeps the retrospective log a living artefact. Future validator runs benefit from pattern recognition across prior failures.

**Step 5c — Update portfolio registry on BUILD:**

On verdict = BUILD, append one line to `~/Documents/Claude/outputs/active-revenue-projects.md` under "Active Builds":

```markdown
- **{Product Name}** — validated {YYYY-MM-DD}, target ${N}K MRR by {YYYY-MM-DD}, buyers: {names}
```

### 6. Pivot Handling

If the user is pivoting an existing product (different ICP, different value prop, different vertical), this is NOT a continuation — it's a new product idea. Save the verdict under a new slug (e.g. `tender-writer-ndis-pivot.md`) so the prior verdict file remains intact for audit. The old product's verdict does not transfer.

---

## Rules

1. **Brutal honesty.** The user explicitly wants ideas killed early. Sugar-coating wastes tokens, time, and credibility.
2. **Gate 2 requires BOTH free AND paid searches.** Tender Writer failed because prior validation only checked free tools. Paid incumbents (Doreva, TenderPilot, GovBid, AutogenAI) were the actual killers.
3. **Gate 6 (moat) cannot be waved through.** If the user can't name a specific unfair advantage in one sentence, there isn't one. KILL.
4. **Gate 7 (buyers) converts FAIL to VALIDATE-FIRST, not KILL.** The fix is interviews, not abandonment.
5. **Gate 8 (portfolio) protects active revenue projects from starvation.** No new builds while the current breadwinner is under its revenue goal.
6. **"This is just X with a UI" is a valid kill reason.** Most ideas are wrappers around something free or paid.
7. **Output must be short.** Verdict + bullets + URLs. Not a 10-page market report.
8. **Context: FlipTracker + Tender Writer.** Both wasted multiple sessions on products the validator would have killed. This skill exists so that never happens again.
9. **If prior session recommended BUILD and this session contradicts, own it.** Don't retcon — note the earlier error and save both verdicts.

---

## Model Routing
- Gate 2a + 2b (competitor search): spawn 2 WebSearch agents in parallel, `model: "haiku"`
- Gate 5 (TAM research): spawn WebSearch agent with `model: "haiku"`
- Gate 8 (portfolio): main context reads memory — no agent
- Verdict synthesis: run in main context (no subagent needed)

## Integration with /saas-build

`/saas-build` Phase 0 MUST:
1. Derive slug from product name
2. Read `~/Documents/Claude/outputs/product-validation-{slug}.md`
3. If file missing → HALT, run `/product-validator` first
4. If verdict = KILL → HALT, surface verdict, refuse to build
5. If verdict = VALIDATE-FIRST → HALT, surface interview protocol, refuse to build
6. If verdict = BUILD → proceed, keep file path logged

Additionally, `/saas-build` Phase 0.25 (market research) must compare findings against the validator file. If new competitors surface → HALT and re-run validator.

---

## Retrospective Log

Every KILL or post-mortem adds a line to `~/Documents/Claude/retrospectives/validator-learnings.md` with:
- Product name
- Why it slipped through previous gates (if it was originally BUILD)
- Which gate would have caught it
- Rule added or strengthened as a result

Known retrospectives:
- **FlipTracker (2026-??)** — reselling tracker, Google Sheets already solved it. Fix: Gate 2 must search for free alternatives.
- **Tender Writer (2026-04-18)** — 6 days built before validator caught incumbents (Doreva, TenderPilot, GovBid). Fix: Gate 2 must search PAID competitors, Gate 6 (moat) added, Gate 7 (buyer pre-commitment) added, Gate 8 (portfolio fit) added.
