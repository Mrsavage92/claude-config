# Technical Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from technical audit data using the enterprise PDF generator script.

## When to Use
- `techaudit report-pdf`
- After running `techaudit audit`

## How to Execute

### Step 1: Check for existing data
Look for `TECHNICAL-AUDIT.md`. If not found, recommend running `techaudit audit` first.

### Step 2: Build JSON
```json
{
  "brand_name": "Company Name",
  "industry": "E-commerce",
  "company_size": "",
  "date": "March 18, 2026",
  "overall_score": 55,
  "executive_summary": "Summary with key finding.",
  "categories": {
    "Page Speed & Performance": {"score": 45, "weight": "25%"},
    "Mobile Responsiveness": {"score": 60, "weight": "20%"},
    "SEO Technical Health": {"score": 55, "weight": "20%"},
    "Security & SSL": {"score": 70, "weight": "15%"},
    "Accessibility": {"score": 40, "weight": "10%"},
    "Code Quality": {"score": 50, "weight": "10%"}
  },
  "findings": [...],
  "quick_wins": [...],
  "medium_term": [...],
  "strategic": [...]
}
```

### Step 3: Generate
```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "TECHNICAL-REPORT-[company].pdf"
```

## PDF Design
- Accent colour: blue (#2563EB)
- Same enterprise design system: arc gauge, bar chart, severity findings, tiered action plan
- Header reads "Website Technical Audit Report"
