# Research: Due-Date Calendar View (003-calendar-view)

## Overview

This document resolves all "NEEDS CLARIFICATION" items identified in the Technical Context and documents technology decisions made for the calendar feature.

---

## 1. Next.js 16 App Router — Client Pages with Data Fetching

**Decision**: Use `"use client"` page component with `useEffect` + `fetch` (same pattern as existing `src/app/page.tsx`).

**Rationale**: The calendar page requires interactive state (selected month, selected day, open panel) that must live on the client. The existing codebase consistently uses this pattern. Server Components are not used for data-heavy interactive pages in this project.

**Pattern confirmed from `src/app/page.tsx`**:
```tsx
const loadSlips = useCallback(async () => {
  const res = await fetch(`/api/slips?month=${selectedMonth}`);
  const data = await res.json();
  setSlips(data);
}, [selectedMonth]);

useEffect(() => { loadSlips(); }, [loadSlips]);
```

**Alternatives considered**:
- **Server Component + `searchParams`**: Would require full page reload on month navigation — violates SC-002 (< 300 ms transition). Rejected.
- **SWR/React Query**: Would add a dependency. The existing project avoids external data-fetching libraries. Rejected.

---

## 2. React 19 `useTransition` for Month Navigation

**Decision**: Wrap month navigation state update in `startTransition` to keep the UI responsive during the async fetch.

**Rationale**: `useTransition` marks the state update as non-urgent so React can keep rendering the current month grid while the fetch and new state are pending. This achieves the "stale while loading" pattern without a library.

**Pattern**:
```tsx
const [isPending, startTransition] = useTransition();

function handleMonthChange(delta: number) {
  startTransition(() => {
    setSelectedMonth(prev => shiftMonth(prev, delta));
  });
}
```

**Note**: `isPending` is used to show a subtle loading indicator in the calendar header, not a full-page spinner, so the grid remains visible during the transition.

---

## 3. Calendar Grid Layout — Pure CSS Grid

**Decision**: 7-column CSS Grid (`grid-template-columns: repeat(7, 1fr)`) with `<time>` elements for day cells.

**Rationale**: CSS Grid trivially handles irregular month starts (leading blank cells as empty `<div>`s) and variable row counts. No JavaScript layout calculation required. Renders at browser-native speed.

**Pattern**:
```css
.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
}
```

**Overflow strategy**: Each `DayCell` has a fixed `min-height` and shows up to 2 slip chips. A "+N more" button (rendered only when `slips.length > 2`) triggers the day-detail panel.

**Alternatives considered**:
- **HTML `<table>`**: Semantically correct for a calendar grid (ARIA `role="grid"` maps to it), but CSS Grid is simpler to style responsively. Used ARIA roles on the CSS Grid instead.
- **React libraries (react-calendar, FullCalendar)**: ~200–500 KB gzipped. Rejected for bundle size and customisation constraints.

---

## 4. Data Grouping — `Map<string, Slip[]>` 

**Decision**: Group slips into a `Map` keyed by `"YYYY-MM-DD"` using `useMemo`.

**Rationale**: O(n) grouping once per `slips` array change. Each `DayCell` does an O(1) `Map.get(key)` lookup. Avoids the O(n×m) cost of `.filter()` per cell (28–42 cells × up to 100 slips = potential 4,200 comparisons per render).

**Implementation** (in `src/lib/calendar.ts`):
```ts
export function groupSlipsByDay(slips: Slip[]): Map<string, Slip[]> {
  const map = new Map<string, Slip[]>();
  for (const slip of slips) {
    const key = slip.dueDate.slice(0, 10); // "YYYY-MM-DD"
    const list = map.get(key) ?? [];
    list.push(slip);
    map.set(key, list);
  }
  return map;
}
```

---

## 5. ARIA Grid Keyboard Navigation

**Decision**: Implement `role="grid"` on the calendar container with `role="gridcell"` on each day cell. Arrow key navigation managed by an `onKeyDown` handler on the grid element.

**Rationale**: WCAG 2.1 SC-007 requires full keyboard navigability. The ARIA grid pattern is the correct semantic model for a calendar.

**Pattern**:
```tsx
// Grid container
<div role="grid" aria-label="Calendário de vencimentos" onKeyDown={handleGridKeyDown}>
  {/* Day cells */}
  <div role="gridcell" tabIndex={isSelected ? 0 : -1} aria-label={`${day}, ${slipCount} boletos`}>
```

**Arrow key handler**: Calculates the target cell index from `(row ± 1) × 7 + col ± 1` and calls `.focus()` on the corresponding DOM element via `ref` array.

---

## 6. Overdue Status Determination

**Decision**: A slip is "overdue" when `status === "Pending"` AND `new Date(slip.dueDate) < today` (same logic as `src/app/page.tsx`). This is computed client-side with `useMemo` and today's date captured once at render time (not per-cell to avoid 42 `new Date()` calls per render).

**Colour mapping**:
- Paid → `--color-success` (emerald)
- Pending (future/today) → `--color-warning` (amber)  
- Overdue (pending + past) → `--color-danger` (rose)

---

## 7. Mobile Responsive Strategy

**Decision**: Below 640px, the 7-column grid collapses to a vertical list of day rows (one row per day that has slips), using `@media (max-width: 640px)`.

**Rationale**: A 7-column grid on a 320px screen produces ~40px wide cells — unusable. The week-list view shows only days with bills, with full-width slip chips.

**Pattern**:
```css
@media (max-width: 640px) {
  .calendarGrid {
    grid-template-columns: 1fr;
  }
  .dayCell:empty,
  .dayCell[data-empty="true"] {
    display: none; /* Hide empty cells on mobile */
  }
}
```

---

## Summary of Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| Data fetching pattern | `useCallback` + `useEffect` + `fetch` (matches existing codebase) |
| Month nav performance | `useTransition` wrapping `setSelectedMonth` |
| Calendar grid approach | 7-col CSS Grid, no library |
| Day grouping algorithm | `Map<string, Slip[]>` via `useMemo` |
| Keyboard navigation | ARIA `role="grid"` + `onKeyDown` arrow key handler |
| Overdue detection | Client-side: `status === "Pending" && dueDate < today` |
| Mobile layout | `@media` collapse to single-column day list |
