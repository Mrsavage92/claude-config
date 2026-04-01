---
name: privacy-report-pdf
description: Generate a professional PDF from privacy audit data using the shared audit_pdf_engine.py. Produces a client-ready PDF with compliance score gauge, cookie consent analysis, policy review, and prioritised remediation plan.
---

# Privacy Audit PDF Report Generator

## Skill Purpose
Generate a professional, client-ready PDF from privacy and compliance audit data. Uses the shared `audit_pdf_engine.py` for consistent styling across all audit suites.

## When to Use
- User runs `/privacy report-pdf`
- After running `/privacy audit` or `/privacy-audit`
- User wants a client deliverable for privacy compliance findings

## Prerequisites
- **ReportLab** must be installed: `pip install reportlab`
- A completed privacy audit with `PRIVACY-AUDIT.md` in the output directory
- The shared engine: `~/.claude/skills/shared/audit_pdf_engine.py`

## How to Execute

### Step 1: Check for Existing Data
Look for `PRIVACY-AUDIT.md` in the domain output directory (`~/Documents/Claude/{domain}/`). If not found, tell the user to run `/privacy audit <url>` first.

### Step 2: Parse the Markdown Report
Extract from `PRIVACY-AUDIT.md`:
- **Overall Privacy Score** (0-100)
- **Category scores:** Cookie Consent, Privacy Policy, Data Collection, Third-Party Sharing, User Rights (GDPR/APP)
- **Findings** with severity levels (Critical/High/Medium/Low)
- **Quick wins**, medium-term, and strategic recommendations

### Step 3: Build the JSON Data Structure

```json
{
  "url": "https://example.com",
  "date": "March 31, 2026",
  "brand_name": "Example Co",
  "suite": "Privacy & Compliance",
  "overall_score": 48,
  "executive_summary": "2-4 sentence summary of compliance posture and key risks.",
  "categories": {
    "Cookie Consent": { "score": 35, "weight": "25%" },
    "Privacy Policy": { "score": 55, "weight": "25%" },
    "Data Collection": { "score": 42, "weight": "20%" },
    "Third-Party Sharing": { "score": 50, "weight": "15%" },
    "User Rights Compliance": { "score": 60, "weight": "15%" }
  },
  "findings": [
    { "severity": "Critical", "finding": "No cookie consent banner — GDPR/ePrivacy violation" },
    { "severity": "High", "finding": "Privacy policy last updated 2022 — missing required disclosures" }
  ],
  "quick_wins": [
    "Install a cookie consent management platform (CookieYes, Osano, or Cookiebot)",
    "Add data retention period to privacy policy"
  ],
  "medium_term": [
    "Implement DSAR (Data Subject Access Request) workflow",
    "Audit all third-party scripts for data sharing"
  ],
  "strategic": [
    "Achieve full Australian Privacy Act compliance",
    "Implement Privacy by Design across all new features"
  ]
}
```

### Step 4: Generate the PDF

```python
import sys, os
sys.path.insert(0, os.path.expanduser("~/.claude/skills"))
from shared.audit_pdf_engine import generate

generate(
    directory=os.path.expanduser("~/Documents/Claude/{domain}"),
    output_path=os.path.expanduser("~/Documents/Claude/{domain}/PRIVACY-REPORT.pdf"),
    selected_suites=["Privacy"]
)
```

### Step 5: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- **Accent colour:** Red (#DC2626) — signals urgency and regulatory risk
- **Header:** "Privacy & Compliance Audit Report"
- **Disclaimer on every page:** "This report does not constitute legal advice. Consult a qualified privacy lawyer for compliance decisions."
- **Score gauge colours:** Green (80+), Blue (60-79), Yellow (40-59), Red (<40)

## Scoring Guidance

| Category | What It Measures | 80+ | 60-79 | <60 |
|---|---|---|---|---|
| Cookie Consent | Banner present, opt-in vs opt-out, granular controls | Full CMP with granular opt-in | Banner exists but opt-out only | No banner or implied consent |
| Privacy Policy | Completeness, currency, readability, required disclosures | Complete, current, plain language | Present but missing sections | Outdated or missing |
| Data Collection | Forms, tracking pixels, analytics, fingerprinting | Minimal collection, clear purpose | Some unnecessary collection | Excessive or undisclosed |
| Third-Party Sharing | Disclosed sharing, processors listed, DPA in place | All sharing disclosed with DPAs | Partially disclosed | Undisclosed sharing detected |
| User Rights | Access, deletion, portability, opt-out mechanisms | Full rights workflow in place | Some rights supported | No rights mechanism |

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: reportlab` | Run `pip install reportlab` |
| Engine not found | Check `~/.claude/skills/shared/audit_pdf_engine.py` exists |
| Empty PDF | Ensure PRIVACY-AUDIT.md has parseable scores and findings |
