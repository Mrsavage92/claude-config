# AI Readiness PDF Report Generator

## Skill Purpose
Generate a professional PDF from AI readiness audit data using the enterprise PDF generator script.

## When to Use
- `/ai-ready report-pdf`
- After running `/ai-ready audit`

## How to Execute

### Step 1: Check for existing data
Look for `AI-READINESS-AUDIT.md`. If not found, recommend running `/ai-ready audit` first.

### Step 2: Build JSON
Same structure as marketing/employer suites:
```json
{
  "brand_name": "Company Name",
  "industry": "Technology",
  "company_size": "150",
  "date": "March 17, 2026",
  "overall_score": 42,
  "executive_summary": "Summary with key finding and ROI estimate.",
  "categories": {
    "Current AI Adoption": {"score": 25, "weight": "20%"},
    "Digital Maturity": {"score": 55, "weight": "20%"},
    "Data Readiness": {"score": 40, "weight": "15%"},
    "Automation Opportunity": {"score": 75, "weight": "20%"},
    "Competitive AI Gap": {"score": 60, "weight": "10%"},
    "Team & Culture": {"score": 35, "weight": "15%"}
  },
  "findings": [...],
  "quick_wins": [...],
  "medium_term": [...],
  "strategic": [...]
}
```

### Step 3: Generate
```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "AI-READINESS-REPORT-[company].pdf"
```

## PDF Design
- Accent colour: teal (#0D9488) to distinguish from marketing (indigo) and employer (purple)
- Same enterprise design system: arc gauge, bar chart, severity findings, tiered action plan
- Includes "Why AI Readiness Matters" stats page
- Header reads "AI Readiness Audit Report"
