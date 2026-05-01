---
name: geo-audit
description: Full website GEO+SEO audit with parallel subagent delegation. Orchestrates a comprehensive Generative Engine Optimization audit across AI citability, platform analysis, technical infrastructure, content quality, and schema markup. Produces a composite GEO Score (0-100) with prioritized action plan.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebFetch
  - Write
---

# GEO Audit Orchestration Skill

## Purpose

This skill performs a comprehensive Generative Engine Optimization (GEO) audit of any website. GEO is the practice of optimizing web content so that AI systems (ChatGPT, Claude, Perplexity, Gemini, etc.) can discover, understand, cite, and recommend it. This audit measures how well a site performs across all GEO dimensions and produces an actionable improvement plan.

## Key Insight

Traditional SEO optimises for search engine rankings. GEO optimises for AI citation and recommendation. The two disciplines overlap (both care about clean HTML, structured data, fast crawlable pages) but have distinct requirements — GEO also cares about AI crawler access, quotable passages, llms.txt, and entity clarity.

## Capability Declaration — What This Audit CAN and CANNOT Do

GEO is an emerging practice. This audit measures **proxy signals** that predict AI citation likelihood.

**We CAN check from public HTML + headers + robots.txt + llms.txt:**
- AI crawler access — full 2026 crawler list (parsed from robots.txt + meta robots):
  - **Training crawlers:** GPTBot (OpenAI training), ClaudeBot (Anthropic training), Google-Extended (Gemini training), Applebot-Extended (Apple Intelligence training, iOS 18+), Meta-ExternalAgent (Meta AI/Llama training), Bytespider (ByteDance/TikTok AI), Amazonbot (Amazon/Alexa AI), cohere-ai (Cohere training), mistralai-User-Agent (Mistral training)
  - **Live search crawlers:** OAI-SearchBot (ChatGPT search — separate from GPTBot), PerplexityBot (Perplexity search index), Bingbot (powers Microsoft Copilot + Bing Chat + several AI partners), DuckAssistBot (DuckDuckGo's AI assistant)
  - **Multi-purpose:** Diffbot (used by major AI training pipelines), CCBot (Common Crawl, feeds many open-source LLMs)
- AI-specific meta directives — `<meta name="robots" content="noai, noimageai">`, `<meta name="claude-bot" content="noindex">`, etc.
- Schema.org structured data (JSON-LD types, completeness, validity)
- **2026 GEO-critical schema types:** Speakable (voice AI queries), Product+GTIN+Brand+Offer (AI Shopping), ClaimReview (fact-checked content), VerifiedNewsPublisher annotation, LearningResource (educational), HowTo, FAQPage, ImageObject with creator
- llms.txt + **llms-full.txt** presence, structure, and content quality
- **Knowledge graph entity verification:** sameAs links pointing to Wikipedia, Wikidata, Crunchbase, LinkedIn — these are the #1 signals AI uses to confirm entity identity
- Quotable passage structure (clear Q&A blocks, FAQ sections, definitive factual statements, statistical density)
- **Inline citation density** — links to primary sources (gov, edu, peer-reviewed, established media). AI engines weight content with verifiable sourcing higher.
- E-E-A-T markers (author bios with credentials, ORCID IDs, sameAs to LinkedIn/Wikipedia/Mastodon, publication dates, dateModified > dateCreated freshness)
- Entity clarity (About page, unambiguous name + category, schema Organization with logo + sameAs)
- Technical GEO (SSR vs CSR rendering hints, canonical URLs, sitemap, **HTTP/2 or HTTP/3 support, accurate Last-Modified headers**)
- **Multi-modal signals:** image alt text quality (depth, not just presence), video transcript availability, audio descriptions/podcast show-notes

**We CANNOT directly measure (requires live AI platform queries):**
- Whether ChatGPT / Claude / Perplexity / Gemini actually cite the site right now
- Which specific passages get quoted in AI responses
- Relative citation share vs competitors
- Actual traffic referrals from AI systems (needs server logs + GA4)

**What this means for the report:**
- GEO scores are **predictive**, not causal. A high score means the site is *structurally likely* to be cited; it does not prove citation has occurred.
- Never claim "you're cited 30% more than competitors" without actual live-query evidence.
- Never invent research citations. If you reference an academic study, the URL must be in the report.
- If a section requires capability the runtime doesn't have (e.g. live AI query testing), say so: "Live citation testing requires a separate add-on that queries each AI platform directly."

---

## Report Tone — Write for Business Owners, Not Auditors

The person reading this report is a business owner, CEO, or manager — not a technical auditor. Every sentence must make sense to someone who has never heard a technical term.

**Rules for report writing:**

1. **Lead every finding with business impact.** "AI assistants like ChatGPT can't find or recommend your business" NOT "Low AI citability score due to missing answer blocks"
2. **No evidence tags in report text.** Never write `[Confirmed]` or `[Strong inference]` in the report. Track confidence with HTML comments only: `<!-- Confirmed -->` — the client never sees these.
3. **Every action item names WHO does it and HOW LONG it takes.** "Ask your content writer to add FAQ sections to your main pages — a half-day task that makes your business visible to AI search" NOT "Implement FAQPage schema with answer blocks"
4. **Lead with cost.** What is this costing in visibility, customers finding you via AI, or competitive position?
5. **Use plain severity labels:**
   - 🔴 **Fix immediately** — AI systems are actively unable to find or cite you
   - 🟠 **Fix this month** — you're missing AI visibility opportunities
   - 🟡 **Plan for next quarter** — worth doing, not urgent
6. **Translate ALL technical terms.** "AI search tools can't read your website properly" NOT "AI crawlers blocked in robots.txt". If you must use a technical term, follow it immediately with a plain-English explanation in parentheses.
7. **Write like you're explaining to a smart friend over coffee.** Short sentences. No jargon. Concrete consequences.

These rules apply to the final markdown report only. Internal analysis (Phases 1-3) should use technical language for accuracy. The translation to business language happens when writing the report output.

---

## Output Directory

**Always save report files to a domain-specific folder — never to the current directory or user profile root.**

Choose output root: `CLAUDE_AUDIT_OUTPUT_ROOT` > `./outputs` > user-requested path

1. Extract the domain from the URL (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`)
2. Set the output path: `./outputs/{domain}/`
3. Create the folder if it doesn't exist: `mkdir -p "./outputs/{domain}"`
4. Save all output files into that folder: `./outputs/{domain}/GEO-AUDIT-REPORT.md`

**Example:** `https://bdrgroup.co.uk/` → `./outputs/bdrgroup.co.uk/GEO-AUDIT-REPORT.md`

---

## Audit Workflow

### Phase 1: Discovery and Reconnaissance

### Tool Budget
- WebFetch: homepage + robots.txt + llms.txt + up to 3 service pages (max 6 fetches)
- WebSearch: up to 8 queries (brand authority, competitor GEO, Wikipedia/Reddit presence, schema validation)
- Total: aim for under 25 tool calls to avoid rate limits
- Priority order: homepage → robots.txt → llms.txt → 2 service pages → WebSearch for brand/competitors

**Step 1: Fetch Homepage and Detect Business Type**

1. Use WebFetch to retrieve the homepage at the provided URL.
2. Extract the following signals:
   - Page title, meta description, H1 heading
   - Navigation menu items (reveals site structure)
   - Footer content (reveals business info, location, legal pages)
   - Schema.org markup on homepage (Organization, LocalBusiness, etc.)
   - Pricing page link (SaaS indicator)
   - Product listing patterns (E-commerce indicator)
   - Blog/resource section (Publisher indicator)
   - Service pages (Agency indicator)
   - Address/phone/Google Maps embed (Local business indicator)

3. Classify the business type using these patterns:

| Business Type | Detection Signals |
|---|---|
| **SaaS** | Pricing page, "Sign up" / "Free trial" CTAs, app.domain.com subdomain, feature comparison tables, integration pages |
| **Local Business** | Physical address on homepage, Google Maps embed, "Near me" content, LocalBusiness schema, service area pages |
| **E-commerce** | Product listings, shopping cart, product schema, category pages, price displays, "Add to cart" buttons |
| **Publisher** | Blog-heavy navigation, article schema, author pages, date-based archives, RSS feeds, high content volume |
| **Agency/Services** | Case studies, portfolio, "Our Work" section, team page, client logos, service descriptions |
| **Hybrid** | Combination of above signals -- classify by dominant pattern |

**Step 2: Crawl Sitemap and Internal Links**

1. Attempt to fetch `/sitemap.xml` and `/sitemap_index.xml`.
2. If sitemap exists, extract up to 50 unique page URLs prioritized by:
   - Homepage (always include)
   - Top-level navigation pages
   - High-value pages (pricing, about, contact, key service/product pages)
   - Blog posts (sample 5-10 most recent)
   - Category/landing pages
3. If no sitemap exists, crawl internal links from the homepage:
   - Extract all `<a href>` links pointing to the same domain
   - Follow up to 2 levels deep
   - Prioritize pages linked from main navigation
4. Respect `robots.txt` directives -- do not fetch disallowed paths.
5. Enforce a maximum of 50 pages and a 30-second timeout per fetch.

**Step 3: Collect Page-Level Data**

For each page in the crawl set, record:
- URL, title, meta description, canonical URL
- H1-H6 heading structure
- Word count of main content
- Schema.org types present
- Internal/external link counts
- Images with/without alt text
- Open Graph and Twitter Card meta tags
- Response status code
- Whether the page has structured data

---

### Phase 2: Parallel Subagent Delegation

Delegate analysis to 5 specialized subagents. Each subagent operates on the collected page data and produces a category score (0-100) plus findings.

**Subagent 1: AI Citability Analysis (geo-citability)**
- Analyze content blocks for quotability by AI systems
- Score passage self-containment, answer block quality, statistical density
- Identify high-value pages that could be reformatted for better AI citation

**Subagent 2: Platform & Brand Analysis (geo-brand-mentions)**
- Check brand presence across YouTube, Reddit, Wikipedia, LinkedIn
- Assess third-party mention volume and sentiment
- Score brand authority signals that AI models use for entity recognition

**Subagent 3: Technical GEO Infrastructure (geo-crawlers + geo-llmstxt)**
- Analyze robots.txt for AI crawler access
- Check for llms.txt presence and quality
- Verify meta tags, headers, and technical accessibility for AI systems
- Check page speed and rendering (JS-heavy sites are harder for AI crawlers)

**Subagent 4: Content E-E-A-T Quality (geo-content)**
- Evaluate Experience, Expertise, Authoritativeness, Trustworthiness signals
- Check author bios, credentials, source citations
- Assess content freshness, depth, and originality
- Verify "About" page quality and team credentials

**Subagent 5: Schema & Structured Data (geo-schema)**
- Validate all schema.org markup
- Check for GEO-critical schema types (FAQ, HowTo, Organization, Product, Article)
- Assess schema completeness and accuracy
- Identify missing schema opportunities

---

### Phase 3: Score Aggregation and Report Generation

#### Composite GEO Score Calculation

The overall GEO Score (0-100) is a weighted average of seven category scores (added AI Mode/Shopping in 2026 spec):

| Category | Weight | What It Measures |
|---|---|---|
| **AI Citability** | 22% | How quotable/extractable content is for AI systems |
| **Brand Authority** | 18% | Third-party mentions, entity recognition signals (sameAs to Wikipedia/Wikidata) |
| **Content E-E-A-T** | 18% | Experience (first-hand evidence), Expertise (verified credentials), Authoritativeness (citations), Trustworthiness (transparency) |
| **Technical GEO** | 14% | AI crawler access (full 2026 list), llms.txt + llms-full.txt, SSR/rendering, HTTP/2-3, Last-Modified accuracy |
| **Schema & Structured Data** | 10% | Schema.org markup quality + 2026 types (Speakable, ClaimReview, Product+GTIN, LearningResource) |
| **AI Shopping & Commerce** | 8% | ChatGPT Shopping, Perplexity Shopping, Bing Shopping AI signals (Product schema + GTIN + Offer + AggregateRating) — only weighted for ecommerce/SaaS |
| **Multi-Modal & Platform** | 10% | Image/video/audio AI signals + presence on platforms AI models cite (YouTube transcripts, podcast show-notes, Wikipedia) |

**Formula:**
```
GEO_Score = (Citability * 0.22) + (Brand * 0.18) + (EEAT * 0.18) + (Technical * 0.14) + (Schema * 0.10) + (Shopping * 0.08) + (MultiModal * 0.10)
```

**Note:** For non-ecommerce/SaaS sites, redistribute the 8% Shopping weight proportionally across the other 6 categories (most goes to Multi-Modal & Platform).

#### Score Interpretation

| Score Range | Rating | Interpretation |
|---|---|---|
| 90-100 | Excellent | Top-tier GEO optimization; site is highly likely to be cited by AI |
| 75-89 | Good | Strong GEO foundation with room for improvement |
| 60-74 | Fair | Moderate GEO presence; significant optimization opportunities exist |
| 40-59 | Poor | Weak GEO signals; AI systems may struggle to cite or recommend |
| 0-39 | Critical | Minimal GEO optimization; site is largely invisible to AI systems |

**Scoring Anchors:**
- 80-100: Equivalent to Wikipedia, NHS.uk — highly citable, rich schema, cited by AI platforms
- 60-79: Well-structured content site with FAQ schema, author attribution, some AI visibility
- 40-59: Marketing-copy site with basic schema — content exists but is not citable or answer-formatted
- 20-39: Thin content, no schema, no llms.txt, AI crawlers partially blocked
- 0-19: No content of value for AI systems to extract

---

## 2026 AI Search Landscape — Platforms To Optimise For

| Platform | Source of citation data | Key signals it weights |
|---|---|---|
| **Google AI Overviews** (formerly SGE) | Google index + knowledge graph | Featured-snippet-eligible content, FAQPage schema, knowledge panel entities, Wikipedia presence, recent dateModified |
| **Google AI Mode** (full AI search, 2025+) | Google index + AI ranking | Query fan-out coverage, passage indexing depth, E-E-A-T credentials, multi-modal content |
| **ChatGPT Search** | OAI-SearchBot crawl + Bing index partnership | Schema.org + clear authorship, definitive factual answers, recency, sameAs to Wikipedia |
| **ChatGPT Shopping** (late 2024+) | Product schema feeds + merchant ratings | Product schema with GTIN, brand, Offer (price/availability/currency), AggregateRating |
| **Perplexity** | PerplexityBot crawl + own index + web in real-time | Inline citations to primary sources, recency (dateModified), quotable passages with stats |
| **Perplexity Shopping** (2025+) | Product feeds + reviews | Product schema, AggregateRating with reviewCount, comparison-friendly content |
| **Apple Intelligence** (iOS 18+) | Applebot-Extended crawl + on-device | Speakable schema, voice-friendly Q&A, structured FAQs, local LocalBusiness schema |
| **Microsoft Copilot / Bing Chat** | Bingbot index | Bing Webmaster verification, BreadcrumbList, sitemap completeness, E-E-A-T |
| **Meta AI** (WhatsApp/Instagram AI) | Meta-ExternalAgent crawl | Open Graph + structured product data, public content access |
| **Google Gemini** | Google-Extended crawl + Google index | Same as Google AI Overviews + multi-modal (image/video) |
| **Grok (X)** | X timeline + open web | Fresh content, definitive statements, social proof signals |
| **Claude.ai search/citations** | ClaudeBot crawl + Brave Search partnership | Clean HTML, JSON-LD validity, author authority, citation density |

**Audit implication:** A 2026 GEO audit must measure access for each crawler family AND verify the platform-specific schema/signal each uses.

---

## Issue Severity Classification

Every issue found during the audit is classified by severity:

### Critical (Fix Immediately)
- Any of the 5 major AI crawlers blocked: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot
- Site returns 5xx on homepage or key landing pages
- Complete absence of any structured data
- JavaScript-rendered content with no SSR/pre-rendering (AI crawlers see empty shell)
- Domain-level `noindex` or `<meta name="robots" content="noai">` directive
- Brand has zero entity verification — no Wikipedia/Wikidata/Crunchbase sameAs link AND no Google Knowledge Panel
- For ecommerce: Product pages with no Product schema (zero ChatGPT/Perplexity Shopping eligibility)

### High (Fix Within 1 Week)
- 2026-era AI crawlers blocked: Applebot-Extended, Meta-ExternalAgent, Bytespider, Amazonbot
- No llms.txt file present
- Zero question-answering content blocks on key pages
- Missing Organization or LocalBusiness schema
- No author attribution on content pages
- All content behind login/paywall with no preview
- For local business: No Speakable schema (voice AI invisible)
- For ecommerce: Product schema present but missing GTIN, brand, or Offer (Shopping AI eligibility blocked)
- HTTP/1.1 only (no HTTP/2 or HTTP/3 — AI crawlers prefer modern protocols)
- Last-Modified headers missing or stuck at HTTP server start time (AI uses this for recency)

### Medium (Fix Within 1 Month)
- Partial AI crawler blocking (some allowed, some blocked)
- llms.txt exists but missing llms-full.txt counterpart
- llms.txt incomplete or malformed
- Content blocks average under 50 citability score
- Missing FAQ schema on pages with FAQ content
- Thin author bios without credentials, no ORCID/sameAs to LinkedIn
- No Wikipedia or Reddit brand presence
- No Speakable annotations on FAQ pages
- Inline citation density under 1 per 500 words
- Most content >365 days since dateModified (stale content signal)

### Low (Optimize When Possible)
- Minor schema validation errors
- Some images missing alt text or alt text shorter than 5 words (low quality)
- Video pages without transcript or captions
- Missing Open Graph tags
- Suboptimal heading hierarchy on some pages
- LinkedIn company page exists but is incomplete
- No `noai` opt-out documented (decision should be intentional, not absent)

---

## Output Format

**IMPORTANT: Apply all Report Tone rules when writing this report. Every finding leads with business cost. Every action names who does it and how long it takes. No jargon. No `[Confirmed]` tags in client-facing text. Write for the business owner.**

Generate a file called `GEO-AUDIT-REPORT.md` with the following structure:

```markdown
# GEO Audit Report: [Site Name]

**Audit Date:** [Date]
**URL:** [URL]
**Business Type:** [Detected Type]
**Pages Analyzed:** [Count]

---

## Executive Summary

**Overall GEO Score: [X]/100 ([Rating])**

[2-3 sentence summary of the site's GEO health, biggest strengths, and most critical gaps.]

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | [X]/100 | 25% | [X] |
| Brand Authority | [X]/100 | 20% | [X] |
| Content E-E-A-T | [X]/100 | 20% | [X] |
| Technical GEO | [X]/100 | 15% | [X] |
| Schema & Structured Data | [X]/100 | 10% | [X] |
| Platform Optimization | [X]/100 | 10% | [X] |
| **Overall GEO Score** | | | **[X]/100** |

---

## 🔴 Fix Immediately — AI Systems Can't Find You

[Items where AI systems actively cannot find or cite the business. Each: plain-English problem → what it costs in AI visibility → "Ask your [role] to [action] — [time estimate]"]

## 🟠 Fix This Month — Missing AI Visibility

[Items where AI visibility opportunities are being missed. Same format: problem → cost → who fixes it → how long.]

## 🟡 Plan for Next Quarter — Improve AI Discoverability

[Improvements worth making this quarter. Same format.]

## Nice to Have — Polish When Time Allows

[Polish items when time allows.]

---

## Category Deep Dives

### AI Citability ([X]/100)
[Detailed findings, examples of good/bad passages, rewrite suggestions]

### Brand Authority ([X]/100)
[Platform presence map, mention volume, sentiment]

### Content E-E-A-T ([X]/100)
[Author quality, source citations, freshness, depth]

### Technical GEO ([X]/100)
[Crawler access, llms.txt, rendering, headers]

### Schema & Structured Data ([X]/100)
[Schema types found, validation results, missing opportunities]

### Platform Optimization ([X]/100)
[Presence on YouTube, Reddit, Wikipedia, etc.]

---

## Quick Wins (Implement This Week)

1. [Specific action — who does it, how long, expected AI visibility impact]
2. [Another quick win]
3. [Another quick win]
4. [Another quick win]
5. [Another quick win]

## 30-Day Action Plan

### Week 1: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 2: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 3: [Theme]
- [ ] Action item 1
- [ ] Action item 2

### Week 4: [Theme]
- [ ] Action item 1
- [ ] Action item 2

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| [url] | [title] | [issue count] |
```

---

## Quality Gates

- **Page Limit:** Never crawl more than 50 pages per audit. Prioritize high-value pages.
- **Timeout:** 30-second maximum per page fetch. Skip pages that exceed this.
- **Robots.txt:** Always check and respect robots.txt before crawling. Note any AI-specific directives.
- **Rate Limiting:** Wait at least 1 second between page fetches to avoid overloading the server.
- **Error Handling:** Log failed fetches but continue the audit. Report fetch failures in the appendix.
- **Content Type:** Only analyze HTML pages. Skip PDFs, images, and other binary content.
- **Deduplication:** Canonicalize URLs before crawling. Skip duplicate content (e.g., HTTP vs HTTPS, www vs non-www, trailing slashes).

---

## Business-Type-Specific Audit Adjustments

### SaaS Sites
- Extra weight on: Feature comparison tables (high citability), integration pages, documentation quality
- Check for: API documentation structure, changelog pages, knowledge base organization
- Key schema: SoftwareApplication, FAQPage, HowTo

### Local Businesses
- Extra weight on: NAP consistency, Google Business Profile signals, local schema
- Check for: Service area pages, location-specific content, review markup
- Key schema: LocalBusiness, GeoCoordinates, OpeningHoursSpecification

### E-commerce Sites
- Extra weight on: Product descriptions (citability), comparison content, buying guides
- Check for: Product schema completeness, review aggregation, FAQ sections on product pages
- Key schema: Product, AggregateRating, Offer, BreadcrumbList

### Publishers
- Extra weight on: Article quality, author credentials, source citation practices
- Check for: Article schema, author pages, publication date freshness, original research
- Key schema: Article, NewsArticle, Person (author), ClaimReview

### Agency/Services
- Extra weight on: Case studies (citability), expertise demonstration, thought leadership
- Check for: Portfolio schema, team credentials, industry-specific expertise signals
- Key schema: Organization, Service, Person (team), Review

---

## Template Compliance (Self-Check Before Saving)

Your report MUST contain ALL of these sections. If any are missing, add them before saving.

- [ ] Executive Summary (with overall GEO score and score breakdown table)
- [ ] 🔴 Fix Immediately (with who/how-long)
- [ ] 🟠 Fix This Month
- [ ] 🟡 Plan for Next Quarter
- [ ] Nice to Have
- [ ] Category Deep Dives (all 6 GEO categories with evidence)
- [ ] Quick Wins — Implement This Week
- [ ] 30-Day Action Plan
- [ ] Appendix: Pages Analyzed (list every URL fetched)
