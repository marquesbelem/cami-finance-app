"use client";

import { TrendingDown, TrendingUp, Clock, Wallet } from "lucide-react";
import styles from "./SummaryCards.module.css";

interface Slip {
  amount: number;
  status: string;
  isCreditCardPayment: boolean;
}

interface Props {
  slips: Slip[];
  budgetLimit: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SummaryCards({ slips, budgetLimit }: Props) {
  const totalSpent = slips.reduce((sum, s) => sum + s.amount, 0);
  const paidTotal = slips.filter((s) => s.status === "Paid").reduce((sum, s) => sum + s.amount, 0);
  const pendingTotal = slips.filter((s) => s.status !== "Paid").reduce((sum, s) => sum + s.amount, 0);
  const creditTotal = slips.filter((s) => s.isCreditCardPayment).reduce((sum, s) => sum + s.amount, 0);
  const budgetUsedPct = budgetLimit > 0 ? Math.min(100, (totalSpent / budgetLimit) * 100) : 0;
  const pendingCount = slips.filter((s) => s.status !== "Paid").length;

  return (
    <div className={styles.grid}>
      {/* Total Spent */}
      <article className={styles.card} aria-label="Total gasto no mês">
        <div className={`${styles.iconWrap} ${styles.iconBrand}`}>
          <Wallet size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Total do Mês</span>
          <span className={styles.value}>{formatCurrency(totalSpent)}</span>
          {budgetLimit > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${budgetUsedPct >= 90 ? styles.progressDanger : budgetUsedPct >= 70 ? styles.progressWarning : styles.progressBrand}`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
              <span className={styles.progressLabel}>
                {budgetUsedPct.toFixed(0)}% do limite (
                {formatCurrency(budgetLimit)})
              </span>
            </div>
          )}
        </div>
      </article>

      {/* Paid */}
      <article className={styles.card} aria-label="Total pago">
        <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>
          <TrendingDown size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Pago</span>
          <span className={`${styles.value} ${styles.valueSuccess}`}>
            {formatCurrency(paidTotal)}
          </span>
          <span className={styles.sub}>
            {slips.filter((s) => s.status === "Paid").length} boletos
          </span>
        </div>
      </article>

      {/* Pending */}
      <article className={styles.card} aria-label="Total pendente">
        <div className={`${styles.iconWrap} ${styles.iconWarning}`}>
          <Clock size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Pendente</span>
          <span className={`${styles.value} ${styles.valueWarning}`}>
            {formatCurrency(pendingTotal)}
          </span>
          <span className={styles.sub}>
            {pendingCount} boleto{pendingCount !== 1 ? "s" : ""}
          </span>
        </div>
      </article>

      {/* Credit Card */}
      <article className={styles.card} aria-label="Gastos no cartão de crédito">
        <div className={`${styles.iconWrap} ${styles.iconDanger}`}>
          <TrendingUp size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Cartão de Crédito</span>
          <span className={`${styles.value} ${styles.valueDanger}`}>
            {formatCurrency(creditTotal)}
          </span>
          <span className={styles.sub}>
            {totalSpent > 0
              ? `${((creditTotal / totalSpent) * 100).toFixed(0)}% do total`
              : "—"}
          </span>
        </div>
      </article>
    </div>
  );
}
