---
name: audit
description: "Run audit suites against a website URL. Presents a numbered menu to select which audits to run, generates individual PDF reports for each. Full combined audit PDF only on explicit request."
---

# Audit Command

Main entrypoint for the audit product.

## Usage

```
audit "<url>"
audit "<url>" --compare "./previous-outputs/{domain}"
```

The optional `--compare` flag points to a previous audit's output directory. When set, the system passes previous scores to agents for delta tracking and flags any score shifts >10 points.

## Behavior

### Step 1: Parse the URL

Extract the target URL from the user's message. Extract the domain (e.g. `bdrgroup.co.uk` from `https://bdrgroup.co.uk/`). Strip `www.` if present.

Check for `--compare` flag. If present, verify the previous directory exists and note the path.

Create the output directory immediately:

```bash
mkdir -p "./outputs/{domain}"
```

### Step 2: Present the Audit Selection Menu

Display this exact menu and wait for the user's response:

```
Which audits would you like to run?

  1. Marketing
  2. Technical
  3. GEO
  4. Security
  5. Privacy
  6. Reputation
  7. AI Readiness
  8. Employer Brand

Enter your selection:
  - Comma-separated numbers: 1,3,4,5
  - Range: 1-5
  - All suites: all
```

**Wait for the user's response.** Do not proceed until they select.

### Step 3: Parse the Selection

Parse the user's input:
- `all` → suites 1-8
- Comma-separated: `1,3,4,5` → Marketing, GEO, Security, Privacy
- Range: `1-5` → Marketing, Technical, GEO, Security, Privacy
- Mixed: `1-3,7` → Marketing, Technical, GEO, AI Readiness

Suite routing table:

| # | Suite | Audit Skill | Expected Markdown Output |
|---|-------|-------------|--------------------------|
| 1 | Marketing | `market-audit` | `MARKETING-AUDIT.md` |
| 2 | Technical | `techaudit-audit` | `TECHNICAL-AUDIT.md` |
| 3 | GEO | `geo-audit` | `GEO-AUDIT-REPORT.md` |
| 4 | Security | `security-audit` | `SECURITY-AUDIT.md` |
| 5 | Privacy | `privacy-audit` | `PRIVACY-AUDIT.md` |
| 6 | Reputation | `reputation-audit` | `REPUTATION-AUDIT.md` |
| 7 | AI Readiness | `ai-ready-audit` | `AI-READINESS-AUDIT.md` |
| 8 | Employer Brand | `employer-audit` | `EMPLOYER-AUDIT.md` |

### Step 4: Run the Selected Audits

**For 1-2 selected suites:** Run sequentially in the main conversation. For each suite, read the corresponding audit skill from `skills/{skill-name}/SKILL.md` and follow its full instructions (Phase 1-4). Save the markdown report to `./outputs/{domain}/{FILENAME}.md`.

**For 3+ selected suites:** Spawn parallel background Agents. For each selected suite, launch one Agent with this exact prompt template:

```
You are running a {SUITE_NAME} audit against {URL}.

INSTRUCTIONS — follow these phases in order:
1. Read the skill file at skills/{AUDIT_SKILL}/SKILL.md completely before starting
2. Phase 1 (Data Gathering): Fetch the target URL and every additional URL the skill specifies. Build the data map.
3. Phase 2 (Analysis): Score every category using the rubric in the skill. Anchor scores to the rubric band descriptions.
4. Phase 3 (Synthesis): Calculate the composite score using the weights. Classify recommendations by tier.
5. Phase 4 (Output): Write the COMPLETE report following the template in the skill.

OUTPUT RULES:
- Save to: ./outputs/{DOMAIN}/{MARKDOWN_FILENAME}
- Your report MUST contain every ## section listed in the skill's "Template Compliance" checklist at the bottom of the skill file. Do not skip any section — if you lack evidence, write "No evidence found" rather than omitting.
- Label every major finding: [Confirmed], [Strong inference], or [Unverified]
- Do NOT generate a PDF — the orchestrator handles PDF generation after all audits complete
- Do NOT hardcode any user-specific paths

TOOL BUDGET:
- WebFetch: Target homepage + up to 5 additional pages (prioritize: homepage, key service pages, privacy policy, robots.txt)
- WebSearch: Up to 10 queries (competitors, review platforms, DNS records, industry context)
- If you approach 25 total tool calls, wrap up data gathering and move to analysis with what you have

PREVIOUS AUDIT (only include this block if --compare was used):
Previous audit scored {SUITE_NAME} at {PREVIOUS_SCORE}/100 on {PREVIOUS_DATE}.
If your score differs by more than 10 points, add a "Changes Since Last Audit" section
explaining what changed. Possible causes: real site changes, different evidence found,
calibration difference. Be specific about which findings drove the delta.

The output file MUST be saved to: ./outputs/{DOMAIN}/{MARKDOWN_FILENAME}
```

Replace the placeholders with actual values from the routing table.

**Error handling for agents:**
- If an agent fails or times out, log the error and continue with remaining suites
- Do not block the entire audit on one failed suite
- Report which suites succeeded and which failed in the summary

### Step 5: Validate Markdown Reports

After all agents complete, run the report validator:

```bash
python3 ~/.claude/skills/shared/validate_reports.py "./outputs/{domain}"
```

This checks each report for:
- Minimum line count (150 lines)
- Required sections present (per-suite checklist)
- Score present and valid (X/100 in first 1000 chars)
- Evidence tags present (Confirmed, Strong inference)
- No hardcoded paths

Review the output. If any reports FAIL validation:
- Note which sections are missing
- The report can still be converted to PDF but flag the gaps in the summary
- If a report is under 100 lines or has no score, skip PDF for that suite

### Step 5.5: Cross-Suite Consistency Check (3+ suites only)

When 3 or more suites were run, run the score extractor:

```bash
python3 ~/.claude/skills/shared/extract_scores.py "./outputs/{domain}"
```

If a previous audit exists for the same domain, pass it for comparison:
```bash
python3 ~/.claude/skills/shared/extract_scores.py "./outputs/{domain}" "./previous-outputs/{domain}"
```

This automatically:
- Extracts and displays all suite scores
- Checks for factual contradictions (Trustpilot rating mismatches, HSTS presence conflicts, etc.)
- Detects compounding issues mentioned in 2+ suites
- Flags score shifts >10 points from previous audits

**If contradictions are found:** Note them in the Step 7 summary with the exact mismatch. Do not silently let them stand.

**If score shifts >10 points from previous audit:** Note them in the summary with "*** INVESTIGATE" flag.

### Step 5.75: Synthesize Combined Report (full audit only)

**This step only runs when the user explicitly requests a full/combined audit.**

When the user says "full audit", "combined audit", or "generate full audit PDF" — and at least 2 suite markdown reports exist:

1. Read the `full-audit-synthesis` skill from `skills/full-audit-synthesis/SKILL.md`
2. Follow its instructions exactly:
   - Read ALL selected suite markdown reports from `./outputs/{domain}/` (this works for any combo — all 8, or a subset like 3 or 4 suites)
   - Build the data map (scores, findings, revenue estimates, cross-references)
   - Reconcile contradictions (use the suite with direct evidence)
   - Write `./outputs/{domain}/FULL-AUDIT-REPORT.md` following the template
   - Ensure every cross-suite issue has evidence tags [Confirmed] / [Strong inference]
   - Ensure every suite summary is 5-6 sentences with specific evidence
3. Verify the output has all required sections (check the skill's Template Compliance checklist)

The PDF engine will detect `FULL-AUDIT-REPORT.md` and render its sections (Executive Summary, Cross-Suite Issues, Integrated Action Plan, Revenue Impact) instead of using keyword-based synthesis. This is what produces consultancy-quality narrative in the combined PDF.

**This works for any suite combination:**
- `audit "url"` → select `all` → then "full audit" → synthesizes all 8 suites
- `audit "url"` → select `1,3,4,5` → then "combined report" → synthesizes those 4 suites
- The synthesis skill adapts its language and analysis to the number of suites present

**If this step is skipped** (e.g. user only wants individual PDFs), the engine falls back to keyword-based cross-suite synthesis which is functional but less detailed.

### Step 6: Generate PDFs

Run the PDF generator for all suites that produced valid markdown reports:

```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" {suite_numbers_with_reports}
```

Example: if suites 1,3,4,5 were selected and all produced markdown:
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/bdrgroup.co.uk" 1 3 4 5
```

After PDF generation, verify the PDFs exist and are reasonable size (>50KB each):

```bash
ls -la "./outputs/{domain}/"*.pdf
```

**If PDF generation fails:** Report the error clearly. Do not silently deliver only markdown.

**If some suites have no markdown:** Generate PDFs only for suites that have reports. Note the missing suites in the summary.

### Step 7: Report Results

Display a summary table:

```
Audit complete for {domain}

  #  Suite            Score   Grade   PDF                        Size
  1  Marketing        62/100  C       AUDIT-1-MARKETING.pdf      135 KB
  4  Security         52/100  D       AUDIT-4-SECURITY.pdf       120 KB
  ...

{count} PDF report(s) generated in ./outputs/{domain}/
```

If any reports had validation issues:
```
Validation notes:
  AI Readiness: Missing sections — Data Map, Key Findings
```

If any cross-suite contradictions were found:
```
Cross-suite notes:
  Glassdoor rating: Marketing says 4.0, Reputation says 3.7
  HSTS: Technical says absent, Security says present
```

If any suites failed entirely:
```
Failed suites: GEO (agent rate limit)
```

## Critical Rules

### Full Audit is Explicit Only

**DO NOT generate a combined full audit PDF** unless the user explicitly says one of:
- "full audit"
- "combined audit"
- "generate full audit PDF"

Selecting `all` from the menu generates **8 separate PDFs**, NOT a combined PDF.

To generate a combined report when explicitly requested:
```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 1 2 3 4 5 6 7 8 --full
```

### Evidence Standards (Non-Negotiable)

All audit agents must follow these hardening rules:
- Label findings as `Confirmed`, `Strong inference`, or `Unverified`
- Reconcile contradictions across suites before presenting unified findings
- Avoid legal certainty language unless evidence and jurisdiction are both clear
- Never turn an inference into a certainty in the final report

### Output Paths (Non-Negotiable)

- All output goes to `./outputs/{domain}/` relative to the working directory
- Never hardcode user-specific paths
- The `CLAUDE_AUDIT_OUTPUT_ROOT` environment variable overrides `./outputs` if set
- Every agent must be told the exact output path — do not let agents choose their own

### PDF-First Delivery

- The deliverable is the PDF, not the markdown
- Internal markdown files are implementation details
- Every audit flow MUST end with PDF generation via `~/.claude/skills/shared/generate_suite_pdfs.py`
- If PDF generation fails, report the error — do not silently deliver only markdown

### Suite Skills Do NOT Generate PDFs

Individual suite audit skills write markdown only. PDF generation is handled centrally in Step 6 by the orchestrator (this command). This prevents double-PDF generation or inconsistent PDF output.
