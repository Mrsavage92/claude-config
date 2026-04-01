---
name: reputation-report-pdf
description: "Reputation Audit PDF Report Generator"
---

# Reputation Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from reputation audit data using the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`). The engine reads markdown directly -- no JSON intermediary needed.

## When to Use
- `reputation report-pdf`
- After running `reputation audit`

## How to Execute

### Step 1: Check for existing data
Look for `REPUTATION-AUDIT.md` in `./outputs/{domain}/`. If not found, recommend running `reputation audit` first.

### Step 2: Ensure markdown report exists
The production PDF engine parses `REPUTATION-AUDIT.md` directly to extract scores, findings, and recommendations. Verify the file exists and contains complete audit data. No JSON intermediary is needed.

The engine extracts these scoring categories from the markdown:
| Category | Weight |
|---|---|
| Google Business Profile | 25% |
| Industry Platforms | 25% |
| Social Media Reputation | 15% |
| Response Management | 15% |
| Review Velocity & Trend | 10% |
| Competitive Position | 10% |

### Step 3: Generate the PDF
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 6
```

Suite number `6` = Reputation.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/REPUTATION-REPORT.pdf",
    selected_suites=["Reputation"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- Accent colour: amber (#D97706)
- Same enterprise design system
- Header reads "Reputation & Review Audit Report"
