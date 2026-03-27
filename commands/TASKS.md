# Suite Gap Closure — TASKS

## Session goal
Implement 3 missing patterns that every product needs but the suite doesn't enforce yet:
1. Stripe checkout + webhook + upgrade UI
2. AppLayout trial banner (reference implementation in web-scaffold)
3. Sentry error monitoring in web-scaffold + pre-deploy checklist

## Tasks

- [x] 1. Create /web-stripe skill — Stripe checkout session, webhook handler, upgrade UI component, trial-to-paid flow
- [x] 2. Add AppLayout trial banner to web-scaffold — reference React component scaffolded into every new product
- [x] 3. Add Sentry to web-scaffold — init in main.tsx, ErrorBoundary wrapper, enforce in pre-deploy checklist
- [x] 4. Update premium-website.md contract — Stripe + Sentry added to pre-deploy checklist
- [ ] 5. Sync to GitHub + Notion
