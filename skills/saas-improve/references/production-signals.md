# Production Signals — saas-improve Phase 0b

Before any code analysis, check what the live product is telling us. Read all signals in parallel.

## Sentry

If `VITE_SENTRY_DSN` is set: check for unresolved issues in the last 7 days. Each unresolved error = automatic P0 gap.

Log: "Sentry: [N] unresolved issues" or "Sentry: unavailable".

## Railway Logs

If Railway service exists:

```bash
# Get last 100 lines of Railway logs for 5xx errors
npx railway logs --lines 100 2>/dev/null | grep -E "5[0-9]{2}|ERROR|CRITICAL" || echo "Railway: unavailable"
```

Each unique 5xx pattern = automatic P1 gap.

## Build Health

```bash
npm run build 2>&1 | tail -20
```

Any build error = P0. Any warning about bundle size > 250KB = P1.

## TypeScript

```bash
npx tsc --noEmit 2>&1 | head -30
```

Any TS error = P1.

## Tests

```bash
npx vitest run --reporter=verbose 2>&1 | tail -20
```

Any failing test = P1.

## Injection Rule

Log all signal output. These findings are injected into the swarm as pre-seeded gaps before Phase 1 agents run.

- Every Sentry error = P0 in the stack
- Every Railway 5xx = P1
- Every failing test = P1

These are non-negotiable — production is telling you something is broken.
