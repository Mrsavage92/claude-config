# /saas-discover

Full SaaS opportunity discovery pipeline. Ingests real pain signals from actual sources, clusters into candidates, scores them against Adam's distribution + skills, auto-feeds every candidate through `/product-validator`, outputs a report with trinary verdicts. No idea exits this skill without a validator result attached.

## When to Use
- Adam asks "what should I build next?" or "find me a SaaS idea"
- Looking for product #2 after the current primary revenue project hits its target
- Weekly/monthly scan of niches Adam has distribution into

## When NOT to Use
- Primary revenue project is under its stated target (see `~/Documents/Claude/outputs/active-revenue-projects.md`). Discovery surfaces candidates but build is BLOCKED — saves to backlog only.
- User asks for brainstorming from thin air. This skill REQUIRES a signal source.
- User already has an idea. Use `/product-validator` directly.

---

## Invocation

```
/saas-discover {signal-source}
```

Signal source formats:
- `reddit:{subreddit}` — e.g. `reddit:smallbusiness`, `reddit:NDIS`, `reddit:accounting`
- `g2:{category}` — e.g. `g2:project-management`, `g2:crm-software`
- `niche:"{description}"` — e.g. `niche:"AU allied health providers"`
- `clients` — mines Adam's existing client signals (BDR MuleSoft tickets, AuditHQ user requests)
- `pipeline` — no arg; scans all Adam's active signal sources at once

Without a signal source → HALT with: *"I need a signal source. Discovery from thin air was the Tender Writer failure mode. Give me `reddit:X`, `g2:Y`, `niche:"Z"`, `clients`, or `pipeline`."*

---

## Phase 1 — Signal Ingest

Dispatch WebSearch/WebFetch agents in parallel (`model: "haiku"` — read-only research).

### reddit:{subreddit}
Search queries, last 90 days weighted:
- `site:reddit.com/r/{subreddit} "wish there was a tool" OR "wish someone would build"`
- `site:reddit.com/r/{subreddit} "I hate" OR "frustrating" (tool OR software OR app)`
- `site:reddit.com/r/{subreddit} "spending hours" OR "takes forever" workflow`
- `site:reddit.com/r/{subreddit} "paying too much for" software`

Extract: post title, pain statement (verbatim), upvote count, recency, commenter agreement signals.

### g2:{category}
- Fetch G2/Capterra 1–2 star reviews of top 5 tools in the category
- Extract recurring complaint themes (pricing, missing features, support, integration gaps)
- Cross-reference with TrustRadius + Product Hunt comment threads

### niche:"{description}"
- Search: `"{niche}" "looking for a tool" OR "is there software for"`
- Scan industry forums, Slack/Discord communities, LinkedIn group discussions
- Check job boards — recurring VA/freelancer tasks = automation opportunities

### clients
- Prompt Adam: "List client complaints/requests from BDR MuleSoft and any AuditHQ users. Or paste support ticket CSVs."
- If no input: fall back to `pipeline`

### pipeline
- Runs `clients` + scans MuleSoft community forums + AU agency Slack (if links provided)
- Aggregates across sources

**Output:** raw `SIGNALS.md` with every pain point: source URL, date, volume proxy, verbatim quote.

## Phase 2 — Pain Clustering

Group raw signals into themes. Each theme:
- **Name** — short handle (e.g. "Multi-currency invoice reconciliation")
- **Volume** — distinct mentions in window
- **Intensity** — sentiment heat (frustration words, all-caps, emojis)
- **Recency** — weighted toward last 30 days
- **Current workaround** — what tool/process today (Sheets, manual, named competitor)
- **Willingness-to-pay signal** — "would pay for", "happy to pay $X", complaints about incumbent pricing

Drop themes with <3 distinct mentions or no willingness-to-pay signal.

## Phase 3 — Fit Scoring

Score each remaining theme 1–10 on:

| Dimension | What it measures | Weight |
|---|---|---|
| Distribution fit | Warm audience? (MuleSoft clients, AuditHQ users, agency network) | 3x |
| Skill fit | Buildable with React/Supabase/Stripe/FastAPI? | 2x |
| Adjacency to active project | Feature of AuditHQ or NEW product? Features get rerouted. | 2x |
| Moat potential | Any unfair advantage (data, domain, channel)? | 2x |
| Ugly-enough market | Boring enough VCs ignore, painful enough SMBs pay | 1x |

Drop themes scoring <6/10.

## Phase 4 — Candidate Generation

Top 3–5 surviving themes become candidates:

```markdown
### Candidate {N}: {ProductName}
- **Pain signal:** {verbatim quote} — {source URL}
- **Volume/intensity:** {N mentions, intensity score, recency}
- **Target buyer:** {specific segment}
- **Value prop (1 sentence):** {does X, for Y, because Z}
- **Pricing hypothesis:** ${N}/mo, expected ${M} MRR per customer
- **Distribution path:** {specific — "MuleSoft clients via Anil", "AU agencies via cs-partnerships list"}
- **Fit score:** {N}/10 with breakdown
- **Proposed slug:** {kebab-case}
```

## Phase 5 — Auto-Validate (MANDATORY — NO BYPASS)

For EVERY candidate from Phase 4, invoke `/product-validator` with the slug. Each candidate runs the full 8-gate validator. Collect trinary verdicts.

Do NOT write any summary or present candidates to Adam until all validator runs complete. The verdict is non-negotiable output.

## Phase 6 — Portfolio Gate

Read `~/Documents/Claude/outputs/active-revenue-projects.md`. If primary revenue focus is under its stated target:
- Any BUILD-verdict candidate gets FLAGGED AS BACKLOG, not ready-to-build
- Output: *"{ProductName} passed validation but new builds are blocked until {PrimaryProject} hits {target}. Logged to backlog."*
- Candidate added to `~/Documents/Claude/outputs/saas-discover-backlog.md` with full verdict file link

If primary is at/above target: BUILD candidates surface as real opportunities and can proceed to `/saas-build`.

## Phase 7 — Report + Commit

Write discovery report to: `~/Documents/Claude/outputs/discovery/{source-slug}-{YYYY-MM-DD}.md`

Format:
```markdown
# SaaS Discovery — {source} — {date}

**Signals ingested:** {N}
**Themes clustered:** {N}
**Candidates generated:** {N}
**Verdicts:** {BUILD count} BUILD | {VALIDATE-FIRST count} VALIDATE-FIRST | {KILL count} KILL
**Portfolio gate:** {OPEN / BLOCKED by {PrimaryProject} at ${current}/${target}}

## Candidate Results

### 1. {Name} — {VERDICT}
- Pain signal + source
- Validator verdict file: {link to product-validation-{slug}.md}
- Reason (if KILL): top 2 failed gates
- Reason (if VALIDATE-FIRST): interview protocol path
- Reason (if BUILD): moat + first 3 buyers to contact

## Recommended Action
{"Pursue {name} — run interview protocol first" | "All candidates dead — try different signal source" | "Portfolio gate blocks builds — candidates saved to backlog"}
```

Mirror to `claude-config` repo at `reference/discoveries/{source-slug}-{date}.md` and push.

## Rules

1. **No ideation without evidence.** Every candidate cites verbatim pain signal with source URL. "I thought of this" = instant skip.
2. **Every candidate runs validator.** No candidate skips the 8-gate. No "obviously good" exemption.
3. **Drop low-volume themes.** <3 distinct mentions = noise.
4. **Drop low-intensity themes.** Mentions ≠ payers. Needs willingness-to-pay signal.
5. **Portfolio gate is law.** 10/10 BUILD candidate still goes to backlog if primary project isn't at target.
6. **Output is singular.** One run → one report → N verdict files.
7. **Log every KILL.** Validator step 5 appends to `validator-learnings.md`.

## Anti-Patterns

- Running without signal source — banned
- Generating ideas from Claude's training data — banned, cite real pain or skip
- Skipping to Phase 4 without Phase 1–3 evidence — banned
- Presenting candidates to Adam before validator runs — banned
- Bypassing portfolio gate for "really exciting" candidate — banned. Flywheel > excitement.
- Producing >5 candidates per run — noise. 3 real signals beat 10 weak ones.

## Integration

- **Upstream:** no skill — fresh discovery pipeline entry point
- **Gate (mandatory):** `/product-validator` — runs N times, once per candidate
- **Downstream (if BUILD + portfolio open):** `/saas-build` — user manually invokes with winning slug
- **Log:** writes to `~/Documents/Claude/retrospectives/validator-learnings.md` via validator step 5
- **Backlog:** `~/Documents/Claude/outputs/saas-discover-backlog.md` for BUILD candidates blocked by portfolio gate

## Model Routing

- Phase 1 (signal ingest): WebSearch agents with `model: "haiku"` in parallel
- Phase 2–4 (clustering, scoring, candidates): main context (Sonnet-equivalent reasoning)
- Phase 5 (validator): inherits `/product-validator` routing
- Phase 7 (report): main context

Never Opus. Structured research + judgment, not high-stakes architecture.
