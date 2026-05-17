# Product Library — Analytics & Monitoring

**Products:** Datadog, Grafana, Mixpanel, Amplitude, Google Analytics 4, Segment, PostHog, Heap

---

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
