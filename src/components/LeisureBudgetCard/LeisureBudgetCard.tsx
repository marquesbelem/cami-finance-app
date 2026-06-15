"use client";

import styles from "./LeisureBudgetCard.module.css";

interface LeisureBudgetData {
  budget: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
  percentUsed: number;
  configured: boolean;
}

interface Props {
  data: LeisureBudgetData | null;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function LeisureBudgetCard({ data, loading }: Props) {
  if (loading) {
    return (
      <article className={styles.card}>
        <div className={`${styles.skeleton} ${styles.skeletonHeader}`} />
        <div className={`${styles.skeleton} ${styles.skeletonBar}`} />
        <div className={`${styles.skeleton} ${styles.skeletonValue}`} />
      </article>
    );
  }

  if (!data || !data.configured) {
    return (
      <article className={styles.card}>
        <div className={styles.notConfigured}>
          <span className={styles.emptyIcon}>🎮</span>
          <p className={styles.emptyTitle}>Orçamento de Lazer</p>
          <p className={styles.emptyHint}>
            Configure nas ⚙ Configurações de RPG para ativar.
          </p>
        </div>
      </article>
    );
  }

  const { budget, spent, remaining, isOverBudget, percentUsed } = data;

  // Status classification
  const remainPct = budget > 0 ? (remaining / budget) * 100 : 0;
  const status: "safe" | "warning" | "danger" =
    isOverBudget ? "danger" : remainPct < 30 ? "warning" : "safe";

  const statusLabel: Record<string, string> = {
    safe: "SEGURO",
    warning: "ATENÇÃO",
    danger: "ESTOURADO",
  };

  const iconClass = {
    safe: styles.iconSafe,
    warning: styles.iconWarning,
    danger: styles.iconDanger,
  }[status];

  const badgeClass = {
    safe: styles.badgeSafe,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
  }[status];

  const fillClass = {
    safe: styles.fillSafe,
    warning: styles.fillWarning,
    danger: styles.fillDanger,
  }[status];

  return (
    <article
      className={`${styles.card} ${isOverBudget ? styles.cardOverBudget : ""}`}
      aria-label="Orçamento de Lazer"
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${iconClass}`}>🎮</div>
        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <span className={styles.label}>Poção de Lazer</span>
            <span className={`${styles.badge} ${badgeClass}`}>
              {statusLabel[status]}
            </span>
          </div>
          <div className={styles.valueRow}>
            <span
              className={`${styles.value} ${isOverBudget ? styles.valueNegative : ""}`}
            >
              {formatCurrency(Math.abs(remaining))}
            </span>
            <span className={styles.valueSuffix}>
              {isOverBudget ? "acima do limite" : "restante"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${fillClass}`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
          <div className={styles.barGloss} />
        </div>
        <div className={styles.progressLabel}>
          <span>{percentUsed.toFixed(0)}% usado</span>
          <span>
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className={styles.breakdown}>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Orçamento</span>
          <span className={styles.breakdownValue}>{formatCurrency(budget)}</span>
        </div>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Gasto</span>
          <span className={`${styles.breakdownValue} ${styles.spentValue}`}>
            {formatCurrency(spent)}
          </span>
        </div>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>Saldo</span>
          <span
            className={styles.breakdownValue}
            style={{ color: isOverBudget ? "#f87171" : "#34d399" }}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </article>
  );
}
