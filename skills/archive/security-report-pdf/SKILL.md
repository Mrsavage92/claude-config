---
name: security-report-pdf
description: Generate a professional PDF from security audit data using the production PDF engine (~/.claude/skills/shared/audit_pdf_engine.py via ~/.claude/skills/shared/generate_suite_pdfs.py). Produces a client-ready PDF with security posture score, header analysis, email authentication status, and prioritised hardening plan.
---

# Security Audit PDF Report Generator

## Skill Purpose
Generate a professional, client-ready PDF from cybersecurity posture audit data. Uses the production PDF engine (`~/.claude/skills/shared/audit_pdf_engine.py` via `~/.claude/skills/shared/generate_suite_pdfs.py`) which reads markdown directly -- no JSON intermediary needed.

## When to Use
- User runs `/security report-pdf`
- After running `/security audit` or `/security-audit`
- User wants a client deliverable for security posture findings

## Prerequisites
- **ReportLab** must be installed: `pip install reportlab`
- A completed security audit with `SECURITY-AUDIT.md` in the output directory
- The production engine: `~/.claude/skills/shared/audit_pdf_engine.py` and `~/.claude/skills/shared/generate_suite_pdfs.py`

## How to Execute

### Step 1: Check for Existing Data
Look for `SECURITY-AUDIT.md` in the domain output directory (`./outputs/{domain}/`). If not found, tell the user to run `/security audit <url>` first.

### Step 2: Ensure Markdown Report Exists
The production PDF engine parses `SECURITY-AUDIT.md` directly to extract:
- **Overall Security Score** (0-100)
- **Category scores:** HTTP Security Headers, SSL/TLS Configuration, Email Authentication, Information Disclosure, Attack Surface
- **Findings** with severity levels (Critical/High/Medium/Low)
- **Quick wins**, medium-term, and strategic recommendations

Verify the file exists and contains complete audit data. No JSON intermediary is needed.

### Step 3: Generate the PDF

```bash
python3 ~/.claude/skills/shared/generate_suite_pdfs.py "./outputs/{domain}" 4
```

Suite number `4` = Security.

**Python API (alternative):**
```python
from audit_pdf_engine import generate

generate(
    directory="./outputs/{domain}",
    output_path="./outputs/{domain}/SECURITY-AUDIT.pdf",
    selected_suites=["Security"]
)
```

### Step 4: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- **Accent colour:** Emerald (#059669) -- signals protection and trust
- **Header:** "Cybersecurity Posture Audit Report"
- **Disclaimer on every page:** "This is an observational security assessment, not a penetration test. Critical infrastructure should undergo professional security testing."
- **Score gauge colours:** Green (80+), Blue (60-79), Yellow (40-59), Red (<40)

## Scoring Guidance

| Category | What It Measures | 80+ | 60-79 | <60 |
|---|---|---|---|---|
| HTTP Security Headers | CSP, HSTS, X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy | All major headers present and strict | Most headers present, some weak | Multiple missing or misconfigured |
| SSL/TLS Configuration | Certificate validity, protocol versions, cipher suites | TLS 1.3, valid cert, strong ciphers | TLS 1.2+, valid cert | Expired cert, TLS 1.0/1.1, weak ciphers |
| Email Authentication | SPF, DKIM, DMARC records and policy strength | SPF -all, DKIM present, DMARC reject | Records present but weak policies | Missing records |
| Information Disclosure | Server headers, error pages, exposed tech stack | Minimal disclosure | Some leakage | Verbose errors, exposed stack |
| Attack Surface | Open ports, exposed admin panels, default configs | Minimal exposure | Some unnecessary exposure | Admin panels public, defaults active |

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError: reportlab` | Run `pip install reportlab` |
| Engine not found | Check `~/.claude/skills/shared/audit_pdf_engine.py` and `~/.claude/skills/shared/generate_suite_pdfs.py` exist |
| Empty PDF | Ensure SECURITY-AUDIT.md has parseable scores and findings |
