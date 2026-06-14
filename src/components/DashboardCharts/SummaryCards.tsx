"use client";

import { Heart, Shield, Clock, Swords } from "lucide-react";
import styles from "./SummaryCards.module.css";

interface Slip {
  amount: number;
  status: string;
  isCreditCardPayment: boolean;
}

interface Props {
  slips: Slip[];
  budgetLimit: number;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SummaryCards({ slips, budgetLimit, loading }: Props) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <article key={idx} className={styles.card}>
            <div className={`${styles.iconWrap} ${styles.skeletonIcon}`} />
            <div className={styles.info} style={{ width: "100%" }}>
              <div className={styles.skeletonLabel} />
              <div className={styles.skeletonValue} />
              {idx === 0 && (
                <div className={styles.skeletonBar} style={{ marginTop: "10px" }} />
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }

  const totalSpent = slips.reduce((sum, s) => sum + s.amount, 0);
  const paidTotal = slips.filter((s) => s.status === "PAGO").reduce((sum, s) => sum + s.amount, 0);
  const pendingTotal = slips.filter((s) => s.status !== "PAGO").reduce((sum, s) => sum + s.amount, 0);
  const creditTotal = slips.filter((s) => s.isCreditCardPayment).reduce((sum, s) => sum + s.amount, 0);

  // Remaining budget represents the user's Health Points (HP)
  const remainingBudget = Math.max(0, budgetLimit - totalSpent);
  const hpPct = budgetLimit > 0 ? Math.min(100, (remainingBudget / budgetLimit) * 100) : 0;
  const pendingCount = slips.filter((s) => s.status !== "PAGO").length;

  const isCritical = hpPct < 20;

  return (
    <div className={styles.grid}>
      {/* RPG Health Card (HP) */}
      <article
        className={`${styles.card} ${styles.rpgCard} ${isCritical ? styles.cardCritical : ""}`}
        aria-label="Pontos de vida de orçamento (HP)"
      >
        <div className={`${styles.iconWrap} ${hpPct >= 50 ? styles.iconHpGreen : hpPct >= 20 ? styles.iconHpYellow : styles.iconHpRed} ${isCritical ? styles.pulseHeart : ""}`}>
          <Heart size={20} fill="currentColor" />
        </div>
        <div className={styles.info}>
          <div className={styles.rpgHeader}>
            <span className={styles.label}>HP do Orçamento</span>
            {isCritical && <span className={styles.criticalBadge}>CRÍTICO</span>}
          </div>
          <span className={styles.value}>{formatCurrency(remainingBudget)}</span>
          {budgetLimit > 0 && (
            <div className={styles.progressWrap}>
              <div className={styles.rpgProgressBar}>
                <div
                  className={`${styles.rpgProgressFill} ${
                    hpPct >= 50 ? styles.hpGreen : hpPct >= 20 ? styles.hpYellow : styles.hpRed
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
                <div className={styles.barGloss} />
              </div>
              <span className={styles.progressLabel}>
                HP: {remainingBudget.toFixed(0)} / {budgetLimit.toFixed(0)} ({hpPct.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      </article>

      {/* Paid (Shield) */}
      <article className={styles.card} aria-label="Total pago">
        <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>
          <Shield size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Defesa (Paga)</span>
          <span className={`${styles.value} ${styles.valueSuccess}`}>
            {formatCurrency(paidTotal)}
          </span>
          <span className={styles.sub}>
            {slips.filter((s) => s.status === "PAGO").length} boletos defendidos
          </span>
        </div>
      </article>

      {/* Pending (Clock) */}
      <article className={styles.card} aria-label="Total pendente">
        <div className={`${styles.iconWrap} ${styles.iconWarning}`}>
          <Clock size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Ameaças (Pendentes)</span>
          <span className={`${styles.value} ${styles.valueWarning}`}>
            {formatCurrency(pendingTotal)}
          </span>
          <span className={styles.sub}>
            {pendingCount} monstro{pendingCount !== 1 ? "s" : ""} ativo{pendingCount !== 1 ? "s" : ""}
          </span>
        </div>
      </article>

      {/* Credit Card (Swords - Avoid at all costs!) */}
      <article className={styles.card} aria-label="Gastos no cartão de crédito">
        <div className={`${styles.iconWrap} ${styles.iconDanger}`}>
          <Swords size={20} />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Uso do Cartão</span>
          <span className={`${styles.value} ${styles.valueDanger}`}>
            {formatCurrency(creditTotal)}
          </span>
          <span className={styles.sub}>
            {totalSpent > 0
              ? `${((creditTotal / totalSpent) * 100).toFixed(0)}% do dano sofrido`
              : "0% de dano"}
          </span>
        </div>
      </article>
    </div>
  );
}
