---
name: parallel-audit
description: Run multiple audit suites simultaneously against a URL using parallel subagent delegation. Completes in a fraction of the time of sequential audits. Use when you want a comprehensive multi-domain audit (marketing + technical + GEO + security + privacy) without waiting for each to finish before the next starts.
---

# Parallel Audit

Runs selected audit suites simultaneously by spawning independent background agents. Each audit runs in its own context window. After all agents complete, generates one individual PDF per suite plus one combined PDF.

## Suite Reference

| # | Suite | What it covers |
|---|-------|----------------|
| 1 | Marketing | SEO, copy, funnel, social, email, CTAs |
| 2 | Technical | Speed, mobile, accessibility, Core Web Vitals |
| 3 | GEO | AI citability, schema, llms.txt, AI crawlers |
| 4 | Security | Headers, certificates, CMS hardening |
| 5 | Privacy | GDPR/PECR, cookies, privacy policy |
| 6 | Reputation | Reviews, brand mentions, trust signals |
| 7 | Employer Brand | Careers page, EVP, Glassdoor, LinkedIn employer |
| 8 | AI Readiness | AI maturity, automation opportunities, data readiness |

## How to Use

**All 8 suites:**
```
/parallel-audit https://example.com
```

**Selected suites by number:**
```
/parallel-audit https://example.com 1 2 3
/parallel-audit https://example.com 4 5 6
/parallel-audit https://example.com 1 3 4 6
```

**Selected suites by name:**
```
/parallel-audit https://example.com --suites marketing,geo,security
```

**Quick 3-suite sweep (1, 2, 3):**
```
/parallel-audit https://example.com --quick
```

## What Claude Does

1. Parses suite selection — numbers (1-8), names, or all 8 by default
2. Spawns one background Agent per selected suite, each with the URL and its specific audit prompt
3. Waits for all agents to complete (notified automatically)
4. Saves each suite's markdown report to `C:\Users\Adam\Documents\Claude\{domain}\`
5. Runs `generate_suite_pdfs.py` to produce:
   - One individual PDF per suite: `AUDIT-{N}-{SUITE}.pdf`
   - One combined PDF: `AUDIT-COMBINED-{numbers}.pdf`
6. Synthesises a unified text report in chat

## PDF Output

After all agents complete, call the generator:
```python
python3 "C:/Users/Adam/.claude/skills/shared/generate_suite_pdfs.py" \
    "C:/Users/Adam/Documents/Claude/{domain}" \
    {suite_numbers...}
```

This produces per-suite PDFs + combined. Example output for suites 1, 4, 5:
```
AUDIT-1-MARKETING.pdf       (individual)
AUDIT-4-SECURITY.pdf        (individual)
AUDIT-5-PRIVACY.pdf         (individual)
AUDIT-COMBINED-145.pdf      (merged)
```

## Audit Agent Prompts

Each agent receives the URL + this instruction template. The agent must save its markdown report to the output directory.

### Suite 1 — Marketing
Audit SEO basics (titles, metas, H1s), copy quality (headlines, value prop, CTAs), conversion funnel (lead capture, offers, friction), social proof (testimonials, case studies), content strategy (blog frequency, topical authority), and email/lead gen. Save report as `MARKETING-AUDIT.md`.

### Suite 2 — Technical
Audit page speed (render-blocking, lazy loading, image optimisation), Core Web Vitals signals (LCP, CLS, FID indicators), mobile responsiveness, accessibility (ARIA, labels, heading hierarchy, colour contrast), and technical SEO (canonical, robots, sitemap, structured data). Save as `TECHNICAL-AUDIT.md`.

### Suite 3 — GEO
Audit AI citability (content structured for AI systems to quote), schema markup (JSON-LD types present), llms.txt (check /llms.txt), AI crawler access (robots.txt for GPTBot, ClaudeBot, PerplexityBot), E-E-A-T signals (author bios, credentials, citations), and brand entity clarity. Save as `GEO-AUDIT-REPORT.md`.

### Suite 4 — Security
Audit security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, X-Content-Type-Options, Referrer-Policy), HTTPS configuration, cookie security flags, CMS fingerprinting and plugin exposure, form security (CSRF, CAPTCHA), and exposed sensitive paths. Save as `SECURITY-AUDIT.md`.

### Suite 5 — Privacy
Audit cookie consent mechanism (banner, CMP, granular controls), privacy policy (existence, UK GDPR compliance, lawful basis, retention, data subject rights), data collection transparency, third-party tracker disclosure, and PECR compliance. Save as `PRIVACY-AUDIT.md`.

### Suite 6 — Reputation
Audit Trustpilot/Google/Clutch presence and review responses, on-site social proof (testimonials, case studies, logos), awards and certifications, social media presence and follower health, brand mention quality, and PR/press coverage. Save as `REPUTATION-AUDIT.md`.

### Suite 7 — Employer Brand
Audit careers page quality and CRO, EVP clarity and differentiation, Glassdoor/Indeed presence and employer responses, LinkedIn employer page, job posting quality, and talent attraction messaging. Save as `EMPLOYER-AUDIT.md`.

### Suite 8 — AI Readiness
Audit AI adoption maturity (tools in use, team awareness), automation opportunity mapping (processes ripe for AI), data infrastructure readiness (quality, accessibility, governance), AI strategy alignment with business goals, and competitive positioning on AI. Save as `AI-READINESS-AUDIT.md`.

## Audit Report Format

Every agent must produce its markdown report in this exact format for consistent PDF rendering:

```markdown
# {Suite} Audit — {domain}

**Score: {N}/100**
**Date: {date}**

## Score Breakdown

| Category | Score |
|---|---|
| {Category 1} | {score}/100 |
...

## Critical Issues

### 1. {Finding title} ({score penalty})
{Body: 2-4 sentences explaining the issue, its impact, and evidence found.}

### 2. {Finding title} ({score penalty})
{Body text.}

## Major Issues

### 3. {Finding title} ({score penalty})
{Body text.}

...

## Minor Issues

- {Brief finding} (-{N})
- {Brief finding} (-{N})

## Quick Wins (Under 1 Hour)

1. {Specific actionable fix} ({time estimate})
2. ...

## Strengths

- {Strength 1}
- {Strength 2}
```

This format ensures:
- `### N. Title (-score)` findings are rendered as SeverityCards in the PDF
- Score is extracted correctly by the PDF engine
- Section headers match the engine's findings detection keywords

## Output Format (Chat)

```
## Parallel Audit Report — example.com — [date]

### Overall Score: 67/100

### Suite Scores
| # | Suite | Score | Grade |
|---|-------|-------|-------|
| 1 | Marketing | 71 | C |
| 2 | Technical | 58 | D |
...

### Top 10 Priority Issues
1. [Issue] — [Suite] — Impact: High — Effort: Low
...

### Quick Wins
...

### 30-Day Action Plan
...

### PDFs Generated
- AUDIT-1-MARKETING.pdf (individual)
- AUDIT-4-SECURITY.pdf (individual)
- AUDIT-COMBINED-14.pdf (merged)
```

## Performance

Sequential audit time: ~25-40 minutes
Parallel audit time: ~8-12 minutes (limited by slowest suite)
PDF generation: ~30 seconds per suite + 60 seconds combined
