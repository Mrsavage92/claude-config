---
name: techaudit-report-pdf
description: "Technical Audit PDF Report Generator"
---

# Technical Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from technical audit data using the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`). The engine reads markdown directly -- no JSON intermediary needed.

## When to Use
- `techaudit report-pdf`
- After running `techaudit audit`

## How to Execute

### Step 1: Check for existing data
Look for `TECHNICAL-AUDIT.md` in `./outputs/{domain}/`. If not found, recommend running `techaudit audit` first.

### Step 2: Ensure markdown report exists
The production PDF engine parses `TECHNICAL-AUDIT.md` directly to extract scores, findings, and recommendations. Verify the file exists and contains complete audit data before proceeding. No JSON intermediary is needed.

### Step 3: Generate the PDF
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 2
```

Suite number `2` = Technical.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/TECHNICAL-REPORT.pdf",
    selected_suites=["Technical"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- Accent colour: blue (#2563EB)
- Same enterprise design system: arc gauge, bar chart, severity findings, tiered action plan
- Header reads "Website Technical Audit Report"

## Scoring Categories
| Category | Weight |
|---|---|
| Page Speed & Performance | 25% |
| Mobile Responsiveness | 20% |
| SEO Technical Health | 20% |
| Security & SSL | 15% |
| Accessibility | 10% |
| Code Quality | 10% |
