"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import AdicionarBoleto from "@/components/AdicionarBoleto/AdicionarBoleto";
import SlipItem, { Slip } from "@/components/SlipList/SlipItem";
import DashboardCharts from "@/components/DashboardCharts/DashboardCharts";
import SummaryCards from "@/components/DashboardCharts/SummaryCards";
import AchievementsPanel from "@/components/Achievements/AchievementsPanel";
import Celebration, { useToasts } from "@/components/Achievements/Celebration";
import styles from "./page.module.css";

// ── Month helpers ──────────────────────────────────────────────────────────────
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(ym: string, delta: number): string {
  const [year, month] = ym.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);
  const [loading, setLoading] = useState(true);
  const [salaryToCelebrate, setSalaryToCelebrate] = useState<{ amount: number; month: string } | null>(null);

  const { toasts, dismissToast, celebrateAchievement, addToast, showXpToast, showLevelUpToast } = useToasts();

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadSlips = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [slipsRes, statsRes] = await Promise.all([
        fetch(`/api/slips?month=${selectedMonth}`),
        fetch("/api/stats"),
      ]);
      const [slipsData, statsData] = await Promise.all([
        slipsRes.json(),
        statsRes.json(),
      ]);
      setSlips(slipsData);
      const salary = statsData.scheduledSalaryAmount > 0 ? statsData.scheduledSalaryAmount : 3000.0;
      const budgetPct = statsData.monthlyBudgetLimit ?? 50.0;
      const calculatedBudget = salary * (budgetPct / 100);
      setBudgetLimit(calculatedBudget);

      // Trigger retroactive salary received celebration if validated
      if (statsData.celebrateSalary) {
        setSalaryToCelebrate({
          amount: statsData.scheduledSalaryAmount,
          month: formatMonthLabel(selectedMonth),
        });
      }
    } catch {
      addToast({ title: "Erro", message: "Falha ao carregar boletos.", type: "danger" });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedMonth, addToast]);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      title: editingSlip ? "Boleto atualizado" : "Boleto adicionado",
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

  async function handleDelete(id: string) {
    const deleted = slips.find((s) => s.id === id);
    await fetch(`/api/slips/${id}`, { method: "DELETE" });
    setSlips((prev) => prev.filter((s) => s.id !== id));
    if (deleted) {
      addToast({ title: "Boleto excluído", message: deleted.title, type: "info" });
    }
  }

  async function handleStatusToggle(slip: Slip) {
    const newStatus = slip.status === "PAGO" ? "PENDENTE" : "PAGO";
    const form = new FormData();
    form.append("status", newStatus);
    const res = await fetch(`/api/slips/${slip.id}`, { method: "PUT", body: form });
    const updated: Slip = await res.json();
    setSlips((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

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
  }

  function openEdit(slip: Slip) {
    setEditingSlip(slip);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingSlip(null);
  }

  // Group overdue slips first
  const sorted = [...slips].sort((a, b) => {
    const aOverdue = a.status !== "PAGO" && new Date(a.dueDate) < new Date();
    const bOverdue = b.status !== "PAGO" && new Date(b.dueDate) < new Date();
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <>
      <div className={styles.layout}>
        {/* ── Sidebar: Achievements ─────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <AchievementsPanel
            onAchievementUnlocked={celebrateAchievement}
            onSettingsSaved={() => loadSlips(true)}
          />
        </aside>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main className={styles.main} id="main-content">
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <LayoutDashboard size={24} className={styles.headerIcon} />
              <div>
                <h1 className={styles.appTitle}>Cami Finance</h1>
                <p className={styles.appSubtitle}>Gerenciador Financeiro Gamificado</p>
              </div>
            </div>

            {/* Month selector */}
            <div className={styles.monthNav} role="group" aria-label="Seletor de mês">
              <button
                id="prev-month-btn"
                className={styles.monthBtn}
                onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.monthLabel}>{formatMonthLabel(selectedMonth)}</span>
              <button
                id="next-month-btn"
                className={styles.monthBtn}
                onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              id="add-slip-btn"
              className={styles.addBtn}
              onClick={() => { setEditingSlip(null); setIsFormOpen(true); }}
              aria-label="Adicionar boleto"
            >
              <Plus size={18} />
              <span>Adicionar Boleto</span>
            </button>
          </header>

          {/* Summary Cards */}
          <section aria-label="Resumo financeiro do mês">
            <SummaryCards slips={slips} budgetLimit={budgetLimit} loading={loading} />
          </section>

          {/* Charts */}
          <section aria-label="Gráficos de gastos">
            <DashboardCharts slips={slips} />
          </section>

          {/* Slip list */}
          <section aria-label="Lista de boletos">
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>
                Boletos
                {slips.length > 0 && (
                  <span className={styles.listCount}>{slips.length}</span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className={styles.skeletonList}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>💸</span>
                <p className={styles.emptyTitle}>Nenhum boleto em {formatMonthLabel(selectedMonth)}</p>
                <p className={styles.emptyHint}>Clique em &quot;Adicionar Boleto&quot; para começar.</p>
              </div>
            ) : (
              <ul className={styles.slipList} role="list">
                {sorted.map((slip) => (
                  <li key={slip.id}>
                    <SlipItem
                      slip={slip}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onStatusToggle={handleStatusToggle}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <AdicionarBoleto
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        editingSlip={editingSlip}
      />

      {/* ── Toast notifications & Salary Modal ────────────────────────────── */}
      <Celebration
        toasts={toasts}
        onDismiss={dismissToast}
        salaryToCelebrate={salaryToCelebrate}
        onDismissSalary={() => setSalaryToCelebrate(null)}
      />
    </>
  );
}
