---
Name: seo-strategy
Description: Unified SEO skill with two modes — Mode 1 optimises a single article with competitor research and semantic rewrite, Mode 2 runs a comprehensive site-wide audit across up to 10 pages with architecture review and prioritised action plan. Both produce interactive HTML reports.
Category: marketing-skill
Tier: 2
Author: Claude Skills
Version: 1.0.0
Dependencies: []
Trigger: "optimize this article", "SEO this", "audit my site", "full SEO audit", "website SEO review", "seo strategy"
---

# SEO Strategy

## Description

Unified SEO skill with two operational modes:

**Mode 1 — Single Article/Page Optimisation**
- Competitor research (top 5 ranking pages for target keyword)
- Semantic keyword analysis (topical depth, not just LSI keyword stuffing)
- Full article rewrite optimised for search intent
- On-page elements: title tag, meta description, H1/H2 structure, internal links
- Interactive HTML report with before/after comparison

**Mode 2 — Site-Wide Audit**
- Comprehensive audit across up to 10 pages
- Cross-page analysis: keyword cannibalization, topic clusters, internal linking map
- Architecture review: site structure, crawlability, pillar/cluster model
- Technical SEO checklist: Core Web Vitals, mobile, schema, canonical
- Prioritised action plan with effort/impact scoring
- Interactive HTML report with tabbed navigation

## Features

- Rate limiting awareness for web_fetch (graceful fallback when rate limited)
- Semantic keyword methodology: topical depth vs shallow LSI claims
- Competitor gap analysis in both modes
- Interactive HTML reports with score rings, badges, and tabbed navigation
- Consistent design language: dark theme, glass-morphism, Space Grotesk/Inter fonts

## Usage

**Mode 1 triggers**: "optimize this article", "SEO this", "SEO optimise this page"
**Mode 2 triggers**: "audit my site", "full SEO audit", "website SEO review"

For Mode 1, provide:
- The article URL or paste the content
- Target keyword (primary)
- Target audience

For Mode 2, provide:
- Homepage URL
- Up to 10 page URLs to audit (or I'll crawl from homepage)
- Business goal (rank for what? sell what?)

## Examples

```
User: SEO this article [pastes content]
Claude: [runs Mode 1, outputs optimised version + HTML report]

User: audit my site https://example.com
Claude: [runs Mode 2, audits up to 10 pages, outputs HTML report]
```

---

## Mode 1 Workflow — Single Page Optimisation

### Step 1 — Input Collection

Ask:
1. Article URL or content (paste it)
2. Primary target keyword
3. Who is the target audience?

### Step 2 — Competitor Research

Use web_fetch/WebSearch to find top 5 ranking pages for the target keyword.

For each competitor page, analyse:
- Title and H1
- Word count estimate
- Content angle (how-to, listicle, comparison, opinion)
- Key topics covered (subtopics that appear)
- What they do better than the input article

If rate limited, note it and proceed with available data.

### Step 3 — Semantic Keyword Analysis

Identify:
- **Primary keyword**: exact match intent
- **Supporting topics** (5-10): related questions, subtopics, entity associations that demonstrate topical authority. Do NOT call these "LSI keywords" — frame as topical depth.
- **Search intent**: Informational / Navigational / Transactional / Commercial
- **Content gaps**: topics competitors cover that the input article misses

### Step 4 — Article Rewrite

Rewrite the full article with:

**Structure**:
- Title tag: 50-60 chars, primary keyword near front
- Meta description: 150-160 chars, includes keyword + clear value prop + implicit CTA
- H1: matches or closely mirrors title
- H2 subheadings: cover all supporting topics identified
- Introduction: hook within first 2 sentences, states what reader will learn
- Body: addresses search intent directly, covers all gaps
- Conclusion: summary + next step / CTA

**Optimisation rules**:
- Primary keyword in first 100 words
- Natural keyword density (don't stuff)
- Use semantically related terms throughout (topical depth)
- Short paragraphs (3-4 lines max)
- Bullet lists where appropriate
- Internal link suggestions: [suggest 2-3 internal link opportunities]
- External links: suggest 1-2 authoritative sources to cite

### Step 5 — Output HTML Report (Mode 1)

Generate HTML report with:

**Header section**:
- Page title: "SEO Optimisation Report"
- Score ring: overall SEO score (0-100) before and after
- Keyword badge, date, target URL

**Tabs**:
1. **Overview** — score breakdown (title, meta, structure, content, gaps)
2. **Optimised Article** — full rewrite in a readable format
3. **Keyword Analysis** — semantic keyword map, intent, competitor gaps
4. **Technical Checklist** — quick-win on-page items

**Design**: Dark theme (#0a0a0f), glass-morphism cards, Space Grotesk headings, Inter body, accent #7c3aed → #06b6d4 gradient, score rings in SVG.

Output path:
- Cloud: `/mnt/user-data/outputs/seo-report-[slug].html`
- Local: `./seo-report-[slug].html`

---

## Mode 2 Workflow — Site-Wide Audit

### Step 1 — Input Collection

Ask:
1. Homepage URL
2. List of pages to audit (up to 10 URLs — or I'll discover from homepage)
3. Primary business goal (e.g. "rank for SaaS project management tools", "drive e-commerce conversions")

### Step 2 — Page Discovery (if no list provided)

Fetch homepage, extract all internal links, select up to 10 most important pages:
- Homepage
- Top-level nav pages
- Blog/content index
- 3-5 highest-traffic-signal pages (infer from nav prominence)

### Step 3 — Per-Page Analysis

For each page (up to 10), analyse:
- URL structure (clean, keyword-rich vs generic)
- Title tag: present, length, keyword
- Meta description: present, length, compelling
- H1: present, unique, keyword-aligned
- H2 structure: logical hierarchy
- Content quality: depth, topical coverage
- Internal links: count, anchor text quality
- Page speed signals: image optimisation, script loading (inferred from source)
- Schema markup: present/absent, type

Score each page 0-100 across these dimensions.

### Step 4 — Cross-Page Analysis

**Keyword cannibalization check**:
- Identify pages targeting similar/identical keywords
- Flag cannibalisation conflicts
- Recommend: consolidate, differentiate, or canonicalise

**Topic cluster mapping**:
- Identify pillar pages (broad topics)
- Identify cluster pages (specific subtopics)
- Map internal linking gaps between pillar and cluster pages

**Internal link audit**:
- Identify orphaned pages (no internal links pointing in)
- Identify pages with excessive outbound internal links (diluting PageRank)
- Suggest priority internal linking opportunities

### Step 5 — Technical SEO Checklist

Check (infer from source where possible):
- [ ] HTTPS
- [ ] Mobile viewport meta tag
- [ ] Canonical tags
- [ ] Open Graph / Twitter Card meta
- [ ] Schema markup (Organization, Article, Product, FAQ as appropriate)
- [ ] Image alt attributes
- [ ] No broken links (flag any 404s discovered)
- [ ] Sitemap.xml present (check /sitemap.xml)
- [ ] Robots.txt present (check /robots.txt)
- [ ] Core Web Vitals signals (LCP, CLS, FID — infer from source)

### Step 6 — Prioritised Action Plan

Create a table of recommended actions:

| Priority | Action | Effort (1-5) | Impact (1-5) | Score | Page(s) |
|----------|--------|--------------|--------------|-------|---------|

Sort by Score (Impact/Effort ratio) descending. Group into:
- **Quick Wins** (high impact, low effort — do first)
- **Strategic** (high impact, high effort — plan these)
- **Housekeeping** (low impact, low effort — batch these)

### Step 7 — Output HTML Report (Mode 2)

Generate comprehensive HTML report with:

**Header**:
- "Site-Wide SEO Audit" title
- Overall site health score (0-100)
- Pages audited count, date, domain

**Tabs**:
1. **Executive Summary** — overall score, top 5 quick wins, critical issues
2. **Page Scores** — table/cards per page with individual scores and key issues
3. **Keyword Map** — cannibalization issues, topic clusters, gaps
4. **Internal Links** — orphaned pages, linking opportunities
5. **Technical** — checklist with pass/fail/warning per item
6. **Action Plan** — prioritised table sorted by effort/impact

**Visual elements**:
- Score ring per page (SVG)
- Badge system: EXCELLENT (green), GOOD (blue), NEEDS WORK (amber), POOR (red)
- Collapsible sections for detail
- Competitor comparison if data available

**Design**: Same tokens as Mode 1.

Output path:
- Cloud: `/mnt/user-data/outputs/seo-audit-[domain].html`
- Local: `./seo-audit-[domain].html`
