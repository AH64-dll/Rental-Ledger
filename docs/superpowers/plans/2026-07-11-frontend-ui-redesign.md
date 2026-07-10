# Frontend UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Rental Ledger frontend's utilitarian UI with a production-quality, premium-feeling design system while preserving all existing functionality, bilingual (en/ar) + RTL support.

**Architecture:** Build a small component library at `src/components/ui/` on top of Tailwind design tokens. Redesign each page to consume those components. Add `ToastProvider` and `ConfirmProvider` in `App.tsx` and replace `window.confirm` with a shared `ConfirmDialog`. Keep React Query, hooks, and routing unchanged.

**Tech Stack:** React 19, Vite 8, TypeScript 6, TailwindCSS 3.4, @tanstack/react-query 5, axios, react-router-dom 7, vitest + @testing-library/react 16.

## Global Constraints

- TypeScript strict; no `any` in new code (except unavoidable error-shape threading)
- Tailwind v3 utilities only; no CSS-in-JS; no external icon library (inline SVG only)
- All new strings use `LanguageContext.t()` with both en and ar entries
- All new components RTL-safe: `ms-/me-/ps-/pe-` for logical spacing, `text-start` not `text-left/right`, `border-s-/border-e-` for side-specific borders
- All clickable: `cursor-pointer`. All buttons: `disabled:opacity-50 disabled:cursor-not-allowed`. All focusable: `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`
- Icon-only buttons: `aria-label`
- "no piastres" — money displays whole EGP only (already enforced in `Money.tsx`)
- No backend changes
- Existing API calls, route params, query keys unchanged

## Quality Gates (run after every milestone, must pass before commit)

```bash
cd /home/ah64/Documents/Rental\ Ledger/rental-ledger/frontend
npx tsc --noEmit
npx vitest run
npx oxlint src/
```

Backend should remain passing (no backend changes):

```bash
cd /home/ah64/Documents/Rental\ Ledger/rental-ledger/backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/ -q
```

---

## File Structure

### New files
- `frontend/src/components/ui/AppIcon.tsx` — SVG icon library (29 icons)
- `frontend/src/components/ui/Button.tsx` — variants + sizes + loading
- `frontend/src/components/ui/Card.tsx` — Card + CardHeader + CardBody + CardFooter
- `frontend/src/components/ui/Input.tsx` — labeled, error, leftIcon
- `frontend/src/components/ui/Select.tsx` — labeled, error
- `frontend/src/components/ui/Modal.tsx` — backdrop, scaleIn, escape, scroll lock
- `frontend/src/components/ui/ConfirmDialog.tsx` — wraps Modal + ConfirmProvider/useConfirm
- `frontend/src/components/ui/Spinner.tsx`
- `frontend/src/components/ui/EmptyState.tsx`
- `frontend/src/components/ui/PageHeader.tsx` — title + actions + back
- `frontend/src/components/ui/Table.tsx` — Table + THead + TBody + TR + TH + TD
- `frontend/src/components/ui/Tabs.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Toast.tsx` — ToastProvider + useToast
- `frontend/src/components/ui/Skeleton.tsx`

### Modified files
- `frontend/tailwind.config.js`
- `frontend/index.html`
- `frontend/src/index.css`
- `frontend/src/App.tsx` — wrap in Toast + Confirm providers
- `frontend/src/context/LanguageContext.tsx` — add new keys
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/ErrorBanner.tsx`
- `frontend/src/components/StatusPill.tsx` — uses Badge
- `frontend/src/components/lease/ChargesSection.tsx`
- `frontend/src/components/lease/DepositsSection.tsx`
- `frontend/src/components/lease/PaymentsSection.tsx`
- `frontend/src/components/debts/DebtForm.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/PropertiesList.tsx`
- `frontend/src/pages/TenantsList.tsx`
- `frontend/src/pages/TenantProfile.tsx`
- `frontend/src/pages/LeasesList.tsx`
- `frontend/src/pages/LeaseDetail.tsx`
- `frontend/src/pages/ChargesList.tsx`
- `frontend/src/pages/DebtsList.tsx`
- `frontend/src/pages/Settings.tsx`

---

## Milestone 1 — Design System & Component Library

### Task 1.1: Tailwind config + Inter font + base CSS

**Files:** `frontend/tailwind.config.js`, `frontend/index.html`, `frontend/src/index.css`

- Replace `tailwind.config.js` with design tokens: font family Inter, animations (fade-in 200ms, slide-up 250ms, scale-in 200ms) and matching keyframes.
- Update `index.html` to preconnect Google Fonts and load Inter weights 400/500/600/700, add `meta theme-color="#4F46E5"`.
- Replace `index.css` with base layer: font-family Inter, scroll-behavior smooth, antialiased font smoothing, body bg-slate-50 text-slate-900, focus-visible ring 2 indigo.
- Verify: `npx tsc --noEmit`. Commit: `feat(ui): add Tailwind design tokens and Inter font`.

### Task 1.2: AppIcon — SVG icon library

**File:** `frontend/src/components/ui/AppIcon.tsx`

Export 29 named components (each takes `className?`, `size?` default 20, stroke 1.75, `stroke="currentColor"`, `fill="none"`). Icons: Home, Building2, Users, FileText, Receipt, AlertCircle, Settings, Plus, Edit, Trash2, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, LogOut, X, Check, Search, Filter, Calendar, DollarSign, Menu, Bell, ArrowUp, ArrowDown, Wallet, TrendingUp, TrendingDown, Clock. Use Lucide paths (public domain). Commit: `feat(ui): add AppIcon SVG icon library`.

### Task 1.3: Spinner

**File:** `frontend/src/components/ui/Spinner.tsx`

Inline SVG, `animate-spin`, `role="status"`, `aria-label="Loading"`. Commit: `feat(ui): add Spinner component`.

### Task 1.4: Button

**File:** `frontend/src/components/ui/Button.tsx`

forwardRef; variants: primary (indigo-600/700), secondary (white border), danger (rose-600), ghost. Sizes: sm (h-8 px-3 text-xs), md (h-10 px-4 text-sm), lg (h-12 px-5 text-base). Props: loading, leftIcon, rightIcon, disabled. Always: cursor-pointer, focus-visible:ring-2, disabled:opacity-50. Commit: `feat(ui): add Button component`.

### Task 1.5: Card

**File:** `frontend/src/components/ui/Card.tsx`

`Card` (white bg-slate-50, rounded-xl, shadow-sm, border, optional hoverable shadow-md), plus named `CardHeader` (px-6 py-4 border-b), `CardBody` (p-6), `CardFooter` (px-6 py-4 border-t bg-slate-50 rounded-b-xl). Commit: `feat(ui): add Card component`.

### Task 1.6: Input

**File:** `frontend/src/components/ui/Input.tsx`

forwardRef; props: label, error, leftIcon, all input attrs. h-10, rounded-lg, border-slate-200, focus:ring-2 indigo, error → border-rose + rose ring, leftIcon → ps-10. Commit: `feat(ui): add Input component`.

### Task 1.7: Select

**File:** `frontend/src/components/ui/Select.tsx`

forwardRef; same patterns as Input, with `children`. Commit: `feat(ui): add Select component`.

### Task 1.8: Modal

**File:** `frontend/src/components/ui/Modal.tsx`

createPortal; backdrop bg-slate-900/50 + backdrop-blur-sm + animate-fade-in; dialog bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col. Sizes: sm/max-w-sm, md/max-w-lg, lg/max-w-2xl. Escape to close; click backdrop to close; body scroll lock while open; aria-modal=true; close X button. Commit: `feat(ui): add Modal component`.

### Task 1.9: Badge

**File:** `frontend/src/components/ui/Badge.tsx`

Pill, rounded-full, px-2.5 py-0.5, text-xs font-medium, variants: neutral (slate-100/slate-700), success (emerald-50/emerald-700), warning (amber-50/amber-700), danger (rose-50/rose-700), info (indigo-50/indigo-700). Commit: `feat(ui): add Badge component`.

### Task 1.10: Toast + ToastProvider

**File:** `frontend/src/components/ui/Toast.tsx`

`useToast()` exposes success/error/info/warning(message). `ToastProvider` renders portal of toasts top-end z-100, 4s auto-dismiss, slide-up animation, check or alert icon, dismiss X. Commit: `feat(ui): add Toast component`.

### Task 1.11: ConfirmDialog + ConfirmProvider

**File:** `frontend/src/components/ui/ConfirmDialog.tsx`

`useConfirm()` returns `(options) => Promise<boolean>`. Internally manages a pending state, renders a Modal with title + AlertCircle + message + Cancel + Confirm buttons. Cancel resolves false, Confirm resolves true. Commit: `feat(ui): add ConfirmDialog component`.

### Task 1.12: Skeleton

**File:** `frontend/src/components/ui/Skeleton.tsx`

animate-pulse rounded-md bg-slate-200, aria-hidden. Commit: `feat(ui): add Skeleton component`.

### Task 1.13: PageHeader

**File:** `frontend/src/components/ui/PageHeader.tsx`

mb-6 flex, optional backTo Link with ArrowLeft (or ArrowRight when ar) icon. Title text-2xl font-semibold tracking-tight, description text-sm text-slate-500, actions flex gap-2. Commit: `feat(ui): add PageHeader component`.

### Task 1.14: Table

**File:** `frontend/src/components/ui/Table.tsx`

Exports Table (overflow-x-auto + w-full text-sm), THead (bg-slate-50 text-xs uppercase tracking-wider), TBody (divide-y divide-slate-200), TR (hover:bg-slate-50), TH (px-4 py-3 font-semibold text-start), TD (px-4 py-3 text-slate-700). All accept className override. Commit: `feat(ui): add Table component`.

### Task 1.15: Tabs

**File:** `frontend/src/components/ui/Tabs.tsx`

Props: `items: { id, label, content }[]`, `activeId`, `onChange`. Underline-style tabs with active = border-indigo-600 + text-indigo-700, hover = border-slate-300. role=tablist, role=tab, aria-selected. Commit: `feat(ui): add Tabs component`.

### Task 1.16: EmptyState

**File:** `frontend/src/components/ui/EmptyState.tsx`

Centered, optional icon in slate-100 circle, title text-base font-semibold, description text-sm text-slate-500 max-w-sm, optional action. Commit: `feat(ui): add EmptyState component`.

### Task 1.17: Mount ToastProvider + ConfirmProvider in App.tsx

**File:** `frontend/src/App.tsx`

Wrap `<BrowserRouter>` in `<ToastProvider><ConfirmProvider>`. No other changes. Verify tsc + vitest. Commit: `feat(ui): mount Toast and Confirm providers`.

---

## Milestone 2 — Layout & Shared Components

### Task 2.1: Redesign Layout

**File:** `frontend/src/components/Layout.tsx`

- Sidebar (md:static w-64 bg-white border-s border-slate-200, hidden on mobile until hamburger)
- Brand block: indigo-600 R mark + "Rental Ledger" text + close X (mobile only)
- Nav: `NAV_ITEMS` with `to`, `key`, `icon` (from AppIcon). Active = bg-indigo-50 + text-indigo-700 + font-semibold + border-s-2 border-indigo-500. Hover = bg-slate-50.
- Bottom: language toggle button (text-xs font-medium indigo) and user row (avatar circle + username + LogOut icon button)
- Mobile drawer: fixed, language-aware side (right when ar, left when en), translate-x-full/-translate-x-full when closed, backdrop bg-slate-900/50
- Main: max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in
- Verify tsc. Commit: `feat(ui): redesign Layout with sidebar icons and refined mobile drawer`.

### Task 2.2: Refresh ErrorBanner

**File:** `frontend/src/components/ErrorBanner.tsx`

Use AlertCircle icon, role="alert", flex items-start gap-2, bg-rose-50 border-rose-200 text-rose-800 rounded-lg. Commit: `feat(ui): refresh ErrorBanner styling to match design system`.

### Task 2.3: Update StatusPill to use Badge

**File:** `frontend/src/components/StatusPill.tsx`

Export `ChargeStatus = "paid" | "partial" | "unpaid" | "overdue"` and `LeaseStatus = "active" | "ended" | "expired"`. Internally render `<Badge variant={...}>` with mapping charge→emerald/amber/slate/rose, lease→emerald/slate/rose. Commit: `feat(ui): refresh StatusPill with new color tokens`. Run vitest to confirm existing tests still pass.

---

## Milestone 3 — Page Redesigns

### Task 3.1: Add new translations

**File:** `frontend/src/context/LanguageContext.tsx`

Add (both en + ar) for: `no_data`, `welcome_back`, `todays_date`, `confirm_title`, `delete_confirm_title`, `language_toggle`, `optional`, `not_set`, `add_first_property`, `add_first_tenant`, `add_first_lease`, `properties_desc`, `tenants_desc`, `leases_desc`, `charges_desc`, `debts_desc`, `add_payment`, `edit_property`, `edit_tenant`, `confirm`, `nothing_to_update`, `property_created`, `property_deleted`, `tenant_created`, `tenant_deleted`, `tenant_updated`, `payment_logged`, `debt_deleted`, `debt_added`, `lease_created`, `lease_ended`, `lease_deleted`, `charge_added`, `charge_deleted`.

Commit: `feat(ui): add new translation keys for redesigned pages`.

### Task 3.2: Redesign Login

**File:** `frontend/src/pages/Login.tsx`

min-h-screen gradient bg-indigo-50 via white to-emerald-50, centered Card, language toggle top-right, brand mark (R in indigo-600 square), title, CardBody with Input × 2, inline AlertCircle error, Button submit with loading. Slide-up animation. Verify tests. Commit: `feat(ui): redesign Login with gradient background and brand mark`.

### Task 3.3: Redesign Dashboard

**File:** `frontend/src/pages/Dashboard.tsx`

PageHeader with title + formatted date. 4-card grid (sm:grid-cols-2 lg:grid-cols-4) of StatCard (icon, label, value) using tones indigo/rose/emerald/amber. Each tone = bg-X-50 + text-X-600 icon container + text-2xl value. Skeleton in each while loading. Below: Card with "Expiring Soon" + count. Verify. Commit: `feat(ui): redesign Dashboard with stat cards and skeleton loaders`.

### Task 3.4: Redesign PropertiesList

**File:** `frontend/src/pages/PropertiesList.tsx`

PageHeader + Add button, 3-col grid of property cards (icon block, name, address, created, delete icon button), EmptyState when empty, Modal for create (Input × 3), ConfirmDialog for delete, useToast for success/error. Verify. Commit: `feat(ui): redesign PropertiesList as card grid with modal and confirm dialog`.

### Task 3.5: Redesign TenantsList

**File:** `frontend/src/pages/TenantsList.tsx`

PageHeader + Add button, Card with Table (Name/Email/Phone/Actions) or EmptyState, Modal for create (Input × 4 with optional labels), ConfirmDialog, useToast. Use language-aware Chevron for the row link indicator. Verify. Commit: `feat(ui): redesign TenantsList as table with modal and confirm dialog`.

### Task 3.6: Redesign TenantProfile

**File:** `frontend/src/pages/TenantProfile.tsx`

PageHeader (backTo=/tenants, title=name, description="Person Profile", Edit action), top grid lg:grid-cols-3 with profile Card (avatar + name + email + phone + notes) and 2 stat cards (net balance, deposits). Tabs (Leases / Debts) using ui/Tabs. Leases tab: Card with Table + EmptyState + Add lease Modal. Debts tab: Card with Table + Add Debt (toggle DebtForm) + EmptyState. Modal for Edit. ConfirmDialog for delete debt. useToast everywhere. Verify. Commit: `feat(ui): redesign TenantProfile with tabs, profile card, and modal edit`.

### Task 3.7: Redesign LeasesList

**File:** `frontend/src/pages/LeasesList.tsx`

PageHeader + Add. Status filter chips (all/active/ended/expired). Card with Table (Tenant/Property/Period/Rent/Status/Actions) or EmptyState. Modal size=lg for create (Select × 2 + Input × 6). End lease uses Check icon button; Delete uses Trash2. ConfirmDialog for both. useToast. Verify. Commit: `feat(ui): redesign LeasesList with status filter chips and modal form`.

### Task 3.8: Redesign LeaseDetail + lease section components

**Files:** `frontend/src/pages/LeaseDetail.tsx`, `frontend/src/components/lease/ChargesSection.tsx`, `frontend/src/components/lease/DepositsSection.tsx`, `frontend/src/components/lease/PaymentsSection.tsx`

- LeaseDetail: PageHeader (backTo=/leases, title=tenant_name, description=property_name, action=StatusPill). Header Card with InfoTile grid (period, rent, due day, deposit, late fee %). Tabs (Charges/Payments/Deposits) — note the existing ChargesSection actually combines charges+payments, so keep that pattern; deposits is its own tab.
- ChargesSection: PageHeader-style header inside the tab (h3 + Add Button). Modal for create. Card list of charge rows (each row with status pill, amounts, expand toggle for PaymentsSection, delete icon). useToast + useConfirm.
- DepositsSection: Similar to ChargesSection but simpler list.
- PaymentsSection: Rendered inside expanded charge rows; small form (amount + method) for create payment + list of payments. Use Input/Button.

Verify. Commit: `feat(ui): redesign LeaseDetail and lease sub-sections`.

### Task 3.9: Redesign ChargesList

**File:** `frontend/src/pages/ChargesList.tsx`

PageHeader. Filter row (Select tenant, Select status, overdue toggle as Button ghost with active state). Card with Table (Tenant/Description/Amount/Paid/Balance/Status/Due/Actions) or EmptyState. Inline "Log Payment" expands in the row with a small form. ConfirmDialog for delete. useToast. Verify. Commit: `feat(ui): redesign ChargesList with filter row and inline payment form`.

### Task 3.10: Redesign DebtsList

**File:** `frontend/src/pages/DebtsList.tsx`

PageHeader + Add. Card with Table (Tenant/Description/Amount/Paid/Remaining/Date/Elapsed/Status/Actions) or EmptyState. "Add Debt" opens a Modal with Tenant select + DebtForm inside. Inline payment form per row. ConfirmDialog for delete. useToast. Verify. Commit: `feat(ui): redesign DebtsList with modal add and inline payment`.

### Task 3.11: Redesign Settings

**File:** `frontend/src/pages/Settings.tsx`

PageHeader. Account Card (avatar + username + email). Update credentials Card with Input × 4 (new username, new password, confirm new password, current password) and Save Button. Replace setSuccess/setError with useToast for transient feedback. Verify. Commit: `feat(ui): redesign Settings with sectioned cards`.

---

## Milestone 4 — Toast & Confirm Integration Polish

### Task 4.1: Verify all window.confirm replaced

```bash
cd /home/ah64/Documents/Rental\\ Ledger/rental-ledger/frontend
grep -rn "window.confirm" src/
```

Expected: no results. If any remain, replace with `useConfirm()` in that file.

### Task 4.2: Verify all useMutation have toast feedback

Confirm every page that uses `useMutation` has either `useToast` (transient) or `ErrorBanner` (form-level) wired to onError and onSuccess. Use the design pattern from the page redos.

### Task 4.3: Run full quality gates

```bash
cd /home/ah64/Documents/Rental\\ Ledger/rental-ledger/frontend
npx tsc --noEmit
npx vitest run
npx oxlint src/
```

All must pass. Commit: `feat(ui): final quality pass — toasts and confirms wired`.

---

## Milestone 5 — Polish & Accessibility

### Task 5.1: Audit keyboard navigation

Verify all interactive elements have `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`. Verify all icon-only buttons have `aria-label`.

### Task 5.2: Verify RTL

In the running app, toggle language to Arabic. Check:
- Sidebar is on the right
- Text alignment flips
- Chevron direction is mirrored
- Spacing uses logical properties

### Task 5.3: Verify Money.test.tsx + StatusPill.test.tsx still pass

```bash
cd /home/ah64/Documents/Rental\\ Ledger/rental-ledger/frontend
npx vitest run src/components/Money.test.tsx src/components/StatusPill.test.tsx
```

If any test fails because of styling/API changes, update the test to match (but preserve the assertion of the rendered text).

### Task 5.4: Run backend tests

```bash
cd /home/ah64/Documents/Rental\\ Ledger/rental-ledger/backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/ -q
```

Expected: all pass (no backend changes).

### Task 5.5: Commit polish

Commit: `fix(ui): polish and accessibility improvements`.

---

## Commit Plan Summary

1. `feat(ui): add Tailwind design tokens and Inter font`
2. `feat(ui): add AppIcon SVG icon library`
3. `feat(ui): add Spinner component` and `feat(ui): add Button component` (combined in one commit if convenient)
4. `feat(ui): add Card component`
5. `feat(ui): add Input component` and `feat(ui): add Select component`
6. `feat(ui): add Modal component`
7. `feat(ui): add Badge component`
8. `feat(ui): add Toast component`
9. `feat(ui): add ConfirmDialog component`
10. `feat(ui): add Skeleton, PageHeader, Table, Tabs, EmptyState components` (one commit)
11. `feat(ui): mount Toast and Confirm providers`
12. `feat(ui): redesign Layout with sidebar icons and refined mobile drawer`
13. `feat(ui): refresh ErrorBanner styling to match design system`
14. `feat(ui): refresh StatusPill with new color tokens`
15. `feat(ui): add new translation keys for redesigned pages`
16. `feat(ui): redesign Login with gradient background and brand mark`
17. `feat(ui): redesign Dashboard with stat cards and skeleton loaders`
18. `feat(ui): redesign PropertiesList as card grid with modal and confirm dialog`
19. `feat(ui): redesign TenantsList as table with modal and confirm dialog`
20. `feat(ui): redesign TenantProfile with tabs, profile card, and modal edit`
21. `feat(ui): redesign LeasesList with status filter chips and modal form`
22. `feat(ui): redesign LeaseDetail and lease sub-sections`
23. `feat(ui): redesign ChargesList with filter row and inline payment form`
24. `feat(ui): redesign DebtsList with modal add and inline payment`
25. `feat(ui): redesign Settings with sectioned cards`
26. `feat(ui): final quality pass — toasts and confirms wired`
27. `fix(ui): polish and accessibility improvements`
