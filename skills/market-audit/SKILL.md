---
name: market-audit
description: "Marketing Audit Engine"
---

# Marketing Audit Engine

You are the full marketing audit engine for `/market audit <url>`. You perform a comprehensive, evidence-based marketing audit and produce a client-ready MARKETING-AUDIT.md report with scores, findings, and prioritised recommendations.

## When This Skill Is Invoked

The user runs `/market audit <url>`. This is the flagship command of the suite.

---

## Output Directory

**Always save report files to a domain-specific folder — never to the current directory or user profile root.**

1. Extract the domain from the URL (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`)
2. Choose the output root: `CLAUDE_AUDIT_OUTPUT_ROOT` > `./outputs` > user-requested path
3. Create the folder if it doesn't exist: `mkdir -p "./outputs/{domain}"`
4. Save all output files into that folder: `./outputs/{domain}/MARKETING-AUDIT.md`

**Example:** `https://bdrgroup.co.uk/` → `./outputs/bdrgroup.co.uk/MARKETING-AUDIT.md`

---

## Phase 1: Data Gathering

This is the most important phase. The quality of the audit depends entirely on the data collected. Do NOT skip steps or rush to analysis.

### 1.1 Crawl the Target Site

Use `web_fetch` (or the environment equivalent) to retrieve the **homepage** first, then systematically fetch interior pages. Extract the navigation menu from the homepage HTML to discover the site structure.

**Pages to fetch (in priority order):**

1. Homepage (always)
2. Primary service/product pages (from main nav)
3. Pricing page (if exists)
4. About/team page (if exists)
5. Contact page (always - check for forms, phone, address, map)
6. Blog/news page (if exists - check volume and recency)
7. Testimonials/reviews page (if exists)
8. FAQ page (if exists)
9. Any "Book Now", "Get Started", or primary conversion page

**Target: 4-8 pages fetched.** Stop at 8 unless critical pages remain.

**For each page, extract and note:**
- Page title tag (exact text)
- Meta description (exact text, or note if missing)
- H1 heading (exact text)
- H2 headings (list them)
- Primary CTA text and destination
- Images: alt text present? Modern formats (webp)?
- Social proof: testimonials, review counts, award badges, client logos
- Trust signals: phone number, address, certifications, guarantees
- Email capture: newsletter signup, lead magnet, popup
- Schema markup indicators (JSON-LD or microdata in source)
- External links to social media profiles
- Internal linking patterns

### 1.2 Check Third-Party Reputation

**This step is critical.** Search the web for the business to assess external reputation:

**Run these searches:**
1. `[Business Name] reviews` - find Google, TripAdvisor, Yelp, OpenTable, ProductReview ratings
2. `[Business Name] [City/Region]` - check what appears on page 1

**Extract:**
- Google Business Profile: star rating, review count, response pattern
- TripAdvisor/OpenTable/Yelp/industry platforms: rating, review count, recent sentiment
- What appears on the first page of search results
- Social media follower counts if visible

**This data feeds directly into Brand & Trust scoring.**

### 1.3 Detect Business Type

Classify based on evidence gathered:

| Business Type | Detection Signals | Analysis Focus |
|---|---|---|
| **SaaS/Software** | Free trial, pricing tiers, login link, API docs | Trial-to-paid, onboarding, differentiation |
| **E-commerce** | Product listings, cart, checkout, categories | Product pages, cart flow, upsells |
| **Agency/Services** | Case studies, portfolio, contact forms | Trust, positioning, lead qualification |
| **Local Business** | Address, phone, hours, Google Maps | Local SEO, GBP, reviews, NAP |
| **Hospitality/Venue** | Menu, booking, events, functions, accommodation | Booking conversion, events, reviews |
| **Creator/Course** | Lead magnets, email capture, courses | Email capture, funnel, content |
| **Healthcare/Professional** | Practitioner profiles, booking, certifications | Trust, credentials, acquisition |
| **Trades/Home Services** | Service areas, quote forms, licenses | Local SEO, trust, lead generation |

Many businesses span multiple types. Identify primary and secondary.

### 1.4 Build the Page Map

Create a structured summary:

```
SITE MAP:
- Homepage: [title] - [fetched]
- [Page]: [URL] - [fetched/not found]

BUSINESS TYPE: [Primary] (Secondary: [if applicable])
LOCATION: [City, State/Country]
REVIEWS: [Platform]: [rating]/5 ([count]) | [Platform]: [rating]/5 ([count])
EMAIL CAPTURE: [Yes/No - describe]
SOCIAL PROFILES: [platforms found]
```

---

## Phase 2: Analysis

Work through each category systematically. For every score, provide **specific evidence** from data gathered. No score should be based on assumption.

### Category 1: Content & Messaging (Weight: 25%)

| Element | Check | Evidence Required |
|---|---|---|
| Headline clarity | Does H1 pass the 5-second test? | Quote the actual H1 |
| Value proposition | Unique value immediately obvious? | Quote it or note absence |
| Body copy quality | Benefit-led or generic? Specific or template? | Quote 1-2 representative sentences |
| Social proof on site | Testimonials, logos, case studies visible? | Count and note placement |
| Content depth | Blog exists? Post count? Last publish date? | Note specifics |
| Voice consistency | Same tone across pages? | Note inconsistencies |

**Scoring:** 80+: Clear, specific, benefit-driven with strong social proof | 60-79: Adequate but generic | 40-59: Template-style, weak social proof | <40: Unclear, no social proof

### Category 2: Conversion Optimization (Weight: 20%)

| Element | Check | Evidence Required |
|---|---|---|
| CTA clarity | Primary CTA benefit-driven? | Quote the CTA text |
| CTA placement | Above fold? Repeated? Contrasting? | Note positions |
| Form friction | How many fields? | Count on key forms |
| Trust near CTAs | Guarantees, badges near conversion? | Note what's there |
| Booking/signup flow | Steps from intent to completion? | Map the steps |
| Popup behaviour | Intrusive or helpful? | Describe it |
| Pricing transparency | Clear or hidden? | Note what's shown |
| Urgency/scarcity | Time-limited offers? | Quote them |

**Scoring:** 80+: Clear CTAs, minimal friction, strong trust | 60-79: Present but generic | 40-59: Weak CTAs, significant friction | <40: No clear conversion path

### Category 3: SEO & Discoverability (Weight: 20%)

| Element | Check | Evidence Required |
|---|---|---|
| Title tags | Descriptive? Location keywords? | Quote 3-5 titles |
| Meta descriptions | Present? Compelling? | Quote or note missing |
| Header hierarchy | Proper H1>H2>H3? | Note structure |
| URL structure | Clean, readable? | Quote 3-5 URLs |
| Image optimisation | Alt text? WebP? | Note findings |
| Internal linking | Cross-referencing between pages? | Note patterns |
| Schema markup | LocalBusiness, Restaurant, Event JSON-LD? | Note presence/absence |
| Blog/content | Exists? Keywords targeted? Frequency? | Note details |
| Local SEO | NAP consistency, Maps embed, location terms? | Check across pages |

**Scoring:** 80+: Fully optimised, schema, active blog | 60-79: Basics present with gaps | 40-59: Significant gaps | <40: Major issues

### Category 4: Competitive Positioning (Weight: 15%)

| Element | Check | Evidence Required |
|---|---|---|
| Differentiation | What makes them unique? | Quote differentiators or note absence |
| Awards/credentials | Prominently displayed? | List what's shown |
| Comparison content | "Why us", "vs" pages? | Note presence |
| Review reputation vs competitors | How do ratings compare? | Show comparison |
| Content authority | Expertise competitors lack? | Note unique content |

**Search for 2-4 competitors** using `[business type] [location]`. Fetch 1-2 competitor homepages if time allows.

**Scoring:** 80+: Clear positioning, awards prominent, strong reputation | 60-79: Some differentiation | 40-59: Generic, mixed reputation | <40: No differentiation, poor reputation

### Category 5: Brand & Trust (Weight: 10%)

| Element | Check | Evidence Required |
|---|---|---|
| About/team page | Exists? Photos? Story? | Describe what's there |
| Review ratings | Google, TripAdvisor, industry platforms | Quote exact ratings |
| Review management | Responding to reviews? | Note response pattern |
| Design quality | Modern, professional, consistent? | Note impression |
| Contact accessibility | Phone, email, form, chat findable? | Note availability |

**Scoring:** 80+: 4.5+ reviews, active management, professional design | 60-79: 3.5-4.4 reviews, adequate | 40-59: Mixed reviews, minimal management | <40: Poor reviews, unprofessional

### Category 6: Growth & Strategy (Weight: 10%)

| Element | Check | Evidence Required |
|---|---|---|
| Email capture | Newsletter, lead magnet, popup? | Describe or note absence |
| Loyalty/retention | Membership, loyalty program? | Note what exists |
| Cross-sell/upsell | Packages, add-ons, related items? | Note mechanisms |
| Multiple revenue streams | Diversified or single focus? | List streams |
| Remarketing | Facebook Pixel, Google tag present? | Note tracking codes |
| Events/seasonal | Regular events, campaigns? | Describe activity |

**Scoring:** 80+: Email capture, loyalty, multi-channel, remarketing | 60-79: Some capture, basic retention | 40-59: Minimal capture, no loyalty | <40: No growth mechanisms

---

## Phase 3: Synthesis

### 3.1 Calculate Composite Score

```
Score = Content*0.25 + Conversion*0.20 + SEO*0.20 + Competitive*0.15 + Brand*0.10 + Growth*0.10
```

| Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Excellent - minor optimisations |
| 70-84 | B | Good - clear opportunities |
| 55-69 | C | Average - significant gaps |
| 40-54 | D | Below average - major overhaul |
| 0-39 | F | Critical - fundamental issues |

**Scoring Anchors:**
- 80-100: Equivalent to HubSpot.com, Stripe.com — world-class content, conversion, SEO
- 60-79: Equivalent to a well-run regional agency site — good basics, gaps in conversion/content
- 40-59: Basic brochure site with some SEO — missing email capture, weak CTAs, no case studies
- 20-39: Outdated site with minimal content — no blog, no trust signals, broken UX
- 0-19: Parked domain or under construction

### 3.2 Classify Recommendations

Every recommendation must include: what to change, where, why, and estimated impact.

- **Quick Wins** (this week): Copy changes, missing elements, obvious gaps
- **Strategic** (this month): New pages, systems, campaigns
- **Long-Term** (this quarter): Content strategy, repositioning, new channels

### 3.3 Revenue Impact

Use conservative ranges (monthly):
- High: >$5,000/mo or >20% improvement (clear evidence)
- Medium: $1,000-$5,000/mo or 5-20% (industry benchmarks)
- Low: <$1,000/mo or <5% (incremental)

### 3.4 Competitor Comparison Table

```
| Factor | [Target] | [Comp A] | [Comp B] | [Comp C] |
|---|---|---|---|---|
| Headline Clarity | X/10 | X/10 | X/10 | X/10 |
| Trust Signals | X/10 | X/10 | X/10 | X/10 |
| CTA Effectiveness | X/10 | X/10 | X/10 | X/10 |
| Review Reputation | X/10 | X/10 | X/10 | X/10 |
| Content Depth | X/10 | X/10 | X/10 | X/10 |
```

---

## Phase 4: Output

### MARKETING-AUDIT.md

Save the full report following this structure:

```markdown
# Marketing Audit: [Business Name]
**URL:** [url]
**Date:** [date]
**Business Type:** [type]
**Overall Marketing Score: [X]/100 (Grade: [letter])**

---

## Executive Summary
[3-5 paragraphs: score, biggest strength, biggest gap, top 3 actions, total revenue impact]

## Score Breakdown
[Table with all 6 categories, scores, weights, weighted scores, key findings]

## Quick Wins (This Week)
[5-10 numbered items with specific steps and impact]

## Strategic Recommendations (This Month)
[3-7 numbered items with rationale and outcomes]

## Long-Term Initiatives (This Quarter)
[2-5 numbered items with business case]

## Detailed Analysis by Category
[Full findings per category WITH quoted evidence]

## Competitor Comparison
[Table if competitors researched]

## Revenue Impact Summary
[Table of recommendations with monthly impact, confidence, timeline]

## Next Steps
[Top 3 actions]

*Generated by AI Marketing Suite - `/market audit`*
```

### Terminal Summary

Display condensed scorecard with bar chart, top 3 wins, top 3 strategic moves, and revenue estimate.

---

## Error Handling

- URL unreachable: Report error, suggest checking URL
- Behind auth: Note accessible content, recommend manual review
- Thin site (1-3 pages): Adapt analysis, note limited scope
- No reviews found: This IS a finding - note it in Brand & Trust
- No competitors found: Note underserved or poorly defined niche

## Cross-Skill Integration

- Incorporate `COMPETITOR-REPORT.md`, `BRAND-VOICE.md` if they exist
- Suggest follow-ups: `/market copy`, `/market seo`, `/market funnel`, `/market report-pdf`
- Audit data feeds into `/market report-pdf` JSON structure

---

## Template Compliance (Self-Check Before Saving)

Your report MUST contain ALL of these sections. If any are missing, add them before saving.

- [ ] Executive Summary (3+ paragraphs with revenue impact estimate)
- [ ] Score Breakdown (table with all 6 categories, weights, and key findings)
- [ ] Quick Wins — This Week (5-8 numbered items)
- [ ] Strategic Recommendations — This Month (3-5 numbered items)
- [ ] Long-Term Initiatives — This Quarter (2-4 numbered items)
- [ ] Detailed Analysis by Category (all 6 categories with evidence)
- [ ] Competitor Comparison (2-3 named competitors)
- [ ] Revenue Impact Summary (table with monthly estimates)
- [ ] Next Steps (top 3 priorities)
