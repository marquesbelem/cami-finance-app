"use client";

import { useState, useEffect, useCallback, useMemo, useTransition, useRef } from "react";
import type { Slip } from "@/components/SlipList/SlipItem";
import {
  buildCalendarMonth,
  getCurrentMonth,
  shiftMonth,
  toDateKey,
} from "@/lib/calendar";
import CalendarHeader from "@/components/Calendar/CalendarHeader";
import CalendarGrid from "@/components/Calendar/CalendarGrid";
import DayDetailPanel from "@/components/Calendar/DayDetailPanel";
import AdicionarBoleto from "@/components/AdicionarBoleto/AdicionarBoleto";
import Celebration, { useToasts } from "@/components/Achievements/Celebration";
import styles from "./calendar.module.css";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  // Track which cell triggered the panel so we can return focus on close
  const triggerRef = useRef<HTMLElement | null>(null);

  const { toasts, addToast, dismissToast, showXpToast, showLevelUpToast } = useToasts();

  // ── Data Loading ───────────────────────────────────────────────────────────
  const loadSlips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slips?month=${selectedMonth}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Slip[] = await res.json();
      setSlips(data);
    } catch {
      addToast({
        title: "Erro",
        message: "Falha ao carregar boletos.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, addToast]);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  // ── Calendar View Model ────────────────────────────────────────────────────
  // Recomputed only when slips or selectedMonth changes — O(n) + memoised.
  const today = useMemo(() => new Date(), []);
  const calendarMonth = useMemo(
    () => buildCalendarMonth(selectedMonth, slips, today),
    [selectedMonth, slips, today]
  );

  const currentMonth = useMemo(() => getCurrentMonth(), []);
  const isCurrentMonth = selectedMonth === currentMonth;

  // ── Month Navigation ───────────────────────────────────────────────────────
  function handlePrev() {
    startTransition(() => {
      setSelectedMonth((m) => shiftMonth(m, -1));
    });
  }

  function handleNext() {
    startTransition(() => {
      setSelectedMonth((m) => shiftMonth(m, 1));
    });
  }

  function handleToday() {
    startTransition(() => {
      setSelectedMonth(currentMonth);
    });
  }

  // ── Day Selection ──────────────────────────────────────────────────────────
  function handleDaySelect(dateKey: string) {
    setSelectedDay(dateKey);
    // Track the triggering element for focus return
    triggerRef.current = document.activeElement as HTMLElement;
  }

  function handlePanelClose() {
    setSelectedDay(null);
    // Return focus to the triggering cell
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  }

  // ── Status Toggle (optimistic UI) ─────────────────────────────────────────
  async function handleStatusToggle(slip: Slip) {
    if (toggling[slip.id]) return; // debounce

    const newStatus = slip.status === "PAGO" ? "PENDENTE" : "PAGO";
    const previous = slips;

    // 1. Optimistic update
    setToggling((t) => ({ ...t, [slip.id]: true }));
    setSlips((prev) =>
      prev.map((s) => (s.id === slip.id ? { ...s, status: newStatus } : s))
    );

    try {
      // 2. Server confirm
      const form = new FormData();
      form.append("status", newStatus);
      const res = await fetch(`/api/slips/${slip.id}`, {
        method: "PUT",
        body: form,
      });
      if (!res.ok) throw new Error("toggle failed");
      const updated: Slip = await res.json();

      // 3. Replace optimistic slip with server response
      setSlips((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );

      // Check XP metadata for debit/PIX payment
      const xpDetails = (updated as any).xpDetails;
      if (xpDetails) {
        showXpToast(xpDetails.xpGained, "Boleto pago no Débito ou PIX!");
        if (xpDetails.leveledUp) {
          setTimeout(() => {
            showLevelUpToast(xpDetails.newLevel);
          }, 1200);
        }
      }
    } catch {
      // 4. Rollback on error
      setSlips(previous);
      addToast({
        title: "Erro",
        message: "Não foi possível atualizar o status.",
        type: "danger",
      });
    } finally {
      setToggling((t) => {
        const copy = { ...t };
        delete copy[slip.id];
        return copy;
      });
    }
  }

  // ── Form Handlers ──────────────────────────────────────────────────────────
  function handleAddBill() {
    setIsFormOpen(true);
  }

  function handleSave(saved: Slip) {
    setSlips((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    addToast({
      title: "Boleto adicionado",
      message: saved.title,
      type: "success",
    });

    // Award XP and show toasts if metadata exists
    const xpDetails = (saved as any).xpDetails;
    if (xpDetails) {
      showXpToast(
        xpDetails.xpGained,
        xpDetails.bonusAwarded
          ? `Bônus de consistência diária! Combo: ${xpDetails.streak} dias 🔥`
          : "Despesa registrada!"
      );
      if (xpDetails.leveledUp) {
        setTimeout(() => {
          showLevelUpToast(xpDetails.newLevel);
        }, 1200);
      }
    }
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  // ── Derive selected-day slips from the view model ─────────────────────────
  const selectedDaySlips = selectedDay
    ? (calendarMonth.slipsByDay.get(selectedDay) ?? [])
    : [];

  // ── Pre-fill dueDate when adding from empty-day panel ─────────────────────
  // We use a null editingSlip so AdicionarBoleto opens in "add" mode.
  // The due date pre-fill would require a prop change to AdicionarBoleto;
  // for now we open the modal and let the user fill the date.

  return (
    <main className={styles.calendarPage} id="calendar-main">
      {/* Header */}
      <CalendarHeader
        label={calendarMonth.label}
        isPending={isPending}
        isCurrentMonth={isCurrentMonth}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Grid or loading skeleton or empty state */}
      {loading ? (
        <SkeletonGrid />
      ) : !calendarMonth.hasSlips ? (
        <>
          {/* Still render the grid for navigation context */}
          <CalendarGrid
            calendarMonth={calendarMonth}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
            isPending={isPending}
          />
          {/* Celebration empty state */}
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🎉</span>
            <p className={styles.emptyTitle}>Mês livre de boletos!</p>
            <p className={styles.emptySubtitle}>
              Parece que você está em festa — nenhum vencimento este mês.
            </p>
          </div>
        </>
      ) : (
        <CalendarGrid
          calendarMonth={calendarMonth}
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
          isPending={isPending}
        />
      )}

      {/* Day detail panel */}
      <DayDetailPanel
        dateKey={selectedDay}
        slips={selectedDaySlips}
        toggling={toggling}
        onClose={handlePanelClose}
        onStatusToggle={handleStatusToggle}
        onAddBill={handleAddBill}
      />

      {/* Add bill modal (reused from existing feature) */}
      <AdicionarBoleto
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        editingSlip={null}
      />

      {/* Toast notifications */}
      <Celebration toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className={styles.skeletonGrid} aria-busy="true" aria-label="Carregando calendário...">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className={styles.skeletonCell} />
      ))}
    </div>
  );
}

// ── Today date key helper (for the "Today" highlight today's cell) ────────────
function _todayKey(): string {
  return toDateKey(new Date());
}
void _todayKey; // suppress unused warning
