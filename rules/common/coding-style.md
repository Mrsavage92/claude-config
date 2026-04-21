# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones.

- `WRONG`: mutate original in place (`obj.field = value`, `arr.push(x)`)
- `CORRECT`: return a new copy (`{ ...obj, field: value }`, `[...arr, x]`)

Rationale: immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

**Language note:** Go and Rust have idiomatic mutation patterns — follow the language file for overrides.

## Core Principles

### KISS (Keep It Simple)
- Prefer the simplest solution that actually works.
- Avoid premature optimization.
- Optimize for clarity over cleverness.

### DRY (Don't Repeat Yourself)
- Extract repeated logic once it's real, not speculative.
- Avoid copy-paste implementation drift.
- Three similar lines is better than a premature abstraction.

### YAGNI (You Aren't Gonna Need It)
- Do not build features or abstractions before they are needed.
- Avoid speculative generality.
- Start simple, refactor when the pressure is real.

## File Organization

**Many small files > few large files.**

- 200–400 lines typical, 800 max.
- High cohesion, low coupling.
- Organize by feature/domain, not by file type.
- Extract utilities from large modules.

## Error Handling

- Handle errors explicitly at every level.
- Provide user-friendly messages in UI-facing code.
- Log detailed context on the server side.
- **Never silently swallow errors** — no empty catch blocks, no suppressed logs, no fallback values that hide bugs.

## Input Validation

Validate at system boundaries only:
- User input, external APIs, file content, environment variables.
- Use schema-based validation (Zod, Pydantic) where available.
- Fail fast with clear error messages.
- Do NOT re-validate between internal trusted modules.

## Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Variables & functions | `camelCase` | `formatUser` |
| Booleans | `is`, `has`, `should`, `can` prefix | `isLoading`, `hasAccess` |
| Types, interfaces, components | `PascalCase` | `UserCard`, `ApiResponse` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Custom hooks | `use` prefix, camelCase | `useDebounce` |

## Code Smells to Avoid

- **Deep nesting** → use early returns once nesting exceeds 3 levels.
- **Magic numbers** → named constants for thresholds, delays, limits.
- **Long functions** → split over 50 lines into focused pieces.
- **Dead code** → delete it. Don't leave `_unused` renames or `// removed` comments.
- **Premature abstractions** → three similar lines is better than a shaky base class.

## Comments

Default: **no comments.** Only write one when the *why* is non-obvious:
- Hidden constraint, subtle invariant, workaround for a specific bug, behavior that would surprise a reader.

Never write:
- Comments that describe *what* (the code already says it).
- References to the current task/PR (`// added for X flow`) — those belong in the commit message.
- Multi-paragraph docstrings unless the function is a public API.

## Code Quality Checklist

Before marking work complete:
- [ ] Readable and well-named
- [ ] Functions <50 lines
- [ ] Files <800 lines
- [ ] No nesting >4 levels
- [ ] Errors handled explicitly (no silent swallows)
- [ ] No hardcoded values (use constants or config)
- [ ] Immutable patterns used
- [ ] No stray `console.log` / `print()` / `dbg!` in production paths
