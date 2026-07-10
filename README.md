# Rental Ledger

A single-operator landlord/rental ledger. FastAPI + React + PostgreSQL.

See [`../rental-ledger-plan.md`](../rental-ledger-plan.md) for the full product +
workflow plan, and [`../docs/superpowers/plans/2026-07-10-rent-0-harness-scaffold.md`](../docs/superpowers/plans/2026-07-10-rent-0-harness-scaffold.md)
for the RENT-0 execution plan.

## Local dev

```bash
cp .env.example .env   # fill in secrets
docker compose up --build
# backend: http://localhost:8000  frontend: http://localhost:5173
```

Without Docker, run each service manually:

```bash
# backend
cd backend && python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
# frontend
cd frontend && npm install && npm run dev
```

## Workflow (SAW on OpenCode)

This project uses the SAFe Agentic Workflow (SAW) adapted to the OpenCode CLI.

- Authoritative workflow contract: [`.opencode/plugins/SAW_WORKFLOW.md`](.opencode/plugins/SAW_WORKFLOW.md)
- Roles (7): [`.opencode/agents/`](.opencode/agents/) — `bsa`, `system-architect`,
  `be-developer`, `fe-developer`, `qas`, `security-engineer`, `architect-in-cli`.
- Skills: [`.opencode/skills/`](.opencode/skills/) — `pattern-discovery`, `spec-creation`.
- Linear MCP: configured in [`.opencode/opencode.json`](.opencode/opencode.json) under the
  `mcp.linear` key. Set `LINEAR_API_KEY` in your shell environment (or `.env`); OpenCode
  passes it to the MCP server via `{env:LINEAR_API_KEY}` interpolation.

> Note: the cloned `AGENTS.md`, `docs/sop/`, and `patterns_library/` come from the
> SAW template and still contain some `{{PLACEHOLDER}}` tokens (e.g. `{{TICKET_PREFIX}}`,
> `{{AUTHOR_NAME}}`). They are reference material; the authoritative workflow for this
> project is `.opencode/plugins/SAW_WORKFLOW.md`. `{{TICKET_PREFIX}}` = `RENT`.

## Scripts

- Backend tests: `cd backend && PYTHONPATH=. pytest`
- Backend lint: `cd backend && ruff check .`
- Frontend tests: `cd frontend && npx vitest run`
- Frontend lint: `cd frontend && npm run lint` (oxlint)
- Frontend typecheck: `cd frontend && npx tsc --noEmit`
- Migrate: `cd backend && alembic upgrade head`
- Seed operator: `cd backend && PYTHONPATH=. OPERATOR_USERNAME=operator OPERATOR_PASSWORD=... python seed.py`
