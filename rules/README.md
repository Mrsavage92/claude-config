# Claude Code Rules

Language and domain rulebooks for Adam's setup. Adapted from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) and edited to match the actual stack (React + TS + Vite + FastAPI + Supabase + Vercel).

## Structure

```
rules/
├── common/      # Language-agnostic principles
├── typescript/  # TS / JS / React
├── python/      # Python + FastAPI + Supabase
└── web/         # Frontend + design quality
```

## Layering

- `common/` applies everywhere.
- Language directories extend common with stack-specific patterns.
- **Language-specific rules override common** when they conflict (like CSS specificity).

## When to Load

- Writing **TS / React** → `common/` + `typescript/` + `web/`
- Writing **Python / FastAPI** → `common/` + `python/`
- **Design-heavy frontend work** → `common/` + `typescript/` + `web/design-quality.md`
- **Reviewing code** → `common/code-review.md` + relevant language
- **Adding tests** → `common/testing.md` + language testing file

## Files

### common/
- `coding-style.md` — immutability, KISS/DRY/YAGNI, naming, smells
- `code-review.md` — self-review checklist, severity levels, agent routing
- `development-workflow.md` — research → plan → TDD → review → commit
- `git-workflow.md` — commit format, staging, amend/force rules
- `testing.md` — pyramid, AAA pattern, naming, what to test
- `security.md` — pre-commit checks, secret management, OWASP Top 10
- `patterns.md` — repository, envelope, idempotency, anti-patterns
- `performance.md` — measure before optimizing, DB/cache/async

### typescript/
- `coding-style.md` — strict TS, no `any`, Zod, React patterns
- `patterns.md` — envelope, custom hooks, repository, Result type, TanStack Query
- `testing.md` — Vitest, RTL, Playwright, MSW
- `security.md` — env var exposure, Supabase key handling, CSRF

### python/
- `coding-style.md` — PEP 8, type annotations, Pydantic, ruff
- `patterns.md` — FastAPI structure, Pydantic Settings, Supabase client, protocols
- `testing.md` — pytest, fixtures, FastAPI TestClient, async tests
- `security.md` — secret management, SQL injection, CORS, rate limiting

### web/
- `coding-style.md` — file org, design tokens (OKLCH), Tailwind, shadcn
- `design-quality.md` — anti-template policy, required qualities, style directions
- `patterns.md` — composition, state ownership, URL-as-state, forms
- `performance.md` — Core Web Vitals, bundle budgets, image/font loading
- `security.md` — CSP, headers, XSS, Supabase RLS reminders
- `testing.md` — visual regression, a11y, E2E priority order
- `hooks.md` — PostToolUse patterns (reference only)

## Adding Rules

Follow the existing format:
1. Frontmatter with `paths:` glob for auto-loading (language files).
2. Opening line: `> Extends [common/...](...)`.
3. Keep each file focused on one domain.

## Priority

When rules conflict:
1. `CLAUDE.md` global (behavior, preferences) wins.
2. Language-specific rules win over common rules.
3. Common rules are defaults.
