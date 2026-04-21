# Common Patterns

## Before Writing New Code

1. Search for battle-tested implementations (GitHub code search, package registries).
2. If 80%+ exists, adopt/fork/wrap it. Do not re-implement.
3. If nothing matches, design intentionally — don't just start typing.

## Design Patterns

### Repository Pattern

Encapsulate data access behind a consistent interface.

- Standard operations: `findAll`, `findById`, `create`, `update`, `delete`.
- Concrete implementations handle the storage (Supabase, REST, in-memory).
- Business logic depends on the interface, not the storage.
- Enables swapping sources and mocking in tests.

### API Response Envelope

Consistent shape for all API responses:

```
{
  success: boolean,
  data: T | null,
  error: string | null,
  meta?: { total, page, limit }
}
```

### Boundary Validation

- Validate at every system boundary: user input, external APIs, file content, env vars.
- Use schema libraries: Zod (TS), Pydantic (Python).
- Don't re-validate between trusted internal modules.

### Idempotency

Any operation that can be retried (webhooks, background jobs, API mutations) must be idempotent:
- Use unique request IDs or idempotency keys.
- Check "already processed" before applying.
- Return the same result on retry.

### Optimistic Updates

For perceived responsiveness:
1. Snapshot current state.
2. Apply update immediately in UI.
3. Send to server in background.
4. Roll back and show error feedback on failure.

## Anti-Patterns

- **God objects** — classes/modules that do everything.
- **Stringly-typed** — passing meaningful data as untyped strings.
- **Boolean parameters** — `doThing(user, true, false, true)` — use named options or separate functions.
- **Null returns for errors** — throw or use a `Result<T, E>` type.
- **Shotgun surgery** — one conceptual change touching 20 files; means the abstraction is wrong.
