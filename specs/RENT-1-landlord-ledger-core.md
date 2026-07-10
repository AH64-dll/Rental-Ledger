# Spec: Landlord Ledger Core

## Issue Reference

- **Label**: `RENT-1`
- **URL**: https://github.com/AH64-dll/Rental-Ledger/issues/RENT-1

## High-Level Objective

### User Story

**As a** landlord/operator  
**I want to** manage properties, units, tenants, leases, charges, payments, and view per-tenant balances and a dashboard overview  
**So that** I can track all rental income, outstanding amounts, and lease statuses in one place without spreadsheets

### Business Context

This is the core of the application. Every subsequent ticket (RENT-2 deposits, RENT-3 late fees, RENT-4 lease tracking, RENT-5 deploy) builds on these entities and APIs. Getting the data model and derived computation (balance, status) right here is critical — changes later would require migrations.

The operator is a single authenticated user. There is no tenant self-service portal, no multi-user, no signup flow. A single operator row is seeded and JWT auth gates all API access.

---

## Acceptance Criteria

### Auth
- [ ] `POST /auth/login` accepts `{username, password}`, returns `{access_token}` on valid credentials, returns 401 on invalid
- [ ] `GET /me` returns `{username}` when a valid Bearer token is provided, returns 401 without

### Properties
- [ ] `GET /properties` returns all properties
- [ ] `POST /properties` creates a property with `{name, address, notes?}`, returns the created property (201)
- [ ] `GET /properties/{id}` returns a single property with its units nested
- [ ] `PUT /properties/{id}` updates a property, returns 404 if missing
- [ ] `DELETE /properties/{id}` deletes a property, returns 404 if missing, returns 409 if units exist

### Units (nested under property)
- [ ] `GET /properties/{pid}/units` returns all units for that property
- [ ] `POST /properties/{pid}/units` creates a unit with `{name, notes?}`, returns 404 if property missing
- [ ] `PUT /properties/{pid}/units/{id}` updates a unit name/notes
- [ ] `DELETE /properties/{pid}/units/{id}` deletes a unit, returns 409 if unit has active leases

### Tenants
- [ ] `GET /tenants` returns all tenants
- [ ] `POST /tenants` creates a tenant with `{name, email?, phone?, notes?}`, returns 201
- [ ] `GET /tenants/{id}` returns tenant detail with active leases listed
- [ ] `PUT /tenants/{id}` updates tenant fields
- [ ] `DELETE /tenants/{id}` deletes a tenant, returns 409 if tenant has active leases
- [ ] `GET /tenants/{id}/balance` returns `{net_balance_cents, deposits_held_cents, charges_summary[]}` computed on-read

### Leases
- [ ] `GET /leases` returns all leases with tenant name and unit name populated
- [ ] `POST /leases` creates a lease linking tenant to unit with `{unit_id, tenant_id, start_date, end_date, monthly_rent_cents, rent_due_day_of_month, late_fee_percent, security_deposit_cents}`. Validates unit and tenant exist. Sets status to `active`.
- [ ] `GET /leases/{id}` returns lease detail with tenant and unit info
- [ ] `PUT /leases/{id}` updates mutable lease fields
- [ ] `DELETE /leases/{id}` deletes a lease, returns 409 if has charges
- [ ] `POST /leases/{id}/end` marks lease status as `ended`, persists change

### Charges
- [ ] `GET /leases/{lid}/charges` returns all charges for that lease, each with computed `paid_cents`, `balance_cents`, and derived `status`
- [ ] `POST /leases/{lid}/charges` creates a charge with `{description, amount_cents, charge_date, due_date?, category (rent|late_fee|other)}`, returns 201
- [ ] `GET /charges?tenant_id=&status=&overdue=` returns flat filterable list across all leases, with tenant name populated
- [ ] `PUT /leases/{lid}/charges/{id}` updates charge fields (amount, description, due_date)
- [ ] `DELETE /leases/{lid}/charges/{id}` deletes a charge, returns 409 if has payments

### Payments
- [ ] `POST /charges/{cid}/payments` logs a partial payment with `{amount_cents, payment_date, method?, notes?}`, returns 201. Validates charge exists and payment doesn't exceed remaining balance.
- [ ] `GET /payments/{id}` returns a single payment
- [ ] `PUT /payments/{id}` updates payment fields
- [ ] `DELETE /payments/{id}` deletes a payment

### Deposit (RENT-2 stub — basic model only in RENT-1)
- [ ] Deposit model exists in the database with all fields from the data model
- [ ] Full CRUD is deferred to RENT-2; RENT-1 includes the model and Alembic migration only

### Dashboard
- [ ] `GET /dashboard/overview` returns `{active_leases, overdue_charges, total_owed_to_you_cents, deposits_held_cents, expiring_leases}` computed on-read

### Derived computations (verified by QAS)
- [ ] Charge status correctly derives `paid/partial/unpaid/overdue` according to the rules in §1.2
- [ ] `net_balance_cents` = SUM(charges) − SUM(payments) across all tenant charges
- [ ] Positive balance = tenant owes landlord; negative = landlord owes tenant
- [ ] All money fields stored as integers (cents); no floating-point arithmetic in backend

### Cross-cutting
- [ ] All endpoints except `/auth/login` and `/health` require a valid JWT Bearer token
- [ ] All request bodies are validated by Pydantic schemas; invalid input returns 422 with detail
- [ ] All responses are JSON
- [ ] Database has a single operator user seeded from env vars

---

## Pattern References

### Primary Patterns (Directly Reused)

- **`backend/app/auth.py`** (lines 1-39) — JWT + bcrypt auth pattern. `hash_password(rounds=12)`, `issue_token(HS256, 7-day)`, `decode_token()` → raises 401, `current_user` FastAPI dependency. **Justification:** Already implemented and tested in RENT-0. RENT-1 adds the `/auth/login` route that uses `verify_password()` + `issue_token()` and wires `Depends(current_user)` to all protected routes.

- **`backend/app/db.py`** (lines 1-19) — SQLAlchemy engine + session + Base + `get_db()` dependency. **Justification:** All models extend `app.db.Base`. All routes use `Depends(get_db)`. Synchronous session management pattern is established and must be consistent.

- **`backend/app/models.py`** (lines 1-20) — SQLAlchemy 2.0 Mapped[] + mapped_column() style. Uses `server_default=func.now()` for timestamps, `unique=True + index=True` for username. **Justification:** All 7 new entities follow this exact style. No legacy `Column()` syntax.

- **`backend/app/config.py`** (lines 1-17) — Pydantic BaseSettings singleton. **Justification:** All new config (no new env vars needed for RENT-1 beyond what RENT-0 defined).

- **`frontend/src/api/client.ts`** (lines 1-13) — Axios singleton with JWT interceptor. **Justification:** All frontend API calls use `import { api } from "@/api/client"`. TanStack Query hooks wrap this client.

- **`frontend/src/components/Money.tsx`** (lines 1-9) + **`Money.test.tsx`** — Currency formatting. **Justification:** All monetary values displayed via `<Money cents={...} />`. Must be used everywhere amounts appear.

- **`frontend/src/components/StatusPill.tsx`** (lines 1-16) — Status badge with union type `"paid" | "partial" | "unpaid" | "overdue"`. **Justification:** Used on charge rows, dashboard cards, tenant balance view. Statuses match the backend-derived computation.

### Secondary Patterns (Adapted)

- **`patterns_library/api/user-context-api.md`** — GET/POST handler structure with auth check, validation, error handling. **Adaptation:** Replace Clerk `auth()` with `Depends(current_user)`, replace Prisma with `Depends(get_db)`, replace Zod with Pydantic schemas.

- **`patterns_library/api/zod-validation-api.md`** — Schema structure for request/response, `.partial()` for update schemas, discriminated unions. **Adaptation:** Use Pydantic `BaseModel` in `backend/app/schemas/`. Optional fields via `Optional[str] = None`.

- **`patterns_library/ui/data-table.md`** — Sortable table with actions dropdown and status badges. **Adaptation:** Build simpler table with Tailwind (no shadcn/ui dependency). Use `StatusPill` for status column, `<Money>` for amount columns.

- **`patterns_library/ui/form-with-validation.md`** — React Hook Form + Zod structure. **Adaptation:** Zod schemas in `frontend/src/forms/` mirroring backend Pydantic rules. Money fields parsed as integers (cents).

- **`patterns_library/database/prisma-transaction.md`** — Atomic read-check-write pattern. **Adaptation:** SQLAlchemy equivalent for operations where consistency matters (e.g., balance computation that spans multiple tables, or idempotent late-fee application).

- **`patterns_library/security/input-sanitization.md`** — Input validation layered on Pydantic. **Adaptation:** Pydantic handles type coercion and validation (str length limits, int ranges, enum values). SQLAlchemy parameterized queries prevent injection.

---

## Low-Level Implementation Tasks

### Backend Tasks

1. [ ] **Models**: Add `Property`, `Unit`, `Tenant`, `Lease`, `Charge`, `Payment`, `Deposit` to `backend/app/models.py` using SQLAlchemy 2.0 Mapped[] style, with proper ForeignKey relationships, Enum types for status/category fields, and cascading rules.
2. [ ] **Alembic migration**: Run `alembic revision --autogenerate -m "add ledger core entities [RENT-1]"` to generate the migration. Verify it creates all 7 tables with correct columns, constraints, and indexes.
3. [ ] **Pydantic schemas**: Create `backend/app/schemas/properties.py`, `schemas/units.py`, `schemas/tenants.py`, `schemas/leases.py`, `schemas/charges.py`, `schemas/payments.py`, `schemas/deposits.py`, `schemas/auth.py`, `schemas/dashboard.py`. Each file defines Create, Update, and Response schemas.
4. [ ] **Auth router**: Create `backend/app/routers/auth.py` with `POST /auth/login` (validates credentials, returns JWT). Wire to `app.include_router()` in `main.py`.
5. [ ] **Properties router**: `GET/POST /properties`, `GET/PUT/DELETE /properties/{id}`. Cascading delete check: 409 if units exist.
6. [ ] **Units router**: `GET/POST /properties/{pid}/units`, `GET/PUT/DELETE /properties/{pid}/units/{id}`. 404 if property missing, 409 on delete if active leases.
7. [ ] **Tenants router**: `GET/POST /tenants`, `GET/PUT/DELETE /tenants/{id}`. 409 on delete if active leases. `GET /tenants/{id}/balance` endpoint.
8. [ ] **Leases router**: `GET/POST /leases`, `GET/PUT /leases/{id}`, `DELETE /leases/{id}` (409 if charges exist), `POST /leases/{id}/end` (marks ended).
9. [ ] **Charges router**: `GET/POST /leases/{lid}/charges`, `GET/PUT/DELETE /leases/{lid}/charges/{id}`, `GET /charges` (flat filterable with query params).
10. [ ] **Payments router**: `POST /charges/{cid}/payments` (validates amount doesn't exceed balance), `GET/PUT/DELETE /payments/{id}`.
11. [ ] **Dashboard router**: `GET /dashboard/overview` — queries active leases count, overdue charges count, total owed (sum of balances where >0), deposits held, expiring leases (end_date within 30 days).
12. [ ] **Services layer**: Create `backend/app/services/balance.py` with `compute_charge_balance()` (paid_cents = SUM payments, balance_cents = amount − paid), `derive_charge_status()` (paid/partial/unpaid/overdue rules), `compute_tenant_balance()` (net across all charges). Create `backend/app/services/lease.py` with `check_lease_expiry()` (lazy expiry flag on read).
13. [ ] **Wire routers in main.py**: Add `app.include_router()` for each router module with appropriate prefix and tags.
14. [ ] **pytest tests**: Write tests for every router covering: happy path (200/201), auth missing (401), not found (404), invalid input (422), business rule conflicts (409). Use `TestClient` + SQLite in-memory or fixture database.

### Frontend Tasks

1. [ ] **Types**: Create `frontend/src/types/` with TypeScript interfaces for Property, Unit, Tenant, Lease, Charge, Payment, DashboardOverview — mirroring backend Pydantic response schemas.
2. [ ] **Zod schemas**: Create `frontend/src/forms/` with Zod validation schemas for each create/update form. Mirror backend Pydantic rules.
3. [ ] **TanStack Query hooks**: Create `frontend/src/hooks/` with `useQuery`/`useMutation` hooks for each resource: `useProperties()`, `useUnits(propertyId)`, `useTenants()`, `useTenantBalance(id)`, `useLeases()`, `useLease(id)`, `useCharges(leaseId)`, `useChargesList(filters)`, `usePayments(chargeId)`, `useDashboard()`.
4. [ ] **Login page**: `frontend/src/pages/Login.tsx` — username + password form, calls `POST /auth/login`, stores token in localStorage, redirects to `/dashboard`. Auth guard redirects unauthenticated users to `/login`.
5. [ ] **Layout**: `frontend/src/components/Layout.tsx` — sidebar navigation (Dashboard, Properties, Tenants, Leases, Charges, Settings), top bar with operator username (from `/me`), logout button.
6. [ ] **Dashboard page**: `frontend/src/pages/Dashboard.tsx` — cards showing active leases count, overdue charges count, total owed (EGP formatted), deposits held, expiring leases list (≤30 days). Uses `GET /dashboard/overview`.
7. [ ] **Properties pages**: `PropertiesList.tsx` (table with name/address/units count/actions) + `PropertyDetail.tsx` (property info + units list + add unit inline form). Create/Edit via modal or inline form.
8. [ ] **Tenants pages**: `TenantsList.tsx` (table with name/email/phone/active leases count/actions) + `TenantProfile.tsx` (tenant info, net balance card, deposits held card, chronological ledger of charges + payments, edit tenant form).
9. [ ] **Leases pages**: `LeasesList.tsx` (table with tenant/unit/term/rent/status/actions) + `LeaseDetail.tsx` (lease info, tabs for Charges / Payments / Deposits). End lease button.
10. [ ] **Charges page**: `ChargesList.tsx` — filterable table (by tenant dropdown, status dropdown, overdue toggle). Each row shows tenant, description, amount, paid, balance, status pill, due date. "Log payment" inline button on each row.
11. [ ] **Settings page**: `frontend/src/pages/Settings.tsx` — change password form (stub — full implementation in follow-up). Currency display preference (stub).
12. [ ] **Router**: Configure React Router in `App.tsx` with routes for each page. Auth guard component wraps all routes except `/login`.
13. [ ] **Vitest tests**: Write component tests for `<Money>` (already done), `<StatusPill>`, `<Login>` (renders form, handles submit), `<Dashboard>` (renders cards with mock data). Write hook tests for TanStack Query with MSW or mock service worker.

### Database Tasks

1. [ ] Alembic migration creates all 7 new tables with correct columns, foreign keys, indexes, and enum types
2. [ ] Seed script updated (if needed) — RENT-0 seed script already creates the operator; no additional seed data needed for RENT-1
3. [ ] Verify migration is reversible (`alembic downgrade -1`)

---

## Critical Handoff Notes

### #PATH_DECISION

**Why synchronous SQLAlchemy over async:** The existing backend uses synchronous SQLAlchemy (`SessionLocal`, `engine`, `Depends(get_db)`). We maintain this pattern for RENT-1. Transitioning to async (SQLAlchemy 2.0 async) would be a separate architectural decision spanning all tickets. Single-operator load makes async unnecessary for v1.

**Why no RLS:** The app has a single operator user. All data belongs to that one user. Row-Level Security adds complexity with no benefit in this model. If multi-user is ever added (deferred), RLS becomes the solution, not application-level filtering.

**Why computed balances (not cached):** `net_balance_cents`, `charge.paid_cents`, `charge.balance_cents`, and `charge.status` are computed on read from the charges and payments tables. No cached balance fields. Rationale: single operator = low query volume; always-correct balance without cache invalidation bugs is simpler. If performance becomes an issue (unlikely for <10,000 rows), Redis caching can be added later.

**Why charges+payments are linked to both lease AND tenant:** `Charge.tenant_id` and `Charge.lease_id` are both present. This allows flat queries like "show me all charges for tenant X across all their leases" without joining through the lease table. The `tenant_id` on a charge should match the `lease.tenant_id` — validated at creation time.

### #PLAN_UNCERTAINTY

- **Deferred RENT-2 (deposits):** The Deposit model and migration are included in RENT-1 so the table exists, but full CRUD endpoints and UI are deferred to RENT-2. If the spec for deposits changes in RENT-2, a migration may be needed.
- **Deferred RENT-3 (late fees):** The `late_fee_percent` field on Lease and `late_fee_applied` flag on Charge are created in RENT-1 but the auto-calculation logic is deferred to RENT-3.
- **Deferred RENT-4 (lease expiry):** The `status` field on Lease and `end_date` are created in RENT-1, but the lazy expiry auto-flagging logic is deferred to RENT-4.
- **Frontend state management:** TanStack Query handles server state. No additional state library (Redux, Zustand) is planned unless client-side complexity demands it. This assumption should be validated during implementation.

### #EXPORT_CRITICAL

- **Money is INTEGER CENTS everywhere.** The backend stores `*_cents` as SQLAlchemy `Integer`. The API sends/receives cents as JSON integers (not floats). The frontend `<Money>` component divides by 100 for display only. NEVER do floating-point math on currency.
- **All routes except `/auth/login` and `/health` require JWT.** The `current_user` dependency from `auth.py` must be on every router-level dependency or per-route dependency.
- **Business rule conflicts return 409:** deleting a property with units, deleting a unit with active leases, deleting a tenant with active leases, deleting a lease with charges, deleting a charge with payments, logging a payment that exceeds the remaining balance — all return `409 Conflict` with a descriptive detail message.
- **CORS is locked** to `http://localhost:5173` in dev. RENT-5 locks it to the Vercel origin. Never use `allow_origins=["*"]`.
- **bcrypt cost factor is 12** (established in RENT-0 `auth.py`). Do not reduce this.
- **JWT expiry is 7 days** (established in RENT-0 `config.py`). Keep this for v1; shorter-lived tokens + refresh flow is a future optimization.

---

## Testing Strategy

### Unit Tests

- [ ] `test_charge_status_derivation` — parametrized: paid (balance=0), partial (balance>0, paid>0), unpaid (paid=0, due_date>=today), overdue (balance>0, due_date<today)
- [ ] `test_tenant_balance_computation` — sum charges minus sum payments, crosses multiple leases
- [ ] `test_money_formatting` — `<Money>` component with various cent values (already partially done)
- [ ] `test_status_pill_renders_correct_color` — each status renders correct Tailwind class
- [ ] `test_auth_login_valid` — returns token for correct credentials
- [ ] `test_auth_login_invalid` — returns 401 for wrong password
- [ ] `test_auth_me_unauthorized` — returns 401 without token
- [ ] `test_payment_exceeds_balance` — returns 409 when payment > remaining balance

### Integration Tests

- [ ] `GET /properties` — returns list (empty initially, then with created property)
- [ ] `POST /properties` — creates, returns 201 with correct shape
- [ ] `GET /properties/{id}` — returns property with nested units
- [ ] `PUT /properties/{id}` — updates, returns updated property
- [ ] `DELETE /properties/{id}` — deletes, then returns 404; with units attached returns 409
- [ ] Units CRUD nested under property — create, read, update, delete, 404 for missing property
- [ ] Tenants CRUD — create, read, update, delete, 409 if has active lease
- [ ] `GET /tenants/{id}/balance` — returns correct net balance and deposits held
- [ ] Leases CRUD — create (validates unit+tenant exist), read, update, delete (409 if has charges)
- [ ] `POST /leases/{id}/end` — marks ended, read confirms status change
- [ ] Charges CRUD — create under lease, read with computed status, update amount, delete (409 if has payments)
- [ ] `POST /charges/{id}/payments` — log payment, verify charge balance decreases
- [ ] `DELETE /payments/{id}` — remove payment, verify charge balance increases
- [ ] `GET /dashboard/overview` — returns correct counts and totals
- [ ] Auth gate: every protected route returns 401 without token

### End-to-End Tests

- [ ] Complete flow: login → create property → create unit → create tenant → create lease → add charge → log payment → verify tenant balance updates → verify dashboard reflects data
- [ ] Error handling flow: attempt delete on property with units → see 409 → remove units → successful delete
- [ ] Auth flow: visit any page without token → redirected to login → login → redirected to dashboard

### Manual Testing

- [ ] Login screen renders, accepts credentials, stores token, redirects to dashboard
- [ ] Dashboard cards display correct values from seed/test data
- [ ] Property list renders, create/edit/delete work, units nested correctly
- [ ] Tenant profile shows balance and chronological ledger
- [ ] Lease detail has working tabs (Charges / Payments / Deposits)
- [ ] Charge list filters work (by tenant, status, overdue)
- [ ] Log payment inline form appears on charge rows and works
- [ ] Logout clears token and redirects to login

---

## Security Considerations

### Authentication/Authorization

- [ ] `POST /auth/login` validates credentials via `bcrypt.checkpw()` (cost 12)
- [ ] JWT secret read from `settings.jwt_secret` (env var), never hardcoded
- [ ] JWT expiry set via `settings.jwt_exp_minutes`
- [ ] All protected routes use `Depends(current_user)` — no unprotected data access
- [ ] Token stored in `localStorage` on frontend; attached via Axios interceptor

### Data Protection

- [ ] Operator password stored as bcrypt hash only (never plaintext)
- [ ] No tenant credentials stored (tenants do not log in)
- [ ] No secrets in the codebase (verified by grep)

### Input Validation

- [ ] Every request body validated by Pydantic schemas (type checking, required fields, string lengths, integer ranges)
- [ ] Path parameters validated by FastAPI (int IDs)
- [ ] Query parameters validated by FastAPI + manual validation in routes
- [ ] SQLAlchemy uses bound parameters — no raw string SQL

---

## Performance Requirements

### Response Time

- `GET /dashboard/overview`: < 200ms (single query with counts + sums)
- `GET /tenants/{id}/balance`: < 100ms (a few aggregate queries)
- All other CRUD endpoints: < 50ms (primary key lookups)

### Scalability

- Single operator, single-digit thousands of rows — no performance concerns for v1
- Computed-on-read balances are O(charges + payments) per tenant — acceptable at this scale

---

## Dependencies

### Technical Dependencies

- [ ] RENT-0 harness + scaffold (complete)
- [ ] PostgreSQL 15 (via docker-compose or Neon)
- [ ] Python 3.12 with packages from `requirements.txt`
- [ ] Node 20 with packages from `package.json`

### Business Dependencies

- [ ] None — self-contained feature

---

## Definition of Done

- [ ] All 24 acceptance criteria met
- [ ] Backend: `ruff check backend/` passes with no errors
- [ ] Backend: `pytest backend/tests/` passes with all tests green
- [ ] Backend: `alembic upgrade head` runs clean from empty database
- [ ] Frontend: `tsc --noEmit` passes with no type errors
- [ ] Frontend: `eslint src/` passes with no errors
- [ ] Frontend: `vitest run` passes with all tests green
- [ ] `docker compose up --build` boots all three services (db, backend, frontend)
- [ ] Manual walkthrough of complete flow (login → create → charge → pay → verify balance) succeeds
- [ ] QAS gate: all AC verified with evidence posted
- [ ] Security Engineer gate: all security checklist items verified
- [ ] Stage 1 review (System Architect): pattern choices validated
- [ ] Stage 2 review (ARCHitect-in-CLI): architecture and cross-cutting concerns approved
- [ ] Stage 3 review (HITL): final approval and merge

---

## Pull Request Template

```markdown
## Summary

Implements the landlord ledger core: Properties, Units, Tenants, Leases, Charges, Payments entities with full CRUD APIs, auth (login + JWT), balance computation, dashboard overview, and React SPA frontend with 9 pages.

## Label

Closes RENT-1

## Changes Made

### Backend
- Added 7 SQLAlchemy models (Property, Unit, Tenant, Lease, Charge, Payment, Deposit)
- Generated Alembic migration for all new tables
- Added 10 Pydantic schema modules (create/update/response per resource)
- Implemented 10 router modules (auth, properties, units, tenants, leases, charges, payments, deposits, dashboard)
- Added services layer (balance computation, status derivation)
- Wired all routers into main.py
- Wrote pytest tests covering happy path, auth, not found, validation, business rule conflicts

### Frontend
- Added TypeScript interfaces for all entities
- Added Zod validation schemas for forms
- Added TanStack Query hooks for all API endpoints
- Implemented Login page with auth guard
- Implemented Dashboard page with overview cards
- Implemented Properties list/detail pages with units CRUD
- Implemented Tenants list/profile pages with balance and ledger
- Implemented Leases list/detail pages with charges/payments tabs
- Implemented Charges filterable list with inline payment form
- Implemented Settings page skeleton
- Added React Router with auth guard
- Wrote Vitest tests for components and hooks

## Testing Evidence

- [ ] Backend tests: `pytest backend/tests/ -v` output attached
- [ ] Frontend tests: `vitest run` output attached
- [ ] Type checks: `tsc --noEmit` output attached
- [ ] Lint: `ruff check` + `eslint` output attached
- [ ] Manual testing: walkthrough screenshots/video attached

## Security Review

- [ ] Auth: bcrypt cost 12, JWT secret from env, all routes guarded
- [ ] No secrets in repo (grep confirmed)
- [ ] SQL: parameterized queries via SQLAlchemy
- [ ] Input validation: Pydantic on all request bodies
- [ ] CORS: locked to localhost:5173 (dev)

## Session Evidence

- **Labels**: RENT-1
- **Validation Results**: CI workflow passing
```

---

## Notes for Execution Agent

### Before Starting

1. Read this entire spec carefully
2. Pay special attention to #EXPORT_CRITICAL items — especially integer cents, JWT on all routes, 409 conflict rules
3. Review referenced patterns: `backend/app/auth.py`, `backend/app/db.py`, `backend/app/models.py`, `frontend/src/api/client.ts`, `frontend/src/components/Money.tsx`
4. Pattern discovery results are documented in the Pattern References section above
5. Branch name: `rent-1-landlord-ledger-core`

### During Implementation

1. Follow the low-level tasks in order — models first, then schemas, then routers, then tests; frontend types/hooks first, then pages
2. Make atomic commits for each logical change with `feat(ledger): ... [RENT-1]` format
3. Run backend tests after each router is implemented: `cd backend && PYTHONPATH=. pytest tests/ -v -k <router_name>`
4. Run frontend type checks frequently: `cd frontend && npx tsc --noEmit`
5. Wire each router into `main.py` as it's completed — don't batch all at the end
6. The Deposit model is created in RENT-1 but full CRUD is deferred to RENT-2

### Before Completing

1. Verify all 24 acceptance criteria are met
2. Run full test suite: `cd backend && ruff check . && PYTHONPATH=. pytest -v` + `cd frontend && npx tsc --noEmit && npx eslint src && npx vitest run`
3. Post evidence summary as a comment on the issue
4. Self-review the diff for integer-cents compliance, JWT on all routes, 409 rules
