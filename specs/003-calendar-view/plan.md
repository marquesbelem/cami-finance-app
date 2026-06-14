# Implementation Plan: Due-Date Calendar View

**Branch**: `003-calendar-view` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-calendar-view/spec.md`

**User constraint**: *"i want that this calendar is fast and have a good performance"*

## Summary

Add a `/calendar` page to the Cami Finance app that renders a full monthly grid of payment slips grouped by their `dueDate`. The page must load in under 800 ms, support month navigation with sub-300 ms transitions, and allow inline status toggling with optimistic UI — all without introducing any third-party calendar library. Performance is the primary non-functional requirement alongside the constitution's premium UX mandate.

---

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16 (App Router)

**Primary Dependencies**: Prisma 6 (SQLite), Lucide-React, Vanilla CSS (CSS Modules)

**Storage**: SQLite via Prisma — `PaymentSlip.dueDate` already indexed by `orderBy: { dueDate: "asc" }`. No schema changes needed.

**Testing**: Manual validation via `quickstart.md` scenarios; no automated test framework in project.

**Target Platform**: Browser (desktop-first, mobile-responsive). Dark mode default.

**Project Type**: Next.js web application (App Router, `"use client"` pages with API routes)

**Performance Goals**:
- Initial month render: < 800 ms (SC-001) — achieved via a single scoped `GET /api/slips?month=YYYY-MM` query on page load
- Month navigation transition: < 300 ms (SC-002) — achieved via client-side state + `useTransition` + optimistic month grid pre-compute
- Day-detail open: < 200 ms (SC-003) — fully client-side (data already loaded), no network round-trip
- Status toggle reflection: < 500 ms (SC-004) — optimistic UI update before server confirmation

**Constraints**:
- No third-party calendar library (react-calendar, FullCalendar, etc.) — avoids ~200–500 KB bundle cost
- No new database fields or schema migrations
- CSS Modules only, no Tailwind
- Single-user app — no auth/permissions layer
- Mobile-responsive (grid collapses to weekly list on narrow viewports)

**Scale/Scope**: Single-user, local SQLite. Month queries return at most ~100 slips in realistic usage.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Premium & Dynamic UX | ✅ PASS | Calendar grid with glass cards, status colour-coding, animated day-detail panel |
| II. Micro-Animations | ✅ PASS | Grid fade-in, slide-in day panel, optimistic badge pulse on toggle |
| III. Semantic HTML5 + Vanilla CSS | ✅ PASS | `<table>`/`<time>` for grid, CSS Modules, no Tailwind |
| IV. Component-Driven + Responsive | ✅ PASS | `CalendarGrid`, `DayCell`, `DayDetailPanel` as focused components; mobile collapses |
| V. SEO, A11y, Testability | ✅ PASS | `<time dateTime>`, `aria-label`, `role="grid"`, keyboard nav (Tab/arrows/Enter) |

No violations. Complexity tracking not required.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-calendar-view/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── contracts/
    └── calendar-api.md  ← Phase 1 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── calendar/
│   │   ├── page.tsx              [NEW] Calendar page (Client Component)
│   │   └── calendar.module.css   [NEW] Calendar-specific CSS Modules
│   ├── api/
│   │   └── slips/
│   │       └── route.ts          [EXISTING] GET ?month= already implemented
│   ├── layout.tsx                [MODIFY] Add Calendar nav link
│   └── globals.css               [MODIFY] Add @keyframes for calendar animations
│
└── components/
    ├── Calendar/                  [NEW]
    │   ├── CalendarGrid.tsx       [NEW] Month grid (7-col CSS Grid, memoised)
    │   ├── DayCell.tsx            [NEW] Single day cell (memoised)
    │   ├── DayDetailPanel.tsx     [NEW] Slide-in side panel for day inspection
    │   └── CalendarHeader.tsx     [NEW] Month nav + "Today" + month label
    └── AdicionarBoleto/           [EXISTING] Reused from day-detail empty state
```

---

## Performance Architecture

### 1. Data Fetching Strategy

- **Single fetch per month**: `GET /api/slips?month=YYYY-MM` already exists and returns all slips for the month with their category. The calendar receives this array once per month change.
- **Client-side grouping**: `useMemo(() => groupSlipsByDay(slips), [slips])` — O(n) pass producing a `Map<dayNumber, Slip[]>`. No re-grouping on re-render unless `slips` changes.
- **No waterfall**: month navigation triggers a single `fetch` call, not a cascade.

### 2. React Rendering Performance

- **`useTransition`**: Wrap `setSelectedMonth` in `startTransition` so navigation never blocks the UI; the stale month is shown while the new one loads (no blank flash).
- **`useMemo` on calendar grid computation**: Day cells array (leading blanks + days + trailing blanks) computed once per month change.
- **`React.memo` on `DayCell`**: Prevents re-render of 28-42 cells when only one slip's status changes. Equality check on `day.slips` array reference (replaced on optimistic update).
- **Optimistic status toggle**: `setSlips` locally before `fetch PUT` resolves → calendar cell updates in < 16 ms, server confirms asynchronously.

### 3. Bundle Performance

- No calendar library dependency (saves ~200–500 KB gzipped).
- All calendar logic is pure TypeScript utility functions (~50 lines) in `src/lib/calendar.ts`.
- CSS Modules are statically extracted at build time — zero runtime style injection.

### 4. Keyboard Navigation

- `role="grid"` + `role="gridcell"` on the calendar table.
- Arrow key navigation between day cells via `onKeyDown` handler on the grid container.
- `Tab` to move through interactive elements; `Enter`/`Space` to open day detail.
- Escape to close the day-detail panel.

---

## Key Implementation Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Calendar grid layout | Pure CSS Grid (7 columns) | No library needed; CSS Grid handles irregular month lengths trivially |
| Data grouping | `Map<string, Slip[]>` keyed by `YYYY-MM-DD` | O(1) lookup per day cell render; avoids `.filter()` per cell |
| Month navigation | `useTransition` + client `fetch` | Sub-300 ms transition; keeps current month visible during load |
| Overflow ("+N more") | Show 2 slips, remainder in detail panel | Keeps cell compact; detail panel already needed for US3 |
| Day detail | Slide-in panel (not modal) | Calendar stays visible; less disruptive than full modal overlay |
| Status toggle | Optimistic UI | < 16 ms visual feedback; rollback on error |
| Mobile layout | CSS `@media` collapse to single-column week list | Avoids layout breakage on narrow viewports without JS |

---

## Phase 0 Output Reference

See [research.md](./research.md) for resolved unknowns on:
- Next.js 16 App Router patterns for client pages with data fetching
- `useTransition` behaviour in React 19
- CSS Grid calendar layout patterns
- Keyboard grid navigation (ARIA `role="grid"`)

## Phase 1 Output Reference

- [data-model.md](./data-model.md) — Entity shapes, derived `CalendarDay` view model, validation rules
- [contracts/calendar-api.md](./contracts/calendar-api.md) — API contracts (existing + new)
- [quickstart.md](./quickstart.md) — Runnable validation scenarios
