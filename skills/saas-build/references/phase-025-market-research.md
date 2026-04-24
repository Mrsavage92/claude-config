### Phase 0.25 — Feature & Market Research

Two questions to answer before any design work:
1. "What are active, successful competitors doing that works?"
2. "What do they miss that users need?"

If they are active and growing, their approach is a proven system. Study it before inventing your own.

**Step A — Discover competitors and user needs (5 WebSearch queries):**
1. `"[product category] SaaS features" site:reddit.com OR site:producthunt.com` — real user needs
2. `"[product category] SaaS alternatives"` — who exists, what they do
3. `"[product category] missing feature" OR "wish it had"` — unmet needs
4. `"[product category] best software" site:g2.com OR site:capterra.com` — which products are rated highest and why
5. `"[top competitor name] review"` — what users love and hate about the market leader

**Step B — Competitor website deep-dive (WebFetch top 3):**
For each of the top 3 competitors identified in Step A, WebFetch their homepage. Capture:
- **Hero pattern**: what's above the fold — product visual or abstract? What's the headline framing? What does the primary CTA say?
- **Social proof format**: logos only? testimonial quotes? stat numbers ("10,000 teams")? G2/Capterra badges?
- **Pricing model**: free trial / freemium / demo-only / paid-only? Number of tiers?
- **Navigation**: what top-level pages do they have — this reveals what features they consider primary
- **One thing that clearly works**: the single strongest element of their site that would perform well for any product in this category

If WebFetch is blocked or returns no content: run `WebSearch "[competitor name] homepage design [year]"` and extract the same fields from search snippets.

Write `MARKET-BRIEF.md` to project root:
```markdown
# Market Brief — [product name]

## Top 3 competitors
| Name | Price | Strengths | Gaps |

## Competitor website analysis
| Competitor | Hero pattern | Social proof | Pricing model | Nav structure | What works |
|---|---|---|---|---|---|
| [name] | | | | | |
| [name] | | | | | |
| [name] | | | | | |

## Patterns worth adopting (proven across 2+ competitors)
- [e.g. "All 3 use large customer logo strips above the fold — this clearly builds trust in this category"]
- [e.g. "Free trial is the universal CTA — no competitor uses demo-only"]

## Features users consistently request that competitors miss
1.
2.
3.

## Our differentiator (one sentence)

## Must-have for v1 (without these we are not in the market)
-

## Nice-to-have post-launch
-
```

**Phase 0.5 (design research) reads the "Competitor website analysis" and "Patterns worth adopting" sections** to inform hero architecture, social proof placement, and pricing section design. Do not duplicate the research — pass it forward.

SCOPE.md (Phase 1) must include the "Must-have for v1" features in the page inventory. If a must-have feature has no page defined, add the page.

If resuming: check if MARKET-BRIEF.md exists. If yes, skip this phase.

Log: "Phase 0.25 complete — MARKET-BRIEF.md written" to BUILD-LOG.md.

---
