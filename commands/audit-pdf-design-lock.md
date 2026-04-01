# Audit PDF Design Lock

This document is the locked design specification for all audit suite PDFs. Any changes to the PDF renderer must comply with this specification. The gold-standard reference PDFs are in `C:\Users\Adam\Documents\Claude\BDR Group.co.uk\`.

**Last locked:** 2026-03-31
**Locked by:** audit-suite-hardening

---

## Design System

### Color Palette (Base)

| Token | Hex | Usage |
|-------|-----|-------|
| BRAND_DARK | #1A1A2E | Cover page background, header bands |
| BRAND_MID | #16213E | Score display background |
| BRAND_ACCENT | #0F3460 | Table headers, section labels |
| COL_GREEN | #16A34A | Good scores (70+), Confirmed evidence |
| COL_AMBER | #D97706 | Average scores (40-69), Strong inference |
| COL_RED | #DC2626 | Poor scores (<40), Critical severity |
| COL_LIGHT | #F1F5F9 | Alternating row background, chart track |
| COL_BORDER | #CBD5E1 | Table borders, HR lines |
| COL_TEXT | #1E293B | Body text |
| COL_MUTED | #64748B | Secondary text, footnotes |
| WHITE | #FFFFFF | Header text, number badges |

### Suite Accent Colors

Each suite has a unique accent color used for H2 headings and visual identity:

| Suite | Key | Accent Hex |
|-------|-----|-----------|
| Marketing | marketing | #4F46E5 (Indigo) |
| Technical | technical | #475569 (Slate) |
| GEO | geo | #059669 (Emerald) |
| Security | security | #DC2626 (Red) |
| Privacy | privacy | #DC2626 (Red) |
| Reputation | reputation | #D97706 (Amber) |
| AI Readiness | ai-readiness | #0D9488 (Teal) |
| Employer Brand | employer-brand | #7C3AED (Purple) |
| Full Audit | full | #2563EB (Blue) |

### Typography

| Element | Font | Size | Leading |
|---------|------|------|---------|
| Cover title | Helvetica-Bold | 28pt | 34 |
| Cover subtitle | Helvetica | 13pt | 18 |
| Cover score | Helvetica-Bold | 64pt | 70 |
| H1 | Helvetica-Bold | 18pt | 22 |
| H2 | Helvetica-Bold | 13pt | 16 |
| H3 | Helvetica-Bold | 11pt | 14 |
| Body | Helvetica | 9.5pt | 14 |
| Body small | Helvetica | 8.5pt | 12 |
| Muted/footnote | Helvetica | 8pt | 11 |
| Footer | Helvetica | 7.5pt | - |

### Page Layout

- Page size: A4 (595.28 x 841.89 pt)
- Margins: 2cm all sides
- Content width: page width - 4cm

---

## Section Order

### Individual Suite PDF

1. **Cover page** — Dark header band, suite title, brand name, domain, date, overall score in large text, grade, meta table, disclaimer (privacy/security only), footer
2. **Executive summary** — Labeled text blocks or paragraph-form summary
3. **Score breakdown** — Horizontal bar chart + category table with Score/Weight/Grade/Finding columns
4. **Key findings** — Severity-coded table with # / Severity / Finding / Evidence columns
5. **Action plan** — Three tiers: Quick Wins (red accent), Strategic (amber accent), Long-Term (blue accent)
6. **Key statistics** (optional) — Industry framing statistics
7. **Final footer** — Generation notice with date, domain, and professional review recommendation

### Full Audit PDF (Combined)

1. **Cover page** — Same as suite but titled "Full Digital Audit Report"
2. **Executive summary** — Labeled blocks: Overall Score, Strengths, Critical Risk, Cross-Suite Patterns, Revenue Impact
3. **Suite scorecard** — Bar chart + table: Suite / Score / Grade / Top Issue
4. **Cross-suite issues** — Compounding problems table: # / Issue / Suites / Detail
5. **Score breakdown** — If categories provided
6. **Key findings** — Combined severity table
7. **Action plan** — Integrated across all suites: Critical / High / Strategic tiers
8. **Revenue & risk summary** — Impact table with monthly estimates
9. **Final footer**

---

## Score Visualization

### Score Color Rules

| Score Range | Color | Grade |
|-------------|-------|-------|
| 85-100 | Green (#16A34A) | A |
| 70-84 | Green (#16A34A) | B |
| 55-69 | Amber (#D97706) | C |
| 40-54 | Amber (#D97706) | D |
| 0-39 | Red (#DC2626) | F |

### Bar Chart Spec

- Horizontal bars, left-aligned labels
- Left margin: 140px for labels
- Bar height: 16px, gap: 8px
- Background track: COL_LIGHT
- Score bar: colored by score_color()
- Tick marks at 25/50/75/100 with vertical lines
- Score value right of bar in bold, colored

### Category Table Spec

- Header row: BRAND_ACCENT background, white text
- Data rows: alternating WHITE / COL_LIGHT
- Overall row: highlighted yellow (#FEF3C7) background
- Bottom border: colored by overall score
- Columns: Category / Score / Weight / Grade / Key Finding

---

## Severity Coding

| Severity | Color | Number Badge |
|----------|-------|-------------|
| Critical | #DC2626 (Red) | White on red |
| High | #D97706 (Amber) | White on amber |
| Medium | #2563EB (Blue) | White on blue |
| Low | #64748B (Muted) | White on grey |

---

## Evidence Status Tags

All major findings must carry an evidence status:

| Status | Color | Meaning |
|--------|-------|---------|
| Confirmed | Green (#16A34A) | Directly observed from fetched content |
| Strong inference | Amber (#D97706) | Highly likely based on multiple signals |
| Unverified | Grey (#64748B) | Plausible but not proven |

---

## Hardening Rules (Non-Negotiable)

These rules are baked into the audit product and must not be removed or weakened:

1. **Evidence tagging** — Every finding must have Confirmed/Strong inference/Unverified status
2. **Contradiction reconciliation** — Cross-suite contradictions must be explicitly addressed
3. **Jurisdiction awareness** — Privacy/legal findings must identify the governing jurisdiction; if unclear, say so
4. **No false legal certainty** — Never assert legal compliance or non-compliance without clear evidence and jurisdiction
5. **Portable output paths** — Never hardcode user-specific paths; use `./outputs/{domain}/` or `CLAUDE_AUDIT_OUTPUT_ROOT`
6. **PDF-first delivery** — Every audit flow must end with PDF generation; markdown is internal only
7. **Full audit is explicit** — Selecting `all` from the menu generates 8 separate PDFs, not a combined report

---

## JSON Input Schema

All PDF skills must structure their data into this schema before calling the renderer:

```json
{
  "brand_name": "string — company/brand name",
  "domain": "string — e.g. example.com",
  "url": "string — full URL audited",
  "industry": "string — optional",
  "location": "string — optional",
  "company_size": "string — optional",
  "business_type": "string — optional",
  "date": "string — e.g. 31 March 2026",
  "overall_score": "number — 0-100",
  "grade": "string — A/B/C/D/F (auto-calculated if omitted)",

  "executive_summary": "string or array of {label, text} objects",

  "categories": {
    "Category Name": {
      "score": "number — 0-100",
      "weight": "string — e.g. 25%",
      "finding": "string — key finding for this category"
    }
  },

  "findings": [
    {
      "severity": "Critical | High | Medium | Low",
      "finding": "string — description with evidence",
      "evidence": "Confirmed | Strong inference | Unverified"
    }
  ],

  "quick_wins": ["string or {action, impact} objects"],
  "medium_term": ["string or {action, impact} objects"],
  "strategic": ["string or {action, impact} objects"],

  "key_statistics": ["string — optional industry stats"],

  "suite_scores": [
    {
      "name": "string — suite name",
      "score": "number",
      "top_issue": "string"
    }
  ],

  "cross_suite_issues": [
    {
      "title": "string",
      "suites": "string — comma-separated suite names",
      "detail": "string"
    }
  ]
}
```

Fields `suite_scores` and `cross_suite_issues` are only used in full audit mode.

---

## Validation Checklist

Before releasing any change to the PDF renderer or audit skills:

- [ ] All 8 suite accent colors render correctly
- [ ] Score bar chart displays with correct colors and labels
- [ ] Findings table shows evidence status column
- [ ] Action plan has three tiers with correct accent bar colors
- [ ] Cover page shows suite-specific title
- [ ] Privacy/security suites include disclaimer text
- [ ] Footer appears on every page with brand name, date, page number
- [ ] No hardcoded paths in the renderer
- [ ] Full audit mode includes suite scorecard and cross-suite issues
- [ ] Full audit is never auto-triggered by selecting all suites
