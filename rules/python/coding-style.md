---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python Coding Style

> Extends [common/coding-style.md](../common/coding-style.md).

## Standards

- Follow **PEP 8**.
- **Type annotations on all function signatures** (parameters + return).
- Python 3.10+ union syntax: `str | None`, not `Optional[str]`.

## Tooling

- **`ruff`** — linter and formatter (replaces black, isort, flake8).
- **`mypy`** or **`pyright`** — type checker. Run in `strict` mode on new code.
- **`pytest`** — testing.
- **`bandit`** — security scan.

## Immutability

Prefer immutable data structures:

```python
from dataclasses import dataclass
from typing import NamedTuple

@dataclass(frozen=True)
class User:
    name: str
    email: str

class Point(NamedTuple):
    x: float
    y: float
```

- Use `frozen=True` dataclasses for domain models.
- Use `NamedTuple` for simple value objects.
- Use Pydantic `BaseModel` for validated I/O data (API requests, config).

## Pydantic for Validation (v2)

```python
from pydantic import BaseModel, EmailStr, Field

class CreateUserRequest(BaseModel):
    email: EmailStr
    age: int = Field(ge=0, le=150)
    name: str = Field(min_length=1, max_length=100)
```

- Pydantic at every boundary: FastAPI request/response, config loading, third-party API parsing.
- Don't duplicate types — derive from the model.

## Error Handling

```python
import logging

logger = logging.getLogger(__name__)

async def load_user(user_id: str) -> User:
    try:
        return await db.get_user(user_id)
    except DatabaseError as e:
        logger.exception("Failed to load user", extra={"user_id": user_id})
        raise UserLoadError(f"Could not load user {user_id}") from e
```

- **Narrow `except` clauses.** Never bare `except:` or `except Exception:` without re-raising.
- Use `logger.exception(...)` inside `except` to capture the traceback.
- Chain exceptions with `raise ... from e` to preserve context.
- **Never silently swallow.** If you catch, log at minimum.

## Logging

- Use the `logging` module. **Never `print()` in production code.**
- Configure a single logger setup at application entry.
- Log structured data via `extra={...}` for JSON logging.

## Imports

- Absolute imports over relative where possible.
- Group: stdlib, third-party, local — `ruff`/`isort` handles ordering.

## Naming

| Kind | Convention |
|---|---|
| Modules, files | `snake_case.py` |
| Functions, variables | `snake_case` |
| Classes | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` |
| Private | `_leading_underscore` |

## Functions

- <50 lines. Split if longer.
- Use keyword-only arguments for optional booleans: `def send(user, *, dry_run: bool = False)`.
- Return early; avoid deep nesting.

## Async

- Use `async`/`await` consistently in async codebases (FastAPI). Don't mix sync and async in the same call chain.
- `asyncio.gather(...)` for parallel independent work.
- Never call blocking I/O from an async handler — use `asyncio.to_thread(...)` if unavoidable.
