---
paths:
  - "**/*.py"
---
# Python Testing

> Extends [common/testing.md](../common/testing.md).

## Framework: pytest

```bash
pytest --cov=app --cov-report=term-missing
```

## Organization

- Tests live in `tests/` mirroring `app/` structure.
- Test files: `test_*.py`.
- Test functions: `test_*`.

## Markers for Categorization

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_supabase_insert():
    ...

@pytest.mark.slow
def test_full_onboarding_flow():
    ...
```

Run subsets: `pytest -m unit`, `pytest -m "not slow"`.

## Fixtures

```python
import pytest
from app.db import get_db

@pytest.fixture
def db():
    db = get_db(test=True)
    yield db
    db.rollback()

@pytest.fixture
def authed_client(db):
    user = create_test_user(db)
    token = issue_token(user)
    return TestClient(app, headers={"Authorization": f"Bearer {token}"})
```

- Scope fixtures intentionally: `function` (default), `module`, `session`.
- Session-scoped fixtures for expensive setup (app init, DB schema).

## FastAPI Testing

```python
from fastapi.testclient import TestClient
from app.main import app

def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
```

- Override `Depends` in tests with `app.dependency_overrides`.
- Don't mock the DB — use a test Supabase or SQLite in-memory for integration tests.

## Async Tests

```python
import pytest

@pytest.mark.asyncio
async def test_async_handler():
    result = await some_async_fn()
    assert result == expected
```

Requires `pytest-asyncio`.

## Mocking

- Mock paid external APIs (Stripe, Claude, OpenAI) with `responses` or `respx`.
- **Don't mock Supabase queries in integration tests.** Use a real test DB.
- Use `unittest.mock.patch` for stdlib / simple overrides.

## Coverage

- 80%+ on new code (aspirational).
- Exclude generated code, migrations, `__init__.py` from coverage.
- `pytest --cov-fail-under=80` in CI for new projects.

## AAA Pattern

```python
def test_cosine_similarity_orthogonal():
    # Arrange
    v1 = [1, 0, 0]
    v2 = [0, 1, 0]

    # Act
    result = cosine_similarity(v1, v2)

    # Assert
    assert result == 0
```

## Test Naming

```
GOOD: def test_returns_none_when_user_not_found()
GOOD: def test_raises_validation_error_for_invalid_email()
BAD:  def test_user()
BAD:  def test_1()
```
