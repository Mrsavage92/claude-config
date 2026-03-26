# /web-page

Build one complete, production-quality page with a per-page review loop before moving on.

## When to Use
- Building any page in an existing scaffolded project
- Called per-page by /saas-build — not all pages at once

## Critical Rule
**One page at a time. Build it. Review it. Fix it. Only then move to the next.**
The old pattern (build all pages, review at the end) produced thin, empty-feeling pages. This skill enforces the per-page loop.

---

## Process

### Step 1 — Read Context
Read `~/.claude/web-system-prompt.md`.
Read `SCOPE.md` for the page definition (purpose, data, empty state, loading state, error state, signature element).
Read `CLAUDE.md` for color job, design decisions.
Read `src/styles/index.css` and `src/components/` listing.

If SCOPE.md does not have a definition for the requested page: define it now (all 5 fields) and add it to SCOPE.md before building.

### Step 2 — Enforce Page Order

**Is this a landing page request?**
YES → build it. This is always valid.

**Is this an app page request, and does `/` (landing page) exist?**
NO → build the landing page first. No exceptions. The landing page is the product's first impression and must exist before any dashboard or feature page.

### Step 3 — Page Design Brief (per page)

Before writing a single component, answer these for this specific page:

1. **What does a brand-new user with zero data see?** Define the empty state CTA.
2. **What is the signature element?** One thing that makes this page visually interesting. Not decoration — something that makes the data/purpose feel alive. Examples: animated stat counter, progress arc, timeline, data visualisation, contextual illustration.
3. **Where does the primary color appear?** Maximum 2 places. Name them.
4. **What is the typography hierarchy?** At minimum: one heading (font-semibold text-base or larger) + body text (text-sm) + captions (text-xs). Never all text-sm.

### Step 4 — Page-Type Templates

#### Landing Page (`/`)
Structure: Nav → Hero → Features → How It Works → Pricing → Final CTA → Footer

**Hero build sequence — follow in order:**

1. **Animated background first** — call `mcp__magic__21st_magic_component_inspiration` with query "animated background hero [dark/enterprise/grid]". Then `mcp__magic__21st_magic_component_builder`. Set `opacity: 0.2`, `z-index: -1`, wrap in `prefers-reduced-motion`. If MCP unavailable: CSS grid lines pattern from `web-system-prompt.md` Visual Signature Elements.

2. **Product visual mockup** — built from shadcn primitives shaped like the real app:
   - Browser chrome: three colored dots (`bg-destructive/50`, `bg-yellow-400/50`, `bg-green-500/50`) + URL bar showing `app.[product].com.au`
   - Sidebar: column of muted icon-shaped divs, first one `bg-primary/80` (active nav state)
   - Content: 3 stat cards (`border border-border/40 bg-background/60`), each with a muted label div + bold value div + colored bottom bar
   - Data table: 3-4 rows, each with a colored dot + muted line divs + status pill shape
   - Wrap entire mockup in a glow container: `absolute -inset-4 rounded-3xl bg-gradient-to-b from-brand/15 to-transparent blur-2xl`
   - This is NOT optional. Every hero must have this.

3. **Headline** — display size (`text-display`), `text-balance`, negative letter-spacing. Key phrase wrapped in `.gradient-text` class. Never the full headline — just 2-3 words.

4. **CTAs** — Primary: `Button size="lg"` (bg-primary — this is one of the 2 allowed uses of primary color on this page). Secondary: `Button size="lg" variant="outline"`.

5. **Trust stats row** — 3 real numbers from the product value prop. Format: large bold number + small muted label.

6. **Framer Motion entrance** — stagger using `web-animations` skill Technique 3 STAGGER pattern. Order: pill → headline → subheadline → CTAs → stats → product visual (slight delay so it "loads in" last).

**Features section:**
- Run `mcp__magic__21st_magic_component_inspiration` for "feature cards dark enterprise SaaS" before writing anything
- 3-6 cards. Each: icon in `bg-primary/10 rounded-lg p-2 w-fit` + title + 2 sentences. Icon is `text-primary` — second allowed use of primary color on landing page.
- `whileInView` stagger from `web-animations` Technique 3.

**Pricing:**
3 tiers, center highlighted: `border-primary/50 bg-primary/5 shadow-lg`. Each tier: name, price, description, feature list with Check icons, CTA button. Check `mcp__magic__21st_magic_component_inspiration` for "pricing table SaaS" if a better layout exists.

**Footer:**
Logo + tagline left, nav links center, legal disclaimer right. No color — purely `text-muted-foreground`.

#### Dashboard
MUST include a "getting started" track for users with zero data:
```tsx
// If user has no data yet, show this instead of empty stat cards
function GettingStarted({ steps }: { steps: Step[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Get started</h2>
      <p className="mt-1 text-xs text-muted-foreground">Complete these steps to set up your account</p>
      <div className="mt-4 space-y-3">
        {steps.map(step => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
              step.done ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
            )}>
              {step.done ? <Check className="h-3 w-3" /> : step.num}
            </div>
            <span className={cn('text-xs', step.done ? 'line-through text-muted-foreground' : 'text-foreground')}>
              {step.label}
            </span>
            {!step.done && <Link to={step.href} className="ml-auto text-xs text-primary hover:underline">{step.action}</Link>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Stat cards show skeleton on load. Empty state per-section shows EmptyState component with relevant CTA.

#### Settings Page
NOT a single bare form. Structure:
- Left: section navigation (vertical list of setting categories)
- Right: content area with grouped fields separated by dividers
- Each field group: heading + description + inputs
- Save pattern: autosave on blur OR explicit save button with "Saved" confirmation that resets after 2s
- Use shadcn Form + Input + Select — never raw HTML form elements

```tsx
// Settings section pattern
function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
```

#### Data Table Pages (customers, transactions, reports)
Always include:
- Column headers with sort indicators
- Loading: skeleton rows (same height as real rows)
- Empty: EmptyState component with CTA to add first item
- Error: inline error with retry button
- Row hover: `hover:bg-muted/40`
- For tables with expand/actions: Fragment key pattern, never nested interactive elements

#### Reports Page
Never just download buttons. Always show live data preview at the top:
- Compliance score / summary metric displayed as a number or progress bar
- Last generated date
- Then download buttons below the preview
- If no data yet: EmptyState explaining what the report contains and how to generate data

### Step 5 — Build the Page

Write components following these rules:
- All colors via CSS variables — never hardcoded hex/rgb
- EmptyState from `src/components/ui/EmptyState.tsx` — never write inline empty states
- Loading states use skeleton divs at the same dimensions as real content
- Status indicators: muted colored dot (`before:content-['•']` with text-[color]) + text label — never full colored badge fills
- framer-motion whileInView + viewport={{ once: true }} on all major sections
- Named exports only, max 150 lines per file

### Step 6 — Add Route to App.tsx
Add the new page to App.tsx with React.lazy + Suspense immediately. Never leave routes unregistered.

### Step 6b — Cross-Page Component Dedup Check

Before finalising the page, scan `src/components/` for existing components that do the same job as anything you just built:
- Did you write an inline empty state? → replace with `EmptyState` from `ui/EmptyState.tsx`
- Did you write a custom skeleton div pattern? → check if a `LoadingSkeleton` component already exists
- Did you write a stat card? → check if a `StatCard` component already exists from a previous page
- Did you write a data table? → check for an existing `DataTable` wrapper

If a duplicate exists: refactor to use the shared component. If the new pattern is better: update the shared component and remove the old implementation everywhere it was used. One version per pattern — no silent copies.

### Step 7 — Per-Page Self-Review (MANDATORY — do not skip)

Run this check before marking the page done. Fix any failures immediately.

```
Per-page review: [page name]
───────────────────────────────────────────────
[ ] Zero-data state: page makes sense with no data
[ ] Empty state: has CTA button (not just text)
[ ] Loading state: skeleton layout (not blank or spinner on empty)
[ ] Error state: inline error + retry button
[ ] Color budget: count every text-primary, bg-primary, border-primary, ring-primary. Total must be <= 2. If > 2: replace ambient/decorative uses with text-muted-foreground, bg-muted, or text-brand.
[ ] document.title: any page title change uses useEffect(() => { document.title = '...' }, []) — never at render scope
[ ] User knows next action: clear without reading docs
[ ] Typography: at least 2 size/weight levels used (not all text-sm)
[ ] Mobile: layout works at 375px
[ ] Focus rings: all buttons, links, inputs have focus-visible:ring-2
[ ] Aria labels: all icon-only buttons have aria-label
[ ] Modals (if any): close button has aria-label="Close", Escape closes
```

If any item fails: fix it. Do not move to the next page until all 12 pass.

Log: "Page [name] — self-review passed (12/12)" before proceeding.

### Step 8 — Output

```
Built: [page name] ([route])
Files: [list]
Self-review: 12/12 passed
Signature element: [what makes this page visually interesting]
Empty state: [CTA label]

Next page: [name] | All pages complete — run /web-review
```

## Page Quality Standards

A page is DONE when:
- It looks correct with zero data (new user)
- It looks correct with real data (populated state)
- It looks correct when loading
- It looks correct when the API fails
- A designer seeing it for the first time would not feel the need to fix it

"It renders" is not done. "It compiles" is not done. These standards are the bar.
