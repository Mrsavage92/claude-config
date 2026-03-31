# Privacy Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from privacy audit data.

## When to Use
- `privacy report-pdf`
- After running `privacy audit`

## How to Execute

### Step 1: Check for existing data
Look for `PRIVACY-AUDIT.md`. If not found, recommend running `privacy audit` first.

### Step 2: Build JSON
Same structure as other suites with privacy-specific categories.

### Step 3: Generate
```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "PRIVACY-REPORT-[company].pdf"
```

## PDF Design
- Accent colour: red (#DC2626) - signals urgency/risk
- Same enterprise design system
- Header reads "Privacy & Compliance Audit Report"
- Includes disclaimer on every page: "This report does not constitute legal advice."
