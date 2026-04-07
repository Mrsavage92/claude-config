---
name: full-audit-synthesis
description: "Synthesize a FULL-AUDIT-REPORT.md from individual suite markdown reports. Produces consultancy-quality cross-suite narrative with compounding issues, integrated action plan, and aggregated revenue impact. Called by the audit command before combined PDF generation."
---

# Full Audit Synthesis Skill

## Report Tone — Write for Business Owners, Not Auditors

This combined report is the document a CEO reads. Apply these rules strictly:

1. **Lead every finding with business impact** — revenue, customers, time, risk
2. **No evidence tags in report text** — no [Confirmed] or [Strong inference]. Use HTML comments only: <!-- Confirmed -->
3. **Every action names WHO does it and HOW LONG it takes**
4. **Use plain severity labels:** 🔴 Fix immediately, 🟠 Fix this month, 🟡 Plan for next quarter
5. **Translate all technical terms** — "your emails can be faked by scammers" not "missing DMARC enforcement"
6. **Write like explaining to a smart friend over coffee**

You read all individual suite audit markdown reports from a directory and write a single FULL-AUDIT-REPORT.md that synthesizes them into a consultancy-quality combined report. This file is then rendered into a polished PDF by the production engine.

## When This Skill Is Invoked

- The user explicitly requests a "full audit", "combined audit", or "combined PDF"
- The audit command triggers this as Step 5.75, after individual suite reports are validated but before PDF generation
- There must be at least 2 suite markdown reports in the output directory

## Input

All suite markdown files in `./outputs/{domain}/`:

| File | Suite |
|------|-------|
| `MARKETING-AUDIT.md` | Marketing |
| `TECHNICAL-AUDIT.md` | Technical |
| `GEO-AUDIT-REPORT.md` | GEO |
| `SECURITY-AUDIT.md` | Security |
| `PRIVACY-AUDIT.md` | Privacy |
| `REPUTATION-AUDIT.md` | Reputation |
| `EMPLOYER-AUDIT.md` | Employer Brand |
| `AI-READINESS-AUDIT.md` | AI Readiness |

Read EVERY file that exists. Do not skip any.

## Output

Save to: `./outputs/{domain}/FULL-AUDIT-REPORT.md`

## How to Execute

### Phase 1: Read All Suite Reports

Read every suite markdown file in the directory. For each one, extract:

1. **Overall score** (look for `X/100` in the first 20 lines)
2. **Grade** (A/B/C/D/F)
3. **Top 3 findings** (from Quick Wins or Critical Issues sections)
4. **Revenue/impact estimates** (scan for tables with £/$/monthly/annual amounts)
5. **Key evidence** (look for [Confirmed] and [Strong inference] tagged items)

Build a working data map before writing anything:

```
SUITE SCORES:
  Marketing:      XX/100 (Grade X) — top issue: ...
  Technical:      XX/100 (Grade X) — top issue: ...
  ...

CROSS-REFERENCES TO CHECK:
  Trustpilot rating: Marketing says X, Reputation says Y
  Glassdoor rating: Marketing says X, Employer says Y
  Security headers: Technical says X, Security says Y
  Cookie consent: Privacy says X, Technical says Y

REVENUE ESTIMATES FOUND:
  Marketing: £X–£Y/month (source: Revenue Impact Summary table)
  Security: £X–£Y/month (source: risk avoidance)
  ...
```

### Phase 2: Cross-Reference and Reconcile

Before writing the report:

1. **Check factual consistency** — if two suites state different values for the same fact (e.g. Trustpilot rating), use the value from the suite with direct evidence (Reputation over Marketing for review data, Security over Technical for header data)
2. **Identify compounding issues** — problems that appear in 3+ suite reports. For each, estimate the combined score drag: "If this were fixed, [Suite A] would gain ~X points, [Suite B] ~Y points, improving the overall by ~Z"
3. **Identify the top 3 quick wins** — actions that would improve the most suites simultaneously, sorted by effort (lowest first)

### Phase 3: Write FULL-AUDIT-REPORT.md

Follow this EXACT template. Every section is mandatory.

```markdown
# Full Digital Audit Report: {Brand Name}

**URL:** {url}
**Date:** {date}
**Business Type:** {type}
**Location:** {location}
**Overall Digital Health Score: {weighted_average}/100 (Grade: {grade})**

---

## Executive Summary

[Paragraph 1 — Score context]
{Brand} scores {score}/100 across {N} audit dimensions — a {grade} grade. [What this means for a company of this size/type. Compare to what you'd expect from a company with their credentials.]

[Paragraph 2 — Strengths]
The strongest performance is in {Suite} ({score}) and {Suite} ({score}). [Name specific genuine assets with evidence — not generic praise. Quote real data: review ratings, client names, team size, years of operation.]

[Paragraph 3 — Critical failures]
However, {N} suites scored below {threshold}: {Suite} ({score}), {Suite} ({score}). [Name the most commercially damaging finding with specific evidence. If the company sells services related to their weakness (e.g. cybersecurity vendor with no security headers), call this out explicitly as a credibility risk.]

[Paragraph 4 — Cross-suite patterns]
Cross-suite analysis reveals {N} compounding issue clusters where a single unfixed problem drags down {N} suites simultaneously. The most impactful: {name top 2-3 clusters with the suites they affect}. Fixing these clusters delivers disproportionate improvement — {estimate: "a single sprint could move the overall score from X to Y"}.

[Paragraph 5 — Top actions and revenue]
Top 3 immediate actions: (1) {action — achievable timeframe, cost}; (2) {action}; (3) {action}. The conservative combined revenue impact of the full recommendation set is {£X–£Y/month} in {what: improved conversion, reduced risk, new channel visibility}.

---

## Suite Scorecard

| Suite | Score | Grade | Status | Top Issue |
|---|---|---|---|---|
| {Suite} | {score}/100 | {grade} | {🟢🟡🔴} | {one-line top issue from the suite report} |
[Repeat for each suite]
| **Overall** | **{weighted}/100** | **{grade}** | | |

🟢 70+   🟡 40–69   🔴 <40

---

## Cross-Suite Issues (Compounding Problems)

These issues each appear in multiple audit dimensions. Fixing one item improves several scores simultaneously.

### 1. {Issue Title} — affects {N} suites
**Suites:** {Suite} · {Suite} · {Suite}

{3-4 sentences describing the issue with specific evidence from the reports. For each key claim, track confidence with HTML comments only (<!-- Confirmed -->, <!-- Strong inference -->, <!-- Unverified -->). Never show these tags in the report text. End with score drag estimate: "Combined score impact: estimated −X {Suite}, −Y {Suite}, −Z {Suite}. Fixing this alone could improve the overall score by ~{N} points."}

[Repeat for 5-8 compounding issues, sorted by number of suites affected]

---

## Integrated Action Plan

### 🔴 Fix Immediately — Costing You Money Right Now
| # | Action | Suites Improved | How | Impact |
|---|--------|-----------------|-----|--------|
| 1 | {Specific action name} | {Suite, Suite} | {How to do it — time, cost, tool} | {What it fixes — specific outcome} |
[4-6 critical actions]

### 🟠 Fix This Month — You're Missing Opportunities
| # | Action | Suites Improved | How | Impact |
|---|--------|-----------------|-----|--------|
[4-6 high actions]

### 🟡 Plan for Next Quarter — Worth Doing, Not Urgent
| # | Action | Suites Improved | How | Impact |
|---|--------|-----------------|-----|--------|
[3-5 strategic actions]

---

## Suite Summaries

### Marketing — {score}/100 ({grade})
{5-6 sentences summarising the Marketing audit. Sentence 1: overall positioning and what the score means. Sentence 2: biggest strength with specific evidence (quote a stat or finding). Sentence 3: biggest gap with specific evidence. Sentence 4: what this is costing them (revenue estimate if available). Sentence 5: the single most impactful fix. Sentence 6: reference to individual report. See MARKETING-AUDIT.md for full detail.}

### Technical — {score}/100 ({grade})
{5-6 sentences following the same structure. Reference TECHNICAL-AUDIT.md.}

[Repeat for every suite that was audited — 5-6 sentences each, same structure]

---

## Revenue & Risk Impact Summary

| Recommendation | Monthly Impact | Risk Level | Source Suite | Priority |
|---|---|---|---|---|
| {Action} | {£X–£Y} | {🔴🟠🟡} | {Suite} | {1-N} |
[10-15 rows aggregating from individual suite Revenue/Impact tables]

**Conservative total monthly impact (critical + high items): £{X}–£{Y}/month**

---

## Detailed Reports

Individual suite reports with full evidence and analysis:

- [MARKETING-AUDIT.md](./MARKETING-AUDIT.md)
- [TECHNICAL-AUDIT.md](./TECHNICAL-AUDIT.md)
[List all suite reports that exist]

---

*Generated by Full Audit Suite · All scores based on publicly observable signals · Professional review recommended.*
```

## Rules (Non-Negotiable)

1. **Read before writing** — Do not start writing until you have read every suite report completely and built the data map
2. **Cross-reference everything** — If Reputation says Trustpilot is 4.6/5 and Marketing says 4.0/5, resolve it. Use the suite with direct evidence.
3. **Score drag must be estimated** — Every compounding issue needs "fixing this would improve X by ~N points". Calculate from the category rubrics.
4. **Revenue must come from the reports** — Do not invent revenue estimates. Aggregate from individual suite Revenue Impact tables. If a suite has no revenue table, note it as "not estimated".
5. **Tone must be business-owner friendly** — This is the document a CEO reads. Lead with business impact, not technical jargon. Name specific actions with who does them, cost, and timeframe. No evidence tags in client-facing text.
6. **Evidence confidence tracks internally only** — If a finding was uncertain in the suite report, keep it uncertain in the synthesis. Track confidence with HTML comments <!-- Confirmed --> or <!-- Strong inference --> but NEVER show these tags in client-facing text.
7. **No legal certainty** — Privacy and security findings must retain their disclaimers.
8. **Subset awareness** — This skill works for any combination of 2+ suites, not just all 8. If only 3 suites were audited, the cross-suite analysis covers only those 3. Adjust language accordingly ("across 3 audit dimensions" not "across 8").

## Template Compliance (Self-Check Before Saving)

Your report MUST contain ALL of these sections:

- [ ] Executive Summary (5 paragraphs: score context, strengths, failures, cross-suite patterns, top actions + revenue)
- [ ] Suite Scorecard (table with every audited suite + overall, with status emoji)
- [ ] Cross-Suite Issues (5-8 named compounding clusters with score drag estimates)
- [ ] Integrated Action Plan — Critical (table with 4-6 actions, cost/time/impact)
- [ ] Integrated Action Plan — High Impact (table with 4-6 actions)
- [ ] Integrated Action Plan — Strategic (table with 3-5 actions)
- [ ] Suite Summaries (3-4 sentences per suite with score and reference)
- [ ] Revenue & Risk Impact Summary (table with 10-15 rows from suite reports)
- [ ] Detailed Reports (links to individual reports)
