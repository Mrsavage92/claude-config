# Reputation Audit PDF Report Generator

## Skill Purpose
Generate a professional PDF from reputation audit data.

## When to Use
- `reputation report-pdf`
- After running `reputation audit`

## How to Execute

### Step 1: Check for existing data
Look for `REPUTATION-AUDIT.md`. If not found, recommend running `reputation audit` first.

### Step 2: Build JSON
```json
{
  "brand_name": "Business Name",
  "industry": "Hospitality",
  "company_size": "",
  "date": "March 18, 2026",
  "overall_score": 62,
  "executive_summary": "Summary.",
  "categories": {
    "Google Business Profile": {"score": 70, "weight": "25%"},
    "Industry Platforms": {"score": 55, "weight": "25%"},
    "Social Media Reputation": {"score": 65, "weight": "15%"},
    "Response Management": {"score": 40, "weight": "15%"},
    "Review Velocity & Trend": {"score": 60, "weight": "10%"},
    "Competitive Position": {"score": 55, "weight": "10%"}
  },
  "findings": [...],
  "quick_wins": [...],
  "medium_term": [...],
  "strategic": [...]
}
```

### Step 3: Generate
```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "REPUTATION-REPORT-[company].pdf"
```

## PDF Design
- Accent colour: amber (#D97706)
- Same enterprise design system
- Header reads "Reputation & Review Audit Report"
