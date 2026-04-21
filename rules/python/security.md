---
paths:
  - "**/*.py"
---
# Python Security

> Extends [common/security.md](../common/security.md).

## Secret Management

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_service_role_key: str  # required — fails at startup if missing
    stripe_secret_key: str
    claude_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()
```

- Validate required secrets at startup via Pydantic Settings.
- `os.environ["KEY"]` is fine for simple scripts; Pydantic Settings for apps.
- **Never hardcode.** Never commit `.env`.

## Security Scanning

```bash
bandit -r app/           # static security analysis
pip-audit               # vulnerable deps
```

Run both in CI.

## SQL Injection

```python
# WRONG
query = f"SELECT * FROM users WHERE email = '{email}'"

# CORRECT — parameterized
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# CORRECT — Supabase client (already parameterized)
supabase.table("users").select("*").eq("email", email).execute()
```

Never build SQL with string concatenation or f-strings containing user input.

## FastAPI CORS

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.audithq.com"],  # explicit list, no "*" in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

- Never `allow_origins=["*"]` with `allow_credentials=True` — that's a security hole.
- Explicit origin list in production.

## Supabase Service Role Key

- Backend only. If it ends up in a file that ships to the client, that's a breach.
- Use the anon key + RLS for anything client-facing.
- Service role bypasses RLS — use sparingly, even server-side.

## Rate Limiting

- Use `slowapi` or a middleware-level rate limiter on FastAPI.
- Auth endpoints especially: login, signup, password reset.

## Password Handling

- Never roll your own hashing. Use `passlib[bcrypt]` or `argon2-cffi`.
- For Supabase Auth, let Supabase handle it — don't store passwords yourself.

## Dependency Updates

- Pin versions in `requirements.txt` or `pyproject.toml`.
- Run `pip-audit` weekly.
- Review any new dep you haven't heard of before adding.

## Logging Sensitive Data

- Never log passwords, API keys, full JWTs, credit card numbers.
- Mask emails in logs if they're PII in your jurisdiction (GDPR).
- Use a log filter to scrub known-sensitive field names.
