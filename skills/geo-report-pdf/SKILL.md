---
name: geo-report-pdf
description: Generate a professional PDF report from GEO audit data using the production PDF engine. Creates a polished, client-ready PDF with score gauges, bar charts, platform readiness visualizations, color-coded tables, and prioritized action plans.
---

# GEO PDF Report Generator

## Purpose

This skill generates a professional, visually polished PDF report from GEO audit data. The production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`) reads markdown directly -- no JSON intermediary is needed. The PDF includes score gauges, bar charts, platform readiness visualizations, color-coded tables, and a prioritized action plan -- ready to deliver directly to clients.

## Prerequisites

- **ReportLab** must be installed: `pip install reportlab`
- The production PDF engine: `~/.claude/skills/shared/audit_pdf_engine.py` and `~/.claude/skills/shared/generate_suite_pdfs.py`
- Run a full GEO audit first (using `/geo-audit`) to have data to include in the report

## How to Generate a PDF Report

### Step 1: Collect Audit Data

After running a full `/geo-audit`, verify the markdown report exists in the output directory:

- `GEO-AUDIT-REPORT.md` in `./outputs/{domain}/`

The engine parses the markdown to extract:
- Overall GEO score
- Category scores (citability, brand authority, content/E-E-A-T, technical, schema, platform)
- Platform readiness scores (Google AIO, ChatGPT, Perplexity, Gemini, Bing Copilot)
- AI crawler access status
- Key findings with severity levels
- Quick wins, medium-term, and strategic action items
- Executive summary

### Step 2: Ensure Markdown Report Exists

Verify that `GEO-AUDIT-REPORT.md` exists in `./outputs/{domain}/`. If it does not exist, tell the user to run `/geo-audit <url>` first, then come back for the PDF. The production engine reads markdown directly -- no JSON assembly is needed.

### Step 3: Generate the PDF

```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 3
```

Suite number `3` = GEO.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/GEO-AUDIT.pdf",
    selected_suites=["GEO"]
)
```

### Step 4: Return the PDF Path

After generation, tell the user where the PDF was saved and its file size.

## Complete Workflow Example

When the user runs this skill, follow this exact sequence:

1. **Check for existing audit data** -- Look for GEO audit reports in the output directory:
   - `GEO-AUDIT-REPORT.md`
   - Or any `GEO-*.md` files from a recent audit

2. **If no audit data exists** -- Tell the user to run `/geo-audit <url>` first, then come back for the PDF.

3. **If audit data exists** -- Proceed directly to PDF generation. The engine handles all parsing.

4. **Run the PDF generator:**
   ```bash
   python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 3
   ```

5. **Report success** -- Tell the user the PDF was generated, its location, and file size.

## If the User Provides a URL

If the user runs `/geo-report-pdf https://example.com` with a URL:
1. First run a full audit: invoke the `geo-audit` skill for that URL
2. Then generate the PDF as described above

## PDF Contents

The generated PDF includes:
- **Cover Page** -- Brand name, URL, date, overall GEO score with visual gauge
- **Executive Summary** -- Key findings and top recommendations
- **Score Breakdown** -- Table and bar chart of all 6 scoring categories
- **AI Platform Readiness** -- Visual horizontal bar chart per platform with scores
- **AI Crawler Access** -- Color-coded table (green=allowed, red=blocked)
- **Key Findings** -- Severity-coded findings list (critical/high/medium/low)
- **Prioritized Action Plan** -- Quick wins, medium-term, and strategic initiatives
- **Appendix** -- Methodology, data sources, and glossary

## Notes

- If ReportLab is not installed, run: `pip install reportlab`
- The PDF is designed for US Letter size (8.5" x 11")
- Color palette: Navy primary (#1a1a2e), Blue accent (#0f3460), Coral highlight (#e94560), Green success (#00b894)
- Each page has a header line, page numbers, "Confidential" watermark, and generation date
- Score gauges use traffic-light colors: green (80+), blue (60-79), yellow (40-59), red (below 40)
