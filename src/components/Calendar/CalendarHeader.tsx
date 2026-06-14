"use client";

import { ChevronLeft, ChevronRight, CalendarCheck, Loader2 } from "lucide-react";
import styles from "./calendar.module.css";

interface CalendarHeaderProps {
  label: string;
  isPending: boolean;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  label,
  isPending,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <header className={styles.calendarHeader}>
      {/* Left: icon + title */}
      <div className={styles.calendarHeaderLeft}>
        <CalendarCheck size={22} className={styles.calendarHeaderIcon} aria-hidden="true" />
        <h1 className={styles.calendarTitle}>Calendário de Vencimentos</h1>
      </div>

      {/* Centre: month navigation */}
      <div className={styles.monthNav} role="group" aria-label="Navegação de mês">
        <button
          id="cal-prev-month-btn"
          className={styles.navBtn}
          onClick={onPrev}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className={styles.monthLabel} aria-live="polite" aria-atomic="true">
          {isPending ? (
            <Loader2 size={14} className={styles.pendingIndicator} aria-label="Carregando..." />
          ) : null}
          {label}
        </span>

        <button
          id="cal-next-month-btn"
          className={styles.navBtn}
          onClick={onNext}
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Right: Today shortcut */}
      <button
        id="cal-today-btn"
        className={styles.todayBtn}
        onClick={onToday}
        disabled={isCurrentMonth}
        aria-label="Voltar ao mês atual"
        aria-disabled={isCurrentMonth}
      >
        Hoje
      </button>
    </header>
  );
}
