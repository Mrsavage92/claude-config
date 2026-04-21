# Performance Principles

## Measure Before Optimizing

- Profile first, optimize second. "Measure > Guess."
- Don't optimize for perceived hotspots — optimize for measured ones.
- Use `performance-tuner` agent when the problem is real and documented.

## Common Bottlenecks

| Symptom | Likely Cause |
|---|---|
| Slow page load | Bundle size, render-blocking resources, waterfall fetches |
| Slow API | N+1 queries, missing DB index, unbounded query, external API call blocking response |
| High memory | Unreleased references, caching everything, huge in-memory lists |
| Slow tests | Hitting real network, no parallelism, fresh DB per test |

## Database Performance

- **Always bound queries.** Every `SELECT` should have a `LIMIT` or pagination.
- **Index what you filter on.** If you query by `user_id`, there's an index on `user_id`.
- **Avoid N+1.** Use joins, eager loading, or batched fetches.
- **Don't `SELECT *`** when you only need a few columns.

## Caching

- Cache at the right layer: CDN for static assets, Redis/memory for computed values, React Query for server state.
- Every cache needs a **TTL and an invalidation strategy.** "Cache forever" is a bug.
- Stale-while-revalidate is usually the right default for read-heavy UIs.

## Asynchronous Work

- Never do heavy work in a request handler — queue it.
- Use Supabase Edge Functions, background jobs, or queues (BullMQ, Celery) for anything >1s.
- Return 202 + job ID; poll or websocket for status.

## Frontend Specifics

See [web/performance.md](../web/performance.md) for Core Web Vitals targets, bundle budgets, and animation rules.

## Anti-Patterns

- Premature optimization — adding caching/memoization before any measurement.
- Micro-optimizing a hot loop while ignoring an N+1 query above it.
- Measuring local dev performance instead of production (different data sizes, no network latency).
