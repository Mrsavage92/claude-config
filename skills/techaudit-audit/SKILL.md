---
name: techaudit-audit
description: "Website Technical Audit Engine"
---

# Website Technical Audit Engine

You are the technical audit engine for `techaudit audit <url>`. You perform a comprehensive, evidence-based technical audit of a website and produce a client-ready TECHNICAL-AUDIT.md report with scores, findings, and prioritised fixes.

## When This Skill Is Invoked

The user runs `techaudit audit <url>`. This is the flagship command.

---

## Output Directory

**Always save report files to a domain-specific folder — never to the current directory or user profile root.**

Choose output root: `CLAUDE_AUDIT_OUTPUT_ROOT` > `./outputs` > user-requested path

1. Extract the domain from the URL (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`)
2. Set the output path: `./outputs/{domain}/`
3. Create the folder if it doesn't exist: `mkdir -p "./outputs/{domain}"`
4. Save all output files into that folder: `./outputs/{domain}/TECHNICAL-AUDIT.md`

**Example:** `https://bdrgroup.co.uk/` → `./outputs/bdrgroup.co.uk/TECHNICAL-AUDIT.md`

---

## Phase 1: Data Gathering

### 1.1 Fetch the Homepage

Use `web_fetch` to retrieve the homepage HTML. From the raw source, extract:

**Performance indicators:**
- Count all `<script>` tags (external and inline) - note render-blocking vs async/defer
- Count all `<link rel="stylesheet">` tags
- Count all `<img>` tags - check for: src format (webp/avif vs png/jpg), loading="lazy", width/height attributes, alt text
- Check for font loading: @font-face, Google Fonts links, font-display property
- Total estimated page weight from visible resources
- Check for minification signals in CSS/JS filenames (.min.js, .min.css)

**Mobile indicators:**
- `<meta name="viewport">` present and correctly configured?
- Responsive CSS: media queries in inline styles or linked stylesheets?
- Touch-friendly: buttons/links with adequate size (>44px)?
- Font sizes: base font size adequate for mobile reading?

**SEO technical indicators:**
- `<title>` tag: present, length, keywords
- `<meta name="description">`: present, length, compelling
- `<link rel="canonical">`: present and correct
- `<meta name="robots">`: present, content
- Schema/JSON-LD: any `<script type="application/ld+json">`? Parse and describe
- Open Graph tags: og:title, og:description, og:image
- Header hierarchy: count and order of H1-H6 tags (multiple H1s = issue)
- `<html lang="">` attribute present?

**Security indicators:**
- Page served over HTTPS?
- Mixed content: any http:// resources loaded on an https:// page?
- `<meta http-equiv="Content-Security-Policy">`?
- Referrer policy meta tag?

**Accessibility indicators:**
- Images without alt text (count)
- Images with empty alt="" (acceptable for decorative, note it)
- Form inputs without associated labels
- ARIA attributes present?
- Skip navigation link?
- Colour contrast: check inline styles for low-contrast text
- Heading hierarchy: proper nesting (H1 > H2 > H3)?

**Code quality:**
- Deprecated HTML elements (`<font>`, `<center>`, `<marquee>`, etc.)
- Excessive inline styles
- Console error indicators (malformed script tags, missing resources)
- HTML lang attribute
- DOCTYPE declaration

### 1.2 Fetch 2-3 Interior Pages

Fetch key interior pages (about, services/products, contact). Compare against homepage for consistency in:
- Title tag and meta description quality
- Schema markup consistency
- Mobile responsiveness consistency
- Image optimisation consistency
- Header hierarchy

### 1.3 Check Technical Files

Search for or attempt to fetch:
- `[domain]/robots.txt` - present? Well-configured? Blocking important content?
- `[domain]/sitemap.xml` - present? Valid? URL count?
- `[domain]/favicon.ico` - present?

### 1.4 Check External Signals

Search for `site:[domain]` to estimate indexed page count and check for issues:
- Approximate number of indexed pages
- Any obviously wrong pages indexed (admin, staging, test)?
- Page titles in search results - consistent and descriptive?

### 1.5 Build the Data Map

```
SITE: [url]
PLATFORM: [WordPress/Shopify/custom/etc - detect from source]
HTTPS: [Yes/No]

PERFORMANCE:
  Script tags: [count] (blocking: [count], async/defer: [count])
  Stylesheets: [count]
  Images: [count] (WebP: [count], lazy loaded: [count], missing alt: [count])
  Font loading: [method]
  Minification: [Yes/No/Partial]

MOBILE:
  Viewport meta: [present/missing/incorrect]
  Responsive: [Yes/No/Partial]
  Font size: [adequate/too small]

SEO TECHNICAL:
  Title: [present - quote it]
  Meta description: [present - quote it]
  Canonical: [present/missing]
  Schema: [type found or "none"]
  H1 count: [number per page]
  Sitemap: [present/missing]
  Robots.txt: [present/missing]

SECURITY:
  HTTPS: [Yes/No]
  Mixed content: [count of http:// resources]
  Security headers: [present/missing]

ACCESSIBILITY:
  Images missing alt: [count]/[total]
  Form labels: [present/missing]
  ARIA: [present/absent]
  Heading hierarchy: [proper/broken]

CODE QUALITY:
  Deprecated elements: [count]
  Inline styles: [excessive/moderate/minimal]
  HTML lang: [present/missing]
```

---

## Phase 2: Analysis

Score each category with specific evidence. No score without proof.

### Category 1: Page Speed & Performance (Weight: 25%)

| Element | Check | Evidence Required |
|---|---|---|
| Script management | Render-blocking vs async/defer | Count each type |
| Image optimisation | WebP/AVIF, lazy loading, sizing | Count optimised vs not |
| CSS delivery | Minified, critical CSS, number of files | Note file count and minification |
| Font loading | font-display, preload, number of fonts | Note strategy |
| Overall weight | Estimated page size from resource count | Rough estimate |

**Scoring rubric:**
- 80-100: All images WebP + lazy, scripts async/defer, CSS minified, fonts optimised
- 60-79: Most images optimised, some render-blocking resources, decent minification
- 40-59: Mixed optimisation, several render-blocking scripts, unoptimised images
- 0-39: No optimisation, many render-blocking resources, large unoptimised images

### Category 2: Mobile Responsiveness (Weight: 20%)

| Element | Check | Evidence Required |
|---|---|---|
| Viewport meta | Present and correct | Quote the tag |
| Responsive CSS | Media queries present | Note evidence |
| Touch targets | Adequate button/link sizing | Note any small targets |
| Font sizes | Readable on mobile | Note base font size |
| Layout | No horizontal scrolling indicators | Note fixed widths |

**Scoring rubric:**
- 80-100: Proper viewport, fully responsive, adequate touch targets, readable fonts
- 60-79: Viewport present, mostly responsive, minor touch target issues
- 40-59: Viewport present but issues, partially responsive, readability concerns
- 0-39: No viewport, not responsive, desktop-only design

### Category 3: SEO Technical Health (Weight: 20%)

| Element | Check | Evidence Required |
|---|---|---|
| Title tags | Present, unique, descriptive, correct length | Quote titles from 3+ pages |
| Meta descriptions | Present, compelling, correct length | Quote descriptions |
| Header hierarchy | Single H1 per page, proper nesting | Map the hierarchy |
| Schema markup | Present, correct type for business | Quote the JSON-LD |
| Sitemap & robots | Present and well-configured | Note contents |
| Canonical URLs | Present and correct | Quote the tag |
| Open Graph | Complete OG tags for social sharing | Note which are present |

**Scoring rubric:**
- 80-100: All titles/metas unique, schema present, sitemap valid, proper hierarchy
- 60-79: Titles present, some metas missing, no schema, sitemap exists
- 40-59: Generic titles, missing metas, no schema or sitemap
- 0-39: Missing titles, no metas, broken hierarchy, no technical SEO

### Category 4: Security & SSL (Weight: 15%)

| Element | Check | Evidence Required |
|---|---|---|
| HTTPS | Site served over HTTPS | Note protocol |
| Mixed content | HTTP resources on HTTPS pages | Count http:// resources |
| Security headers | CSP, referrer policy, X-Frame-Options | Note which are present |
| SSL configuration | Certificate valid, not expired | Note any warnings |

**Scoring rubric:**
- 80-100: HTTPS, no mixed content, security headers present, valid cert
- 60-79: HTTPS, minor mixed content, some security headers
- 40-59: HTTPS but significant mixed content, no security headers
- 0-39: No HTTPS or expired certificate

### Category 5: Accessibility (Weight: 10%)

| Element | Check | Evidence Required |
|---|---|---|
| Image alt text | All meaningful images have descriptive alt | Count missing vs total |
| Form labels | All inputs have associated labels | Note unlabelled inputs |
| Heading structure | Proper H1-H6 nesting | Map the structure |
| ARIA attributes | Present where needed | Note usage |
| Keyboard navigation | Skip nav link, focusable elements | Note presence |
| Colour contrast | Inline styles with low contrast | Note any found |

**Scoring rubric:**
- 80-100: Full alt text, proper labels, correct headings, ARIA present, skip nav
- 60-79: Most alt text, some label issues, mostly correct headings
- 40-59: Significant alt text gaps, missing labels, heading issues
- 0-39: Widespread accessibility failures

### Category 6: Code Quality & Standards (Weight: 10%)

| Element | Check | Evidence Required |
|---|---|---|
| HTML validity | DOCTYPE, lang attribute, deprecated elements | Note issues |
| Clean code | Inline styles, code organisation | Note prevalence |
| Broken resources | Missing scripts, stylesheets, images | Count 404 indicators |
| CMS/platform | Up to date or outdated version signals | Note platform and version |
| Console errors | Malformed scripts, syntax issues | Note any visible |

**Scoring rubric:**
- 80-100: Valid HTML, no deprecated elements, clean code, no broken resources
- 60-79: Minor validation issues, some inline styles, no broken resources
- 40-59: Several deprecated elements, excessive inline styles, some broken resources
- 0-39: Major validation issues, outdated platform, broken functionality

---

## Phase 3: Synthesis

### 3.1 Calculate Composite Score

```
Technical Health Score = (
    Speed_Performance    * 0.25 +
    Mobile_Responsive    * 0.20 +
    SEO_Technical        * 0.20 +
    Security_SSL         * 0.15 +
    Accessibility        * 0.10 +
    Code_Quality         * 0.10
)
```

| Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Excellent - well-optimised, minor tweaks only |
| 70-84 | B | Good - solid foundation, clear improvements available |
| 55-69 | C | Average - significant issues hurting performance and SEO |
| 40-54 | D | Below average - major technical debt |
| 0-39 | F | Critical - fundamental issues breaking user experience |

**Scoring Anchors:**
- 80-100: Equivalent to web.dev, github.com — fast, accessible, all security headers, perfect Lighthouse
- 60-79: Modern WordPress/Next.js site with good basics — HTTPS, responsive, some optimization gaps
- 40-59: Functional but slow — render-blocking scripts, missing headers, accessibility gaps
- 20-39: Visibly broken — slow load, mobile issues, no HTTPS or mixed content
- 0-19: Non-functional or inaccessible

### 3.2 Classify Findings by Severity

- **Critical:** Site-breaking issues - no HTTPS, major mobile failures, blocked indexing
- **High:** Significant impact - render-blocking resources, missing schema, no sitemap
- **Medium:** Notable issues - missing alt text, suboptimal image formats, minor mixed content
- **Low:** Nice-to-haves - font optimisation, minor code quality, additional security headers

### 3.3 Prioritise Recommendations

- **Quick Wins** (this week): Add missing alt text, fix mixed content, add viewport meta
- **Strategic** (this month): Image optimisation, schema markup, sitemap creation
- **Long-Term** (this quarter): Performance overhaul, accessibility audit, platform upgrade

---

## Phase 4: Output

### TECHNICAL-AUDIT.md

```markdown
# Website Technical Audit: [Business Name]
**URL:** [url]
**Date:** [date]
**Platform:** [detected CMS/framework]
**Overall Technical Health Score: [X]/100 (Grade: [letter])**

---

## Executive Summary
[3-5 paragraphs: score, biggest win, biggest risk with business impact,
top 3 fixes. Lead with: "53% of mobile users abandon sites that take
longer than 3 seconds to load."]

## Score Breakdown
| Category | Score | Weight | Weighted | Key Finding |
|---|---|---|---|---|
[All 6 categories with evidence]

## Critical Issues (Fix Immediately)
[Severity-coded findings]

## Quick Wins (This Week)
[5-8 specific fixes]

## Strategic Recommendations (This Month)
[3-5 items with rationale]

## Detailed Analysis by Category
[Full findings per category with quoted evidence from HTML source]

## Tool Recommendations
[Specific tools for ongoing monitoring: Google Search Console, PageSpeed Insights, etc.]

## Next Steps
1. [Most critical fix]
2. [Second priority]
3. [Third priority]

*Generated by Website Technical Audit Suite*
```

## Error Handling

- URL unreachable: Report error, suggest checking URL
- Single-page site: Adapt analysis, note limited scope
- SPAs (React/Vue/Angular): Note that client-side rendering limits what can be audited from HTML alone
- Very large site: Focus on homepage + 3-4 key pages, note sampling approach

## Cross-Skill Integration

- Audit data feeds into `techaudit report-pdf`
- Complements `market audit` (technical issues affect marketing)
- After audit, suggest: `techaudit speed`, `techaudit accessibility`, `techaudit report-pdf`

---

## Template Compliance (Self-Check Before Saving)

Your report MUST contain ALL of these sections. If any are missing, add them before saving.

- [ ] Executive Summary (3+ paragraphs)
- [ ] Score Breakdown (table with all 5 categories)
- [ ] Critical Issues — Fix Immediately (severity-tagged)
- [ ] Quick Wins — This Week (5-8 items)
- [ ] Strategic Recommendations — This Month
- [ ] Detailed Analysis by Category (all 5 categories with evidence)
- [ ] Tool Recommendations (specific tools named)
- [ ] Data Map Summary (structured platform/stack block)
- [ ] Next Steps (top 3)
