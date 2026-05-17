# Product Library — DevOps/Infra + Customer Support + Marketing + Product Analytics

---

## DevOps/Infrastructure

**Products:** Vercel, Railway, AWS Console, Render, Supabase

---

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

## Customer Support

**Products:** Intercom, Zendesk, Freshdesk, Loom

---

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

## Marketing

**Products:** Mailchimp, Klaviyo, Beehiiv, Buffer

---

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

## Product Analytics

**Products:** Pendo

---

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
