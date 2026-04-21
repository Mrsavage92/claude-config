# Web Testing

> Extends [common/testing.md](../common/testing.md).

## Priority Order

### 1. Visual Regression

- Screenshot at key breakpoints: 320, 768, 1024, 1440.
- Test hero sections, scrollytelling sections, meaningful states (empty, loaded, error).
- Playwright screenshots for visual-heavy work.
- If both themes exist, test both.

### 2. Accessibility

- Automated: `@axe-core/playwright` in E2E runs.
- Manual: keyboard nav, reduced motion, screen reader smoke test on critical flows.
- Color contrast via Lighthouse or axe.

### 3. Performance

- Lighthouse or equivalent on meaningful pages.
- Hold Core Web Vitals targets from [performance.md](./performance.md).

### 4. Cross-Browser

- Minimum: Chromium, Firefox, WebKit (Safari).
- Test scrolling, motion, fallback behavior.
- Playwright can run all three from one suite.

### 5. Responsive

- Test 320, 375, 768, 1024, 1440, 1920.
- Verify no horizontal overflow.
- Verify touch interactions work (tap targets ≥ 44px).

## E2E with Playwright

```ts
import { test, expect } from '@playwright/test'

test('landing hero loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page).toHaveScreenshot('landing-hero.png')
})
```

**Rules:**
- Prefer `getByRole` / `getByLabel` / `getByText` over `getByTestId` — closer to how users find things.
- `await expect(...)` with built-in retries. **Never `page.waitForTimeout(...)`.**
- One context per test for isolation.
- Test critical flows only: signup, checkout, core product action. Don't E2E everything.

## Component Testing

- React Testing Library + Vitest.
- Query by role / label / text. Avoid querying by class name.
- Use `userEvent` not `fireEvent`.

```tsx
test('calls onSelect when button clicked', async () => {
  const onSelect = vi.fn()
  render(<UserCard user={user} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: /select/i }))
  expect(onSelect).toHaveBeenCalledWith(user.id)
})
```

## Unit Tests

- Test utilities, data transforms, custom hooks.
- For highly visual components, visual regression often carries more signal than brittle markup assertions.

## What to Mock

- **Mock:** paid APIs (Stripe, Claude, OpenAI), slow external services.
- **Don't mock:** your own API layer in component tests — use MSW (Mock Service Worker) for realistic network responses.
- **Don't mock:** Supabase in integration tests — use a local Supabase or test branch.

## Coverage Target

80% on new logic. Visual regression supplements coverage; doesn't replace unit tests for logic.
