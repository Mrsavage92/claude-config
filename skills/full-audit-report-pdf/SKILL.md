---
name: full-audit-report-pdf
description: Generate a professional PDF from a completed full 8-suite audit using the shared audit_pdf_engine.py. Produces a client-ready PDF with cover page, overall score gauge, suite scorecard bar chart, cross-suite issues, and integrated action plan.
---

# Full Audit PDF Report Generator

## Purpose

Generate a professional, client-ready PDF from a completed `/full-audit` run. Uses the shared `audit_pdf_engine.py` which natively supports full 8-suite reports with automatic weight normalization, cover page, TOC, scorecard, and methodology sections.

## When to Use

- User runs `/full-audit report-pdf`
- User asks for a PDF version of the full audit
- User wants a client deliverable after a `/full-audit` or `/parallel-audit` run

## Prerequisites

- **ReportLab** must be installed: `pip install reportlab`
- A completed full audit with `FULL-AUDIT-REPORT.md` and individual suite reports in the output directory
- The shared engine: `~/.claude/skills/shared/audit_pdf_engine.py`

## How to Execute

### Step 1: Locate the Audit Directory

Find the domain-specific output directory containing the completed audit files:

```
C:\Users\Adam\Documents\Claude\{domain}\
```

Verify these files exist:
- `FULL-AUDIT-REPORT.md` (master report)
- Individual suite reports: `MARKETING-AUDIT.md`, `TECHNICAL-AUDIT.md`, `GEO-AUDIT-REPORT.md`, `SECURITY-AUDIT.md`, `PRIVACY-AUDIT.md`, `REPUTATION-AUDIT.md`, `EMPLOYER-AUDIT.md`, `AI-READINESS-AUDIT.md`

If the master report doesn't exist, tell the user to run `/full-audit <url>` first.

### Step 2: Generate the PDF Using the Shared Engine

The `audit_pdf_engine.py` handles full audits natively. Call it with:

```python
import sys
sys.path.insert(0, os.path.expanduser("~/.claude/skills"))
from shared.audit_pdf_engine import generate

generate(
    directory="C:/Users/Adam/Documents/Claude/{domain}",
    output_path="C:/Users/Adam/Documents/Claude/{domain}/FULL-AUDIT-REPORT.pdf"
)
```

Or via command line:

```bash
python3 -c "
import sys, os
sys.path.insert(0, os.path.expanduser('~/.claude/skills'))
from shared.audit_pdf_engine import generate
generate(
    directory='C:/Users/Adam/Documents/Claude/{domain}',
    output_path='C:/Users/Adam/Documents/Claude/{domain}/FULL-AUDIT-REPORT.pdf'
)
"
```

### Step 3: Verify and Report

After generation, verify the PDF was created and report the file path and size to the user.

## What the PDF Contains

The shared engine produces a comprehensive PDF with:

1. **Cover Page** -- Business name, URL, date, overall Digital Health Score gauge, grade
2. **Table of Contents** -- All 8 suites listed with page numbers
3. **Executive Summary** -- Key findings, cross-suite patterns, top actions
4. **Suite Scorecard** -- Bar chart showing all 8 suite scores with weighted percentages
5. **Suite Detail Pages** -- One page per suite with score, grade, top findings, and recommendations
6. **Cross-Suite Issues** -- Compounding problems that affect multiple suites
7. **Integrated Action Plan** -- Critical (This Week), High Impact (This Month), Strategic (This Quarter)
8. **Methodology** -- Scoring weights, grade scale, data sources

## Score Weights (Full 8-Suite)

| Suite | Weight |
|---|---|
| Marketing | 20% |
| Technical | 18% |
| GEO | 15% |
| Security | 15% |
| Privacy | 12% |
| Reputation | 10% |
| Employer Brand | 5% |
| AI Readiness | 5% |

When generating a pick-and-mix subset (fewer than 8 suites), the engine automatically normalizes weights to sum to 100%.

## Pick-and-Mix Subset PDFs

To generate a PDF for a subset of suites (e.g. only Marketing + GEO + Security):

```python
generate(
    directory="C:/Users/Adam/Documents/Claude/{domain}",
    output_path="C:/Users/Adam/Documents/Claude/{domain}/PARTIAL-AUDIT.pdf",
    selected_suites=["Marketing", "GEO", "Security"]
)
```

Valid suite names: `Marketing`, `Technical`, `GEO`, `Security`, `Privacy`, `Reputation`, `Employer Brand`, `AI Readiness`

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: reportlab` | Run `pip install reportlab` |
| Engine not found | Check `~/.claude/skills/shared/audit_pdf_engine.py` exists |
| Empty PDF | Ensure suite report .md files exist in the directory |
| Missing suite in PDF | That suite's .md report file is missing from the directory |
| Font rendering issues | Engine uses Segoe UI (Windows), Inter (cross-platform), or Helvetica (fallback) |

## Notes

- The PDF uses A4 page size
- Color palette: Navy primary (#1a1a2e), suite-specific accent colors per section
- Score gauges use traffic-light colors: green (80+), blue (60-79), yellow (40-59), red (<40)
- Each page has header, page numbers, and generation date
- The engine parses markdown reports automatically -- no manual JSON assembly needed
