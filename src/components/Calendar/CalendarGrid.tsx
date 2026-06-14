"use client";

import { memo, useRef, useCallback } from "react";
import type { CalendarMonth } from "@/lib/calendar";
import DayCell from "./DayCell";
import styles from "./calendar.module.css";

interface CalendarGridProps {
  calendarMonth: CalendarMonth;
  selectedDay: string | null;
  onDaySelect: (dateKey: string) => void;
  isPending: boolean;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CalendarGrid({
  calendarMonth,
  selectedDay,
  onDaySelect,
  isPending,
}: CalendarGridProps) {
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setCellRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cellRefs.current[index] = el;
    },
    []
  );

  // Arrow-key navigation across the grid
  function handleGridKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const focused = document.activeElement;
    const cells = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    const idx = cells.indexOf(focused as HTMLDivElement);
    if (idx === -1) return;

    let target = -1;
    if (e.key === "ArrowRight") target = idx + 1;
    else if (e.key === "ArrowLeft") target = idx - 1;
    else if (e.key === "ArrowDown") target = idx + 7;
    else if (e.key === "ArrowUp") target = idx - 7;
    else return;

    e.preventDefault();
    const next = cells[Math.max(0, Math.min(target, cells.length - 1))];
    next?.focus();
  }

  const { days } = calendarMonth;

  return (
    <section aria-label={`Calendário de ${calendarMonth.label}`}>
      {/* Weekday header */}
      <div className={styles.weekdayRow} aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.weekdayCell}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        role="grid"
        aria-label={`Grade do calendário — ${calendarMonth.label}`}
        aria-busy={isPending}
        className={styles.calendarGrid}
        onKeyDown={handleGridKeyDown}
        style={{ opacity: isPending ? 0.6 : 1, transition: "opacity var(--transition-base)" }}
      >
        {days.map((day, i) => (
          <DayCell
            key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
            day={day}
            isSelected={
              !!selectedDay &&
              `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}` === selectedDay
            }
            onSelect={onDaySelect}
            tabIndex={i === 0 ? 0 : -1}
            cellRef={setCellRef(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(CalendarGrid);
