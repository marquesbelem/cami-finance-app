# Data Model: Due-Date Calendar View (003-calendar-view)

## Existing Entities (unchanged)

### PaymentSlip

The primary entity. No schema changes required.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID) | Primary key |
| `title` | `string` | Displayed in day cells and detail panel |
| `amount` | `number` (Float) | Formatted as BRL currency in display |
| `dueDate` | `DateTime` (ISO 8601) | Determines calendar placement (day cell) |
| `status` | `"Paid" \| "Pending"` | Drives colour coding; "Overdue" is derived |
| `isCreditCardPayment` | `boolean` | Shown as optional badge in detail panel |
| `documentPath` | `string \| null` | Not displayed in calendar view |
| `createdAt` | `DateTime` | Not displayed in calendar view |
| `categoryId` | `string` (FK → Category) | Used for category colour swatch in detail panel |
| `category` | `Category` (relation) | Included via Prisma `include: { category: true }` |

### Category

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID) | Primary key |
| `name` | `string` | Displayed in day-detail panel |
| `colorCode` | `string` | CSS variable or hex; used as colour swatch |
| `iconRef` | `string` | Lucide icon name; optionally shown in detail panel |

---

## Derived View Models (client-side only, not persisted)

### SlipWithStatus

Extends `PaymentSlip` with a computed `derivedStatus` field for display. Computed once via `useMemo` in the calendar page.

```ts
// src/lib/calendar.ts
export type SlipStatus = "paid" | "pending" | "overdue";

export interface SlipWithStatus extends Slip {
  derivedStatus: SlipStatus;
}

export function withDerivedStatus(slips: Slip[], today: Date): SlipWithStatus[] {
  return slips.map(slip => ({
    ...slip,
    derivedStatus:
      slip.status === "Paid"
        ? "paid"
        : new Date(slip.dueDate) < today
        ? "overdue"
        : "pending",
  }));
}
```

### CalendarDay

Represents one day cell in the calendar grid. Produced by `buildCalendarDays()`.

```ts
export interface CalendarDay {
  date: Date;                 // The actual date for this cell
  dayNumber: number;          // 1–31 (day of month)
  isCurrentMonth: boolean;    // false for leading/trailing filler days
  isToday: boolean;           // true only for today's date
  slips: SlipWithStatus[];    // slips due on this day (may be empty)
}
```

### CalendarMonth

Top-level view model returned by `buildCalendarMonth()`.

```ts
export interface CalendarMonth {
  year: number;
  month: number;                // 1-indexed (1 = January)
  label: string;                // "junho de 2026" (pt-BR)
  days: CalendarDay[];          // 28–42 cells (complete weeks)
  slipsByDay: Map<string, SlipWithStatus[]>; // "YYYY-MM-DD" → slips (O(1) lookup)
  totalSlips: number;
  hasSlips: boolean;
}
```

---

## State Transitions

### Payment Slip Status

```
Pending (future dueDate) ──→ [derivedStatus: "pending"] (amber)
Pending (past dueDate)   ──→ [derivedStatus: "overdue"] (rose)
Paid                     ──→ [derivedStatus: "paid"]    (emerald)

User action: "Mark as Paid"    → status: "Pending" → "Paid"
User action: "Mark as Pending" → status: "Paid"    → "Pending"
```

**Optimistic update flow**:
1. User clicks toggle button → `setSlips()` with updated status immediately
2. `derivedStatus` recomputed by `useMemo` → calendar cell re-renders (< 16 ms)
3. `PATCH /api/slips/:id` sent → server confirms
4. On error: `setSlips()` rolled back to previous state + error toast shown

### Calendar Month Navigation

```
[currentMonth] ──[Prev]──→ [month - 1] ──[fetch]──→ [new slips loaded]
[currentMonth] ──[Next]──→ [month + 1] ──[fetch]──→ [new slips loaded]
[any month]    ──[Today]──→ [currentMonth]
```

---

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| `dueDate` must fall within the displayed month | Enforced by API filter (`gte` start, `lt` end of month) |
| Max 2 slips shown per cell without overflow | Enforced by `DayCell` component — 3rd+ shown as "+N more" |
| Cell min-height must not break grid layout | Enforced by CSS `min-height` + `overflow: hidden` on chip list |
| Titles must be truncated at ~20 chars in cells | Enforced by CSS `text-overflow: ellipsis; overflow: hidden; white-space: nowrap` |
| Status toggle must be idempotent | API `PUT` sets exact value; double-click prevented by `loading` state |

---

## TypeScript Type Definitions

The calendar utility file adds these types alongside the existing `Slip` type (defined in `src/components/SlipList/SlipItem.tsx`):

```ts
// src/lib/calendar.ts  [NEW]
import type { Slip } from "@/components/SlipList/SlipItem";

export type SlipStatus = "paid" | "pending" | "overdue";

export interface SlipWithStatus extends Slip {
  derivedStatus: SlipStatus;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  slips: SlipWithStatus[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  days: CalendarDay[];
  slipsByDay: Map<string, SlipWithStatus[]>;
  totalSlips: number;
  hasSlips: boolean;
}
```
