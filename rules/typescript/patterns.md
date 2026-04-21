---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript Patterns

> Extends [common/patterns.md](../common/patterns.md).

## API Response Envelope

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## Custom Hook Pattern

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  return debounced
}
```

- Hooks start with `use`.
- Return tuples only when order is meaningful (`useState`); return objects otherwise (`{ data, isLoading, error }`).
- Always clean up subscriptions, timers, and listeners in the `useEffect` return.

## Repository Pattern

```typescript
interface Repository<T, CreateDto, UpdateDto> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

## Result Type (avoid throw-as-control-flow)

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.getUser(id)
    return { ok: true, value: user }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }
  }
}
```

Use for expected failure paths (not found, validation); still throw for truly exceptional cases.

## TanStack Query Pattern

- Keys are arrays: `['users', userId]`, `['users', userId, 'posts']`.
- Never store server state in Zustand — let TanStack Query own it.
- Use `useMutation` with `onSuccess` to invalidate related queries.
- Optimistic updates via `onMutate` + `onError` rollback.

## Zustand Pattern (client state only)

- One store per domain (`useUIStore`, `useFilterStore`) — not one giant store.
- No server data in Zustand — that's what TanStack Query is for.
- Use selectors to prevent re-renders: `useStore(s => s.value)` not `useStore().value`.

## Component Composition

- **Compound components** for shared state widgets (`<Tabs>`, `<Select>`).
- **Render props / slots** when markup must vary but behavior is shared.
- **Container / Presentational split** — data-loading component wraps a pure renderer.

## Discriminated Unions

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

Forces exhaustive handling and prevents "loading + error + data all true" state bugs.
