---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
# TypeScript Security

> Extends [common/security.md](../common/security.md).

## Secret Management

```typescript
// WRONG
const apiKey = "sk-proj-abc123..."

// CORRECT
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

- Validate required env vars at startup — fail fast.
- Use `zod` to validate `process.env` shape in one place.

## Next.js / Vite Env Var Exposure

- `NEXT_PUBLIC_*` / `VITE_*` vars are shipped to the browser. **Never put secrets in them.**
- Only put publishable/anon keys in public env.
- Double-check before committing: `grep -r "NEXT_PUBLIC_" .env` — if a secret is there, it's already leaked.

## Supabase

- **Anon key → client.** Safe to ship.
- **Service role key → server only.** Never import in browser code.
- If a file imports `SUPABASE_SERVICE_ROLE_KEY`, it must only run in API routes / server actions / edge functions / node scripts.

## XSS Prevention

- Never use `dangerouslySetInnerHTML` with unsanitized input. If you must, sanitize with DOMPurify.
- Trust React's default escaping — don't circumvent it.
- Escape URLs when building links: `encodeURIComponent(userInput)`.

## CSRF

- State-changing endpoints need CSRF protection (SameSite cookies + origin check, or explicit tokens).
- Supabase Auth handles this for its own flows; for custom mutations, verify.

## Dependencies

- Run `npm audit` / `pnpm audit` weekly.
- Pin versions in production (`package-lock.json` committed).
- Never install packages you haven't heard of without checking.

## Rate Limiting

- Every public API route needs rate limiting (Upstash, Vercel KV, or in-memory for low-scale).
- Auth endpoints especially — login, signup, password reset.
