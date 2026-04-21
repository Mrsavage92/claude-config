---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript Testing

> Extends [common/testing.md](../common/testing.md).

## Stack

- **Unit + integration:** Vitest
- **E2E:** Playwright
- **Component:** React Testing Library (via Vitest)

## Vitest Config

- Use `vitest --coverage` for coverage reports (v8 provider).
- `happy-dom` over `jsdom` for speed unless you need full DOM fidelity.

## React Testing Library

- **Test behavior, not implementation.** Query by role, label, text — not by class name or test ID.
- `screen.getByRole('button', { name: /submit/i })` > `container.querySelector('.btn-primary')`.
- Use `userEvent` not `fireEvent` for realistic interactions.
- Use `await findBy...` for async UI, not arbitrary `waitFor(500)`.

## Playwright

- One browser context per test for isolation.
- Use `page.getByRole` / `page.getByLabel` / `page.getByTestId` — in that preference order.
- **Never `page.waitForTimeout(...)`** — use `expect(locator).toBeVisible()` or `page.waitForURL`.
- Test critical flows only: signup, checkout, core product action. Don't E2E everything.

## Mocking

- Mock paid external APIs (Stripe, Claude, OpenAI).
- **Do not mock the database** in integration tests — use a local Supabase or test DB.
- Mock network with MSW (Mock Service Worker) in component tests.

## Coverage Target

80% on new logic (aspirational, not blocking). Don't retrofit legacy untested code unless you're already touching it.
