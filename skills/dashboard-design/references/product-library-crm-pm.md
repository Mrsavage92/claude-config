# Product Library — CRM/Sales + Project/Work Management

---

## CRM/Sales

**Products:** Salesforce Lightning, HubSpot CRM, Pipedrive, Close CRM, Attio

---

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

## Project/Work Management

**Products:** Linear, Jira, Asana, Monday.com, Notion, ClickUp, Height

---

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
