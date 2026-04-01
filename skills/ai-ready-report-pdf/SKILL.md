---
name: ai-ready-report-pdf
description: "AI Readiness PDF Report Generator"
---

# AI Readiness PDF Report Generator

## Skill Purpose
Generate a professional PDF from AI readiness audit data using the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`). The engine reads markdown directly -- no JSON intermediary needed.

## When to Use
- `/ai-ready report-pdf`
- After running `/ai-ready audit`

## How to Execute

### Step 1: Check for existing data
Look for `AI-READINESS-AUDIT.md` in `./outputs/{domain}/`. If not found, recommend running `/ai-ready audit` first.

### Step 2: Ensure markdown report exists
The production PDF engine parses `AI-READINESS-AUDIT.md` directly to extract scores, findings, and recommendations. Verify the file exists and contains complete audit data. No JSON intermediary is needed.

The engine extracts these scoring categories from the markdown:
| Category | Weight |
|---|---|
| Current AI Adoption | 20% |
| Digital Maturity | 20% |
| Data Readiness | 15% |
| Automation Opportunity | 20% |
| Competitive AI Gap | 10% |
| Team & Culture | 15% |

### Step 3: Generate the PDF
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 8
```

Suite number `8` = AI Readiness.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/AI-READINESS-AUDIT.pdf",
    selected_suites=["AI Readiness"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- Accent colour: teal (#0D9488) to distinguish from marketing (indigo) and employer (purple)
- Same enterprise design system: arc gauge, bar chart, severity findings, tiered action plan
- Includes "Why AI Readiness Matters" stats page
- Header reads "AI Readiness Audit Report"
