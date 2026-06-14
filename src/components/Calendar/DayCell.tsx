"use client";

import { memo } from "react";
import type { CalendarDay } from "@/lib/calendar";
import styles from "./calendar.module.css";

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onSelect: (dateKey: string) => void;
  tabIndex: number;
  cellRef?: (el: HTMLDivElement | null) => void;
}

const CHIP_LIMIT = 2;

function DayCell({ day, isSelected, onSelect, tabIndex, cellRef }: DayCellProps) {
  const { date, dayNumber, isCurrentMonth, isToday, slips } = day;

  // "YYYY-MM-DD" key
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const slipCount = slips.length;
  const visibleSlips = slips.slice(0, CHIP_LIMIT);
  const overflowCount = slipCount - CHIP_LIMIT;

  const weekdayLabel = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const ariaLabel = `${weekdayLabel}, ${dayNumber} de ${date.toLocaleDateString("pt-BR", { month: "long" })}${slipCount > 0 ? `, ${slipCount} boleto${slipCount > 1 ? "s" : ""}` : ", sem boletos"}`;

  function handleClick() {
    if (!isCurrentMonth) return;
    onSelect(dateKey);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  const cellClass = [
    styles.dayCell,
    isToday ? styles.dayCellToday : "",
    isSelected ? styles.dayCellSelected : "",
    !isCurrentMonth ? styles.dayCellOtherMonth : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={cellRef}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isSelected}
      tabIndex={isCurrentMonth ? tabIndex : -1}
      className={cellClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-date={dateKey}
      data-empty={slipCount === 0 ? "true" : undefined}
    >
      {/* Day number + weekday label (weekday visible on mobile only) */}
      <div className={styles.dayHeader}>
        <span className={styles.dayNumber}>{dayNumber}</span>
        <span className={styles.weekdayLabel}>{weekdayLabel}</span>
      </div>

      {slipCount > 0 && (
        <div className={styles.chipList} aria-hidden="true">
          {visibleSlips.map((slip) => (
            <span
              key={slip.id}
              className={`${styles.slipChip} ${styles[`slipChip${slip.derivedStatus.charAt(0).toUpperCase() + slip.derivedStatus.slice(1)}`]}`}
              title={slip.title}
            >
              <span className={styles.chipDot} />
              <span className={styles.chipTitle}>{slip.title}</span>
            </span>
          ))}

          {overflowCount > 0 && (
            <button
              className={styles.overflowBtn}
              aria-expanded={isSelected}
              aria-label={`Ver mais ${overflowCount} boleto${overflowCount > 1 ? "s" : ""}`}
              tabIndex={-1}
            >
              +{overflowCount} mais
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DayCell);
