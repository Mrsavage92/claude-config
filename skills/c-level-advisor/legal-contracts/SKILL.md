---
name: "legal-contracts"
description: "SaaS legal and contracts specialist for MSA/SaaS agreement review, DPA drafting, vendor risk assessment, IP protection, data residency compliance, and contract renewal management. Use when reviewing or drafting customer contracts, creating DPAs, assessing vendor risk, protecting IP, or building a contract management process."
Name: "Legal & Contracts"
  Tier: "STANDARD"
  Category: "C-Level Advisory"
  Dependencies: "None"
  Author: "claude-skills"
  Version: "2.1.2"
---

# Legal & Contracts Manager

## Overview

This skill covers the commercial legal needs of a SaaS company: customer and vendor agreements, data processing, IP ownership, and compliance. Note: this is guidance to inform decisions — always engage a qualified solicitor/attorney for binding legal work.

## When to Use

- Reviewing or drafting a customer MSA or SaaS agreement
- Creating or reviewing a Data Processing Agreement (DPA)
- Assessing vendor or supplier risk
- Protecting company IP (code, brand, data)
- Building a contract management process
- Understanding data residency requirements

## Quick Start

```
# MSA review
Paste a contract clause → I'll flag risks, suggest revisions, explain implications

# DPA drafting
Describe your data processing activities → GDPR-compliant DPA structure

# Vendor risk assessment
Vendor name + data they'll access → risk score and required safeguards
```

## SaaS Agreement Key Clauses

### Must Review in Every Customer Contract
| Clause | Risk | What to Check |
|--------|------|---------------|
| Liability cap | HIGH | Should be capped at 12 months fees paid |
| Indemnification | HIGH | IP indemnity scope, third-party claims |
| Data ownership | HIGH | Customer owns their data, you own aggregated/anonymised |
| Termination rights | HIGH | For cause vs convenience, notice periods |
| SLA & credits | MEDIUM | Credit caps, exclusions, measurement method |
| Auto-renewal | MEDIUM | Notice period to cancel (aim for 60–90 days) |
| Governing law | MEDIUM | Your jurisdiction preferred |
| IP assignment | MEDIUM | Ensure customer feedback doesn't transfer IP |

### Standard SaaS Agreement Structure
1. Definitions
2. Subscription grant & restrictions
3. Customer obligations (acceptable use)
4. Fees & payment
5. Confidentiality
6. Data processing (or reference to DPA)
7. Warranties & disclaimers
8. Indemnification
9. Liability limitation
10. Term & termination
11. General (governing law, notices, entire agreement)

## Data Processing Agreement (DPA) Essentials
GDPR Article 28 requires a DPA when processing personal data on behalf of a controller.

**Required DPA contents:**
- Subject matter and duration of processing
- Nature and purpose of processing
- Type of personal data and categories of data subjects
- Obligations and rights of the controller
- Sub-processor list and approval mechanism
- Data subject rights support obligations
- Security measures (Article 32)
- Data breach notification (72 hours)
- Deletion/return of data on termination

## Vendor Risk Assessment Matrix
| Risk Level | Data Access | Action Required |
|------------|-------------|-----------------|
| Critical | PII + financial | Full security review, DPA, contract review |
| High | PII only | DPA, security questionnaire, annual review |
| Medium | Business data | DPA, standard terms review |
| Low | No personal data | Standard procurement only |

## IP Protection Checklist
- [ ] Employment contracts include IP assignment clause
- [ ] Contractor agreements include IP assignment + work-for-hire
- [ ] Open source usage tracked and licences audited
- [ ] Trade marks registered in operating jurisdictions
- [ ] Domain names registered (primary + common variants)
- [ ] GitHub repos have appropriate licence files

## Contract Lifecycle Management
1. **Initiation** — NDA → MSA negotiation → Order Form
2. **Execution** — e-sign (DocuSign/Adobe Sign), CRM update
3. **Monitoring** — renewal dates in calendar 90/60/30 days prior
4. **Renewal** — pricing review, usage analysis, upsell opportunity
5. **Termination** — data deletion certificate, offboarding

## Related Skills
- cs-quality-regulatory
- cs-ceo-advisor
- customer-success


<!-- Auto-generated required sections -->

## Name

Legal & Contracts

## Description

Legal and Contract Management skill for Claude Code. Provides workflows, templates, and automation tools.

## Features

- Production-ready workflows
- Step-by-step guidance
- Reusable templates
- Best practices embedded

## Usage

Describe your task to Claude and this skill will be applied automatically based on context.

```
# Trigger this skill by describing your need:
"Help me with legal and contract management"
```

## Examples

**Example 1:** Ask Claude to apply this skill to your current project.

**Example 2:** Reference the workflows in SKILL.md to guide your implementation.
