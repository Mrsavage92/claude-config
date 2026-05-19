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

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>
  create(input: NewUser): Promise<User>
}

class SupabaseUserRepository implements UserRepository {
  async findById(id: string) {
    const { data } = await supabase.from('users').select().eq('id', id).maybeSingle()
    return data
  }
  async create(input: NewUser) { /* ... */ }
}

// Business logic depends on the interface, not Supabase.
async function welcomeNewUser(repo: UserRepository, input: NewUser) {
  const user = await repo.create(input)
  await sendWelcomeEmail(user)
}
```

### API Response Envelope

Consistent shape for all API responses:

```json
{
  "success": true,
  "data": { "id": "..." },
  "error": null,
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

### Boundary Validation

- Validate at every system boundary: user input, external APIs, file content, env vars.
- Use schema libraries: Zod (TS), Pydantic (Python).
- Don't re-validate between trusted internal modules.

```typescript
// External boundary — validate.
const body = bookingSchema.parse(await request.json())

// Internal call — already validated upstream, do NOT re-parse.
await persistBooking(body)
```

### Idempotency

Any operation that can be retried (webhooks, background jobs, API mutations) must be idempotent:

- Use unique request IDs or idempotency keys.
- Check "already processed" before applying.
- Return the same result on retry.

```typescript
async function processStripeEvent(event: Stripe.Event) {
  const seen = await db
    .from('processed_webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle()
  if (seen.data) return { status: 'duplicate', id: event.id }

  await applyEvent(event)
  await db.from('processed_webhook_events').insert({ id: event.id })
  return { status: 'applied', id: event.id }
}
```

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
