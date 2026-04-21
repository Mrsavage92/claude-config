# Web Patterns

> Extends [common/patterns.md](../common/patterns.md).

## Component Composition

### Compound Components

Use when related UI shares state and interaction semantics:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

- Parent owns state.
- Children consume via context.
- Prefer this over prop drilling for complex widgets.

### Render Props / Slots

- Use when behavior is shared but markup must vary.
- Keep keyboard handling, ARIA, and focus logic in the headless layer (Radix / Headless UI).

### Container / Presentational Split

- Container owns data loading and side effects.
- Presentational receives props and renders.
- Presentational stays pure — easy to snapshot and Storybook.

## State Management

| Concern | Tool |
|---------|------|
| Server state | TanStack Query |
| Client state | Zustand (small stores per domain) |
| URL state | Search params, route segments |
| Form state | React Hook Form + Zod resolver |

**Rules:**
- Never duplicate server state into client stores — TanStack Query owns it.
- Derive values rather than storing redundant computed state.
- Avoid prop-drilling past 2 levels — context or compound component instead.

## URL as State

Persist shareable state in the URL:
- Filters
- Sort order
- Pagination
- Active tab
- Search query

Users can bookmark, share, and refresh without losing state. Don't store these only in Zustand.

## Data Fetching

### Stale-While-Revalidate (default)

- Return cached data immediately.
- Revalidate in background.
- TanStack Query does this out of the box.

### Optimistic Updates

1. Snapshot current state.
2. Apply optimistic update.
3. Roll back on failure.
4. Emit visible error feedback.

```tsx
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['user', id] })
    const previous = queryClient.getQueryData(['user', id])
    queryClient.setQueryData(['user', id], newUser)
    return { previous }
  },
  onError: (err, newUser, context) => {
    queryClient.setQueryData(['user', id], context.previous)
    toast.error('Update failed')
  },
})
```

### Parallel Loading

- Fetch independent data in parallel (`Promise.all`, multiple `useQuery`).
- Avoid parent-child waterfalls (parent fetches, passes ID to child, child fetches).
- Prefetch likely next routes (`queryClient.prefetchQuery`).

## Form Handling

- **React Hook Form + Zod.**
- Single schema defines both TS type (`z.infer`) and runtime validation.
- Don't handroll form state — it's a solved problem.

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## Accessibility

- Every interactive element reachable by keyboard.
- Focus states always visible (don't kill `:focus-visible`).
- Semantic HTML first; ARIA only when semantics fall short.
- Respect `prefers-reduced-motion` for any non-essential animation.

## Error Boundaries

- Wrap route-level components in error boundaries.
- Log to a service (Sentry, Supabase logs) on catch.
- Show a branded error UI, not a white page.
