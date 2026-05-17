---
name: dashboard-design
description: >
  Enterprise dashboard design expert grounded in deep analysis of 40 SaaS products across 8 categories.
  Covers the 20 Laws of Dashboard Design, full per-product pattern library (all 40), layout architecture,
  KPI card specs, chart selection, empty states, CMD+K search, animations, dark mode, mobile patterns,
  onboarding wizards, date range pickers, and Claude Code implementation prompts.
---

# Skill: Enterprise Dashboard Design Expert

## Purpose
Design, critique, and build world-class SaaS dashboards grounded in patterns from 40 enterprise products. Use when designing a dashboard from scratch, reviewing one for improvement, deciding on chart types or layout, building components in React + Tailwind + shadcn/ui, or evaluating what enterprise-grade looks like.

---

## The 40-Dashboard Corpus

| Category | Products |
|---|---|
| Analytics & Monitoring | Datadog, Grafana, Mixpanel, Amplitude, Google Analytics 4, Segment, PostHog, Heap |
| Fintech/Payments | Stripe, Brex, Mercury, Ramp, QuickBooks Online, Xero |
| CRM/Sales | Salesforce Lightning, HubSpot CRM, Pipedrive, Close CRM, Attio |
| Project/Work Mgmt | Linear, Jira, Asana, Monday.com, Notion, ClickUp, Height |
| DevOps/Infra | Vercel, Railway, AWS Console, Render, Supabase |
| Customer Support | Intercom, Zendesk, Freshdesk, Loom |
| Marketing | Mailchimp, Klaviyo, Beehiiv, Buffer |
| Product Analytics | Pendo |

---

## The 20 Laws of Enterprise Dashboard Design

### LAW 1 - ONE METRIC OWNS THE PAGE
Every page has a single primary metric answering "are we winning today?" All other data is context for that number. If you can't name the primary metric, the page isn't designed.

### LAW 2 - HIERARCHY BY PROXIMITY TO MONEY
Arrange metrics top-to-bottom in order of business impact. Revenue/retention at top. Operational detail at bottom. Never bury ARR below feature usage.

### LAW 3 - TREND IS MORE VALUABLE THAN SNAPSHOT
A number without a comparison is decoration. Every KPI card shows: current value + change % + comparison period + direction arrow. "$45K" is useless. "$45K +12% vs last month" is information.

### LAW 4 - LEFT SIDEBAR IS THE INDUSTRY DEFAULT
38 of 40 products use left sidebar navigation. It scales to 8+ sections, collapses gracefully, supports icon+label hierarchy. Deviate only for document-centric (Notion) or command-driven (Linear palette) products.

### LAW 5 - 5-7 METRICS PER PAGE MAXIMUM
Stripe: 5. Linear: 4. Vercel: 6. Datadog breaks this and is universally called overwhelming by new users. Density is not value.

### LAW 6 - COLOR IS SEMANTIC, NOT DECORATIVE
Green = improving. Red = declining/error. Yellow = warning. Blue = informational. Gray = inactive. Brand color gets ONE job: active state or primary CTA. Never use it for metric trends.

### LAW 7 - SPARKLINES ON EVERY KPI CARD
37 of 40 products attach mini trend charts to KPI cards. A 40x20px sparkline adds pattern recognition without a full chart navigation. Table stakes now.

### LAW 8 - EMPTY STATES ARE ONBOARDING MOMENTS
An empty table without a CTA is a dead end. Must have: what's missing + value in 1 sentence + 1 primary action. Linear's empty states include animated illustrations and keyboard shortcuts. That's the bar.

### LAW 9 - TABLES FOR PRECISION, CHARTS FOR PATTERNS
"Does the user need exact values or trend recognition?" Financial data, audit logs, transactions = table. Revenue trend, user growth, funnel = chart. When unsure: chart above, table below.

### LAW 10 - LOADING SKELETONS EVERYWHERE
Users perceive skeleton loaders as faster than spinners at identical load times. All 40 products use skeletons on primary data surfaces. Blank space during load = perceived reliability failure.

### LAW 11 - MOBILE IS A MONITORING SURFACE, NOT A WORKFLOW SURFACE
No enterprise SaaS has full mobile parity. Sidebar collapses to hamburger, KPI grid goes 1-column, charts simplify, tables become cards. Design mobile to check status, not complete work.

### LAW 12 - ACTIONS BELONG IN THE HEADER
Primary CTA lives in the top-right of the page header. Never bury it in a card or after a table. Stripe, HubSpot, Linear, Vercel follow this without exception.

### LAW 13 - BULK ACTIONS APPEAR ONLY ON SELECTION
The bulk action bar is invisible until rows are selected. Appears as a floating pill or sticky bar. Never show bulk buttons always-on - creates decision paralysis.

### LAW 14 - SETTINGS AT THE SIDEBAR BOTTOM
Settings and user profile live at the bottom-left of the sidebar. Top-right user avatar dropdown is acceptable secondary placement. Never put settings mid-hierarchy.

### LAW 15 - NOTIFICATIONS ARE TIERED
3 tiers: (1) Modal/banner for critical events requiring acknowledgment, (2) Persistent banner for time-sensitive actions, (3) Toast for confirmations. Toasts auto-dismiss in 4-6s. Errors never auto-dismiss.

### LAW 16 - DATE CONTEXT IS MANDATORY
Every metric, chart, and table row includes a time reference. "Last 30 days," "Q1 2026," "Updated 2 min ago." Missing date context is the most common dashboard bug in shipped SaaS products.

### LAW 17 - INLINE EDIT FOR 1 FIELD, MODAL FOR 3+
Click-to-edit inline: status changes, name edits, single values. Modals: multi-field forms, related data needing context, cross-field validation.

### LAW 18 - PROGRESSIVE DISCLOSURE OVER FLAT DENSITY
Show summary. Let users drill down. Amplitude: aggregate first, user-level on click. Stripe: total first, transaction list on click. Put the insight above the fold, the detail below.

### LAW 19 - SEARCH IS NAVIGATION AT SCALE
10+ page types or 50+ records = CMD+K command palette is non-optional. Linear's command palette is the gold standard. Power users navigate entirely by keyboard once they learn it.

### LAW 20 - CONSISTENCY BEATS CREATIVITY
Stripe, Linear, Vercel age well because they enforce rigid design systems. Cards identical. 2-3 button variants. 4px spacing grid. Products that look "busy" at 3 years old made creative exceptions.

---

## Per-Product Design Library

Full per-product patterns for all 40 products are in the reference files below. Each entry covers: Layout, Signature pattern, KPIs, Navigation, Colors, Empty states, Mobile, Animation, Copy pattern, and what to Avoid.

### Analytics & Monitoring (8 products)
Datadog, Grafana, Mixpanel, Amplitude, Google Analytics 4, Segment, PostHog, Heap

→ See [references/product-library-analytics.md](references/product-library-analytics.md)

### Fintech/Payments (6 products)
Stripe, Brex, Mercury, Ramp, QuickBooks Online, Xero

→ See [references/product-library-fintech.md](references/product-library-fintech.md)

### CRM/Sales + Project/Work Management (12 products)
Salesforce Lightning, HubSpot CRM, Pipedrive, Close CRM, Attio, Linear, Jira, Asana, Monday.com, Notion, ClickUp, Height

→ See [references/product-library-crm-pm.md](references/product-library-crm-pm.md)

### DevOps/Infra + Customer Support + Marketing + Product Analytics (14 products)
Vercel, Railway, AWS Console, Render, Supabase, Intercom, Zendesk, Freshdesk, Loom, Mailchimp, Klaviyo, Beehiiv, Buffer, Pendo

→ See [references/product-library-devops-support-marketing.md](references/product-library-devops-support-marketing.md)

---

## Component Specs & Implementation

All component-level specs (KPI cards, sparklines, chart selection, date range pickers, CMD+K, animations, dark mode, mobile patterns, onboarding wizards, empty states, notification system, data tables, spacing & typography) are in the reference file below.

→ See [references/component-specs.md](references/component-specs.md)

Claude Code implementation prompts and the pre-ship checklist:

→ See [references/implementation-prompts.md](references/implementation-prompts.md)

---

## Output Artifacts

| Request | Output |
|---|---|
| Design a dashboard | Layout spec + metric hierarchy + component list |
| Review a dashboard | Laws violated + specific fixes per violation |
| Choose chart type | Chart selection table decision + code snippet |
| Build in React | Full implementation prompt filled with product details |
| Empty state | Headline + description + CTA variant for the context |
| Dark mode | ThemeProvider setup + Recharts color override pattern |
| Mobile layout | Responsive breakdown + touch target checklist |

---

## Anti-Patterns

- **Spinners instead of skeleton loaders** — All 40 products use skeletons. Spinners = perceived slowness.
- **More than 7 metrics per page** — Density is not value. 5-7 max. Datadog is the cautionary tale.
- **Decorative color instead of semantic color** — Brand color has one job: active nav + primary CTA. Never use it for trends.
- **Mobile-first workflows** — Mobile = monitoring only. Tables, complex forms, and creation flows are desktop.
- **Skipping CMD+K on 8+ nav items** — At 10+ page types or 50+ records, CMD+K is non-optional.
- **Hardcoded colors instead of CSS variables** — Exception: Recharts (SVG ignores CSS vars) — pass explicit color values via JS based on resolved theme.

---

## Related Skills

- `web-component` — Build individual React + Tailwind + shadcn/ui components
- `saas-build` — Full SaaS product orchestration (uses dashboard-design for UI decisions)
- `saas-improve` — Post-launch UI/UX improvement (applies Laws as audit criteria)
- `web-design-guidelines` — Brand and visual system decisions upstream of dashboard layout
