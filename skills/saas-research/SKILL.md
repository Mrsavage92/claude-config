# /saas-research

Pre-build market research and validation for SaaS ideas. Identifies market gaps, tears down competitors, estimates profitability, and scores traffic potential. Outputs a go/no-go verdict with a RESEARCH-BRIEF.md that saas-build reads as its primary input.

## When to Use
- Before running `/saas-build` on any new product idea
- When evaluating whether a SaaS niche is worth entering
- When comparing multiple SaaS ideas to pick the best one
- When the user wants to discover SaaS ideas from scratch — no idea needed
- User says things like "research this idea", "is this worth building", "find me a gap in [market]", "find me a SaaS to build", "what should I build"

## What This Does
Runs 6 phases of deep research autonomously. Only stops if the verdict is SKIP (recommends not building). Outputs RESEARCH-BRIEF.md which saas-build's Phase 0.25 reads — if that file exists, Phase 0.25 skips its own lighter research entirely.

## Session Management

This skill makes 30-40+ WebSearch/WebFetch calls across all phases. To avoid rate limits and context window pressure:

1. **Batch parallel calls within each phase** — run all queries in a phase simultaneously (e.g. all 8 Phase 0 queries in one parallel batch), but run phases sequentially
2. **Write findings to RESEARCH-BRIEF.md incrementally** — after each phase completes, append that phase's section to the file. This persists progress if the session is interrupted or context compresses.
3. **If rate-limited on WebSearch/WebFetch:** pause for 30 seconds, then retry. If still blocked after 2 retries, log what's missing in RESEARCH-BRIEF.md as `[INCOMPLETE — rate limited, re-run Phase X Step Y to fill]` and continue to the next step. Incomplete data should reduce confidence scores in Phase 6.
4. **If context window is getting large:** after completing Phase 3, write all findings so far to RESEARCH-BRIEF.md and note "Phases 1-3 complete, findings persisted to file." Phases 4-6 can read the file for prior context instead of relying on conversation history.
5. **Mode 4 with fallback loop** is the most expensive path (~60+ calls if 2 ideas are tried). If the first idea BUILDs, total is ~35 calls. Budget accordingly.

## Input Modes

**Mode 1 — Idea validation:** User provides a specific SaaS idea (e.g. "AI invoice tool for tradies")
- Run all 6 phases against that idea
- Output: RESEARCH-BRIEF.md with go/no-go verdict

**Mode 2 — Gap hunting:** User provides a market/niche (e.g. "Australian compliance SaaS" or "tools for dentists")
- Run Phase 1 as a broad scan to identify 3-5 underserved gaps
- Rank gaps by combined Revenue + Traffic potential (the user's priorities)
- Auto-select the top gap and run Phases 2-6 against it — do NOT pause to ask which one
- Output: RESEARCH-BRIEF.md for the selected gap (full gap list in appendix)

**Mode 3 — Idea comparison:** User provides 2-4 competing ideas
- Run a **lighter pass** of Phases 1-4 for each idea:
  - Phase 1: Run all 6 queries but write a condensed 1-paragraph market summary per idea (not full gap analysis)
  - Phase 2: WebFetch only the #1 competitor per idea (not 5), skip review mining, produce a 3-row steal/avoid table per idea
  - Phase 3: Bottom-up TAM only (skip top-down cross-check), pricing range from Phase 2, skip full unit economics
  - Phase 4: Run queries 1-2 only (demand signal + listicle count), skip full keyword map and channel assessment
- Score all ideas on the Phase 6 scorecard (same dimensions and weights)
- Auto-select the highest scorer. Run Phases 1-6 **in full** on the winner only.
- Output: RESEARCH-BRIEF.md for the winner + comparison table showing all ideas with scores

**Mode 4 — Idea generation:** User provides no idea, or says "find me something to build"
- Optionally accepts constraints: geography (e.g. "Australia"), audience (e.g. "SMBs"), domain (e.g. "compliance"), budget, or tech preference
- Run Phase 0 (Idea Discovery) to generate 8-12 ranked opportunities
- Auto-select the top-scored idea (or let user pick if multiple score equally)
- Run Phases 1-6 on the selected idea
- Output: RESEARCH-BRIEF.md for the winner + full opportunity list as appendix

---

## Phase 0 — Idea Discovery (Mode 4 only)

**Goal:** Find profitable, buildable SaaS opportunities with real demand and weak competition. This phase only runs when the user has no specific idea.

### Step A — Trend & Pain Point Mining (8 WebSearch queries)

Run all 8 in parallel. All queries use `after:[current year - 1]` or include the current year to force recency — stale Reddit threads from 2020 are noise, not signal.

1. `site:reddit.com "I wish there was a" OR "why is there no" software OR SaaS after:[current year - 1]` — raw unmet demand (recent only)
2. `site:reddit.com "I'd pay for" OR "would pay for" OR "take my money" SaaS OR tool after:[current year - 1]` — willingness-to-pay signals (recent only)
3. `site:reddit.com/r/SaaS OR site:reddit.com/r/startups "building" OR "launched" OR "MRR" [current year]` — what indie builders are shipping right now (spot patterns and gaps in what's NOT being built)
4. `"fastest growing SaaS categories" OR "emerging SaaS trends" OR "SaaS market report" [current year]` — macro trend signals from analyst reports
5. `site:indiehackers.com "revenue" OR "MRR" OR "$" "per month" [current year]` — what solo/small-team SaaS products are actually making money
6. `"new regulation" OR "new compliance requirement" OR "mandatory by" OR "effective date" [current year] [next year]` — regulatory-driven demand (forced adoption = best demand)
7. `"[constraint: geography/audience/domain if provided]" software gap OR underserved OR "no good tool" OR "looking for" [current year]` — constraint-specific gaps (skip if no constraints provided — redistribute to query 8)
8. `"[product category] software" site:g2.com/categories OR "new category" OR "emerging category" g2 [current year]` — G2 category browsing to find small/new categories with few listed products

If user provided constraints (geography, audience, domain), weave them into queries 1-6 as well. If no constraints provided, replace query 7 with: `site:reddit.com "what software do you wish existed" OR "SaaS idea" OR "micro SaaS" [current year]`

### Step B — Opportunity Extraction

From the raw search results, extract every distinct SaaS opportunity that meets ALL of these criteria:

| Filter | Requirement |
|---|---|
| **Demand signal** | At least 2 independent sources mention the need (Reddit + G2, ProductHunt + regulation, etc.) |
| **Revenue potential** | Target customers are businesses or professionals who pay for software (not consumers, not hobbyists) |
| **Buildable** | An MVP could ship in 2-4 weeks with a standard stack (React + Supabase + Stripe) |
| **Not saturated** | Fewer than 10 well-funded direct competitors, OR clear differentiation angle visible |
| **Low liability** | The product must NOT operate in a domain where getting it wrong exposes the builder or users to serious legal, financial, health, or criminal consequences. **Auto-discard** any idea in these categories: AML/CTF, financial advice/reporting, medical/health compliance, legal compliance tools, tax filing, security certifications (SOC 2, ISO 27001), pharmaceutical/TGA, gambling, weapons, or any domain where a bug or incomplete feature could result in fines, lawsuits, or criminal liability for users. The builder has no domain expertise in regulated industries — building compliance tools without that expertise is itself a liability. Regulatory-driven demand is only valid if the product helps with **low-stakes operational workflow** (e.g. scheduling, reminders, documentation) rather than being the compliance artifact itself. |

Discard anything that fails ANY filter. Don't force ideas that barely qualify. The low-liability filter is the hardest gate — when in doubt, discard.

### Step C — Opportunity Scoring

Score each surviving opportunity on 5 dimensions (1-5 scale):

| Dimension | Weight | What a 5 Looks Like |
|---|---|---|
| **Demand Strength** | 25% | Multiple Reddit threads, G2 searches, regulatory deadline forcing adoption |
| **Competition Gap** | 20% | 0-3 competitors, all with bad UX or missing key features |
| **Revenue Clarity** | 25% | Clear pricing model, B2B audience known to pay, $50+/mo viable |
| **Traffic Path** | 20% | High-volume keywords with low difficulty, or a community channel with direct access |
| **Build Speed** | 10% | Standard CRUD + auth + payments, no complex integrations or ML required |

### Step D — Opportunity Ranking

```markdown
## SaaS Opportunity Scan — [date]
[Constraints applied: geography/audience/domain or "none — open scan"]

| Rank | Idea | One-Liner | Demand | Competition | Revenue | Traffic | Build | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | [name] | [pitch] | X/5 | X/5 | X/5 | X/5 | X/5 | X.X |
| 2 | [name] | [pitch] | X/5 | X/5 | X/5 | X/5 | X/5 | X.X |
| ... | | | | | | | | |

### Top Pick: [name]
**Why this one:** [2-3 sentences — strongest demand signal, weakest competition, clearest revenue path]
**Key risk:** [biggest concern]
**Demand evidence:** [specific Reddit thread / G2 gap / regulation / ProductHunt signal]

### Runner-Up: [name]
**Why second:** [brief]
**When to pick this instead:** [scenario where runner-up beats top pick]
```

### Step E — Quick Validation (WebFetch top 2 candidates)

Before committing to an idea, sanity-check that the competition is actually beatable. For the top 2 scored ideas from Step D:

1. WebFetch the homepage of the strongest existing competitor in that space
2. In under 60 seconds per competitor, assess:
   - **Design quality:** Modern or dated? (Dated = easy to beat on UX)
   - **Product maturity:** Full-featured enterprise tool or basic MVP? (Mature = harder to displace, but if UX is bad there's still an angle)
   - **Pricing visibility:** Can you see pricing or is it "Contact Sales"? (Hidden pricing = enterprise-only, may not compete with self-serve)
   - **Last updated signals:** Blog dates, copyright year, "What's New" page — is this product actively maintained or abandoned?

3. Adjust scores: If the top competitor is polished, modern, well-priced, and actively maintained — drop the Competition Gap score by 1. If it's dated, clunky, or abandoned — bump it by 1. Re-rank if this changes the order.

If WebFetch is blocked for a competitor, run `WebSearch "[competitor name] review [current year]"` as fallback and assess from review snippets.

### Step F — Selection & Handoff

- If one idea scores 4.0+ and is 0.5+ points above the runner-up: auto-select it and proceed to Phase 1
- If top 2-3 ideas score within 0.3 of each other: auto-select the one with the highest Revenue + Traffic combined score (the user's stated priorities)
- Proceed to Phase 1 with the selected idea. The opportunity list is preserved as an appendix in the final RESEARCH-BRIEF.md

---

## Phase 1 — Market Landscape Scan

**Goal:** Understand the market, who's in it, and where the white space is.

**Mode 4 fast-path:** If arriving from Phase 0, you already have demand signals, competitor counts, and a market classification estimate from the opportunity scoring. Skip queries 1, 4, and 5 below — they duplicate Phase 0 data. Run only queries 2, 3, and 6 to fill in TAM sizing, the full competitive set, and pricing norms. Carry forward Phase 0's demand evidence and gap identification into Step C.

### Step A — Market Discovery (6 WebSearch queries, or 3 in Mode 4 fast-path)

1. `"[product category] software" site:g2.com` — who ranks, how many players, market maturity *(skip in Mode 4)*
2. `"[product category] SaaS" market size OR revenue OR TAM [current year]` — market sizing signals
3. `"[product category] alternatives" OR "best [product category] tools" [current year]` — listicle roundups revealing the full competitive set
4. `"[product category]" site:reddit.com "switched to" OR "looking for" OR "anyone use" after:[current year - 1]` — real user conversations about switching, pain, and needs *(skip in Mode 4)*
5. `"[product category]" site:producthunt.com` — what's been launched recently, how it was received *(skip in Mode 4)*
6. `"[product category] software" [target geography if specified] pricing` — regional players and pricing norms

### Step B — Market Classification

Based on discovery, classify the market:

| Signal | Classification | Implication |
|---|---|---|
| 0-2 competitors, no G2 category | **Emerging** | High risk, high reward — validate demand exists |
| 3-8 competitors, growing category | **Growing** | Best window — proven demand, room to differentiate |
| 9-20 competitors, established G2 category | **Mature** | Need a sharp angle — niche down or 10x one dimension |
| 20+ competitors, commoditized | **Saturated** | Avoid unless you have a genuine unfair advantage |

### Step C — Gap Identification

From the discovery data, identify gaps across 4 dimensions:

```markdown
## Market Gaps Identified

### Feature Gaps (things users want that no one does well)
1. [Gap] — Evidence: [quote/source]
2. [Gap] — Evidence: [quote/source]

### Audience Gaps (underserved segments)
1. [Segment] — Why underserved: [evidence]
2. [Segment] — Why underserved: [evidence]

### Geographic Gaps (markets with local needs unmet)
1. [Region/country] — Gap: [what's missing]

### Experience Gaps (everyone's UX is bad, or pricing is hostile, or onboarding is broken)
1. [Gap] — Evidence: [complaint pattern]
```

In Mode 2 (gap hunting): rank gaps by combined Revenue potential + Traffic potential. Auto-select the top gap and proceed to Phase 2. Include the full gap list in the RESEARCH-BRIEF.md appendix.

---

## Phase 2 — Competitor Deep-Dive

**Goal:** Learn what works, what doesn't, and what to steal vs. avoid.

### Step A — Select Top 5 Competitors

Pick the 5 most relevant competitors from Phase 1:
- 3 direct competitors (same product, same audience)
- 1 indirect competitor (different product, same problem)
- 1 aspirational (market leader or adjacent category leader)

### Step B — Website Teardown (WebFetch each competitor)

For each competitor, fetch their **homepage**. Capture:

| Dimension | What to Capture |
|---|---|
| **Hero** | Headline text, subheadline, CTA text, visual (product shot vs abstract), layout pattern |
| **Value prop** | Core promise in one sentence, how they frame the problem |
| **Social proof** | Type (logos, testimonials, stats, badges), placement, quantity |
| **Navigation** | Top-level pages — reveals what features they consider primary |
| **Onboarding** | Free trial flow? Demo booking? Self-serve or sales-led? |
| **Design quality** | Rate 1-5. Modern/dated? Fast/slow? Mobile-friendly? |

### Step B2 — Pricing Page Teardown (WebFetch each competitor's /pricing)

For each competitor, fetch their **pricing page** (usually `/pricing`, `/plans`, or linked from nav). Capture:

| Dimension | What to Capture |
|---|---|
| **Visibility** | Is pricing public or hidden behind "Contact Sales"? |
| **Number of tiers** | How many plans? What are they called? |
| **Price points** | Exact prices per tier (monthly and annual if both shown) |
| **Pricing model** | Per-user, flat-rate, usage-based, per-feature, hybrid? |
| **Free tier / trial** | Free plan? Trial length? Credit card required? |
| **Anchoring tactics** | Is one plan highlighted as "Most Popular"? Is enterprise plan shown to anchor mid-tier? |
| **Feature gating** | What's locked behind higher tiers? (This reveals what they consider premium value) |
| **Annual discount** | What % discount for annual billing? (Industry norm is 15-20%) |
| **CTA text** | What does the buy button say? ("Start free", "Buy now", "Talk to sales") |

If pricing page is gated or not found via WebFetch: run `WebSearch "[competitor name] pricing [current year]"` — blog reviews and comparison sites often publish pricing screenshots.

**Pricing intelligence output:**
```markdown
## Pricing Landscape

| Competitor | Cheapest | Mid | Top | Model | Free Tier | Annual Discount |
|---|---|---|---|---|---|---|
| [name] | $X/mo | $X/mo | $X/mo | [model] | Yes/No | X% |

**Market price floor:** $[X]/mo (below this, perceived as toy/unserious)
**Market price ceiling:** $[X]/mo (above this, need enterprise sales motion)
**Sweet spot:** $[X]/mo — [rationale]
**Pricing model consensus:** [what most competitors use — deviate with good reason only]
**Biggest pricing gap:** [e.g. "No one offers usage-based pricing — all per-seat, which punishes small teams"]
```

### Step C — Review Mining (WebSearch for each competitor)

For each competitor, run:
- `"[competitor name] review" site:g2.com OR site:capterra.com`
- `"[competitor name]" site:reddit.com "love" OR "hate" OR "switched" OR "alternative"`

Extract:
- **Top 3 things users love** (steal these)
- **Top 3 things users hate** (avoid these / exploit these gaps)
- **Common switching triggers** (why people leave)
- **Rating** (G2/Capterra score if available)

### Step D — Steal/Avoid Matrix

Capture both **product patterns** (features, UX, onboarding) AND **go-to-market patterns** (how competitors acquire and retain customers). The best steal might not be a feature — it might be a content strategy, community play, or referral mechanic.

```markdown
## Competitor Intelligence

### STEAL — Product Patterns (proven features/UX worth adopting)
| What | Who Does It | Why It Works | How We'd Implement |
|---|---|---|---|
| [feature/UX pattern] | [competitor] | [evidence] | [approach] |

### STEAL — GTM Patterns (proven acquisition/retention tactics worth adopting)
| What | Who Does It | Why It Works | How We'd Implement |
|---|---|---|---|
| [e.g. free tool/calculator that drives SEO traffic] | [competitor] | [evidence — ranking, traffic, conversion] | [approach] |
| [e.g. community/Slack group as retention moat] | [competitor] | [evidence — member count, engagement] | [approach] |
| [e.g. referral program, affiliate channel, partnership] | [competitor] | [evidence] | [approach] |
| [e.g. content strategy — blog cadence, topic focus, comparison pages] | [competitor] | [evidence — ranking pages, content volume] | [approach] |

### AVOID (patterns that cause user complaints — product or GTM)
| What | Who Does It | Why It Fails | Our Alternative |
|---|---|---|---|
| [pattern] | [competitor] | [evidence] | [better approach] |

### DIFFERENTIATE (things nobody does that users want)
| Opportunity | Evidence | Difficulty | Impact |
|---|---|---|---|
| [feature/approach] | [user quotes/data] | Low/Med/High | Low/Med/High |
```

---

## Phase 3 — Profitability Analysis

**Goal:** Can this actually make money? Is the unit economics viable?

### Step A — TAM/SAM/SOM Estimation

Use a bottom-up approach (more reliable than top-down for niche SaaS):

```markdown
## Market Sizing

### Bottom-Up Calculation
- Target customer profile: [description]
- Estimated number of target businesses/users: [number] (source: [how estimated])
- Realistic price point: $[X]/mo (based on competitor pricing in Phase 2)
- SAM (Serviceable Addressable Market): [customers] x $[price] x 12 = $[annual]
- Realistic capture rate (Year 1): [X]% = [customer count]
- SOM (Year 1 revenue target): $[amount]

### Top-Down Cross-Check
- Total market size reported: $[X] (source: [report/article])
- Our niche segment: ~[X]% of total = $[amount]
- Sanity check: [does bottom-up align with top-down?]
```

### Step B — Unit Economics

Phase 2 Step B2 already captured the full pricing landscape (tiers, models, floor/ceiling/sweet spot). Reference that data here — do not rebuild the competitor pricing table. This step focuses on whether OUR numbers work.

```markdown
## Unit Economics

**Our pricing (from Phase 2 pricing landscape):**
- Sweet spot: $[X]/mo (Phase 2 analysis)
- Model: [per-user / flat / usage] (Phase 2 consensus or deviation with rationale)

### Sanity Check
- Target ARPU: $[X]/mo
- Estimated CAC (for this market): $[X] (based on: [channel assumption — will be validated in Phase 5])
- LTV at 5% monthly churn: $[X] (= ARPU / churn rate)
- LTV:CAC ratio: [X]:1 (healthy = 3:1+, exceptional = 5:1+)
- Months to recover CAC: [X] (healthy = under 12)
- Gross margin estimate: [X]% (SaaS norm = 70-85%. If hosting/API costs are high, flag here.)
```

### Step C — Business Model Signals

Assess each signal. Any "No" is a yellow flag. Two or more "No" answers is a red flag that should impact the Phase 6 Profitability score.

- [ ] **Must-have vs nice-to-have?** (regulatory = must have, productivity = nice to have. Must-have products churn less and sell easier.)
- [ ] **Natural subscription fit?** Does the product deliver ongoing value that justifies monthly billing? (Monitoring, compliance tracking, recurring reports = strong subscription fit. One-time generation, single-use tools = weak. If the core value is a one-time action, the product needs a usage/credits model or continuous data to justify MRR.)
- [ ] **Expansion revenue path?** Is there a natural upsell (more seats, more usage, higher tier features, additional modules)?
- [ ] **Audience pays for software?** Some niches are notoriously cheap (artists, students, micro-businesses under 5 staff). B2B mid-market and regulated industries pay reliably.
- [ ] **Free tier threat?** Do competitors offer free tiers that would undercut paid plans? If yes, freemium may be table stakes — factor into pricing strategy.
- [ ] **Regulatory or compliance pressure?** Forced adoption by law or industry requirement is the strongest demand signal. Products that help businesses avoid fines/penalties have lower churn and easier sales.
- [ ] **Fast time to value?** Can a new user get meaningful value within the first session (under 10 minutes), or does the product require data import, team setup, integrations, or training before it's useful? Products with slow time-to-value churn during onboarding before users ever experience the core benefit. If time-to-value is slow, the MVP MUST include a quick-win (demo data, instant audit, sample report) that delivers value before full setup is complete.

---

## Phase 4 — Ideal Customer Profile & Differentiation

**Goal:** Define WHO we're building for and HOW we'll be different. This must come before traffic analysis because the ICP's language, communities, and search behavior drive keyword and channel decisions in Phase 5.

### Step A — Ideal Customer Profile (ICP)

Before positioning, define exactly who the buyer is. This drives every decision in this phase and Phase 5 — messaging, features, channels, pricing tolerance.

```markdown
## Ideal Customer Profile

### Primary Buyer
- **Job title / role:** [e.g. "Operations Manager at a 20-50 person construction firm"]
- **Company size:** [employee count and/or revenue range]
- **Industry vertical:** [specific, not broad — "residential construction" not "construction"]
- **Geography:** [if relevant — local compliance, language, timezone needs]
- **Current solution:** [what they use today — spreadsheets, a competitor, manual process, nothing]
- **Trigger event:** [what makes them search for a solution NOW — new regulation, scaling pain, audit failure, new hire]
- **Budget authority:** [do they hold the card, or do they need approval? This affects sales motion]
- **Tech sophistication:** [self-serve friendly, or needs hand-holding?]

### Pain Statement (in their words)
"I spend [X hours/week] doing [painful task] because [current solution] doesn't [gap]. I need something that [desired outcome]."

### What They'd Google
1. [exact search query this person would type]
2. [exact search query]
3. [exact search query]

### Where They Hang Out Online
- [specific subreddits, LinkedIn groups, industry forums, Slack communities, Facebook groups]
- [this directly informs Phase 5 channel assessment — cross-reference]

### Willingness to Pay
- Current spend on this problem: $[X]/mo (or $0 if manual process)
- Pain severity (1-5): [rating] — [justification]
- Price sensitivity: [low/medium/high] — [evidence from Phase 2 competitor pricing]
```

**ICP validation check (run after Phase 5 completes):** Does the ICP match the Phase 5 channel assessment? If the primary buyer hangs out on LinkedIn but Phase 5 rated LinkedIn as Low viability — reconcile. Either the ICP is wrong or the channel assessment missed something.

### Step B — Positioning Framework

```markdown
## Positioning

### Category
[Existing category] OR [New sub-category we'd create]

### One-Liner
"[Product name] is the [differentiator] [category] for [audience]"
Example: "InvoiceAI is the AI-first invoicing tool for Australian tradies"

### Against Competitors
| vs [Competitor A] | We win on [X], they win on [Y] |
| vs [Competitor B] | We win on [X], they win on [Y] |
| vs [Competitor C] | We win on [X], they win on [Y] |

### Positioning Angle (pick one primary)
- [ ] **Audience niche** — own a specific segment competitors ignore
- [ ] **Feature moat** — one capability nobody else has
- [ ] **Experience** — dramatically better UX/onboarding/support
- [ ] **Price** — undercut on price with equivalent value
- [ ] **Philosophy** — different approach to the problem entirely
- [ ] **Geography** — local compliance/language/integration nobody else handles
```

### Step C — MVP Feature Set

Based on Phase 2 steal/avoid matrix and Phase 1 gaps:

```markdown
## MVP Feature Definition

### Must-Have (without these, not viable)
1. [Feature] — Why: [competitor table stakes / user demand]
2. [Feature] — Why: [competitive requirement]
3. [Feature] — Why: [core value prop delivery]

### Differentiator Features (what makes us worth switching to)
1. [Feature] — Gap source: [Phase 1 gap reference]
2. [Feature] — Steal source: [what competitor does, how we do it better]

### Explicitly NOT in v1 (avoid scope creep)
1. [Feature] — Why defer: [not enough demand / too complex / not our angle]
```

---

## Phase 5 — Traffic & Acquisition Feasibility

**Goal:** Can we actually get users? Is there search demand? What channels work? This phase uses the ICP from Phase 4 — the buyer's exact search queries, communities, and language drive every keyword and channel decision below.

### Step A — Search Demand Validation (6 WebSearch queries)

WebSearch cannot access keyword tools directly. Use these proxy methods to estimate demand and competition. Use the ICP's "What They'd Google" queries from Phase 4 as search inputs for queries 1 and 3 — real buyer language beats category jargon.

1. `"[product category] software" OR "[product category] tool"` — count how many results appear and note what ranks on page 1 (all ads = high commercial intent and proven spend; all organic = lower competition). **Also search the ICP's exact queries** from Phase 4 — e.g. if the ICP would google "compliance tracking for builders", search that exact phrase.
2. `"best [product category] tools [current year]" OR "top [product category] software [current year]"` — listicle competition. Count how many listicles exist. Many = proven demand. Note if they're from major publishers (hard to outrank) or small blogs (opportunity).
3. `"[product category] [target geography]" software OR tool` — local demand signal. Few results = either no demand or untapped opportunity. Cross-reference with Phase 1 gap data.
4. `"[competitor A] vs" OR "[competitor B] alternative" OR "[product category] comparison"` — comparison/alternative search activity. Many results = active buyer market with high-intent search traffic available.
5. `"[product category]" keyword volume OR search trends OR search demand site:ahrefs.com OR site:semrush.com OR site:backlinko.com` — look for published keyword research with actual search volume numbers. Blog posts from SEO tools often publish category keyword data with volume and difficulty scores.
6. `site:reddit.com "[product category]" recommend OR suggestions after:[current year - 1]` — Reddit recommendation threads are a proxy for search demand. Active threads = people searching for solutions. Count unique threads in last 12 months as a demand signal.

**Demand strength assessment:** Combine all 6 signals into a qualitative rating:
- **High demand:** Multiple listicles, active comparison searches, Reddit threads, and published keyword data showing volume
- **Medium demand:** Some listicles exist, a few comparison pages, scattered Reddit mentions
- **Low demand:** Few or no listicles, no comparison content, minimal Reddit activity — market may be too niche or demand may not exist

### Step B — Keyword Opportunity Map

```markdown
## Keyword Opportunities

### High-Intent (Bottom of Funnel — ready to buy)
| Keyword Pattern | Competition | Opportunity |
|---|---|---|
| "[category] software" | High/Med/Low | [assessment] |
| "[category] tool for [audience]" | High/Med/Low | [assessment] |
| "[competitor] alternative" | High/Med/Low | [assessment] |
| "[category] pricing" | High/Med/Low | [assessment] |

### Mid-Intent (Comparison/Research)
| Keyword Pattern | Competition | Opportunity |
|---|---|---|
| "best [category] tools" | High/Med/Low | [assessment] |
| "[competitor A] vs [competitor B]" | High/Med/Low | [assessment] |
| "[category] comparison" | High/Med/Low | [assessment] |

### Top-of-Funnel (Problem-Aware)
| Keyword Pattern | Competition | Opportunity |
|---|---|---|
| "how to [problem the tool solves]" | High/Med/Low | [assessment] |
| "[industry] [pain point]" | High/Med/Low | [assessment] |
| ICP-specific: "[exact ICP query from Phase 4]" | High/Med/Low | [assessment] |

### Content Moat Potential
- Can we create definitive guides that rank? [yes/no + reasoning]
- Is there a data/tool angle (free calculator, checker, template)? [yes/no + idea]
- Are competitors investing in content? [who is, who isn't]
```

### Step C — Channel Assessment

Use the ICP's "Where They Hang Out Online" from Phase 4 to weight channel viability. If the ICP says they're active on specific subreddits, Reddit/Community should score higher. If they're LinkedIn-heavy professionals, LinkedIn channels should score higher.

```markdown
## Acquisition Channels

| Channel | Viability | Why | Estimated CAC |
|---|---|---|---|
| SEO / Content | High/Med/Low | [reasoning] | $[X] |
| Google Ads | High/Med/Low | [reasoning] | $[X] |
| LinkedIn (organic) | High/Med/Low | [reasoning] | $[X] |
| LinkedIn (paid) | High/Med/Low | [reasoning] | $[X] |
| Product Hunt launch | High/Med/Low | [reasoning] | $[X] |
| Reddit / Community | High/Med/Low | [reasoning] | $[X] |
| Partnerships / Integrations | High/Med/Low | [reasoning] | $[X] |
| Cold outreach | High/Med/Low | [reasoning] | $[X] |

**Primary channel recommendation:** [channel] — because [reason]
**Secondary channel:** [channel]
```

**ICP reconciliation:** After completing the channel assessment, run the Phase 4 ICP validation check. If the ICP's online communities don't align with the top-rated channels, investigate and reconcile before proceeding.

---

## Phase 6 — Go/No-Go Scorecard

**Goal:** Objective, weighted score to decide: BUILD, PIVOT, or SKIP.

### Scoring Matrix

| Dimension | Weight | Score (1-5) | Weighted | Evidence |
|---|---|---|---|---|
| **Market Gap** — Is there a genuine underserved need? | 20% | | | [one-line evidence] |
| **Competitor Weakness** — Can we exploit real weaknesses? | 15% | | | [one-line evidence] |
| **Profitability** — Can this make money at realistic scale? | 20% | | | [one-line evidence] |
| **Traffic Potential** — Can we acquire users organically? | 20% | | | [one-line evidence] |
| **Differentiation** — Do we have a clear, defensible angle? | 15% | | | [one-line evidence] |
| **Buildability** — Can we ship an MVP with our current stack? | 10% | | | [one-line evidence] |
| **TOTAL** | 100% | | **/5.0** | |

### Scoring Guide

| Score | Meaning |
|---|---|
| 1 | No evidence / major red flag |
| 2 | Weak signal / significant concerns |
| 3 | Moderate — workable but not exciting |
| 4 | Strong signal — clear opportunity |
| 5 | Exceptional — rare, high-conviction opportunity |

### Verdict Thresholds

| Total Score | Verdict | Action |
|---|---|---|
| **4.0 - 5.0** | **BUILD** | Proceed to `/saas-build`. Strong conviction. |
| **3.0 - 3.9** | **PIVOT** | Promising but needs adjustment. Revisit positioning, narrow audience, or find a sharper angle. Re-score after pivot. |
| **Below 3.0** | **SKIP** | Not worth building. Move to next idea. |

### Verdict Output

```markdown
## VERDICT: [BUILD / PIVOT / SKIP]

**Score: [X.X] / 5.0**

**One-paragraph summary:**
[Why this score. What's the strongest signal. What's the biggest risk.]

**If BUILD — recommended next step:**
Run `/saas-build` with this brief. Phase 0.25 will skip its own research and read this file directly.

**If PIVOT — what to change:**
1. [Specific pivot recommendation]
2. [What to re-research after pivoting]

**If SKIP — why:**
[Clear, honest reason. No sugar-coating.]
```

### Fallback Loop (Mode 4 only)

If Phase 6 returns SKIP and Phase 0 produced a runner-up idea:
1. Log the SKIP verdict and reason for the first idea
2. Auto-select the runner-up from Phase 0's opportunity list
3. Re-run Phases 1-6 on the runner-up
4. If the runner-up also SKIPs and a third candidate exists, try it too
5. Maximum 3 attempts. If all 3 SKIP, output the full opportunity list with verdicts and recommend the user provide constraints or a different domain to narrow the search
6. The final RESEARCH-BRIEF.md includes all attempted ideas with their scores and SKIP reasons, so no research is wasted

---

## Output: RESEARCH-BRIEF.md

Write the complete output to `RESEARCH-BRIEF.md` in the working directory:

```markdown
# Research Brief — [Product Name/Idea]

**Date:** [current date]
**Market:** [category]
**Geography:** [target market]
**Verdict:** [BUILD / PIVOT / SKIP] — Score: [X.X]/5.0

---

## Executive Summary
[3-4 sentences: market state, key opportunity, biggest risk, recommendation]

---

## Market Landscape
[Phase 1 output — classification, gap identification]

## Competitor Intelligence
[Phase 2 output — teardown summary, pricing landscape, steal/avoid matrix (product + GTM)]

## Profitability Analysis
[Phase 3 output — TAM/SAM/SOM, unit economics, business model signals]

## Ideal Customer Profile & Differentiation
[Phase 4 output — ICP, positioning framework, MVP features]

## Traffic & Acquisition
[Phase 5 output — keyword map, channel assessment, ICP reconciliation]

## Scorecard
[Phase 6 output — full scoring matrix and verdict]

---

## For saas-build

### Product name suggestion
[name]

### One-liner
[positioning one-liner]

### Target audience
[specific audience]

### Ideal Customer Profile
- **Role:** [job title]
- **Company:** [size + vertical]
- **Trigger:** [what makes them search now]
- **Current solution:** [what they use today]
- **Pain statement:** "[in their words]"
- **Where they hang out:** [online communities, channels]
- **Search queries they'd type:** [3 exact queries]

### Must-have features for v1
1. [feature]
2. [feature]
3. [feature]

### Differentiator features
1. [feature]
2. [feature]

### Pricing recommendation
$[X]/mo — [model] — [rationale]

### Primary acquisition channel
[channel] — [why]

### Competitors to study in design research
1. [name] — [url] — steal: [what]
2. [name] — [url] — steal: [what]
3. [name] — [url] — avoid: [what]

### Patterns worth adopting
[carried forward for Phase 0.25 / 0.5]

### Patterns to avoid
[carried forward — things competitors do badly]

---

## Appendix: Opportunity Scan (Mode 4 only — include if Phase 0 ran)

### Constraints Applied
[geography/audience/domain or "none — open scan"]

### All Opportunities Evaluated
| Rank | Idea | One-Liner | Demand | Competition | Revenue | Traffic | Build | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | [selected — researched above] | [pitch] | X/5 | X/5 | X/5 | X/5 | X/5 | X.X |
| 2 | [name] | [pitch] | X/5 | X/5 | X/5 | X/5 | X/5 | X.X |
| ... | | | | | | | | |

### Why Top Pick Was Selected
[2-3 sentences]

### Runner-Up Notes
[Brief on #2-3 — worth revisiting if top pick gets a PIVOT or SKIP verdict]
```

---

## Terminal Output

```
=== SAAS RESEARCH COMPLETE ===

Mode: [1: Validation / 2: Gap Hunt / 3: Comparison / 4: Idea Generation]
Idea: [name/description]
Market: [classification] ([X] competitors identified)
Verdict: [BUILD / PIVOT / SKIP] — Score: [X.X]/5.0

Key Findings:
  Biggest Gap:    [one line]
  Best Steal:     [one line from competitor]
  Worst Pattern:  [one line to avoid]
  Traffic:        [High/Med/Low] potential via [primary channel]
  Profitability:  [assessment] — LTV:CAC [X]:1

Top 3 Competitors:
  1. [name] — [strength] / [weakness]
  2. [name] — [strength] / [weakness]
  3. [name] — [strength] / [weakness]

MVP Features: [count] must-have + [count] differentiators

Next Step: [action based on verdict]

[Mode 4 only:]
Opportunities Scanned: [X] ideas evaluated
Selected: [name] (scored [X.X]) from [X] candidates
Runner-Up: [name] (scored [X.X]) — viable fallback

Full brief saved to: RESEARCH-BRIEF.md
```

---

## Integration with saas-build

**saas-build Phase 0.25 integration:** When saas-build starts and finds `RESEARCH-BRIEF.md` in the project root:
1. Read the "For saas-build" section at the bottom
2. Skip all Phase 0.25 WebSearch queries — the research is already done
3. Write a slimmed MARKET-BRIEF.md by extracting: competitors, patterns worth adopting, must-have features, differentiator features, and the one-liner
4. Log: "Phase 0.25 complete — MARKET-BRIEF.md generated from RESEARCH-BRIEF.md (pre-researched)"

**saas-build Phase 0.5 integration:** DESIGN-BRIEF.md competitor research step reads the "Competitors to study in design research" section, including steal/avoid notes per competitor. This prevents Phase 0.5 from doing generic competitor research when specific intelligence already exists.

---

## Cross-Skill Integration

- If running in Mode 2 (gap hunting) and user wants deeper competitor analysis on a specific player: suggest `/market competitors [url]`
- After BUILD verdict: suggest `/saas-build` with the product brief
- After PIVOT verdict: suggest re-running `/saas-research` with the adjusted idea
- If user wants SEO deep-dive beyond Phase 4: suggest `/seo-strategy` or `/seo-auditor`
- If user wants pricing strategy beyond Phase 3: suggest `/pricing-model`
