// ── Calendar Utility Library ──────────────────────────────────────────────────
// Pure functions only — no React imports. All date logic lives here.

import type { Slip } from "@/components/SlipList/SlipItem";

// ── Types ─────────────────────────────────────────────────────────────────────

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
  month: number; // 1-indexed
  label: string;
  days: CalendarDay[];
  slipsByDay: Map<string, SlipWithStatus[]>;
  totalSlips: number;
  hasSlips: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the number of days in a given month (1-indexed). */
function getMonthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Returns "YYYY-MM-DD" key for a Date object. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Returns "YYYY-MM" string for the current month. */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Shifts a "YYYY-MM" string by delta months. */
export function shiftMonth(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Formats a "YYYY-MM" string as a capitalised pt-BR month label. */
export function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// ── Core Derivation ───────────────────────────────────────────────────────────

/**
 * Attaches a derived status to each slip.
 * today is captured once externally to avoid repeated Date() calls per cell.
 */
export function withDerivedStatus(
  slips: Slip[],
  today: Date
): SlipWithStatus[] {
  const todayMs = today.setHours(0, 0, 0, 0);
  return slips.map((slip) => {
    let derivedStatus: SlipStatus;
    if (slip.status === "PAGO") {
      derivedStatus = "paid";
    } else {
      const due = new Date(slip.dueDate);
      due.setHours(0, 0, 0, 0);
      derivedStatus = due.getTime() < todayMs ? "overdue" : "pending";
    }
    return { ...slip, derivedStatus };
  });
}

/**
 * Groups SlipWithStatus into a Map keyed by "YYYY-MM-DD".
 * O(n) — avoids per-cell .filter() calls.
 */
export function groupSlipsByDay(
  slips: SlipWithStatus[]
): Map<string, SlipWithStatus[]> {
  const map = new Map<string, SlipWithStatus[]>();
  for (const slip of slips) {
    const key = slip.dueDate.slice(0, 10); // "YYYY-MM-DD"
    const list = map.get(key) ?? [];
    list.push(slip);
    map.set(key, list);
  }
  return map;
}

/**
 * Builds the full array of CalendarDay objects for a given year/month.
 * Includes leading (prev-month) and trailing (next-month) filler days
 * to complete the 7-column grid rows. Always returns 35 or 42 cells.
 */
export function buildCalendarDays(
  year: number,
  month: number, // 1-indexed
  slipsByDay: Map<string, SlipWithStatus[]>,
  today: Date
): CalendarDay[] {
  const todayKey = toDateKey(today);
  const daysInMonth = getMonthDays(year, month);

  // 0 = Sunday, first day of the target month
  const firstDow = new Date(year, month - 1, 1).getDay();

  // Cells from previous month to fill the leading blank slots
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const daysInPrev = getMonthDays(prevYear, prevMonth);

  const days: CalendarDay[] = [];

  // Leading filler days (previous month)
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const date = new Date(prevYear, prevMonth - 1, d);
    const key = toDateKey(date);
    days.push({
      date,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
      slips: slipsByDay.get(key) ?? [],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = toDateKey(date);
    days.push({
      date,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: key === todayKey,
      slips: slipsByDay.get(key) ?? [],
    });
  }

  // Trailing filler days (next month) — fill to 35 or 42
  const total = days.length <= 35 ? 35 : 42;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  let d = 1;
  while (days.length < total) {
    const date = new Date(nextYear, nextMonth - 1, d);
    const key = toDateKey(date);
    days.push({
      date,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: key === todayKey,
      slips: slipsByDay.get(key) ?? [],
    });
    d++;
  }

  return days;
}

/**
 * Top-level builder — call once per month change.
 * Accepts raw Slip[] from the API and a "YYYY-MM" string.
 */
export function buildCalendarMonth(
  ym: string,
  rawSlips: Slip[],
  today: Date
): CalendarMonth {
  const [year, month] = ym.split("-").map(Number);
  const slipsWithStatus = withDerivedStatus(rawSlips, today);
  const slipsByDay = groupSlipsByDay(slipsWithStatus);
  const days = buildCalendarDays(year, month, slipsByDay, today);
  const label = formatMonthLabel(ym);

  return {
    year,
    month,
    label,
    days,
    slipsByDay,
    totalSlips: rawSlips.length,
    hasSlips: rawSlips.length > 0,
  };
}
