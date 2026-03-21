---
name: parallel-audit
description: Run multiple audit suites simultaneously against a URL using parallel subagent delegation. Completes in a fraction of the time of sequential audits. Use when you want a comprehensive multi-domain audit (marketing + technical + GEO + security + privacy) without waiting for each to finish before the next starts.
---

# Parallel Audit

Runs all selected audit suites simultaneously by spawning independent background agents. Each audit runs in its own context window. Results are synthesised into a single prioritised report.

## Supported Suites

| Suite | Skill | What it covers |
|-------|-------|----------------|
| Marketing | `market-audit` | SEO, copy, funnel, social, email |
| Technical | `techaudit-audit` | Speed, mobile, accessibility, core web vitals |
| GEO | `geo-audit` | AI citability, schema, llms.txt, crawlers |
| Security | `security-audit` | Headers, certificates, exposed secrets |
| Privacy | `privacy-audit` | GDPR, cookies, privacy policy |
| Reputation | `reputation-audit` | Reviews, brand mentions, sentiment |

## How to Use

**Full parallel audit (all suites):**
```
/parallel-audit https://example.com
```

**Selected suites:**
```
/parallel-audit https://example.com --suites marketing,geo,technical
```

**Quick 3-suite sweep:**
```
/parallel-audit https://example.com --quick
```
(Runs: marketing + geo + technical)

## What Claude Does

1. Spawns one background Agent per selected suite, each with the URL and its specific audit skill
2. Waits for all agents to complete
3. Extracts the top issues and scores from each
4. Produces a unified report:
   - **Overall health score** (average across suites)
   - **Cross-suite priority matrix** (top 10 issues ranked by impact × effort)
   - **Suite-by-suite summaries** with individual scores
   - **Quick wins** — issues fixable in under 1 hour
   - **30-day action plan** with owner assignments

## Output Format

```
## Parallel Audit Report — example.com — [date]

### Overall Score: 67/100

### Top 10 Priority Issues
1. [Issue] — [Suite] — Impact: High — Effort: Low
...

### Suite Scores
| Suite | Score | Critical Issues |
|-------|-------|-----------------|
| Marketing | 71 | 3 |
| Technical | 58 | 5 |
...

### 30-Day Action Plan
...
```

## Performance

Sequential audit time: ~25-40 minutes
Parallel audit time: ~8-12 minutes (limited by slowest suite)
