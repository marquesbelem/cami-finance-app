# Tasks: Due-Date Calendar View

**Input**: Design documents from `/specs/003-calendar-view/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/calendar-api.md](./contracts/calendar-api.md) · [quickstart.md](./quickstart.md)

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the calendar utility library and CSS foundation that all user story phases depend on.

- [x] T001 Create calendar utility library `src/lib/calendar.ts` with `SlipWithStatus`, `CalendarDay`, `CalendarMonth` types and pure functions: `withDerivedStatus()`, `groupSlipsByDay()`, `buildCalendarDays()`, `buildCalendarMonth()`, `shiftMonth()`, `formatMonthLabel()`
- [x] T002 [P] Add calendar-specific `@keyframes` to `src/app/globals.css`: `slideInPanel` (day-detail slide), `calendarFadeIn` (grid entry), `pulseBadge` (optimistic toggle feedback)
- [x] T003 [P] Create `src/components/Calendar/` directory scaffold with empty index files for `CalendarGrid.tsx`, `DayCell.tsx`, `DayDetailPanel.tsx`, `CalendarHeader.tsx`, and `calendar.module.css`

**Checkpoint**: Utility library compiles (`npx tsc --noEmit`), CSS animations defined, component stubs in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared components and the Next.js page shell that all user stories are rendered within. Must be complete before any story can be visually validated.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement `CalendarHeader` component in `src/components/Calendar/CalendarHeader.tsx` — renders month label (e.g. "junho de 2026"), "← Mês anterior", "→ Próximo mês", and "Hoje" buttons; accepts `{ label, isPending, onPrev, onNext, onToday }` props; `isPending` shows a subtle spinning indicator in the label
- [x] T005 [P] Write CSS for `CalendarHeader` in `src/components/Calendar/calendar.module.css` — `.calendarHeader`, `.monthLabel`, `.navBtn`, `.todayBtn`, `.pendingIndicator`; use design tokens from `globals.css`
- [x] T006 Create the calendar Next.js page shell `src/app/calendar/page.tsx` as a `"use client"` component: state for `selectedMonth`, `slips`, `selectedDay`, `isFormOpen`, `loading`; `loadSlips` callback with `GET /api/slips?month=YYYY-MM`; `useTransition` wrapping `setSelectedMonth`; render `CalendarHeader` and a `<main>` placeholder; no calendar grid yet
- [x] T007 [P] Create `src/app/calendar/calendar.module.css` with `.calendarPage`, `.calendarContainer`, `.loadingOverlay` skeleton styles
- [x] T008 Add "Calendário" nav link to `src/app/layout.tsx` — import `CalendarDays` from `lucide-react`, add `<Link href="/calendar">` entry alongside the existing Dashboard and Categorias links; assign `id="nav-calendar"`

**Checkpoint**: Navigate to `http://localhost:3000/calendar` — page loads with header showing current month and navigation buttons; "Calendário" link appears in the global nav.

---

## Phase 3: User Story 1 — Monthly Calendar Grid (Priority: P1) 🎯 MVP

**Goal**: Render a full 7-column monthly grid with all payment slips pinned to the correct due-date cells, colour-coded by status.

**Independent Test**: Open `/calendar`, see the current month grid (Sun–Sat columns, all days of month), and find every payment slip on its correct due-date cell with a coloured status chip and title.

### Implementation for User Story 1

- [x] T009 [P] [US1] Implement `DayCell` component in `src/components/Calendar/DayCell.tsx` — accepts `{ day: CalendarDay, isSelected: boolean, onSelect, tabIndex }`; renders day number, up to 2 slip chips (title truncated, colour from `derivedStatus`), "+N more" button when `slips.length > 2`; today gets a brand-accent ring; non-current-month days are muted; wrap in `React.memo`
- [x] T010 [P] [US1] Write CSS for `DayCell` in `src/components/Calendar/calendar.module.css` — `.dayCell`, `.dayCellToday`, `.dayCellSelected`, `.dayCellOtherMonth`, `.slipChip`, `.slipChipPaid`, `.slipChipPending`, `.slipChipOverdue`, `.overflowBtn`; fixed `min-height: 7rem`; chip title uses `text-overflow: ellipsis`
- [x] T011 [US1] Implement `CalendarGrid` component in `src/components/Calendar/CalendarGrid.tsx` — accepts `{ calendarMonth, selectedDay, onDaySelect, isPending }`; renders weekday header row (D S T Q Q S S); renders `DayCell` for each day in `calendarMonth.days` (including leading/trailing blanks as non-interactive cells); uses `role="grid"` and `role="gridcell"`; handles `onKeyDown` for arrow-key navigation (Up/Down = ±7, Left/Right = ±1) via `useRef` array of cell refs; wrap grid in `React.memo`
- [x] T012 [US1] Write CSS for `CalendarGrid` in `src/components/Calendar/calendar.module.css` — `.calendarGrid` with `display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-1)`; `.weekdayHeader` row; `@media (max-width: 640px)` collapse to `grid-template-columns: 1fr` hiding empty cells via `data-empty` attribute
- [x] T013 [US1] Wire `CalendarGrid` into the calendar page `src/app/calendar/page.tsx` — call `buildCalendarMonth(year, month, slips, today)` inside `useMemo([slips, selectedMonth])`; pass result to `<CalendarGrid>`; show skeleton grid (7×5 ghost cells) while `loading`; show empty-state celebration 🎉 when `calendarMonth.hasSlips === false`
- [x] T014 [US1] Add empty-state gamification to `src/app/calendar/page.tsx` — when month has no slips render a celebratory panel: emoji 🎉, heading "Mês livre de boletos!", subtext "Parece que você está em festa — nenhum vencimento este mês.", styled with `--color-success` glow

**Checkpoint (US1)**: Navigate to `/calendar` — full grid renders for the current month; each slip appears on the correct cell with amber/rose/emerald chip; today's cell has a glowing border; months with no slips show the celebration panel.

---

## Phase 4: User Story 2 — Month Navigation (Priority: P1)

**Goal**: Allow the user to navigate between months with Previous / Next / Today controls and see the updated grid without a full page reload.

**Independent Test**: Click "→ Próximo mês" — calendar updates to next month in < 300 ms; stale grid stays visible during fetch; "Hoje" returns to current month and today's cell is highlighted.

### Implementation for User Story 2

- [x] T015 [US2] Wire month navigation handlers in `src/app/calendar/page.tsx` — `handlePrev` and `handleNext` call `startTransition(() => setSelectedMonth(shiftMonth(...)))` (already have `useTransition` from T006); `handleToday` resets to `getCurrentMonth()`; pass all three to `<CalendarHeader>`; `isPending` prop from `useTransition` drives the header's spinner
- [x] T016 [P] [US2] Add "Today" button visual indicator to `src/components/Calendar/CalendarHeader.tsx` — disable "Hoje" button when already on current month; animate label with `--transition-fast` when `isPending` is true

**Checkpoint (US2)**: Clicking Previous/Next updates the month label and grid; stale month remains visible (no blank flash); "Hoje" snaps back to current month; today's date cell always has its highlight.

---

## Phase 5: User Story 3 — Day Detail Panel (Priority: P2)

**Goal**: Clicking any day cell opens a slide-in panel listing all slips for that day with their full details.

**Independent Test**: Click a day cell with at least one slip — slide-in panel appears from the right listing all slips with title, category swatch, amount in R$, and a paid/pending/overdue status badge. Press Escape or click outside to close.

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement `DayDetailPanel` component in `src/components/Calendar/DayDetailPanel.tsx` — accepts `{ dateKey, slips, onClose, onStatusToggle, onAddBill }`; renders as a fixed slide-in panel on the right (or bottom on mobile); lists slips sorted Pending → Overdue → Paid; each slip row shows: category colour swatch (inline `background: category.colorCode`), title, amount formatted as `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`, status badge (`.badge-success/.badge-warning/.badge-danger`); empty state shows "Nenhum boleto neste dia" + "Adicionar Boleto" shortcut button; closes on Escape keydown (window listener) and on backdrop click; `role="dialog"` with `aria-label` and `aria-modal="true"`;  focus-traps inside panel while open; returns focus to triggering cell on close
- [x] T018 [P] [US3] Write CSS for `DayDetailPanel` in `src/components/Calendar/calendar.module.css` — `.panelBackdrop` (semi-transparent overlay), `.panel` (fixed right-side drawer, `width: 360px`, slides in via `slideInPanel` keyframe), `.panelHeader`, `.panelSlipRow`, `.categorySwatch`, `.panelEmpty`, `.panelAddBtn`; `@media (max-width: 640px)` panel becomes bottom sheet (`width: 100%; height: 60vh; bottom: 0; left: 0`)
- [x] T019 [US3] Wire `DayDetailPanel` into `src/app/calendar/page.tsx` — `selectedDay` state (string `"YYYY-MM-DD"` or `null`); pass `onDaySelect` to `CalendarGrid` (sets `selectedDay`); derive `selectedDaySlips` from `calendarMonth.slipsByDay.get(selectedDay)`; render `<DayDetailPanel>` conditionally; `onClose` sets `selectedDay` to null; store triggering cell ref for focus-return on close

**Checkpoint (US3)**: Click any day cell → panel slides in from right listing all slips for that day; Escape closes it; clicking outside closes it; focus returns to the day cell; empty day shows "Add bill" shortcut.

---

## Phase 6: User Story 4 — Quick Status Toggle (Priority: P3)

**Goal**: Mark a slip as Paid or Pending directly from the day-detail panel with optimistic UI and rollback on error.

**Independent Test**: In the day-detail panel, click "Marcar como Pago" on a Pending slip — status badge updates immediately (< 16 ms), the calendar cell chip colour changes, server confirms within 500 ms. Double-click prevention active during the request.

### Implementation for User Story 4

- [x] T020 [P] [US4] Add toggle button UI to `DayDetailPanel` in `src/components/Calendar/DayDetailPanel.tsx` — add a "Marcar como Pago" / "Marcar como Pendente" button for each slip row (hidden for Overdue? No — Overdue slips can still be marked Paid); button shows a spinner icon (`animate-spin`) while `toggling[slipId]` is true; disabled when toggling
- [x] T021 [P] [US4] Write CSS for toggle button in `src/components/Calendar/calendar.module.css` — `.toggleBtn`, `.toggleBtnPending` (emerald outline), `.toggleBtnPaid` (amber outline), `.toggleBtnLoading` (dimmed + cursor-not-allowed)
- [x] T022 [US4] Implement optimistic status toggle in `src/app/calendar/page.tsx` — `handleStatusToggle(slip)`: 1) immediately call `setSlips(prev => prev.map(...))` with flipped status (optimistic); 2) `PUT /api/slips/:id` with new status FormData; 3) on success replace optimistic slip with server response; 4) on error rollback `setSlips` to previous state + show error toast via `addToast`; pass `handleStatusToggle` down to `DayDetailPanel`; manage `toggling` state `Record<string, boolean>` to disable buttons during inflight requests

**Checkpoint (US4)**: Toggle a slip status from the detail panel — badge updates instantly, calendar cell chip colour changes, network tab shows a single PUT request completing within 500 ms. Error case: if PUT fails, slip reverts and a toast appears.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility hardening, responsive polish, edge case handling, and quickstart validation.

- [ ] T023 [P] Keyboard navigation hardening in `src/components/Calendar/CalendarGrid.tsx` — ensure arrow key handler wraps correctly at row boundaries; add `aria-label` to each `DayCell` announcing day number + slip count (e.g. "15 de junho, 3 boletos"); `aria-selected` on selected cell; `aria-expanded` on "+N more" button
- [ ] T024 [P] Edge case — last-day-of-month cells in `src/lib/calendar.ts` — add explicit test in `buildCalendarDays()` to verify days 28–31 only appear when the month has those days; add `getMonthDays(year, month)` utility using `new Date(year, month, 0).getDate()`
- [ ] T025 [P] Long title truncation in `src/components/Calendar/calendar.module.css` — confirm `.slipChip` has `max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap` and test with a 60-char title; verify grid layout doesn't break
- [ ] T026 [P] Mobile layout polish in `src/app/calendar/calendar.module.css` and `src/components/Calendar/calendar.module.css` — on `max-width: 640px`: hide non-current-month leading/trailing cells; `DayCell` min-height drops to `4rem`; slip chips show only status dot (no title); panel becomes bottom sheet
- [x] T027 Add `<title>` and `<meta name="description">` to calendar page via Next.js `metadata` export — since the page is `"use client"`, export a separate `metadata` object from a sibling `src/app/calendar/layout.tsx` [NEW] with title "Calendário de Vencimentos – Cami Finance" and description
- [ ] T028 Run all quickstart.md validation scenarios manually against `http://localhost:3000/calendar` and confirm all 12 scenarios pass (SC-001 through SC-007, US1-1 through US3-3, EDGE-1)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T002 and T003 are parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001 types needed by T004, T006)
- **Phase 3 (US1)**: Depends on Phase 2 completion — `CalendarGrid` needs `CalendarMonth` type from T001 and page shell from T006
- **Phase 4 (US2)**: Depends on Phase 2 — navigation wires into the page shell (T006); T015–T016 can run in parallel
- **Phase 5 (US3)**: Depends on Phase 3 — panel needs `selectedDay` state and `calendarMonth.slipsByDay` established in T013
- **Phase 6 (US4)**: Depends on Phase 5 — toggle button lives inside `DayDetailPanel` (T017)
- **Phase 7 (Polish)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US2 (P1)**: After Phase 2 — independent of US1 (navigation wires to existing state); can develop in parallel with US1
- **US3 (P2)**: After US1 — needs `calendarMonth.slipsByDay` (established in T013)
- **US4 (P3)**: After US3 — toggle button is inside `DayDetailPanel` (T017)

### Within Each User Story

- CSS tasks ([P]) can always run in parallel with their component's logic
- Component implementation before page wiring
- Data utilities (T001) before all components

### Parallel Opportunities

```bash
# Phase 1 — all parallel:
Task T002: Add @keyframes to globals.css
Task T003: Scaffold Calendar/ component stubs

# Phase 2 — T005 and T007 parallel with T004 and T006:
Task T004: CalendarHeader component logic
Task T005: CalendarHeader CSS          # parallel with T004
Task T006: Calendar page shell
Task T007: Calendar page CSS           # parallel with T006

# US1 — component and CSS parallel:
Task T009: DayCell logic
Task T010: DayCell CSS                 # parallel with T009

# US3 — panel logic and CSS parallel:
Task T017: DayDetailPanel logic
Task T018: DayDetailPanel CSS          # parallel with T017

# US4 — toggle UI and CSS parallel:
Task T020: Toggle button in DayDetailPanel
Task T021: Toggle button CSS           # parallel with T020

# Phase 7 — all polish tasks parallel:
Task T023, T024, T025, T026, T027 can all run in parallel
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2 — both P1)

1. Complete **Phase 1** (Setup): T001, T002, T003
2. Complete **Phase 2** (Foundational): T004–T008
3. Complete **Phase 3** (US1 Grid): T009–T014
4. Complete **Phase 4** (US2 Navigation): T015–T016
5. **STOP AND VALIDATE**: Run SC-001, SC-002, US1-1, US1-2, US1-3, US2-2 from quickstart.md
6. Deploy/demo if ready — calendar fully functional for core use cases

### Incremental Delivery

1. Phases 1–2 → Foundation ready
2. Phases 3–4 → Calendar MVP with navigation (**Ship it**)
3. Phase 5 → Day detail panel → Test US3 independently
4. Phase 6 → Status toggle → Test US4 independently
5. Phase 7 → Polish & validate all quickstart scenarios

---

## Notes

- No tests requested in spec — no test tasks included
- `[P]` = different files, no dependencies on incomplete tasks; safe to run in parallel
- `[Story]` label maps each task to its user story for traceability
- The `src/lib/calendar.ts` utility (T001) is the single source of truth for all date/calendar logic; keep it pure (no React imports)
- Commit after each phase checkpoint; rollback is easy if a phase needs rework
- The `AdicionarBoleto` modal component is **reused as-is** from the existing codebase — no modification needed; `DayDetailPanel` calls the `onAddBill` callback which opens it
