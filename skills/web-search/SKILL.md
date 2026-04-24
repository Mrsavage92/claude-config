# /web-search

Search skill for the web-* suite. Covers CMD+K command palette, Supabase full-text search, fuzzy client-side search, and search UI components.

**Call this skill when:** any feature needs search across records, a CMD+K command palette, or a global search bar.

**Stack:** cmdk (command palette) + Supabase full-text search (server) + Fuse.js (client fuzzy, small datasets).

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- What entities are searched? (users, documents, audit runs, products, etc.)
- Is search server-side (large dataset) or client-side (< 1000 records)?
- Is a CMD+K palette required? (typically yes for any app with 3+ pages)
- What actions does the palette expose? (navigation, quick actions, recent items)

---

## Phase 1 — CMD+K Command Palette

Install:
```bash
npm install cmdk
```

Create `src/components/search/CommandPalette.tsx`:

```tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  LayoutDashboard, Settings, FileText, Users, Search,
  ArrowRight, Clock, Keyboard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecentItems } from '@/hooks/use-recent-items'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  group: 'navigation' | 'action' | 'recent' | 'result'
}

interface CommandPaletteProps {
  extraItems?: CommandItem[]
}

export function CommandPalette({ extraItems = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { recent } = useRecentItems()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const nav = useCallback((to: string) => {
    navigate(to)
    setOpen(false)
    setQuery('')
  }, [navigate])

  const navItems: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, action: () => nav('/dashboard'), group: 'navigation', keywords: ['home', 'overview'] },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, action: () => nav('/settings'), group: 'navigation', keywords: ['account', 'profile', 'billing'] },
    ...extraItems,
  ]

  const recentItems: CommandItem[] = recent.map(r => ({
    id: `recent-${r.id}`,
    label: r.label,
    description: r.description,
    icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    action: () => nav(r.href),
    group: 'recent' as const,
  }))

  const allItems = [...navItems, ...recentItems]

  const filtered = query
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems

  const groups = {
    recent: filtered.filter(i => i.group === 'recent' && !query),
    navigation: filtered.filter(i => i.group === 'navigation'),
    action: filtered.filter(i => i.group === 'action'),
    result: filtered.filter(i => i.group === 'result'),
  }

  return (
    <>
      {/* Trigger button — show in sidebar/navbar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors w-full"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="flex items-center gap-0.5 text-[10px] font-mono opacity-60">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search or type a command..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results for "{query}"
              </Command.Empty>

              {groups.recent.length > 0 && (
                <Command.Group heading="Recent">
                  {groups.recent.map(item => (
                    <CommandItem key={item.id} item={item} onSelect={() => { item.action(); setOpen(false) }} />
                  ))}
                </Command.Group>
              )}

              {groups.navigation.length > 0 && (
                <Command.Group heading="Navigation">
                  {groups.navigation.map(item => (
                    <CommandItem key={item.id} item={item} onSelect={() => { item.action(); setOpen(false) }} />
                  ))}
                </Command.Group>
              )}

              {groups.action.length > 0 && (
                <Command.Group heading="Actions">
                  {groups.action.map(item => (
                    <CommandItem key={item.id} item={item} onSelect={() => { item.action(); setOpen(false) }} />
                  ))}
                </Command.Group>
              )}

              {groups.result.length > 0 && (
                <Command.Group heading="Results">
                  {groups.result.map(item => (
                    <CommandItem key={item.id} item={item} onSelect={() => { item.action(); setOpen(false) }} />
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="border-t px-3 py-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Keyboard className="h-3 w-3" /> ↑↓ Navigate</span>
              <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> ↵ Select</span>
              <span className="flex items-center gap-1">Esc Close</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CommandItem({ item, onSelect }: { item: CommandItem; onSelect: () => void }) {
  return (
    <Command.Item
      value={`${item.label} ${item.keywords?.join(' ') ?? ''}`}
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer',
        'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground'
      )}
    >
      <span className="flex-shrink-0 text-muted-foreground">{item.icon}</span>
      <span className="flex-1 font-medium">{item.label}</span>
      {item.description && (
        <span className="text-xs text-muted-foreground truncate max-w-[160px]">{item.description}</span>
      )}
    </Command.Item>
  )
}
```

---

## Phase 2 — Recent Items Hook

Create `src/hooks/use-recent-items.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react'

interface RecentItem {
  id: string
  label: string
  description?: string
  href: string
  visitedAt: number
}

const STORAGE_KEY = 'cmd-recent-items'
const MAX_ITEMS = 5

export function useRecentItems() {
  const [recent, setRecent] = useState<RecentItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  const addRecent = useCallback((item: Omit<RecentItem, 'visitedAt'>) => {
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== item.id)
      const updated = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { recent, addRecent }
}
```

Call `addRecent()` when a user navigates to a key resource page (e.g. opens a specific audit, document, or record).

---

## Phase 3 — Supabase Full-Text Search (server-side, large datasets)

### 3a — Add tsvector column to searchable table

Via Supabase MCP `apply_migration`:

```sql
-- Example: searching audit_runs by name + description
alter table audit_runs
  add column if not exists search_vector tsvector
    generated always as (
      to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) stored;

create index if not exists audit_runs_search_idx on audit_runs using gin(search_vector);
```

### 3b — Search function

```sql
create or replace function search_audit_runs(query text, org_id_param uuid)
returns table (id uuid, name text, description text, status text, rank float)
language sql stable security invoker
as $$
  select
    id, name, description, status,
    ts_rank(search_vector, websearch_to_tsquery('english', query)) as rank
  from audit_runs
  where
    org_id = org_id_param
    and search_vector @@ websearch_to_tsquery('english', query)
  order by rank desc
  limit 20;
$$;
```

### 3c — React hook

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

export function useSearch(query: string, orgId: string) {
  const debouncedQuery = useDebouncedValue(query, 300)

  return useQuery({
    queryKey: ['search', orgId, debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_audit_runs', {
        query: debouncedQuery,
        org_id_param: orgId,
      })
      if (error) throw error
      return data ?? []
    },
  })
}
```

Create `src/hooks/use-debounced-value.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

---

## Phase 4 — Client-Side Fuzzy Search (small datasets, < 1000 records)

Install:
```bash
npm install fuse.js
```

```typescript
import Fuse from 'fuse.js'
import { useMemo } from 'react'

export function useFuzzySearch<T>(items: T[], keys: string[], query: string) {
  const fuse = useMemo(() => new Fuse(items, {
    keys,
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  }), [items, keys])

  return useMemo(() => {
    if (!query) return items
    return fuse.search(query).map(r => r.item)
  }, [fuse, query, items])
}
```

Usage:
```tsx
const filtered = useFuzzySearch(users, ['name', 'email'], searchQuery)
```

---

## Phase 5 — Wire Search Results into Command Palette

```tsx
import { useSearch } from '@/hooks/use-search'
import { CommandPalette } from '@/components/search/CommandPalette'
import { FileText } from 'lucide-react'

function AppCommandPalette() {
  const [query, setQuery] = useState('')
  const { data: results } = useSearch(query, activeOrgId)
  const navigate = useNavigate()

  const resultItems = (results ?? []).map(r => ({
    id: r.id,
    label: r.name,
    description: r.status,
    icon: <FileText className="h-4 w-4" />,
    action: () => navigate(`/audits/${r.id}`),
    group: 'result' as const,
  }))

  return <CommandPalette extraItems={resultItems} />
}
```

---

## Phase 6 — Inline Search Bar (page-level)

For per-page search (e.g. filtering a table):

```tsx
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8 h-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={() => onChange('')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
```

---

## Checklist

- [ ] `cmdk` installed: `npm install cmdk`
- [ ] `⌘K` / `Ctrl+K` keyboard shortcut registered globally
- [ ] `CommandPalette` mounted once in AppLayout (not per-page)
- [ ] Recent items persisted to localStorage via `useRecentItems`
- [ ] Full-text: `tsvector` column added + GIN index on searchable tables
- [ ] Full-text: `websearch_to_tsquery` used (not `plainto_tsquery`) — handles user typos better
- [ ] Full-text: search function uses `security invoker` — RLS applies
- [ ] Debounced query (300ms) before firing Supabase RPC
- [ ] Client fuzzy: Fuse.js for datasets < 1000 rows
- [ ] Search bar shows clear (X) button when query is non-empty

---

## Notes

- `websearch_to_tsquery` handles operators like quotes and minus natively — use it over `plainto_tsquery`
- GIN index is required for full-text performance — without it, queries scan the entire table
- The `CommandPalette` should mount in AppLayout at the top level, not inside each page
- For multilingual search: pass the language dynamically based on `navigator.language`
- `cmdk` is used by Linear, Vercel, and Raycast — it is the standard for CMD+K in React
