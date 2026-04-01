---
name: employer-report-pdf
description: "Employer Brand PDF Report Generator"
---

# Employer Brand PDF Report Generator

## Skill Purpose
Generate a professional, client-ready PDF employer brand audit report using the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`). The engine reads markdown directly -- no JSON intermediary needed. Produces a branded PDF with score gauge, bar chart, severity-coded findings, and prioritised action plan.

## When to Use
- User runs `/employer report-pdf`
- User wants a PDF version of the employer brand audit
- User is preparing a deliverable for an HR/People team presentation

## How to Execute

### Step 1: Check for Existing Data
Look for `EMPLOYER-AUDIT.md` in `./outputs/{domain}/`. If not found, recommend running `/employer audit <company>` first.

### Step 2: Ensure Markdown Report Exists
The production PDF engine parses the employer brand audit markdown directly to extract scores, findings, and recommendations. Verify the file exists and contains complete audit data. No JSON intermediary is needed.

The engine extracts these scoring categories from the markdown:
| Category | Weight |
|---|---|
| Review Reputation | 25% |
| Careers Page Quality | 25% |
| EVP & Messaging | 15% |
| LinkedIn Presence | 15% |
| Job Posting Quality | 10% |
| Social & Content | 10% |

### Step 3: Generate the PDF
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 7
```

Suite number `7` = Employer Brand.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/EMPLOYER-AUDIT.pdf",
    selected_suites=["Employer Brand"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
Uses the same enterprise design system as all other suite PDFs:
- Accent color: purple (#7C3AED) instead of indigo
- Score gauge with arc visualisation and grade letter
- Horizontal bar chart for category scores
- Color-coded severity findings (Critical=red, High=amber, Medium=blue, Low=grey)
- Tiered action plan with colored accent bars
- Professional header/footer on every page
- Includes key employer brand statistics page
- Methodology and score interpretation tables
