---
name: web-table
description: >
  Production-ready data table using TanStack Table v8. Sorting, filtering, pagination, column
  visibility, row selection, bulk actions, status badges, action menus, CSV export. Integrates
  with TanStack Query, FilterBar, and EmptyState. Use on any SaaS list/management page.
---

# Skill: /web-table

Production-grade data table using TanStack Table v8. Every SaaS list page uses this pattern. No plain HTML tables.

**Package:** `npm install @tanstack/react-table`

**shadcn components required:**
```bash
npx shadcn@latest add table checkbox dropdown-menu
```

---

## Step 1 — Column Definitions

Define columns once, outside the component. Adapt types and fields to the resource.

```tsx
// src/components/tables/columns/resource-columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'

export interface Resource {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
}

export const resourceColumns: ColumnDef<Resource>[] = [
  // Selection (always first)
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={v => row.toggleSelected(!!v)}
        aria-label="Select row"
        onClick={e => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  // Primary identifier — sortable
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.getValue('name')}</span>
    ),
  },

  // Status — dot + text ONLY, never filled badge
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.getValue<string>('status')
      return (
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${
            s === 'active' ? 'bg-emerald-500' : s === 'pending' ? 'bg-amber-500' : 'bg-muted-foreground'
          }`} />
          <span className="text-sm text-foreground capitalize">{s}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value === 'all' || !value || row.getValue(id) === value,
  },

  // Date — sortable
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.getValue<string>('createdAt')).toLocaleDateString()}
      </span>
    ),
  },

  // Row actions (always last)
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>Copy ID</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

---

## Step 2 — DataTable Component (one per project)

```tsx
// src/components/tables/DataTable.tsx
import {
  ColumnDef, ColumnFiltersState, SortingState, VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageSize?: number
  globalFilter?: string
  columnFilters?: ColumnFiltersState
  onRowClick?: (row: TData) => void
  emptyState?: {
    icon: LucideIcon
    heading: string
    description: string
    actionLabel?: string
    onAction?: () => void
  }
  bulkActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns, data, loading, pageSize = 25,
  globalFilter = '', columnFilters = [],
  onRowClick, emptyState, bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnVisibility, rowSelection, globalFilter, columnFilters },
    initialState: { pagination: { pageSize } },
  })

  const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
  const totalFiltered = table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-3">
      {/* Column visibility */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" />Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={v => col.toggleVisibility(!!v)}
                className="capitalize"
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map(header => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {!header.isPlaceholder && flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  {emptyState ? (
                    <EmptyState
                      icon={emptyState.icon}
                      heading={emptyState.heading}
                      description={emptyState.description}
                      action={emptyState.onAction ? {
                        label: emptyState.actionLabel ?? 'Get started',
                        onClick: emptyState.onAction,
                      } : undefined}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">No results.</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {selectedRows.length > 0
            ? `${selectedRows.length} of ${totalFiltered} selected`
            : `${totalFiltered} result${totalFiltered !== 1 ? 's' : ''}`}
        </span>
        <div className="flex items-center gap-2">
          <span>Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</span>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk action bar — fixed, only when rows selected */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-xl z-50">
          <span className="text-sm font-medium text-foreground">{selectedRows.length} selected</span>
          <div className="w-px h-4 bg-border" />
          {bulkActions
            ? bulkActions(selectedRows, () => table.resetRowSelection())
            : (
              <>
                <Button size="sm" variant="ghost" className="h-8">Export</Button>
                <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive">Delete</Button>
              </>
            )}
          <Button size="sm" variant="ghost" className="h-8 text-muted-foreground"
            onClick={() => table.resetRowSelection()}>Clear</Button>
        </div>
      )}
    </div>
  )
}
```

---

## Step 3 — Wire Into a Page

```tsx
// src/pages/ResourcesPage.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DataTable } from '@/components/tables/DataTable'
import { resourceColumns, type Resource } from '@/components/tables/columns/resource-columns'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { exportToCsv } from '@/lib/export-csv'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ResourcesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['resources', status],
    queryFn: async () => {
      let q = supabase.from('resources').select('*').order('created_at', { ascending: false })
      if (status !== 'all') q = q.eq('status', status)
      const { data, error } = await q
      if (error) throw error
      return data as Resource[]
    },
    staleTime: 30_000,
  })

  if (isError) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-sm text-destructive">Failed to load resources.</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
    </div>
  )

  const filtered = (data ?? []).filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  )
  const hasFilters = search !== '' || status !== 'all'

  return (
    <div className="px-6 py-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Dashboard / Resources</p>
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"
            onClick={() => exportToCsv('resources', filtered)}
            disabled={!filtered.length}>
            Export CSV
          </Button>
          <Button size="sm"><Plus className="w-4 h-4 mr-2" />New Resource</Button>
        </div>
      </div>

      <FilterBar
        search={search} onSearch={setSearch}
        status={status} onStatus={setStatus}
        onClear={() => { setSearch(''); setStatus('all') }}
        hasFilters={hasFilters}
      />

      <DataTable
        columns={resourceColumns}
        data={filtered}
        loading={isLoading}
        pageSize={25}
        globalFilter={search}
        emptyState={{
          icon: FileText,
          heading: hasFilters ? 'No results found' : 'No resources yet',
          description: hasFilters
            ? 'Try adjusting your search or filters.'
            : 'Create your first resource to get started.',
          actionLabel: hasFilters ? 'Clear filters' : 'Create Resource',
          onAction: hasFilters ? () => { setSearch(''); setStatus('all') } : undefined,
        }}
      />
    </div>
  )
}
```

---

## Step 4 — Server-Side Filtering (10K+ rows)

When client-side filtering is too slow, move filtering into the query:

```tsx
queryKey: ['resources', search, status],  // both in key — refetches on change
queryFn: async () => {
  let q = supabase.from('resources').select('*')
  if (search) q = q.ilike('name', `%${search}%`)
  if (status !== 'all') q = q.eq('status', status)
  const { data, error } = await q.order('created_at', { ascending: false }).limit(500)
  if (error) throw error
  return data as Resource[]
}
// Remove client-side .filter() — pass data directly to DataTable
```

---

## Rules

- **One DataTable component per project** — columns are the variable, not the component
- **Never plain HTML `<table>`** — always TanStack Table via DataTable
- **Skeleton rows match loaded shape** — same column count, realistic skeleton widths
- **Bulk action bar: fixed, never always-visible** — appears only on row selection
- **Status: dot + text only** — never filled badge backgrounds (violates color discipline)
- **Export CSV in page header** — never inside the table toolbar
- **Two empty state variants** — "no data" (create CTA) and "no filter results" (clear CTA)
- **Row click optional** — only wire when navigating to a detail page
- **Column visibility toggle** always present for tables with 5+ columns
- **TanStack Query only** — never useEffect for data fetching
