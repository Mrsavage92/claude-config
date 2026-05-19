# Skills Library

**159 Claude Code skills across audits, web builds, marketing, engineering, product, and business growth.**

Private skills library for Adam's Claude Code setup. Every skill is a folder with a `SKILL.md` that loads as a `/slash-command`. Synced across Mac + PC via this repo.

## Quick Reference

| Suite | Skills | Orchestrator |
|-------|--------|-------------|
| **Audit Suites (8)** | 48 | `/full-audit`, `/parallel-audit` |
| **Premium Website Suite** | 20 | `/saas-build`, `/premium-website` |
| **Marketing Suite** | 16 | `/market` |
| **GEO Suite** | 11 | `/geo` |
| **Engineering Team** | 8 | `/engineering-team` |
| **Business and Growth** | 7 | `/business-growth` |
| **Power Platform** | 5 | - |
| **Product and Sprint** | 15 | - |
| **Utility and Content** | 18 | - |
| **Shared** | 3 (Python engines) | - |

**Total: 159 skill folders + 3 shared utilities**

---

## Audit Suites

8 domain audit suites, each with sub-skills and a PDF report generator. Run all 8 with `/full-audit` or pick a subset with `/parallel-audit`.

| Suite | Command | Sub-skills | PDF Report |
|-------|---------|-----------|------------|
| Marketing | `/market audit` | 16 (copy, seo, emails, social, ads, funnel, landing, gbp, brand, competitors, launch, proposal, reviews, report) | `/market report-pdf` |
| Technical | `/techaudit` | 5 (speed, accessibility, mobile) | `/techaudit report-pdf` |
| GEO | `/geo audit` | 11 (citability, schema, technical, content, crawlers, llmstxt, platform, brand-mentions, report) | `/geo report-pdf` |
| Security | `/security` | 4 (headers, email) | `/security report-pdf` |
| Privacy | `/privacy` | 4 (cookies, policy) | `/privacy report-pdf` |
| Reputation | `/reputation` | 4 (monitor, response) | `/reputation report-pdf` |
| Employer Brand | `/employer` | 6 (careers, evp, reviews, social) | `/employer report-pdf` |
| AI Readiness | `/ai-ready` | 5 (adoption, automation, data) | `/ai-ready report-pdf` |

**9th PDF:** `/full-audit-report-pdf` generates a combined report across all 8 suites.

Shared PDF engine: `shared/audit_pdf_engine.py` + `shared/generate_suite_pdfs.py`

---

## Premium Website Suite

Replaces Lovable for all new projects. Orchestrated by `/saas-build`.

| Skill | Command | Purpose |
|-------|---------|---------|
| premium-website | `/premium-website` | Full suite reference |
| saas-build | `/saas-build` | End-to-end pipeline (brief to deploy) |
| saas-improve | `/saas-improve` | Post-launch improvement swarm |
| web-design-research | `/web-design-research` | Pre-build competitor and design research |
| web-scope | `/web-scope` | Scope definition |
| web-scaffold | `/web-scaffold` | React + Vite + Tailwind + shadcn scaffold |
| web-supabase | `/web-supabase` | Schema, RLS, auth, TypeScript types |
| web-stripe | `/web-stripe` | Checkout, webhooks, UpgradeButton |
| web-email | `/web-email` | Resend + React Email transactional emails |
| web-page | `/web-page` | Page builder (landing, auth, app pages) |
| web-component | `/web-component` | Component builder |
| web-animations | `/web-animations` | 5 animation techniques reference |
| web-onboarding | `/web-onboarding` | Multi-step onboarding wizard |
| web-settings | `/web-settings` | Settings page with billing portal |
| web-table | `/web-table` | TanStack Table v8 data tables |
| web-review | `/web-review` | 38+ point quality gate |
| web-deploy | `/web-deploy` | Vercel/Railway deploy with smoke test |
| web-fix | `/web-fix` | Bug fix workflow |
| dashboard-design | `/dashboard-design` | 20 Laws of Dashboard Design |
| web-design-guidelines | `/web-design-guidelines` | Web Interface Guidelines compliance |

---

## Engineering Team

| Skill | Command | Stack |
|-------|---------|-------|
| senior-frontend | `/senior-frontend` | React 18, Vite, TypeScript, Tailwind, shadcn |
| senior-backend | `/senior-backend` | FastAPI, Python, Supabase, PostgreSQL |
| senior-devops | `/senior-devops` | Railway, Vercel, GitHub Actions, Docker |
| senior-qa | `/senior-qa` | Playwright, Vitest, pytest |
| code-reviewer | `/code-reviewer` | Security, logic, N+1 queries |
| stripe-integration-expert | `/stripe` | Checkout, Portal, webhooks |
| incident-commander | `/incident-commander` | Production incident response |
| engineering-team | `/engineering-team` | Orchestrator |

---

## Product and Business

| Skill | Command |
|-------|---------|
| prd | `/prd` |
| okr | `/okr` |
| rice | `/rice` |
| sprint-plan | `/sprint-plan` |
| sprint-health | `/sprint-health` |
| retro | `/retro` |
| user-story | `/user-story` |
| persona | `/persona` |
| competitive-matrix | `/competitive-matrix` |
| customer-journey | `/customer-journey` |
| project-health | `/project-health` |
| saas-health | `/saas-health` |
| financial-health | `/financial-health` |
| pitch-deck | `/pitch-deck` |
| pricing-model | `/pricing-model` |

---

## Utility Skills

| Skill | Command | Purpose |
|-------|---------|---------|
| autopilot | `/autopilot` | Autonomous project progression |
| brainstorming | `/brainstorming` | Mandatory pre-creative exploration |
| stock-photos | `/stock-photos` | Free stock photo finder |
| ai-image-generation | `/ai-image` | FLUX, Gemini, Grok generation |
| agent-browser | `/agent-browser` | Browser automation |
| linkedin-post | `/linkedin-post` | Viral LinkedIn post generator |
| seo-strategy | `/seo-strategy` | Article optimizer or site-wide audit |
| scroll-stop-build | `/scroll-stop-build` | Apple-style scroll video sites |
| scroll-stop-prompt | `/scroll-stop-prompt` | AI image prompts for content |
| notion | `/notion` | Notion page management |
| project-doc | `/project-doc` | Notion project master doc |
| project-refresh | `/project-refresh` | Re-inject project context |
| project-review | `/project-review` | Deep strategic review |
| handoff | `/handoff` | Session handoff document |
| sync-knowledge-base | `/sync-knowledge-base` | Push to GitHub + Notion |
| usage-report | `/usage-report` | Audit which skills you use |
| plugin-audit | `/plugin-audit` | 8-phase skill validator |
| find-skills | `/find-skills` | Discover new skills |

---

## Power Platform

| Skill | Command |
|-------|---------|
| dynamics365-crm-architect | `/dynamics365` |
| dataverse-data-model | `/dataverse` |
| power-automate-engineer | `/power-automate` |
| power-platform-alm | `/pp-alm` |
| power-platform-integration | `/pp-integration` |

---

## Sync

- **Local:** `~/.claude/skills/` (flat skill folders)
- **GitHub:** `Mrsavage92/skills-library` (this repo)
- **Notion:** [Skills Library](https://notion.so/334116e8bef2817f8156d86f263b4c2c)
- **Sync hook:** auto-pushes on session end via `settings.json`

## License

Private repository. MIT base from upstream fork.
