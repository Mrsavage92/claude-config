# Code Review Standards

## When to Self-Review

**Self-review triggers (auto, no user ask needed):**
- After writing or modifying any non-trivial code (more than a 1-line fix).
- Before any commit to `main`.
- When security-sensitive code is changed (auth, payments, user data, RLS policies).
- When architectural changes are made.

## Pre-Review Requirements

Before considering code done:
- All automated checks pass (tsc, ruff, mypy, tests).
- No merge conflicts.
- Branch is up to date with target.

## Review Checklist

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors handled explicitly
- [ ] No hardcoded secrets or credentials
- [ ] No `console.log` / `print()` / debug statements
- [ ] Tests exist for new functionality (aspirational: 80%+ coverage)
- [ ] No dead code, no `_unused` renames, no `// removed` comments
- [ ] No speculative abstractions added "for future use"

## Security Review Triggers

**STOP and invoke `security-review` command when changing:**
- Authentication or authorization code (Supabase Auth, JWT, sessions)
- Supabase RLS policies (this is auth — treat as security-critical)
- User input handling
- Database queries (raw SQL, not through ORM)
- File system operations
- External API calls (Stripe, Resend, Twilio, Claude API)
- Cryptographic operations
- Payment or financial code
- CORS or CSP configuration

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability, data loss, or RLS bypass | **BLOCK** — fix before commit |
| HIGH | Bug or significant quality issue | **WARN** — fix before commit |
| MEDIUM | Maintainability concern | **INFO** — fix when possible |
| LOW | Style or minor suggestion | **NOTE** — optional |

## Agents to Use

| Agent | When |
|-------|------|
| `pr-review-expert` | Non-trivial PRs — logic, security, correctness beyond lint |
| `silent-failure-hunter` | After any change to error handling, try/except, catch blocks |
| `senior-qa` | Before shipping user-facing features |
| `refactor-expert` | When code smells accumulate |
| `root-cause-analyzer` | Debugging complex or recurring issues |

## Review Workflow

1. `git diff` to understand changes.
2. Run security checklist first.
3. Run quality checklist.
4. Run relevant tests.
5. Invoke the appropriate agent for deep review.

## Common Issues to Catch

### Security
- Hardcoded credentials (API keys, Supabase service role key, Stripe secret)
- SQL injection (string concatenation in queries)
- XSS (unescaped user input, `dangerouslySetInnerHTML` without sanitization)
- Supabase queries bypassing RLS via service role on client
- Auth bypasses
- Secrets committed to git (check `.env` not staged)

### Code Quality
- Large functions (>50 lines) — split
- Large files (>800 lines) — extract modules
- Deep nesting (>4) — early returns
- Silent catches — every caught error must be logged or re-thrown
- Mutation patterns — prefer immutable
- Missing tests for new logic

### Performance
- N+1 queries — use joins or batching
- Missing pagination — add `.limit()`
- Unbounded Supabase queries — always set a limit
- Missing caching on expensive ops
- Waterfall fetches — parallelize where independent

## Approval Criteria

- **Approve**: no CRITICAL or HIGH
- **Warning**: only HIGH (proceed with caution)
- **Block**: any CRITICAL

## Integration

- [testing.md](testing.md) — coverage requirements
- [security.md](security.md) — security checklist
- [git-workflow.md](git-workflow.md) — commit standards
