# Component Specs — Dashboard Design

Covers: KPI cards, sparklines, charts, date range pickers, CMD+K, animations, dark mode, mobile patterns, onboarding, empty states, notification system, data tables, spacing & typography.

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
