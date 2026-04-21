---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript / JavaScript Coding Style

> Extends [common/coding-style.md](../common/coding-style.md).

## Strictness

- `tsconfig.json` must set `"strict": true`.
- Additionally enable: `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`.
- **No `any` in application code.** Use `unknown` for external/untrusted input and narrow it.
- **No `@ts-ignore`.** Use `@ts-expect-error` with a comment explaining why, or fix the underlying type.

## Types and Interfaces

### Public APIs
- Explicit parameter and return types on exported functions, shared utilities, public class methods.
- Let TS infer obvious local variables.
- Extract repeated inline object shapes into named types.

```typescript
// WRONG
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}

// CORRECT
interface User {
  firstName: string
  lastName: string
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### Interface vs. Type Alias

- `interface` — object shapes that may be extended or implemented.
- `type` — unions, intersections, tuples, mapped types, utility types.
- **Prefer string literal unions over `enum`** unless interop requires it.

```typescript
type UserRole = 'admin' | 'member' | 'viewer'
```

### Avoid `any`

```typescript
// WRONG
function getErrorMessage(error: any) {
  return error.message
}

// CORRECT
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}
```

### React Props

- Define props with a named `interface` or `type`.
- Type callback props explicitly.
- **Do not use `React.FC`.** It adds an implicit `children` prop and removes return-type specificity.

```typescript
interface UserCardProps {
  user: User
  onSelect: (id: string) => void
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>
}
```

## Immutability

Use spread for updates. Never mutate props, state, or parameters.

```typescript
// WRONG
function updateUser(user: User, name: string): User {
  user.name = name
  return user
}

// CORRECT
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name }
}
```

For arrays: `[...arr, x]`, `arr.filter(...)`, `arr.map(...)` — never `push`, `splice`, `sort` on shared state.

## Error Handling

```typescript
async function loadUser(userId: string): Promise<User> {
  try {
    return await riskyOperation(userId)
  } catch (error: unknown) {
    logger.error('Load user failed', { userId, error: getErrorMessage(error) })
    throw new Error(`Failed to load user ${userId}`)
  }
}
```

- Always `catch (error: unknown)` — narrow before using.
- Log context (user ID, request ID), not just the message.
- Re-throw with a clearer message or handle explicitly. **Never silently swallow.**

## Input Validation — Use Zod

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
})

type UserInput = z.infer<typeof userSchema>

// At boundary
const validated = userSchema.parse(input)
```

- Validate every API input, form submission, and external response with a schema.
- Infer types from the schema (`z.infer`) — don't duplicate.

## Logging

- **No `console.log` in production code.** Use a logger (pino, winston, Supabase logs).
- `console.error` is acceptable for truly unexpected errors in browser code; still prefer a structured logger.

## Modules

- Named exports over default exports (better for refactors and auto-imports).
- One default export acceptable for React page components or route handlers.
- Re-export barrels (`index.ts`) only when they simplify consumer imports — otherwise they bloat bundle trees.

## Async

- `async/await` over raw Promise chains for readability.
- `Promise.all([...])` for parallel independent work — avoid sequential `await` when order doesn't matter.
- Never forget to `await` — enable ESLint `no-floating-promises`.
