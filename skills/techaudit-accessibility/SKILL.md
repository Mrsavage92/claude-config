# Accessibility Audit (WCAG 2.1)

## Skill Purpose
Evaluate website accessibility against WCAG 2.1 guidelines. Identifies barriers for users with disabilities and produces a prioritised remediation plan.

## When to Use
- `techaudit accessibility <url>`
- Follow-up to `techaudit audit` when Accessibility score is below 60

## How to Execute

### Step 1: Automated Checks from HTML Source
From the fetched HTML, check:

**Perceivable:**
- Images: alt text present and descriptive (not "image1.jpg")
- Video/audio: captions or transcripts available?
- Colour contrast: inline styles with potentially low contrast
- Text resizing: fixed font sizes vs relative (em/rem)

**Operable:**
- Keyboard navigation: skip nav link, tabindex usage, focus styles
- Touch targets: buttons/links > 44x44px
- No auto-playing media
- No content that flashes

**Understandable:**
- Language attribute on html tag
- Form labels associated with inputs
- Error messages descriptive
- Consistent navigation across pages

**Robust:**
- Valid HTML (proper nesting, closed tags)
- ARIA roles and attributes used correctly
- Compatible with assistive technology patterns

### Step 2: Score Against WCAG Checklist
Score each principle (Perceivable, Operable, Understandable, Robust) 0-100.

### Step 3: Generate Report
Save to `ACCESSIBILITY-AUDIT.md` with WCAG principle scores, specific failures with line references, prioritised fixes, and legal risk context (Disability Discrimination Act 1992 in Australia).
