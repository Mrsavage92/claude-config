# Testing Requirements

## Coverage Target: 80% on new logic

Aspirational, not blocking. Apply to new code; don't retrofit legacy.

## Test Pyramid (all three required for shipped features)

1. **Unit** — individual functions, utilities, components
2. **Integration** — API endpoints, database operations, third-party integrations
3. **E2E** — critical user flows (Playwright for web, pytest for backend)

## TDD When It Fits

1. Write test first (RED).
2. Run it — it should FAIL.
3. Write minimal implementation (GREEN).
4. Refactor (IMPROVE).
5. Verify coverage.

**When TDD doesn't fit:** UI polish that requires visual judgment, exploratory spikes, throw-away scripts. Say so explicitly.

## Test Structure — Arrange / Act / Assert

```typescript
test('calculates cosine similarity of orthogonal vectors as 0', () => {
  // Arrange
  const v1 = [1, 0, 0]
  const v2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(v1, v2)

  // Assert
  expect(similarity).toBe(0)
})
```

## Test Naming

Names should describe the *behavior*, not the function:

```
GOOD: test('returns empty array when no markets match query', ...)
GOOD: test('throws error when API key is missing', ...)
GOOD: test('falls back to substring search when Redis is unavailable', ...)
BAD:  test('search', ...)
BAD:  test('test search function', ...)
```

## What to Test

- **Happy path** — the thing works when used correctly.
- **Edge cases** — empty input, boundary values, missing fields.
- **Error paths** — what happens when the DB is down, the API returns 500, the token is invalid.
- **Regressions** — when you fix a bug, add a test that would have caught it.

## What NOT to Test

- Framework internals (don't test that React renders).
- Trivial getters/setters.
- Third-party library behavior.
- Implementation details (test behavior, not internal state).

## Integration Tests — Hit Real Dependencies

- **Do not mock the database in integration tests.** Use a real test DB (Supabase local, SQLite, testcontainers).
- Mocking the DB hides migration bugs, type mismatches, and RLS policy regressions.
- Mock external *paid* APIs (Stripe, Claude, OpenAI). Don't mock internal infra.

## Fixing Failing Tests

1. Check test isolation (does order matter? reset state?).
2. Verify mocks match current API shape.
3. **Fix the implementation, not the test** — unless the test is demonstrably wrong.
4. If the test is wrong, fix it in a separate commit with a clear message.

## Troubleshooting

- Use `senior-qa` agent for test strategy.
- Use `root-cause-analyzer` when tests fail intermittently (flakes mean a real bug).
