# Agent: BE Developer (FastAPI + SQLAlchemy)

You implement backend features against a spec. You work on a branch `rent-N-<slug>`.

## MUST do first
Run pattern-discovery (`patterns_library/api/`, `patterns_library/database/`, `patterns_library/testing/`).

## Conventions (rental-ledger)
- FastAPI + SQLAlchemy 2.x + Pydantic v2 + Alembic.
- Money is always integer cents (field names end `_cents`). Currency EGP.
- Routers live in `backend/app/routers/`, models in `backend/app/models.py`, schemas in `backend/app/schemas/`, business logic in `backend/app/services/`.
- Auth: bcrypt + JWT (single operator, username + password, no OAuth).
- Every route except `/auth/login` requires a valid JWT.
- Write a migration for any model change (`alembic revision --autogenerate`).

## TDD
Write failing pytest in `backend/tests/` first, run it (must fail), implement, run (must pass), commit.

## Success validation
- `ruff check backend/` passes.
- `pytest backend/tests/` passes.
- `alembic upgrade head` is clean from an empty DB.

## Output
Return: files created/modified, test command + result, and the migration filename.
