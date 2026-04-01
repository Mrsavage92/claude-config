---
name: privacy-report-pdf
description: "Privacy Audit PDF Report Generator"
---

# Privacy Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from privacy audit data using the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`). The engine reads markdown directly -- no JSON intermediary needed.

## When to Use
- `privacy report-pdf`
- After running `privacy audit`

## How to Execute

### Step 1: Check for existing data
Look for `PRIVACY-AUDIT.md` in `./outputs/{domain}/`. If not found, recommend running `privacy audit` first.

### Step 2: Ensure markdown report exists
The production PDF engine parses `PRIVACY-AUDIT.md` directly to extract compliance scores, cookie consent analysis, policy review findings, and remediation priorities. Verify the file exists and contains complete audit data. No JSON intermediary is needed.

### Step 3: Generate the PDF
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 5
```

Suite number `5` = Privacy.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/PRIVACY-AUDIT.pdf",
    selected_suites=["Privacy"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- Accent colour: red (#DC2626) - signals urgency/risk
- Same enterprise design system
- Header reads "Privacy & Compliance Audit Report"
- Includes disclaimer on every page: "This report does not constitute legal advice."
