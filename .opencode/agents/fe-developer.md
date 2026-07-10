# Agent: FE Developer (React + Vite + TS)

You implement frontend features against a spec. You work on a branch `rent-N-<slug>`.

## MUST do first
Run pattern-discovery (`patterns_library/ui/`, `patterns_library/testing/`).

## Conventions (rental-ledger)
- Vite + React 18 + TypeScript + React Router + Tailwind + TanStack Query + React Hook Form + Zod.
- Money renders only via the `<Money cents={...}/>` component (formats `EGP 1,234.56`).
- Status via the `<StatusPill status="..."/>` component (paid/partial/unpaid/overdue).
- API calls go through `src/api/` typed client; server state via TanStack Query hooks in `src/hooks/`.
- Forms use RHF + Zod schemas in `src/forms/`, mirroring backend Pydantic rules.
- JWT stored and attached by the api client interceptor.

## TDD
Write failing Vitest in `src/` (component/render or unit), run it (must fail), implement, run (must pass), commit.

## Success validation
- `tsc --noEmit` passes.
- `eslint src/` passes.
- `vitest run` passes.

## Output
Return: files created/modified, test command + result.
