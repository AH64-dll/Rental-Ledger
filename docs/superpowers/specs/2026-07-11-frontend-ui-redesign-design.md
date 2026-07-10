# Frontend UI Redesign — Rental Ledger

**Status:** Approved (pre-approved by user via detailed spec)
**Date:** 2026-07-11
**Scope:** Production-quality, premium-feeling UI for the existing Rental Ledger app (React 19 + Vite + TailwindCSS 3 + React Query 5).

## Goal

Replace the current utilitarian UI (plain Tailwind classes, no design system, `window.confirm` for destructive actions, inline error banners) with a coherent design system that feels professional and premium, while preserving all existing functionality and the bilingual (en/ar) + RTL support.

## Design Tokens

### Color (Tailwind utility names)
- **Primary:** indigo-600 `#4F46E5`, hover indigo-700, light indigo-50
- **Success:** emerald-600 / emerald-50
- **Warning:** amber-500 / amber-50
- **Danger:** rose-600 / rose-50
- **Neutral:** slate 50–900 (slate-50 page bg, white cards, slate-900 text, slate-200 borders, indigo-500 focus ring)

### Typography
- Inter (Google Fonts, preconnected)
- font-sans base
- Page title: text-2xl font-semibold tracking-tight
- Section: text-lg font-semibold
- Card title: text-base font-semibold
- Body: text-sm
- Meta: text-xs

### Spacing / Radius / Shadow
- 4px grid; `p-6` cards, `space-y-6` between cards, `space-y-4` between form fields
- Cards `rounded-xl`, buttons/inputs `rounded-lg`, modals `rounded-2xl`, pills `rounded-full`
- Cards `shadow-sm` (default), `shadow-md` (hover), `shadow-lg` (menus), `shadow-2xl` (modals)
- Focus: `ring-2 ring-indigo-500 ring-offset-2`

### Motion
- 150/200/300ms transitions, ease-in-out default / ease-out for entrance
- Three entrance keyframes: `fadeIn`, `slideUp`, `scaleIn`

## Component Library (new `src/components/ui/`)

| Component | Purpose |
|---|---|
| `Button` | primary/secondary/danger/ghost variants; sm/md/lg sizes; loading spinner; left/right icons; aria-label support |
| `Card` | header/body/footer slots; `hoverable` variant |
| `Input` | labeled, error state, left icon, focus ring |
| `Select` | labeled, consistent with Input |
| `Modal` | backdrop, scaleIn entrance, escape-to-close, focus trap, body scroll lock |
| `ConfirmDialog` | wraps Modal for destructive actions; replaces `window.confirm` |
| `Spinner` | inline SVG spinner |
| `EmptyState` | icon + title + description + optional action |
| `PageHeader` | title + actions area + optional back slot |
| `Table` | hover rows, sticky header, alternating row hover |
| `Tabs` | underline-style tabbed navigation |
| `Badge` | pill (extends StatusPill with variants) |
| `Toast` + `useToast()` | success/error/info/warning notifications; ToastProvider mounts at App root |
| `Skeleton` | pulse rectangle for loading states |
| `AppIcon` | SVG icon set (Home, Building2, Users, FileText, Receipt, AlertCircle, Settings, Plus, Edit, Trash2, ChevronRight, ChevronLeft, ArrowLeft, LogOut, X, Check, Search, Filter, Calendar, DollarSign) |

All components: `className` overrides accepted, `forwardRef` where appropriate, RTL-safe.

## Page Redesigns

All pages updated to the design system. Highlights:

- **Login** — centered card on gradient, brand mark, floating labels, slide-up animation
- **Dashboard** — PageHeader with greeting + date, 4 stat cards (active leases, overdue, total owed, deposits), skeleton loaders
- **PropertiesList** — 3-col grid of property cards, EmptyState, modal create/edit
- **TenantsList** — table with clickable rows, modal create/edit
- **TenantProfile** — tabs (Profile / Leases / Debts), net balance highlighted, modal edit
- **LeasesList** — table with status filter, modal create
- **LeaseDetail** — header card, Tabs for Charges/Payments/Deposits (using `ui/Tabs`)
- **ChargesList** — filters row, table with inline "Log Payment", EmptyState
- **DebtsList** — table with pay/delete inline
- **Settings** — sections (Account / Display / About) using Cards

## Layout

- Sidebar (white bg, slate-200 border, logo top, nav with icons, user bottom)
- Active nav: indigo-50 bg, indigo-700 text, indigo-500 left border (logical via `border-s`/`border-e`)
- Hover: slate-50
- Mobile: slide-in drawer, backdrop
- Main: slate-50 bg, generous padding

## Behavior Changes

1. **All `window.confirm` → `ConfirmDialog`** (one shared dialog controlled by a context or state in `App.tsx`)
2. **Transient errors → `toast.error`**; keep `ErrorBanner` for form-level errors that must stay visible
3. **Skeleton loaders** on Dashboard cards, table rows, detail cards
4. **Accessibility:** `cursor-pointer` on clickable; `disabled:opacity-50 disabled:cursor-not-allowed`; `focus-visible:ring-2`; `aria-label` on icon-only buttons
5. **RTL:** `ms-/me-/ps-/pe-` logical spacing; `text-start` instead of `text-left/right`; sidebar mirrors

## Translation Updates

Add new translation keys for any new strings (e.g., `no_data`, `confirm_action`, etc.) in both en and ar. Use `LanguageContext.t()` for all new strings.

## Quality Gates

1. `cd frontend && npx tsc --noEmit` — must pass
2. `cd frontend && npx vitest run` — must pass (update Money.test.tsx and StatusPill.test.tsx as needed)
3. `cd frontend && npx oxlint src/` — must be clean
4. `cd backend && source .venv/bin/activate && PYTHONPATH=. pytest tests/ -q` — must pass (no backend changes)

## Commit Milestones

1. `feat(ui): add design system tokens and component library`
2. `feat(ui): redesign Layout with sidebar and icons`
3. `feat(ui): redesign all pages with new design system`
4. `feat(ui): add toast notifications and confirm dialogs`
5. `fix(ui): polish and accessibility improvements`

## Non-Goals

- No backend changes
- No new features (functional surface area unchanged)
- No external icon library (inline SVGs only)
- No new routing structure
- No state management change (still React Query + local state)
