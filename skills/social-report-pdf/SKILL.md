---
name: social-report-pdf
description: "Social Footprint Audit PDF Report Generator — converts a completed SOCIAL-AUDIT.md into a client-ready PDF with cover page, composite score gauge, 8-category scorecard, per-platform verdict matrix, and 90-day playbook. Uses the production audit PDF engine."
---

# Social Footprint Audit PDF Report Generator

You generate a professional, client-ready PDF from a completed SOCIAL-AUDIT.md report using the shared audit PDF engine.

## When This Skill Is Invoked

- Automatically at the end of `/social-audit`
- Manually via `/social-report-pdf <domain>` if the client wants a re-export
- As part of `/full-audit` combined PDF generation

---

## Prerequisites

1. `SOCIAL-AUDIT.md` exists in the target domain output folder (e.g. `./outputs/glossbeauty.com.au/SOCIAL-AUDIT.md`)
2. The shared PDF engine is available at `~/.claude/skills/shared/audit_pdf_engine.py`
3. The shared suite generator is at `~/.claude/skills/shared/generate_suite_pdfs.py`

If the markdown report doesn't exist, halt and ask the user to run `/social-audit <url>` first.

---

## Execution

### Step 1: Locate the report

Derive domain from the URL or user input. Look for:
```
{output_root}/{domain}/SOCIAL-AUDIT.md
```

If not found in `./outputs/`, check `CLAUDE_AUDIT_OUTPUT_ROOT` env var.

### Step 2: Extract scores

Call `~/.claude/skills/shared/extract_scores.py` with the SOCIAL-AUDIT.md path. It parses the score breakdown table and returns the 8 category scores + composite.

Expected scores to extract:
- Overall Social Footprint Score (composite)
- Presence Breadth
- Profile Quality
- Activity & Cadence
- Content Quality
- Engagement Depth
- Platform-Fit
- Competitive Position
- Brand Consistency

Plus 8 per-platform verdicts (KEEP / FIX / START / KILL / DEFEND).

### Step 3: Generate PDF via shared engine

Use `~/.claude/skills/shared/generate_suite_pdfs.py` with suite-specific config:

```python
SUITE_CONFIG = {
    "suite_name": "Social Footprint Audit",
    "suite_slug": "social",
    "input_file": "SOCIAL-AUDIT.md",
    "output_file": "SOCIAL-AUDIT.pdf",
    "cover_subtitle": "Social Media Digital Footprint Report",
    "score_label": "Social Footprint Score",
    "categories": [
        ("Presence Breadth", 15),
        ("Profile Quality", 15),
        ("Activity & Cadence", 15),
        ("Content Quality", 15),
        ("Engagement Depth", 15),
        ("Platform-Fit", 10),
        ("Competitive Position", 10),
        ("Brand Consistency", 5),
    ],
    "special_sections": [
        "platform_verdict_matrix",  # renders the 8-platform verdict table
        "competitor_benchmark",      # renders the competitor comparison table
        "90_day_playbook",           # renders phased action plan
    ]
}
```

### Step 3.5: Pre-PDF Validation (MANDATORY)

Before generating the PDF, run the social-audit-specific validator:
```bash
python3 ~/.claude/skills/social-audit/scripts/validate_social_audit.py "{report_path}/SOCIAL-AUDIT.md"
```

- **Exit 0 (PASS):** Proceed to PDF generation.
- **Exit 1 (WARN):** Note the warnings, proceed, and add a footer note to the PDF: "See warnings in validator output — some fields are estimated."
- **Exit 2 (FAIL):** **STOP.** Do not generate PDF. Return to the audit engineer with the failing checks. Common failures: missing required sections, score below 10/100 (possible discovery error), no follower counts in report.

**Scope banner rendering:** If the SOCIAL-AUDIT.md contains the text "Audit scope:" or `<!-- Estimated -->`, add a light-grey banner box as the FIRST element after the cover page in the PDF, quoting the scope note verbatim. This ensures clients understand data limitations before reading findings.

### Step 4: Required PDF sections (in order)

1. **Cover page**
   - Brand name + logo placeholder
   - "Social Footprint Audit" title
   - Date
   - Composite Social Footprint Score (large, centred) + grade letter
   - Industry + audience line
   - AuditHQ branding

2. **Composite score gauge**
   - 0-100 gauge visualisation with colour-coded bands (red/amber/green)
   - Grade letter prominent
   - 1-paragraph executive interpretation

3. **Category scorecard (bar chart)**
   - 8 bars — one per category
   - Each bar colour-coded by score band
   - Weighted contribution shown

4. **Platform verdict matrix**
   - 8-row table: platform × status × score × verdict × reason
   - Colour-code verdicts: KEEP (green), FIX (amber), START (blue), KILL (red), DEFEND (grey)

5. **Executive Summary**
   - Extracted from SOCIAL-AUDIT.md
   - No modifications — preserve brand voice

6. **🔴 Fix Immediately section**
   - Rendered as red severity cards
   - Each finding: title · problem · cost · fix (with owner + time)
   - Do NOT split evidence/impact/fix across multiple cards — use SeverityCard body text

7. **🟠 Fix This Month section** (amber cards)

8. **🟡 Plan for Next Quarter section** (yellow cards)

9. **Per-platform deep dive**
   - One page per active platform
   - Stats box (followers, cadence, ER) + top-3 fixes

10. **Competitor benchmark**
    - 3-column comparison table (brand × 3 competitors)
    - Key platform metrics side-by-side

11. **Content mechanics + engagement analysis**
    - Format mix chart (donut or bar)
    - Posting cadence chart (over 90 days)
    - Engagement rate vs benchmarks (horizontal bar)

12. **90-day playbook**
    - Day 1-30 / 31-60 / 61-90 blocks
    - Each action: owner, time, expected outcome

13. **Appendix**
    - Methodology note
    - Data sources used (platforms scraped + ad libraries)
    - "Generated by AuditHQ · `/social-audit`"

### Step 5: Save + confirm

Save to `{output_root}/{domain}/SOCIAL-AUDIT.pdf`. Confirm with:
```
=== SOCIAL FOOTPRINT PDF GENERATED ===
Output: {path}
Pages: {count}
File size: {size}
```

---

## PDF Engine Integration Notes

- Follow `feedback_pdf_layout.md` memory: fixed elements on canvas, not flowables. Calculate coordinates first.
- Follow `feedback_severity_card_splitting.md` memory: SeverityCard must consume `**Evidence:**` / `**Impact:**` / `**Fix:**` as body text, do NOT split one finding into 4 cards.
- Use domain-specific output path per `feedback_audit_output_paths.md` — absolute path, never `./outputs/`.

---

## Error Handling

- **SOCIAL-AUDIT.md missing:** Halt. Message: "Run `/social-audit <url>` first to generate the source report."
- **Score extraction fails:** Log which scores couldn't be parsed, fall back to showing composite only + prompt user to regenerate the markdown.
- **PDF engine error:** Surface the traceback, do not silently partially-render.

---

## Cross-Skill Integration

- Called automatically at end of `/social-audit`
- Called by `/full-audit-report-pdf` when combining all 9 suites into one client PDF
- Does NOT call `reputation-report-pdf`, `geo-report-pdf`, or other suite PDFs — each suite owns its own PDF generation
