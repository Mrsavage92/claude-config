---
name: security-email
description: Deep analysis of SPF, DKIM, and DMARC email authentication records. Identifies misconfigurations, spoofing risks, and produces a step-by-step remediation plan with a DMARC ramp-up schedule.
---

# Email Authentication Security Check

## Skill Purpose
Check SPF, DKIM, and DMARC configuration for a domain. These records prevent email spoofing and phishing attacks using the business's domain. Produces a detailed EMAIL-SECURITY.md report.

## When to Use
- `/security email <domain>`
- Follow-up to `/security audit` when Email Authentication score is below 60
- User wants to verify their email security posture before a domain migration

## How to Execute

### Step 1: Check DNS Records
Search for the domain's email authentication records:
- `[domain] SPF record check`
- `[domain] DMARC record`
- `[domain] DKIM selector`

Use web searches to find the current records from public DNS checkers.

### Step 2: Analyse SPF
- **Record present?** Quote the full TXT record
- **Mechanism:** `-all` (hard fail — best), `~all` (soft fail — weaker), `?all` (neutral — bad), `+all` (pass all — critical vulnerability)
- **Include count:** >10 DNS lookups = record is broken (SPF permerror)
- **Includes audit:** Do the included services match what the business actually uses? (Google Workspace, Microsoft 365, Mailchimp, SendGrid, etc.)
- **Flattening needed?** If approaching 10 lookups, recommend SPF flattening

### Step 3: Analyse DKIM
- **Selector discovery:** Check common selectors (`google`, `selector1`, `selector2`, `k1`, `default`)
- **Key length:** 1024-bit minimum, 2048-bit recommended
- **Key rotation:** Check if multiple selectors suggest rotation is in place

### Step 4: Analyse DMARC
- **Record present at `_dmarc.[domain]`?** Quote the full record
- **Policy:** `p=none` (monitoring only), `p=quarantine` (filter), `p=reject` (block — best)
- **Reporting:** `rua` tag present? (aggregate reports) `ruf` tag? (forensic reports)
- **Subdomain policy:** `sp=` tag set? (controls subdomains separately)
- **Percentage:** `pct=` tag — should be 100 in production
- **Alignment:** `adkim=` and `aspf=` — strict (`s`) is stronger than relaxed (`r`)

### Step 5: Scoring

| Component | Weight | 80+ | 60-79 | <60 |
|---|---|---|---|---|
| SPF | 35% | Present, `-all`, <8 lookups | Present, `~all` | Missing or `?all`/`+all` |
| DKIM | 30% | 2048-bit key, selector found | 1024-bit key found | No DKIM detected |
| DMARC | 35% | `p=reject`, `rua` set, 100% | `p=quarantine` or `p=none` with `rua` | Missing or no reporting |

**Email Authentication Score** = weighted average of all 3 components.

### Step 6: DMARC Ramp-Up Plan
If DMARC is missing or at `p=none`, include a phased implementation plan:

| Week | Action |
|---|---|
| 1-2 | Add `v=DMARC1; p=none; rua=mailto:dmarc@[domain]` — monitor only |
| 3-4 | Review aggregate reports, fix SPF/DKIM alignment issues |
| 5-6 | Move to `p=quarantine; pct=25` — quarantine 25% of failures |
| 7-8 | Increase to `pct=50`, then `pct=100` |
| 9-10 | Move to `p=reject; pct=25` — reject 25% of failures |
| 11-12 | Increase to `p=reject; pct=100` — full protection |

### Step 7: Generate Report
Save to `EMAIL-SECURITY.md` in the domain output directory (`~/Documents/Claude/{domain}/`) with:
- Current record inventory (SPF, DKIM, DMARC — quoted in full)
- Per-component score and assessment
- Overall Email Authentication Score
- Risk assessment (what an attacker could do today)
- Step-by-step remediation for each missing/weak component
- DMARC ramp-up schedule
- Recommended monitoring tools (Postmark DMARC, dmarcian, Valimail)

## Output Standards
- Always quote DNS records verbatim so the user can compare against their DNS
- Include copy-paste-ready DNS records for remediation
- Flag the single highest-risk item prominently at the top
