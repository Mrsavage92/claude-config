# Employer Brand PDF Report Generator

## Skill Purpose
Generate a professional, client-ready PDF employer brand audit report using the Python script `scripts/generate_pdf_report.py`. Collects all available audit data, structures it into JSON, and produces a branded PDF with score gauge, bar chart, severity-coded findings, and prioritised action plan.

## When to Use
- User runs `/employer report-pdf`
- User wants a PDF version of the employer brand audit
- User is preparing a deliverable for an HR/People team presentation

## How to Execute

### Step 1: Check for Existing Data
Look for `EMPLOYER-BRAND-AUDIT.md` in the working directory. If found, extract scores, findings, and recommendations. If not, recommend running `/employer audit <company>` first.

### Step 2: Build JSON Structure
The script expects this JSON format:

```json
{
  "brand_name": "Company Name",
  "industry": "Technology",
  "company_size": "350",
  "date": "March 17, 2026",
  "overall_score": 52,
  "executive_summary": "2-4 sentence summary with key stat and revenue/hiring impact.",
  "categories": {
    "Review Reputation": {"score": 38, "weight": "25%"},
    "Careers Page Quality": {"score": 45, "weight": "25%"},
    "EVP & Messaging": {"score": 55, "weight": "15%"},
    "LinkedIn Presence": {"score": 62, "weight": "15%"},
    "Job Posting Quality": {"score": 58, "weight": "10%"},
    "Social & Content": {"score": 48, "weight": "10%"}
  },
  "findings": [
    {"severity": "Critical", "finding": "Description with evidence"},
    {"severity": "High", "finding": "Description with evidence"}
  ],
  "quick_wins": ["Action 1", "Action 2"],
  "medium_term": ["Action 1", "Action 2"],
  "strategic": ["Action 1", "Action 2"]
}
```

### Step 3: Generate the PDF
```bash
python3 scripts/generate_pdf_report.py /tmp/report_data.json "EMPLOYER-BRAND-REPORT-[company].pdf"
```

### Step 4: Clean Up
Remove temporary JSON file after generation.

## PDF Design
Uses the same enterprise design system as the Marketing Suite PDF:
- Accent color: purple (#7C3AED) instead of indigo
- Score gauge with arc visualisation and grade letter
- Horizontal bar chart for category scores
- Color-coded severity findings (Critical=red, High=amber, Medium=blue, Low=grey)
- Tiered action plan with colored accent bars
- Professional header/footer on every page
- Includes key employer brand statistics page
- Methodology and score interpretation tables
