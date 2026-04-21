---
paths:
  - "**/*.py"
---
# Python Patterns

> Extends [common/patterns.md](../common/patterns.md).

## FastAPI Structure

```
app/
├── main.py              # FastAPI app + mount routers
├── config.py            # Pydantic Settings (env vars)
├── deps.py              # Shared dependencies (auth, db)
├── routers/
│   ├── users.py
│   └── billing.py
├── models/              # Pydantic request/response models
├── services/            # Business logic (called from routers)
├── db/                  # DB client, queries
└── integrations/        # Stripe, Resend, Claude, etc.
```

- **Routers are thin** — parse input, call a service, return.
- **Services own business logic** — pure-ish, testable.
- **Integrations wrap third-party SDKs** — easy to mock.

## Pydantic Settings for Config

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    stripe_secret_key: str

    class Config:
        env_file = ".env"

settings = Settings()  # fails at import if required vars missing
```

## FastAPI Dependency Injection

```python
from fastapi import Depends, HTTPException

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = await verify_token(token)
    if not user:
        raise HTTPException(status_code=401)
    return user

@router.get("/me")
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.from_model(user)
```

- Use `Depends` for auth, DB sessions, any shared per-request setup.
- Lets you override in tests trivially.

## Supabase Python Client

```python
from supabase import create_client, Client

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,  # backend only
)

# Always bound queries
users = supabase.table("users").select("id, email").limit(100).execute()
```

- Service role key = server only.
- Use RLS for authz; don't rely on client-side filters.
- `.limit()` everywhere. Never unbounded.

## Protocols (Structural Typing)

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

Prefer protocols over ABC for duck-typed interfaces — no inheritance required.

## Context Managers for Resources

```python
async with httpx.AsyncClient() as client:
    response = await client.get(url)
```

- DB connections, file handles, HTTP clients — always context-managed.
- Never leave cleanup to garbage collection.

## Background Jobs

- Don't do slow work in a request handler. Queue it.
- Options: Celery (Redis), ARQ (Redis + asyncio), or platform-native (Supabase Edge Functions, Railway cron).
- Always log job start + end with IDs for tracing.

## Dataclass DTOs

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

- Use for internal value passing.
- Use Pydantic `BaseModel` when the data crosses an API boundary or needs validation.

## Testing Pattern — Fixtures over Setup

```python
import pytest

@pytest.fixture
def test_db():
    db = create_test_db()
    yield db
    db.cleanup()

def test_user_creation(test_db):
    user = create_user(test_db, email="a@b.com")
    assert user.id is not None
```
