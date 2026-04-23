---
name: a11y-audit
description: "Scan a frontend project for WCAG 2.2 accessibility violations and optionally auto-fix them. Use when auditing for accessibility compliance, fixing missing alt text/labels/contrast issues, or validating before a release."
---

# /a11y-audit

Scan a frontend project for WCAG 2.2 accessibility issues, show fixes, and optionally check color contrast.

## Quick Start

```bash
/a11y-audit                     # Scan current project
/a11y-audit ./src               # Scan specific directory
/a11y-audit ./src --fix         # Scan and auto-fix what's possible
```

## What It Does

### Step 1: Scan

Run the a11y scanner on the target directory (script is optional — fall back to manual file inspection if unavailable):

```bash
# Optional: if script is available at the relative path below
python3 scripts/a11y_scanner.py {path} --json
```

If the script is unavailable, manually inspect HTML/JSX/TSX files for: missing `alt` attributes, missing `lang` on `<html>`, unlabelled form inputs, heading order violations, and `tabindex > 0` usage.

Parse or collect findings. Group by severity: critical → serious → moderate → minor.

Display a summary:
```
A11y Audit: ./src
  Critical: 3 | Serious: 7 | Moderate: 12 | Minor: 5
  Files scanned: 42 | Files with issues: 15
```

### Step 2: Fix

For each finding (starting with critical):

1. Read the affected file
2. Show the violation with context (before)
3. Apply the fix
4. Show the result (after)

**Auto-fixable issues** (apply without asking):
- Missing `alt=""` on decorative images
- Missing `lang` attribute on `<html>`
- `tabindex` values > 0 → set to 0
- Missing `type="button"` on non-submit buttons
- Outline removal without replacement → add `:focus-visible` styles

**Issues requiring user input** (show fix, ask to apply):
- Missing alt text (need description from user)
- Missing form labels (need label text)
- Heading restructuring (may affect layout)
- ARIA role changes (may affect functionality)

### Step 3: Contrast Check

If CSS files are present, check color contrast (script is optional):

```bash
# Optional: if script is available
python3 scripts/contrast_checker.py --batch {path}
```

If script unavailable, manually check `color`/`background-color` pairs in CSS against WCAG AA ratios (4.5:1 normal text, 3:1 large text).

For each failing color pair, suggest accessible alternatives.

### Step 4: Report

Generate a markdown report at `a11y-report.md`:
- Executive summary (pass/fail, issue counts)
- Per-file findings with before/after diffs
- Remaining manual review items
- WCAG criteria coverage

## Skill Reference

- `engineering-team/a11y-audit/SKILL.md`
- `engineering-team/a11y-audit/scripts/a11y_scanner.py` (optional)
- `engineering-team/a11y-audit/scripts/contrast_checker.py` (optional)
- `engineering-team/a11y-audit/references/wcag-quick-ref.md`
- `engineering-team/a11y-audit/references/aria-patterns.md`
- `engineering-team/a11y-audit/references/framework-a11y-patterns.md`

## Related Skills

- `/tdd` — Add accessibility-focused test cases after fixing violations
- `/seo-auditor` — SEO audit often overlaps with semantic HTML improvements
- `/prd` — Document accessibility requirements as acceptance criteria
