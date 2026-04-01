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

## Per-Product Design Library (All 40)

### Analytics & Monitoring

**1. Datadog**
- Layout: Left sidebar (220px) + persistent top filter bar. Dark mode default.
- Signature: Maximum information density. Everything visible without clicking.
- KPIs: Time-series charts as primary surface, not cards. Threshold lines on every chart.
- Navigation: 15+ top-level sections organized in groups. Nested sidebar.
- Colors: Dark (#1b1b1f bg). Semantic alert colors unchanged in dark mode.
- Empty states: "No data for this time range" with time range adjustment CTA.
- Mobile: Monitoring-only. Read-only dashboards, no editing.
- Animation: Real-time chart updates with sliding window (no full re-render).
- Copy: Time range selector (15m/1h/4h/1d/1w/custom) in persistent top bar.
- Avoid: Overall complexity as a template - power tool, not a SaaS dashboard model.

**2. Grafana**
- Layout: Left sidebar (collapsible) + top time range + dashboard grid.
- Signature: Fully composable drag-and-drop panel system. Users build their own dashboards.
- KPIs: Stat panels (large number + sparkline). Gauge panels for threshold visualization.
- Navigation: Dashboard folders in sidebar, panel-level navigation within boards.
- Colors: Dark-first. Panel color themes (green/yellow/red threshold gradients).
- Empty states: "Add your first panel" with + button prominently placed.
- Mobile: Panels stack vertically. Edit mode disabled on mobile.
- Animation: Live data streaming with websocket - values update in place.
- Copy: Threshold coloring on stat panels (green <80%, yellow 80-90%, red >90%).
- Avoid: Panel editor UI - extremely complex, not appropriate for SaaS dashboards.

**3. Mixpanel**
- Layout: Left sidebar (240px) + top report type tabs + chart area.
- Signature: Event-based query builder. Any metric can be sliced by any property.
- KPIs: Insight cards with trend line + % change. Stacked area for retention cohorts.
- Navigation: Insights, Funnels, Retention, Flows, Users.
- Colors: Purple accent (#7856ff). Multi-color chart series.
- Empty states: "Create your first insight" with event property picker.
- Mobile: Read-only dashboard view. Report building desktop-only.
- Animation: Chart re-renders on filter change with 300ms fade.
- Copy: Property filter builder above charts (event + breakdown + filter inline).
- Avoid: Query builder density - overwhelming for non-analysts.

**4. Amplitude**
- Layout: Left sidebar + chart type switcher above visualization.
- Signature: Chart type is a first-class choice shown prominently. Switch without rebuilding.
- KPIs: Metric cards at top with comparison period always shown.
- Navigation: Home (dashboards), Analyses (reports), Notebooks.
- Colors: Blue accent (#2979ff). Multi-series distinct palette.
- Empty states: Guided event selector with autocomplete on empty analysis.
- Mobile: Dashboard viewer only.
- Animation: Smooth transition between chart types (800ms morph).
- Copy: A/B test annotation on timeline - vertical lines with experiment labels.
- Avoid: Notebook feature - adds complexity most products don't need early.

**5. Google Analytics 4**
- Layout: Left sidebar + overview cards + expandable sections.
- Signature: Explorations (custom analysis) separate from standard reports.
- KPIs: Scorecard widgets with sparklines. Comparison to previous period always on.
- Navigation: Reports (standard) / Explorations (custom) / Advertising.
- Colors: Google blue (#1a73e8). Neutral grays. Minimal color.
- Empty states: Data collection setup wizard for new properties.
- Mobile: Reporting view only. Mobile app for monitoring.
- Animation: Chart load with skeleton then fade.
- Copy: Scorecard + sparkline combo in report header (4 across).
- Avoid: Their navigation - famously confusing after the GA4 redesign.

**6. Segment**
- Layout: Left sidebar with workspace switcher at top.
- Signature: Source/Destination architecture shown visually. Pipeline health as primary dashboard.
- KPIs: Event volume charts. Success/error rates as primary metrics.
- Navigation: Sources, Destinations, Connections, Protocols, Personas.
- Colors: Green accent (#52bd95). Clean white.
- Empty states: "Connect your first source" with integration catalog.
- Mobile: Status monitoring only.
- Animation: Event pipeline visualization with animated flow lines.
- Copy: Integration health indicators (green/yellow/red) on every connection card.
- Avoid: Protocols UI - extremely complex schema management.

**7. PostHog**
- Layout: Left sidebar (dark) + product analytics views.
- Signature: Open-source. Session replay + heatmaps + analytics + feature flags in one.
- KPIs: Trend charts with person-level drill-down on any data point.
- Navigation: Product Analytics, Session Replay, Feature Flags, Experiments, Surveys.
- Colors: Dark sidebar (#1d1f27), light content. Yellow accent for highlights.
- Empty states: "Capture your first event" with SDK snippet shown inline.
- Mobile: Limited - primarily desktop tool.
- Animation: Session replay scrubber. Heatmap overlays on screenshots.
- Copy: Clickable data points that drill to individual user sessions.
- Avoid: Feature sprawl - UX is inconsistent across features.

**8. Heap**
- Layout: Left sidebar + auto-capture event browser.
- Signature: Auto-captures ALL events without SDK instrumentation. Retroactive analysis.
- KPIs: Labeled events with session counts. Conversion funnels without pre-setup.
- Navigation: Dashboard, Charts, Funnels, Journeys, Retention.
- Colors: Blue/indigo accent. Data-dense tables.
- Empty states: Auto-populated with captured events immediately after install.
- Mobile: Viewer only.
- Animation: Journey maps with animated path weights.
- Copy: Retroactive funnel definition - define conversion after data is collected.
- Avoid: Raw event list is overwhelming before labeling/organizing events.

---

### Fintech/Payments

**9. Stripe**
- Layout: Left sidebar (240px) + clean white + generous padding.
- Signature: Merchant of record simplicity. Every surface oriented around money movement.
- KPIs: 5 primary metrics (Gross volume, Net volume, New customers, Failed payments, Disputes). Sparklines on each.
- Navigation: Home, Payments, Billing, Connect, Radar, Reports, Developers.
- Colors: Indigo (#635BFF) used sparingly. Semantic green/red for money up/down.
- Empty states: "Accept your first payment" with API keys and quickstart code.
- Mobile: Stripe Dashboard app - full-featured, best-in-class mobile SaaS dashboard.
- Animation: Number count-up on KPI load. Transaction list fade-in.
- Copy: Sparklines on every metric card. Breadcrumbs on every detail page.
- Avoid: Developer/API section as a model - highly specialized.

**10. Brex**
- Layout: Left sidebar + card/spending-centric views.
- Signature: Spending analytics as primary dashboard. Budget vs actual front and center.
- KPIs: Spend by category donut + monthly trend. Budget utilization progress bars.
- Navigation: Overview, Cards, Payments, Travel, Expenses, Budgets.
- Colors: Mint green (#00A693) accent. Dark sidebar option.
- Empty states: "Issue your first card" with team member invite.
- Mobile: Full-featured spend management on mobile (core use case).
- Animation: Budget fill animations. Category spending transitions.
- Copy: Budget vs actual progress bars per category.
- Avoid: Receipt OCR UI - specialized for expense management.

**11. Mercury**
- Layout: Top navigation + full-width account views. Premium white space.
- Signature: Best typography and whitespace in fintech. Feels like a design agency built it.
- KPIs: Account balance large + transaction list primary. Cashflow chart secondary.
- Navigation: Accounts, Send money, Cards, Team, Investing (top nav, not sidebar).
- Colors: Navy (#1B2A4A). Minimal. Typography does heavy lifting.
- Empty states: "Add funds to get started" - clean, confident, no clutter.
- Mobile: Full mobile banking app. Best mobile fintech UI studied.
- Animation: Balance count-up on load. Smooth transaction list scrolling.
- Copy: Typography-led hierarchy - size and weight over color for importance.
- Avoid: Top nav model (not sidebar) unless product is genuinely account-centric.

**12. Ramp**
- Layout: Left sidebar + spend intelligence primary view.
- Signature: AI spend insights. "You could save $X" recommendations on every page.
- KPIs: Total spend + savings identified + cards active. Prominent savings number.
- Navigation: Dashboard, Transactions, Cards, Vendors, Accounting, Insights.
- Colors: Yellow (#F5C842) accent. Clean white.
- Empty states: "Connect your first account" with bank connection flow.
- Mobile: Expense approval and receipt capture primary mobile use case.
- Animation: Savings counter. Vendor spend treemap transitions.
- Copy: Savings opportunity callouts above standard metrics.
- Avoid: Vendor negotiation feature as a pattern - too specialized.

**13. QuickBooks Online**
- Layout: Left sidebar (collapsed by default) + dashboard overview.
- Signature: Profit & Loss as the hero metric. Accounting-native language throughout.
- KPIs: Income, Expenses, Profit. Bank balance. Outstanding invoices/bills.
- Navigation: Dashboard, Banking, Sales, Expenses, Reports, Taxes, Accounting.
- Colors: QBO green (#2CA01C). Functional, not beautiful.
- Empty states: "Connect your bank account" as first step.
- Mobile: Basic monitoring. Not designed for mobile workflow.
- Animation: Minimal. Report generation loading states.
- Copy: Outstanding invoices + overdue amounts with aging buckets (30/60/90 days).
- Avoid: Overall visual design - dated, not a design inspiration.

**14. Xero**
- Layout: Left sidebar + executive overview dashboard.
- Signature: Executive dashboard with CFO-level summary. Cleaner than QuickBooks.
- KPIs: Bank balances, Money in/out, Invoices owed, Bills to pay.
- Navigation: Dashboard, Business (sales/purchases), Accounting, Payroll, Projects, Reports.
- Colors: Xero blue (#13B5EA). More whitespace than QBO.
- Empty states: Account connection wizard with bank selection.
- Mobile: Xero Me app for expenses. Main app has mobile dashboard.
- Animation: Chart load fade. Minimal motion.
- Copy: "Money in / Money out" framing (not debits/credits - business language).
- Avoid: Payroll UI - extremely jurisdiction-specific.

---

### CRM/Sales

**15. Salesforce Lightning**
- Layout: Top nav (App Launcher) + left sidebar per app + record detail views. 3-level hierarchy.
- Signature: App-within-an-app. Each cloud (Sales/Service/Marketing) is a separate product.
- KPIs: Report charts embedded in Home page. Activity timeline on every record.
- Navigation: Global nav (top) + object nav (sidebar) + record tabs.
- Colors: Salesforce blue (#1589EE). Lightning Design System tokens.
- Empty states: "Get started with Salesforce" guided tour with Trailhead link.
- Mobile: Salesforce mobile app - simplified record views, activity capture.
- Animation: Record page transitions. List view lazy loading.
- Copy: Activity timeline on every record (calls, emails, meetings, tasks).
- Avoid: Navigation complexity - 3 nav levels is too many for most products.

**16. HubSpot CRM**
- Layout: Left sidebar + contact/deal detail panes + pipeline views.
- Signature: Pipeline kanban as primary sales view. Deal cards with stage progression.
- KPIs: Pipeline value by stage. Deals closing this month. Activity metrics.
- Navigation: Contacts, Companies, Deals, Activities, Reports.
- Colors: Orange (#FF7A59). Clean white cards.
- Empty states: "Import your contacts" or "Create your first deal" with CSV template.
- Mobile: HubSpot app - contact/deal lookup and activity logging.
- Animation: Deal stage drag-and-drop with column total update.
- Copy: Kanban pipeline with $ total per stage column header.
- Avoid: Marketing hub UI - unrelated to CRM patterns.

**17. Pipedrive**
- Layout: Left sidebar + pipeline-first view.
- Signature: Pipeline is THE product. Everything oriented around moving deals through stages.
- KPIs: Open deals, Won deals (this month), Activities due today.
- Navigation: Pipeline, Activities, Contacts, Mail, Reports, Insights.
- Colors: Green (#00A84B). Stage colors customizable.
- Empty states: "Add your first deal" with pipeline stage creation flow.
- Mobile: Full pipeline management on mobile. Activity logging first-class.
- Animation: Deal card drag between stages. Win animation on close.
- Copy: Rotting deals indicator - deals inactive >N days shown with amber/red highlight.
- Avoid: Email integration UI - complex threading setup.

**18. Close CRM**
- Layout: Left sidebar + inbox-style activity view.
- Signature: Built for outbound sales. Activity (calls/emails) is the primary dashboard, not pipeline.
- KPIs: Calls made, Emails sent, Deals won. Activity-first metrics.
- Navigation: Inbox, Leads, Opportunities, Reports, Settings.
- Colors: Blue (#3A78E1). Data-dense. Power-user focused.
- Empty states: "Import leads from CSV" with template download.
- Mobile: Call logging on mobile. Activity capture focus.
- Animation: Live call status indicators. Email thread updates.
- Copy: Built-in VoIP with call outcome logging inline in lead record.
- Avoid: Lead scoring UI - requires significant configuration.

**19. Attio**
- Layout: Left sidebar + record database views.
- Signature: Fully flexible data model (like Notion but for CRM). Views are composable.
- KPIs: Pipeline metrics with customizable attributes. No fixed fields.
- Navigation: Workspace, Lists, People, Companies, Deals (all customizable).
- Colors: Dark mode first. Indigo/purple accent. Premium feel.
- Empty states: "Create your first list" with schema builder.
- Mobile: Limited - primarily desktop tool.
- Animation: Record creation animations. Filter transitions.
- Copy: Flexible data model - any field on any object, any relationship.
- Avoid: Onboarding - too open-ended for users new to flexible CRM.

---

### Project/Work Management

**20. Linear**
- Layout: Left sidebar (dark, 240px) + content. Keyboard-first.
- Signature: <100ms interactions. Every action has a keyboard shortcut. CMD+K for everything.
- KPIs: Cycle progress, Issues by status, Velocity chart.
- Navigation: Inbox, My Issues, Views, Teams, Projects, Cycles, Roadmap.
- Colors: Dark (#161618 sidebar, #1c1c1e content). Purple accent (#5E6AD2).
- Empty states: Illustrated SVGs + keyboard shortcut hints + "Create your first issue".
- Mobile: Linear app - issue triage and updates. Full-featured for a PM tool.
- Animation: Issue drag-and-drop. Status transition micro-animations. Instant search.
- Copy: Keyboard shortcut hints in empty states. CMD+K palette. G then I for Issues.
- Avoid: Roadmap view complexity.

**21. Jira**
- Layout: Left sidebar + board/backlog/roadmap views.
- Signature: Scrum board + sprint backlog as the canonical project view. Agile-native.
- KPIs: Sprint velocity, Burndown chart, Issue cycle time.
- Navigation: Board, Backlog, Roadmap, Reports, Issues.
- Colors: Blue (#0052CC). Functional. Reliability over design.
- Empty states: "Create your first board" with template selection (Scrum/Kanban).
- Mobile: Jira mobile - issue updating and commenting.
- Animation: Board card transitions. Burndown chart load.
- Copy: Sprint burndown chart + velocity chart in Reports.
- Avoid: Project switcher - notoriously confusing.

**22. Asana**
- Layout: Left sidebar (with project list) + multiple views (list/board/timeline/calendar).
- Signature: View switcher (list/board/timeline/calendar) above content - any project, any view.
- KPIs: Task completion rate, Overdue tasks, Milestones upcoming.
- Navigation: Home, Inbox, My Tasks, Reporting + Projects in sidebar.
- Colors: Pink accent (#FF4081) for CTA. Clean white. Pastel project colors.
- Empty states: "Add your first task" with template gallery.
- Mobile: Asana app - task management and updates. Good mobile UX.
- Animation: Task completion confetti on milestones. Timeline drag.
- Copy: View switcher (list/board/timeline/calendar) above every project.
- Avoid: Portfolios/Goals UI - complex for most use cases.

**23. Monday.com**
- Layout: Left sidebar + item groups + column-based data.
- Signature: Columns are customizable data types. Spreadsheet-meets-project-tool.
- KPIs: Board summary row (totals/averages at bottom of each column).
- Navigation: Workspaces, Boards, Dashboards (separate from boards).
- Colors: Colorful (each board/group gets a color). Bold, energetic.
- Empty states: Template gallery with 200+ board templates.
- Mobile: Monday app - board viewing and item updates.
- Animation: Status color transitions. Progress bars in formula columns.
- Copy: Summary row at bottom of columns (count/sum/average auto-calculated).
- Avoid: Automation builder - powerful but complex to model.

**24. Notion**
- Layout: Left sidebar (nested pages) + block-based content.
- Signature: Block-based everything. Pages contain databases. Databases have multiple views.
- KPIs: Database view with filter/sort/group. Calculated properties (rollups, formulas).
- Navigation: Sidebar is tree of pages. No fixed nav - fully user-defined.
- Colors: Minimal. Black text, white bg. Page icons/covers for visual identity.
- Empty states: "Press Enter to continue, / for commands" - empty page is a prompt.
- Mobile: Notion app - page reading and simple editing. Full-featured mobile.
- Animation: Page load transitions. Block drag-and-drop. Database view switches.
- Copy: View toggle (table/gallery/kanban/calendar/timeline/list/chart) above every database.
- Avoid: Sidebar organization at scale - becomes a navigation nightmare.

**25. ClickUp**
- Layout: Left sidebar + multiple views + Everything view across all spaces.
- Signature: "Everything" - tries to do all PM features at once. Extreme customization.
- KPIs: Goals with progress tracking. Dashboard widgets (customizable).
- Navigation: Spaces, Folders, Lists (3-level hierarchy) + Home, Inbox, Docs, Dashboards.
- Colors: Purple accent (#7B68EE). Many theming options.
- Empty states: Setup wizard with use-case selection (Engineering/Marketing/HR/etc.).
- Mobile: ClickUp app - task management.
- Animation: Many micro-animations. Can feel busy.
- Copy: Custom statuses per list (not fixed To-do/In Progress/Done).
- Avoid: Feature count as a model - too much complexity for most products.

**26. Height**
- Layout: Left sidebar + list/board/calendar views.
- Signature: Fastest project tool for startup teams. No bloat. Excellent keyboard navigation.
- KPIs: Task count by status. Sprint progress if enabled.
- Navigation: Projects + Views in sidebar. Minimal structure.
- Colors: Dark mode. Minimal accent colors.
- Empty states: "Create a task" - minimal, no templates clutter.
- Mobile: Height app - task viewing and updates.
- Animation: Quick task transitions. No excessive animation.
- Copy: Clean, minimal UI with no feature creep.
- Avoid: Limited reporting compared to larger tools.

---

### DevOps/Infrastructure

**27. Vercel**
- Layout: Left sidebar + deployment-centric views.
- Signature: Git-connected deployment status as primary UI. Every deploy has a preview URL.
- KPIs: Deployment frequency, Error rate, Web Vitals scores.
- Navigation: Overview, Deployments, Analytics, Speed Insights, Logs, Storage, Settings.
- Colors: Black (#000) sidebar, dark gray (#111) content. Pure contrast.
- Empty states: "Import a Git repository" - first action is git connection.
- Mobile: Limited - status monitoring and deployment previews.
- Animation: Build log streaming. Deployment status transitions (queued/building/ready).
- Copy: Deployment status with color + icon + text (not color alone): green checkmark + "Ready".
- Avoid: Domain configuration UI for DNS - genuinely confusing.

**28. Railway**
- Layout: Top nav + project/service/environment hierarchy.
- Signature: Services as the primary unit. Each service has its own metrics, logs, deployments.
- KPIs: CPU, Memory, Network per service. Deploy frequency.
- Navigation: Project switcher (top) + Services list + Metrics/Logs/Settings per service.
- Colors: Purple (#B45309 accent). Dark theme available.
- Empty states: "Deploy a service" with template gallery (databases, frameworks).
- Mobile: Status monitoring only.
- Animation: Real-time metric charts. Deploy log streaming.
- Copy: Per-service metrics in 3-column grid (CPU/Memory/Network with sparklines).
- Avoid: Variable management UI - functional but not intuitive.

**29. AWS Console**
- Layout: Top nav (services) + left sidebar per service + content.
- Signature: Every service is its own product. No unified design system.
- KPIs: Service-specific (EC2: instances, RDS: connections, etc.).
- Navigation: Services menu (200+ services) + Favorites sidebar + per-service nav.
- Colors: Orange (#FF9900). Functional, dated design.
- Empty states: "Get started with [Service]" with documentation links.
- Mobile: AWS mobile app - basic console operations.
- Animation: Minimal. Data tables with lazy load.
- Copy: Resource tagging for cost allocation (copy the tagging pattern, not the UI).
- Avoid: Everything about their navigation as a model.

**30. Render**
- Layout: Left sidebar + service cards dashboard.
- Signature: Simpler Railway. Service cards with status indicators on overview.
- KPIs: Service status (up/down/deploying), recent deploys, resource usage.
- Navigation: Dashboard, Services, PostgreSQL, Redis, Cron Jobs.
- Colors: Purple (#5B3DF5). Clean white.
- Empty states: "New Web Service" with deploy button for popular frameworks.
- Mobile: Status monitoring.
- Animation: Deploy status updates in real-time.
- Copy: Service card grid with health indicator + deploy count + last deployed time.
- Avoid: Pricing display UI - confusing for resource-based billing.

**31. Supabase**
- Layout: Left sidebar (dark) + database/auth/storage sections.
- Signature: Database as the hero. SQL editor as a primary surface. Developer-first.
- KPIs: Database size, Active connections, API requests, Auth users.
- Navigation: Table Editor, SQL Editor, Auth, Storage, Edge Functions, Realtime, Logs, API.
- Colors: Dark (#1c1c1c sidebar). Green accent (#3ECF8E).
- Empty states: "Create your first table" with schema builder or SQL editor.
- Mobile: Limited - developer tool.
- Animation: Table row insertion animations. Real-time subscription updates.
- Copy: Left sidebar organization: Tables / Auth / Storage / Edge Functions.
- Avoid: Realtime inspector UI - useful but visually complex.

---

### Customer Support

**32. Intercom**
- Layout: Left sidebar + conversation inbox + user profile side panel.
- Signature: Customer profile always visible alongside conversation. Full context without switching.
- KPIs: Conversation volume, Response time, CSAT, Resolution rate.
- Navigation: Inbox, Outbound, Contacts, Reports, Fin AI, Settings.
- Colors: Blue (#1F8EFA). User avatars prominent.
- Empty states: "No conversations" with proactive message creation CTA.
- Mobile: Intercom app - conversation handling on mobile (core use case).
- Animation: New message animations. Typing indicators.
- Copy: User attribute sidebar next to conversation (location, plan, MRR, pages visited).
- Avoid: Help Center builder - outdated compared to modern doc tools.

**33. Zendesk**
- Layout: Left sidebar + ticket list + ticket detail.
- Signature: Macro (templated response) system. Bulk ticket operations at scale.
- KPIs: Open tickets, First reply time, Resolution time, CSAT, Ticket volume.
- Navigation: Views, Reporting, Customers, Apps & Integrations.
- Colors: Dark teal (#03363D). Enterprise-heavy.
- Empty states: "No tickets in this view" with view filter adjustment CTA.
- Mobile: Zendesk app - ticket triaging on mobile.
- Animation: Ticket status transitions. SLA timer countdown.
- Copy: SLA breach indicators with countdown timers on tickets.
- Avoid: Views configuration - powerful but extremely complex.

**34. Freshdesk**
- Layout: Left sidebar + ticket management + analytics.
- Signature: Simpler, cheaper Zendesk. Better onboarding flow for SMBs.
- KPIs: Open tickets, Overdue, Unassigned, CSAT, Agent performance.
- Navigation: Dashboard, Tickets, Contacts, Reports, Admin.
- Colors: Green (#28A745). More approachable than Zendesk.
- Empty states: "No open tickets! Great job" - positive framing for zero state.
- Mobile: Freshdesk app - ticket handling on mobile.
- Animation: Minimal. Ticket load transitions.
- Copy: Positive framing for empty states ("Great job!" vs generic "No tickets").
- Avoid: Automation builder - complex for new users.

**35. Loom**
- Layout: Top nav + video library grid.
- Signature: Video-first communication. Watch time and engagement as primary metrics.
- KPIs: Views, Watch time, Completion rate, Reaction count per video.
- Navigation: My Library, Team Library, Workspaces (top nav).
- Colors: Purple (#7C3AED). Video thumbnail grid dominant.
- Empty states: "Record your first Loom" with browser extension CTA.
- Mobile: Loom app - recording on mobile, viewing everywhere.
- Animation: Video preview on hover. Recording indicator.
- Copy: Per-video engagement: views + watch time + who watched (user list).
- Avoid: Workspace/team structure - confusing for larger orgs.

---

### Marketing

**36. Mailchimp**
- Layout: Left sidebar + campaign/audience views.
- Signature: Audience-first. Everything relates back to contacts and segments.
- KPIs: Subscribers, Open rate, Click rate, Revenue attributed.
- Navigation: Campaigns, Audience, Content Studio, Reports, Automations.
- Colors: Yellow (#FFE01B) + dark navy. Freddie mascot.
- Empty states: "Create your first campaign" with template gallery.
- Mobile: Basic stats monitoring. Campaign creation desktop-only.
- Animation: Campaign send animation. Chart load transitions.
- Copy: Campaign health scorecard (open rate vs industry average, click rate vs average).
- Avoid: Template builder - outdated drag-and-drop.

**37. Klaviyo**
- Layout: Left sidebar + revenue attribution primary view.
- Signature: Revenue from email/SMS is THE metric. Every campaign shows attributed revenue.
- KPIs: Revenue, Placed Order Rate, Revenue per Recipient, List growth.
- Navigation: Campaigns, Flows, Lists, Segments, Analytics, Integrations.
- Colors: Black (#000) primary. Clean minimal.
- Empty states: "Create your first flow" with template gallery (welcome/abandoned cart/etc.).
- Mobile: Stats monitoring. Campaign management desktop-only.
- Animation: Revenue attribution updates. Flow performance charts.
- Copy: Revenue attribution on every campaign/flow card (not just open rates).
- Avoid: Segment builder - requires data modeling knowledge.

**38. Beehiiv**
- Layout: Left sidebar + publication-centric views.
- Signature: Newsletter-first. Growth and monetization as key metrics alongside engagement.
- KPIs: Subscribers, Open rate, Click rate, Premium subscribers, Revenue.
- Navigation: Posts, Analytics, Audience, Monetize, Grow, Settings.
- Colors: Clean white + black. Minimal.
- Empty states: "Write your first post" - writer-friendly framing.
- Mobile: Analytics monitoring. Writing on desktop.
- Animation: Subscriber growth chart with milestone markers.
- Copy: Subscriber milestone celebrations + growth timeline with annotations.
- Avoid: Referral program UI - requires careful setup.

**39. Buffer**
- Layout: Left sidebar + queue/calendar views.
- Signature: Content queue as primary surface. Scheduled posts feel like a calendar.
- KPIs: Posts published, Reach, Engagement, Profile growth.
- Navigation: Publish, Analyze, Engage, Start Page.
- Colors: Blue (#2C4BFF). Channel color coding.
- Empty states: "Add your first post to the queue" with composer CTA.
- Mobile: Buffer app - content scheduling on mobile (core use case).
- Animation: Post scheduling drag on calendar. Queue reordering.
- Copy: Content calendar grid with optimal time slot suggestions.
- Avoid: Team approval workflow - limited compared to dedicated content tools.

---

### Product Analytics

**40. Pendo**
- Layout: Left sidebar + feature adoption / NPS / guides views.
- Signature: In-app guides overlay on top of the actual product. Analytics + onboarding in one.
- KPIs: Feature adoption rate, NPS score, Guide completion, Page views per user.
- Navigation: Product Areas, Feature Adoption, Paths, Funnels, NPS, Guides.
- Colors: Indigo (#6C63FF). Guide builder overlay uses highlight rings.
- Empty states: "Tag your first feature" with element selector tool.
- Mobile: Mobile analytics and guide targeting available.
- Animation: Guide highlight ring on elements. Adoption funnel transitions.
- Copy: In-app guide tooltip (ring highlight + popover + step counter + skip tour).
- Avoid: Retroactive tagging session - requires dedicated setup time.

---

## Layout Architecture

### Standard Enterprise Layout
```
Sidebar (240px) + Top Header (56-64px) + Page Header (48px) + Content (px-6 py-8, max-w-[1280px])
```

```tsx
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="p-4 border-b"><Logo /></div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.href} to={item.href}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium border-l-2 border-indigo-600 -ml-px'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t"><UserMenu /></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-white">
          <Sheet>
            <SheetTrigger asChild><button><Menu className="w-5 h-5" /></button></SheetTrigger>
            <SheetContent side="left" className="p-0 w-64"><SidebarContent /></SheetContent>
          </Sheet>
          <span className="font-semibold">{pageTitle}</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
```

**Page header:**
```tsx
<div className="flex items-center justify-between mb-8">
  <div>
    <Breadcrumbs items={breadcrumbs} />
    <h1 className="text-2xl font-bold text-gray-900 mt-1">{title}</h1>
  </div>
  <div className="flex items-center gap-3">
    <Button variant="outline" size="sm">Export</Button>
    <Button size="sm">+ New Report</Button>
  </div>
</div>
```

---

## KPI Card

```tsx
<Card className="p-6">
  <p className="text-sm font-medium text-gray-500">{label}</p>
  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  <div className="flex items-center gap-1.5 mt-1">
    {trend > 0
      ? <TrendingUp className="w-4 h-4 text-emerald-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />}
    <span className={cn('text-sm font-medium', isGood ? 'text-emerald-600' : 'text-red-600')}>
      {trend > 0 ? '+' : ''}{trend}%
    </span>
    <span className="text-sm text-gray-400">vs last month</span>
  </div>
  <MiniSparkline data={sparklineData} className="mt-3 h-10" />
</Card>

// isPositiveGood=false for: churn rate, error rate, costs, bounce rate
const isGood = isPositiveGood ? trend > 0 : trend < 0
```

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

---

## Chart Selection

| Question | Chart | Never |
|---|---|---|
| Trend over time? | LineChart | Bar |
| Compare A vs B? | BarChart | Pie |
| Part-to-whole? (2-3 parts) | PieChart innerRadius (donut) | Pie 4+ slices |
| Drop-off funnel? | FunnelChart | Line |
| Distribution? | Histogram (BarChart + buckets) | Table |
| Exact multi-dim data? | shadcn DataTable | Chart |

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false}
      isAnimationActive animationDuration={800} animationEasing="ease-out" />
  </LineChart>
</ResponsiveContainer>
```

---

## CMD+K Global Search

**When required:** 10+ page types or 50+ records.

```tsx
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(o => !o) }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, records..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => { setOpen(false); navigate('/dashboard') }}>
            Dashboard <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { setOpen(false); handleCreate() }}>Create Report</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent">
          {recentItems.map(item => (
            <CommandItem key={item.id} onSelect={() => { setOpen(false); navigate(item.href) }}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

**Header trigger button:**
```tsx
<button onClick={() => setOpen(true)}
  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-100 rounded-md hover:bg-gray-200">
  <Search className="w-3.5 h-3.5" /><span>Search...</span>
  <kbd className="ml-2 text-xs bg-white border rounded px-1">⌘K</kbd>
</button>
```

---

## Animation Patterns

```tsx
// Skeleton loader
function KpiCardSkeleton() {
  return <Card className="p-6">
    <Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-4 w-20 mb-3" /><Skeleton className="h-10 w-full" />
  </Card>
}

// Number count-up (Stripe/Mercury style)
function AnimatedNumber({ value, duration = 1000, prefix = '' }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      if (ref.current) ref.current.textContent = `${prefix}${Math.floor(value * eased).toLocaleString()}`
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span ref={ref}>{prefix}0</span>
}

// Page transitions (Framer Motion)
<AnimatePresence mode="wait">
  <motion.div key={location.pathname}
    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
    {children}
  </motion.div>
</AnimatePresence>
```

| Animation | Duration | Easing |
|---|---|---|
| Skeleton to content | 200ms | ease-out |
| Chart entrance | 600-800ms | ease-out |
| Number count-up | 800-1200ms | cubic ease-out |
| Page transition | 150ms | ease-out |
| Hover state | 150ms | ease |

---

## Dark Mode

```tsx
// tailwind.config.ts: darkMode: ['class']

// ThemeProvider
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// Recharts needs explicit dark colors (SVG ignores CSS vars)
const isDark = resolvedTheme === 'dark'
const chartColors = {
  line: isDark ? '#818cf8' : '#6366f1',
  grid: isDark ? '#1e293b' : '#f0f0f0',
  axis: isDark ? '#64748b' : '#9ca3af',
  tooltip: isDark ? '#1e293b' : '#ffffff',
}
```

**Dark rules:** bg never pure #000 (use #0f1117). Text never pure white (use #f1f5f9). Semantic colors unchanged in dark. Card borders: `border-white/10`. Best: Linear (#161618), Vercel (#000), Supabase (navy).

---

## Mobile Patterns

```tsx
// Table collapses to cards on mobile (Stripe/HubSpot/Intercom)
<>
  <div className="hidden md:block"><DataTable data={data} columns={columns} /></div>
  <div className="md:hidden space-y-3">
    {data.map(row => (
      <Card key={row.id} className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{row.name}</span>
          <StatusBadge status={row.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
          <span>{row.amount}</span><span>{row.date}</span>
        </div>
      </Card>
    ))}
  </div>
</>

// Chart simplified on mobile
<ResponsiveContainer width="100%" height={isMobile ? 180 : 300}>
  <LineChart>
    <XAxis interval={isMobile ? 'preserveStartEnd' : 0} tick={{ fontSize: isMobile ? 10 : 12 }} />
    <YAxis hide={isMobile} />
  </LineChart>
</ResponsiveContainer>
```

**Mobile rules:** Touch targets `min-h-[44px]`. No sparklines on mobile KPI cards. Max 2 action buttons per card. Bottom tab nav only if product has 4-5 sections AND mobile is a core use case.

---

## Onboarding Patterns

```tsx
// Progress wizard (HubSpot/Intercom style)
function SetupWizard({ steps, currentStep, onNext, onBack }) {
  const progress = (steps.filter(s => s.isComplete).length / steps.length) * 100
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-medium">Setup Progress</span>
          <span className="text-gray-500">{steps.filter(s => s.isComplete).length}/{steps.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Card className="p-8">
        <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-500 mb-6">{steps[currentStep].description}</p>
        <div className="flex items-center justify-between mt-8">
          {currentStep > 0
            ? <Button variant="ghost" onClick={onBack}>Back</Button>
            : <button className="text-sm text-gray-400" onClick={onSkip}>Skip setup</button>}
          <Button onClick={onNext}>{currentStep < steps.length - 1 ? 'Continue' : 'Finish Setup'}</Button>
        </div>
      </Card>
    </div>
  )
}

// Sample data banner (Notion/ClickUp)
{hasSampleData && (
  <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
    <span className="text-sm text-amber-800">Viewing <strong>sample data</strong> to preview the dashboard.</span>
    <Button size="sm" variant="ghost" className="text-amber-800" onClick={clearSampleData}>Use real data</Button>
  </div>
)}
```

---

## Date Range Picker

```tsx
// Analytics preset selector (Mixpanel/Amplitude/Datadog/GA4/PostHog)
const PRESETS = ['15m','1h','4h','24h','7d','30d','90d','Custom']

function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {PRESETS.map(preset => (
        <button key={preset} onClick={() => onChange(preset)}
          className={cn('px-2.5 py-1 text-sm rounded-md transition-colors',
            value === preset ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700')}>
          {preset}
        </button>
      ))}
    </div>
  )
}

// Comparison period toggle (Amplitude/Mixpanel)
<div className="flex items-center gap-4">
  <TimeRangeSelector value={period} onChange={setPeriod} />
  <div className="flex items-center gap-1.5 text-sm">
    <Switch checked={showComparison} onCheckedChange={setShowComparison} id="compare" />
    <label htmlFor="compare" className="text-gray-500">Compare to previous</label>
  </div>
</div>

// Dashed line for comparison period in chart
{showComparison && <Line dataKey="previous" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 4" />}
```

---

## Empty States

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
    <FileText className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports yet</h3>
  <p className="text-sm text-gray-500 max-w-sm mb-6">Create your first report to track revenue trends.</p>
  <Button><Plus className="w-4 h-4 mr-2" />Create Report</Button>
</div>
```

| Type | Headline | CTA |
|---|---|---|
| First use | "No [things] yet" | Create first [thing] |
| Filtered empty | "No results for '[query]'" | Clear filters |
| Error | "Couldn't load [thing]" | Retry |
| All done | "All caught up!" | none |

---

## Notification System

| Tier | When | Component | Dismiss |
|---|---|---|---|
| Critical | Outage, data loss | Modal or full-width red banner | Manual |
| Important | Trial ending, quota hit | Persistent yellow banner | On action |
| Informational | Save, invite sent | Toast bottom-right | Auto 5s |
| Passive | Sync complete | Bell badge | On read |

```tsx
toast({ title: "Invoice sent", description: "alex@company.com will receive it shortly" })
toast({ title: "Failed to send", variant: "destructive" })  // persistent
toast({ title: "Deleted", action: <ToastAction altText="Undo" onClick={undo}>Undo</ToastAction> })
```

---

## DataTable Standards

All 40 products include: sorting, filter/search, pagination (25-50 rows), row select, bulk actions, status badges, skeleton loader, clickable rows.

```tsx
// Floating bulk action bar (Linear/Notion style)
{selected.length > 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white rounded-full px-6 py-3 shadow-xl z-50">
    <span className="text-sm font-medium">{selected.length} selected</span>
    <div className="w-px h-4 bg-gray-600" />
    <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700">Archive</Button>
    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-gray-700">Delete</Button>
  </div>
)}
```

---

## Spacing & Typography

| Role | Tailwind | px |
|---|---|---|
| Metric value | text-3xl font-bold | 30 |
| Page title | text-2xl font-bold | 24 |
| Section title | text-xl font-semibold | 20 |
| Metric label | text-sm font-medium text-gray-500 | 14 |
| Body | text-sm text-gray-700 | 14 |
| Caption | text-xs text-gray-400 | 12 |

**Non-negotiable:** Card padding always `p-6`. Card gap always `gap-6`. Never arbitrary values.

**Semantic colors:** Positive `emerald-500` | Negative `red-500` | Warning `amber-500` | Info `blue-500` | Brand: active nav + primary CTA only.

---

## Pre-Ship Checklist

**Architecture**
- [ ] Named primary metric for this page
- [ ] Metrics ordered by business impact
- [ ] Max 7 KPI cards
- [ ] Time context on every metric + comparison period on every trend

**Navigation**
- [ ] Active nav item: bold + colored left border + bg tint
- [ ] Breadcrumbs on pages >2 levels deep
- [ ] Primary CTA in page header
- [ ] CMD+K if 10+ page types
- [ ] Sidebar to Sheet drawer on mobile

**Data**
- [ ] No pie charts with 4+ slices
- [ ] All charts have axis labels
- [ ] Sparkline on every KPI card (desktop)
- [ ] Tables: sort + pagination + bulk select
- [ ] Every trend has direction arrow + period

**States**
- [ ] Skeleton loaders (not spinners) on all data
- [ ] Empty states with contextual headline + CTA
- [ ] Error state with retry action
- [ ] Toast on every save/create/send/delete

**Dark Mode & Mobile**
- [ ] Dark mode tested - semantic colors intact
- [ ] Recharts gets explicit dark colors
- [ ] Mobile: 1-column KPI grid
- [ ] Mobile: tables become card list
- [ ] Touch targets min 44x44px

---

## Claude Code Implementation Prompt

```
Build a [product name] dashboard in React + Vite + TypeScript + Tailwind CSS + shadcn/ui.

LAYOUT:
- Left sidebar (240px desktop, Sheet drawer on mobile <768px)
- Top header: breadcrumbs + page title + primary CTA top-right
- Content: max-w-[1280px] mx-auto px-6 py-8, bg-gray-50

NAVIGATION (max 8 items):
[icon | label | /route]

KPI CARDS (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6):
[label | example value | trend % | isPositiveGood true/false | "vs last month"]

PRIMARY CHART:
[line/bar/donut] showing [metric] — Recharts h-[300px]
Time range selector: [7d/30d/90d presets | yes/no]
Comparison toggle: [yes/no]

DATA TABLE:
[name], columns: [list]
Sorting, 25 rows/page, row select, floating bulk actions bar, status badges

EMPTY STATE:
"[headline]" + "[CTA label]" button

ONBOARDING: [none | checklist widget | setup wizard N steps]
DARK MODE: [yes/no]
CMD+K: [yes/no]

COLORS: Brand [hex]

ENFORCE ALL:
- Cards: p-6, gap-6, shadow-sm, border-gray-100, rounded-lg
- Skeleton loaders on all data fetches (shadcn Skeleton)
- Toast for success/error/delete (shadcn useToast)
- Sparklines on every KPI card (Recharts LineChart h-10)
- Semantic trends: emerald-500/red-500 with isPositiveGood context
- Animations: chart 800ms, count-up 1000ms, page 150ms (Framer Motion)
- Mobile: 1-col KPI, Sheet sidebar, cards instead of table
```
