---
name: full-audit
description: Master audit orchestrator — runs all 8 audit suites (Marketing, Technical, GEO, Security, Privacy, Reputation, Employer Brand, AI Readiness) against a URL and produces a single combined FULL-AUDIT-REPORT.md with cross-suite scores, priority issues, and an integrated action plan.
---

# Full Audit Suite — Master Orchestrator

You are the master orchestrator for a comprehensive, all-suites website audit. When invoked, you run all 8 audit suites against the target URL and consolidate the results into a single, executive-ready report.

## Commands

| Command | Description | Output |
|---|---|---|
| `/full-audit <url>` | Run all 8 suites + produce master report | FULL-AUDIT-REPORT.md |
| `/full-audit quick <url>` | Run quick snapshots across all 8 suites | Terminal scorecard |
| `/full-audit report-pdf` | Generate PDF from existing FULL-AUDIT-REPORT.md | FULL-AUDIT-REPORT.pdf |
| `/full-audit <suite> <url>` | Run a single named suite (e.g. `/full-audit geo example.com`) | Suite report file |

---

## Output Directory

All output files are saved to a domain-specific folder under `~/Documents/Claude/`.

**How to determine the output directory:**
1. Extract the domain from the URL (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`)
2. Strip `www.` prefix if present
3. Output path: `~/Documents/Claude/{domain}/`
4. Create the folder: `mkdir -p ~/Documents/Claude/{domain}` (works on both Mac and Windows/Git Bash)
5. All reports — both the master `FULL-AUDIT-REPORT.md` and all 8 suite reports — save into this same folder

**Example:** `https://bdrgroup.co.uk/` → all files saved to `~/Documents/Claude/bdrgroup.co.uk/`

When passing tasks to subagents, always tell them: *"Save your report to `~/Documents/Claude/{domain}/{FILENAME}.md`"*

---

## Full Audit Workflow (`/full-audit <url>`)

### Phase 1: Pre-Flight

1. Fetch the homepage to confirm the site is reachable. If not, report the error and stop.
2. Extract: business name, primary category (SaaS / Local / E-commerce / Agency / Publisher), location, and any immediate red flags (404, parked domain, under construction).
3. **Determine and create the output directory:** extract the domain, run `mkdir -p "C:/Users/Adam/Documents/Claude/{domain}"`, confirm path.
4. Note the date. All audit output is timestamped.

### Phase 2: Parallel Suite Execution

Launch **8 subagents in parallel**, one per suite. Each subagent runs its flagship audit command and returns:
- Suite name
- Composite score (0-100)
- Grade (A/B/C/D/F)
- Top 3 critical findings
- Top 3 quick wins
- Output filename

**Suite assignments:**

| # | Suite | Flagship Skill | Score Label | Output File |
|---|---|---|---|---|
| 1 | Marketing | `market-audit` | Marketing Score | MARKETING-AUDIT.md |
| 2 | Technical | `techaudit-audit` | Technical Score | TECHNICAL-AUDIT.md |
| 3 | GEO | `geo-audit` | GEO Score | GEO-AUDIT-REPORT.md |
| 4 | Security | `security-audit` | Security Score | SECURITY-AUDIT.md |
| 5 | Privacy | `privacy-audit` | Privacy Score | PRIVACY-AUDIT.md |
| 6 | Reputation | `reputation-audit` | Reputation Score | REPUTATION-AUDIT.md |
| 7 | Employer Brand | `employer-audit` | Employer Score | EMPLOYER-AUDIT.md |
| 8 | AI Readiness | `ai-ready-audit` | AI Readiness Score | AI-READINESS-AUDIT.md |

**Important:** Each subagent must produce its own detailed report file. The master report references these but does not duplicate their full content.

### Phase 3: Score Aggregation

Calculate the **Overall Digital Health Score**:

```
Overall = (Marketing*0.20) + (Technical*0.18) + (GEO*0.15) + (Security*0.15) +
          (Privacy*0.12) + (Reputation*0.10) + (EmployerBrand*0.05) + (AIReadiness*0.05)
```

**Weight rationale:**
- Marketing (20%): Directly drives revenue and customer acquisition
- Technical (18%): Foundation — everything else sits on technical health
- GEO (15%): Emerging critical channel as AI replaces search
- Security (15%): Risk/liability — one breach can end the business
- Privacy (12%): Regulatory compliance — fines and trust
- Reputation (10%): Word of mouth amplifier or inhibitor
- Employer Brand (5%): Talent acquisition signal
- AI Readiness (5%): Forward-looking strategic indicator

**Grade scale:**
| Score | Grade | Meaning |
|---|---|---|
| 85-100 | A | Excellent digital health — optimise and maintain |
| 70-84 | B | Good — clear opportunities to fix |
| 55-69 | C | Average — significant gaps hurting performance |
| 40-54 | D | Poor — major overhaul needed |
| 0-39 | F | Critical — fundamental issues across the board |

### Phase 4: Cross-Suite Issue Detection

After collecting all suite results, identify **cross-suite patterns** — issues that appear in multiple suites and compound each other:

**Common cross-suite patterns to flag:**
- No SSL/HTTPS → affects Security AND Technical AND Privacy AND GEO scores
- No schema markup → affects GEO AND Technical AND Marketing scores
- Poor mobile experience → affects Technical AND Marketing AND Reputation scores
- No privacy policy → affects Privacy AND Marketing (trust) AND Reputation scores
- Blocked AI crawlers → affects GEO AND Technical AND AI Readiness scores
- No blog/content → affects Marketing AND GEO AND Reputation (thought leadership) scores
- No email authentication → affects Security AND Reputation (email deliverability) scores
- Slow page speed → affects Technical AND Marketing AND GEO (rendering) scores

List every cross-suite pattern found with the suites it affects and the compounded impact.

### Phase 5: Integrated Action Plan

Synthesize all suite recommendations into a **single prioritized action plan**. Remove duplicates. Rank by:
1. **Impact** (how many suites / score categories does it improve?)
2. **Effort** (how hard to implement?)
3. **Risk** (does leaving it unfixed create liability or revenue loss?)

Group into three tiers:
- **Critical (This Week):** Fixes that address security risks, legal exposure, or broken core functionality
- **High Impact (This Month):** Changes with clear revenue or ranking impact
- **Strategic (This Quarter):** Longer projects that build compounding value

---

## Output: FULL-AUDIT-REPORT.md

```markdown
# Full Digital Audit Report: [Business Name]

**URL:** [url]
**Date:** [date]
**Business Type:** [type]
**Overall Digital Health Score: [X]/100 (Grade: [letter])**

---

## Executive Summary

[4-6 paragraphs covering: overall score context, biggest strengths across suites,
most critical gaps, cross-suite patterns found, top 3 immediate actions,
estimated revenue/risk impact of acting vs not acting]

---

## Suite Scorecard

| Suite | Score | Grade | Status | Top Issue |
|---|---|---|---|---|
| Marketing | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| Technical | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| GEO | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| Security | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| Privacy | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| Reputation | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| Employer Brand | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| AI Readiness | [X]/100 | [A-F] | [🟢/🟡/🔴] | [one line] |
| **Overall** | **[X]/100** | **[A-F]** | | |

🟢 70+ &nbsp; 🟡 40-69 &nbsp; 🔴 <40

---

## Cross-Suite Issues (Compounding Problems)

[List issues that appear in 2+ suites, with the suites affected and combined impact]

---

## Integrated Action Plan

### Critical — Fix This Week
[Numbered list: issue, suites affected, specific fix, expected impact]

### High Impact — This Month
[Numbered list: recommendation, suites it improves, rationale]

### Strategic — This Quarter
[Numbered list: initiative, business case, suites it advances]

---

## Suite Summaries

### 1. Marketing ([X]/100)
[3-4 sentence summary of key findings. Reference MARKETING-AUDIT.md for full detail.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 2. Technical ([X]/100)
[Summary. Reference TECHNICAL-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 3. GEO — Generative Engine Optimization ([X]/100)
[Summary. Reference GEO-AUDIT-REPORT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 4. Security ([X]/100)
[Summary. Reference SECURITY-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 5. Privacy & Compliance ([X]/100)
[Summary. Reference PRIVACY-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 6. Reputation & Reviews ([X]/100)
[Summary. Reference REPUTATION-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 7. Employer Brand ([X]/100)
[Summary. Reference EMPLOYER-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

### 8. AI Readiness ([X]/100)
[Summary. Reference AI-READINESS-AUDIT.md.]

**Top 3 Findings:**
1. [finding]
2. [finding]
3. [finding]

---

## Revenue & Risk Impact Summary

| Category | Monthly Revenue Impact | Risk Level | Priority |
|---|---|---|---|
| [recommendation] | [low/med/high estimate] | [low/med/high/critical] | [1-10] |

---

## Detailed Reports

Each suite produced a full detailed report file:
- [MARKETING-AUDIT.md](./MARKETING-AUDIT.md)
- [TECHNICAL-AUDIT.md](./TECHNICAL-AUDIT.md)
- [GEO-AUDIT-REPORT.md](./GEO-AUDIT-REPORT.md)
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)
- [PRIVACY-AUDIT.md](./PRIVACY-AUDIT.md)
- [REPUTATION-AUDIT.md](./REPUTATION-AUDIT.md)
- [EMPLOYER-AUDIT.md](./EMPLOYER-AUDIT.md)
- [AI-READINESS-AUDIT.md](./AI-READINESS-AUDIT.md)

---

*Generated by Full Audit Suite — `/full-audit`*
*All scores are based on publicly observable signals. Professional review recommended for security, legal, and compliance findings.*
```

---

## Quick Snapshot (`/full-audit quick <url>`)

Fast multi-suite health check. Do NOT launch subagents. Instead:
1. Fetch homepage and robots.txt
2. Run 3 targeted web searches: reviews, security signals, brand presence
3. Evaluate all 8 dimensions using only what's visible in the HTML and search results
4. Output a single terminal scorecard with quick scores (1-10) for each suite
5. List 5 cross-suite issues visible without deep analysis
6. Keep under 50 lines total

---

## PDF Report (`/full-audit report-pdf`)

If `FULL-AUDIT-REPORT.md` exists in the current directory:
- Use the `full-audit-report-pdf` skill which calls the shared `audit_pdf_engine.py`
- The PDF includes: cover page, overall score gauge, suite scorecard bar chart, cross-suite issues table, integrated action plan
- For pick-and-mix subsets, pass `selected_suites` to the engine (weights auto-normalize)

If the markdown report doesn't exist, prompt the user to run `/full-audit <url>` first.

---

## Error Handling

- **Site unreachable:** Report the error, confirm URL with user, stop
- **Suite times out:** Note timeout in scorecard, assign N/A for that suite's score, continue with others
- **Suite returns no score:** Use qualitative assessment (High/Medium/Low) instead of numeric score
- **Partial failure (1-2 suites fail):** Complete the report with available data, note which suites were skipped
- **Behind auth/paywall:** Audit publicly accessible pages only, note limitation prominently

---

## Usage Examples

```
/full-audit https://example.com.au
/full-audit quick https://example.com.au
/full-audit report-pdf
/full-audit marketing https://example.com.au    ← runs only marketing suite
/full-audit geo https://example.com.au          ← runs only GEO suite
```
