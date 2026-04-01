---
name: security-report-pdf
description: Generate a professional PDF from security audit data using the shared audit_pdf_engine.py. Produces a client-ready PDF with security posture score, header analysis, email authentication status, and prioritised hardening plan.
---

# Security Audit PDF Report Generator

## Skill Purpose
Generate a professional, client-ready PDF from cybersecurity posture audit data. Uses the shared `audit_pdf_engine.py` for consistent styling across all audit suites.

## When to Use
- User runs `/security report-pdf`
- After running `/security audit` or `/security-audit`
- User wants a client deliverable for security posture findings

## Prerequisites
- **ReportLab** must be installed: `pip install reportlab`
- A completed security audit with `SECURITY-AUDIT.md` in the output directory
- The shared engine: `~/.claude/skills/shared/audit_pdf_engine.py`

## How to Execute

### Step 1: Check for Existing Data
Look for `SECURITY-AUDIT.md` in the domain output directory (`~/Documents/Claude/{domain}/`). If not found, tell the user to run `/security audit <url>` first.

### Step 2: Parse the Markdown Report
Extract from `SECURITY-AUDIT.md`:
- **Overall Security Score** (0-100)
- **Category scores:** HTTP Security Headers, SSL/TLS Configuration, Email Authentication, Information Disclosure, Attack Surface
- **Findings** with severity levels (Critical/High/Medium/Low)
- **Quick wins**, medium-term, and strategic recommendations

### Step 3: Build the JSON Data Structure

```json
{
  "url": "https://example.com",
  "date": "March 31, 2026",
  "brand_name": "Example Co",
  "suite": "Cybersecurity Posture",
  "overall_score": 62,
  "executive_summary": "2-4 sentence summary of security posture and key vulnerabilities.",
  "categories": {
    "HTTP Security Headers": { "score": 45, "weight": "30%" },
    "SSL/TLS Configuration": { "score": 85, "weight": "25%" },
    "Email Authentication": { "score": 70, "weight": "20%" },
    "Information Disclosure": { "score": 55, "weight": "15%" },
    "Attack Surface": { "score": 60, "weight": "10%" }
  },
  "findings": [
    { "severity": "Critical", "finding": "Missing Content-Security-Policy header — XSS vulnerability" },
    { "severity": "High", "finding": "DMARC policy set to p=none — domain spoofing possible" }
  ],
  "quick_wins": [
    "Add X-Content-Type-Options: nosniff header",
    "Add X-Frame-Options: DENY header",
    "Upgrade DMARC from p=none to p=quarantine"
  ],
  "medium_term": [
    "Implement Content-Security-Policy with report-uri",
    "Enable HSTS with includeSubDomains and preload"
  ],
  "strategic": [
    "Achieve A+ rating on SecurityHeaders.com",
    "Implement Permissions-Policy to restrict browser APIs"
  ]
}
```

### Step 4: Generate the PDF

```python
import sys, os
sys.path.insert(0, os.path.expanduser("~/.claude/skills"))
from shared.audit_pdf_engine import generate

generate(
    directory=os.path.expanduser("~/Documents/Claude/{domain}"),
    output_path=os.path.expanduser("~/Documents/Claude/{domain}/SECURITY-REPORT.pdf"),
    selected_suites=["Security"]
)
```

### Step 5: Verify and Report
Confirm the PDF was created, report file path and size to the user.

## PDF Design
- **Accent colour:** Emerald (#059669) — signals protection and trust
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
| Engine not found | Check `~/.claude/skills/shared/audit_pdf_engine.py` exists |
| Empty PDF | Ensure SECURITY-AUDIT.md has parseable scores and findings |
