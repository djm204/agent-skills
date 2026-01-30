# Python Expert Development Guide

Principal-level guidelines for Python engineering. Idiomatic Python, production systems, and deep interpreter knowledge.

---

## Overview

This guide applies to:
- Web services and APIs (Django, FastAPI, Flask)
- CLI tools and automation
- Data processing and ETL pipelines
- Libraries and PyPI packages
- Async services and event-driven architectures

### Core Philosophy

Python's power is in its clarity. The best Python code reads like well-written prose.

- **Readability counts.** The Zen of Python is the engineering standard.
- **Explicit is better than implicit.** Type hints, clear names, no magic.
- **Errors should never pass silently.** Bare `except:` is a bug.
- **The standard library is rich — use it.** `collections`, `itertools`, `pathlib`, `dataclasses`, `contextlib`.
- **If you don't know, say so.** Admitting uncertainty is professional.

### Project Structure

```
project/
├── src/mypackage/
│   ├── __init__.py
│   ├── py.typed
│   ├── models/
│   ├── services/
│   ├── repositories/
│   └── api/
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── pyproject.toml
└── Makefile
```

---

## Type System

### Modern Typed Python

```python
def fetch_users(
    db: Database, *, limit: int = 100, active_only: bool = True
) -> list[User]: ...

# Union types (3.10+)
def find_user(email: str) -> User | None: ...

# Protocol for structural subtyping
class Renderable(Protocol):
    def render(self) -> str: ...
```

### Rules

- `mypy --strict` is the baseline
- All function signatures fully typed
- `dataclasses` or Pydantic over raw dicts
- No `Any` as a crutch — type properly or explain why not
- No `# type: ignore` without inline explanation

---

## Patterns and Idioms

### Data Model

Implement `__repr__`, `__eq__`, `__hash__` via `@dataclass`. Use `frozen=True` and `slots=True` for immutable value objects.

### Generators

```python
def read_large_file(path: Path) -> Iterator[str]:
    with open(path) as f:
        for line in f:
            yield line.strip()

# Generator expressions over list comprehensions when iterating once
total = sum(order.total for order in orders)
```

### Context Managers

```python
@contextmanager
def timed_operation(name: str) -> Iterator[None]:
    start = time.monotonic()
    try:
        yield
    finally:
        logger.info(f"{name} took {time.monotonic() - start:.3f}s")
```

### Decorators

Use `functools.wraps` and `ParamSpec` for properly typed decorators that preserve signatures.

---

## Async Python

### TaskGroup (3.11+)

```python
async with asyncio.TaskGroup() as tg:
    user_task = tg.create_task(fetch_users())
    post_task = tg.create_task(fetch_posts())
# All complete or all cancelled on failure
```

### Bounded Concurrency

```python
semaphore = asyncio.Semaphore(10)
async def bounded_fetch(url: str) -> Response:
    async with semaphore:
        return await fetch(url)
```

### Rules

- Never use blocking calls (`requests`, `time.sleep`) in async code
- Use `run_in_executor` for CPU-bound work
- Every spawned task needs error handling
- Use `asyncio.timeout()` (3.11+) for deadlines

---

## Testing

### pytest Patterns

```python
@pytest.mark.parametrize("input_str, expected", [
    ("hello world", "hello-world"),
    ("UPPER", "upper"),
    ("", ""),
])
def test_slugify(input_str: str, expected: str) -> None:
    assert slugify(input_str) == expected
```

### Dependency Injection Over Mocking

```python
def test_create_user_sends_notification() -> None:
    notifier = Mock(spec=Notifier)
    service = UserService(FakeUserRepo(), notifier)
    service.create(input_data)
    notifier.send_welcome.assert_called_once()
```

### Rules

- Arrange-Act-Assert structure
- Descriptive test names
- Test error cases, not just happy paths
- Prefer DI over `@patch`
- No `time.sleep()` in tests

---

## Performance

### Profile First

```bash
py-spy record -o profile.svg -- python myapp.py
```

### Key Patterns

- `"".join()` over `+=` for string concatenation
- Generator expressions to avoid intermediate lists
- `set` for O(1) membership testing
- `deque` for O(1) append/pop from both ends
- `slots=True` on dataclasses for memory efficiency
- `ThreadPoolExecutor` for I/O parallelism
- `ProcessPoolExecutor` for CPU parallelism
- `lru_cache` / `cache` for expensive pure functions

---

## Web and APIs

### FastAPI

```python
CurrentUser = Annotated[User, Depends(get_current_user)]
DB = Annotated[Database, Depends(get_db)]

@app.get("/users/me")
async def get_me(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)
```

### Pydantic for Validation

```python
class CreateUserRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
```

### Configuration

```python
class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env")
    database_url: str
    debug: bool = False
settings = Settings()  # Validate at import time
```

---

## Tooling

### Essential Stack

| Tool | Purpose |
|------|---------|
| uv | Package management |
| ruff | Linting + formatting |
| mypy | Type checking |
| pytest | Testing |
| pre-commit | Git hooks |

### CI Essentials

```bash
ruff format --check .
ruff check .
mypy .
pytest --cov
pip-audit .
```

---

## Definition of Done

A Python feature is complete when:

- [ ] `mypy --strict` passes
- [ ] `ruff check` and `ruff format --check` pass
- [ ] `pytest` passes with no failures
- [ ] Error cases are tested
- [ ] Docstrings on all public functions and classes
- [ ] No bare `except:` without re-raise
- [ ] No mutable default arguments
- [ ] No `# type: ignore` without explanation
- [ ] Code reviewed and approved
