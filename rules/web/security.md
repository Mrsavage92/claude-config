# Web Security

> Extends [common/security.md](../common/security.md).

## Content Security Policy

Always configure a production CSP. Use per-request nonces for scripts instead of `'unsafe-inline'`.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
```

Adjust origins to the project. Don't cargo-cult unchanged.

## Security Headers (all production sites)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Configure via:
- **Vercel:** `vercel.json` `headers` array
- **Netlify / Lovable:** `public/_headers` file
- **Nginx:** `add_header` in server block

## XSS Prevention

- Never inject unsanitized HTML.
- Avoid `innerHTML` / `dangerouslySetInnerHTML` unless sanitized with DOMPurify first.
- Escape URL params built from user input: `encodeURIComponent`.
- Trust React's default escaping — don't circumvent.

## Supabase Security

- **Anon key ships to browser. Service role NEVER does.**
- Every public table needs an RLS policy. Missing policy = open table.
- Test RLS policies with a test user token, not the service role.
- Use `auth.uid()` in policies, not client-provided user IDs.

## Third-Party Scripts

- Load async.
- Use Subresource Integrity (SRI) when serving from a CDN.
- Audit quarterly — remove scripts you no longer need.
- Self-host critical deps where practical.

```html
<script
  src="https://example.com/lib.js"
  integrity="sha384-..."
  crossorigin="anonymous"
  async
></script>
```

## Forms

- CSRF protection on state-changing forms (SameSite=Lax cookies minimum).
- Rate limit submission endpoints.
- Validate both client AND server side — client validation is UX, not security.
- Prefer honeypots over CAPTCHA for anti-abuse (less friction).

## Auth

- HttpOnly cookies for session tokens (JavaScript cannot read them).
- `Secure` flag (HTTPS only).
- `SameSite=Lax` or `Strict`.
- Short access tokens + refresh flow — don't use long-lived tokens.
- Supabase Auth handles this if you let it. Don't reimplement unless you must.

## HTTPS Everywhere

- HSTS header with `preload`.
- No mixed content (HTTP assets on HTTPS page).
- Redirect HTTP → HTTPS at the edge.

## Client-Side Secrets — Reminder

- Any `VITE_*` / `NEXT_PUBLIC_*` / `REACT_APP_*` env var is in the browser bundle.
- **Never put secrets there.** If you find a secret in one, it's already leaked — rotate it.
