# Implementation Prompts & Code Templates

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
