# Security Guidelines

## Mandatory Pre-Commit Checks

- [ ] No hardcoded secrets (API keys, passwords, tokens, Supabase service role keys)
- [ ] `.env` files are in `.gitignore` and not staged
- [ ] All user inputs validated at boundaries
- [ ] SQL injection prevention (parameterized queries, never string concat)
- [ ] XSS prevention (no unsanitized `dangerouslySetInnerHTML`, `innerHTML`)
- [ ] CSRF protection on state-changing forms
- [ ] Authentication/authorization verified (including Supabase RLS)
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak sensitive data (stack traces, SQL, internal IDs)

## Secret Management

- **NEVER hardcode secrets in source code.**
- Use environment variables via `.env` (local) and platform secrets (Vercel, Railway, GitHub Actions).
- Validate required secrets are present at startup — fail fast with a clear error.
- Rotate immediately if a secret may have been exposed (public commit, Slack paste, chat log).
- **Never paste a secret into a prompt or tool call** — assume it will be logged.

## Supabase-Specific

- **Service role key is server-only.** Never ship it to the browser.
- Anon key goes to the client; service role stays in backend env.
- **RLS is your authz layer.** Every public table must have a policy.
- Test RLS policies — a missing policy = open table.
- Use `auth.uid()` in policies, not client-provided user IDs.

## Third-Party API Keys

- Stripe: publishable key client-side, secret key server-side.
- Resend, Twilio, Claude, OpenAI: server-side only.
- If you need to call a paid API from the client, proxy through your backend.

## Security Response Protocol

If you find a security issue:
1. **STOP.** Don't continue feature work.
2. Invoke `security-review` command or `pr-review-expert` agent.
3. Fix CRITICAL issues before anything else.
4. Rotate any exposed secrets.
5. Grep the codebase for similar patterns — this is rarely an isolated issue.

## OWASP Top 10 — Watch For

1. Broken access control (missing RLS, missing auth checks)
2. Cryptographic failures (weak hashing, plaintext secrets)
3. Injection (SQL, command, LDAP)
4. Insecure design (no threat modeling)
5. Security misconfiguration (default passwords, open CORS)
6. Vulnerable components (outdated deps — run `npm audit` / `pip-audit`)
7. Auth failures (session fixation, weak passwords)
8. Software/data integrity failures (unsigned deps, unverified downloads)
9. Logging failures (not logging auth events)
10. SSRF (user-supplied URLs fetched server-side)
