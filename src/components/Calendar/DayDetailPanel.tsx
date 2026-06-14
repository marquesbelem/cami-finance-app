"use client";

import { useEffect, useRef } from "react";
import { X, Plus, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { SlipWithStatus } from "@/lib/calendar";
import type { Slip } from "@/components/SlipList/SlipItem";
import styles from "./calendar.module.css";

interface DayDetailPanelProps {
  dateKey: string | null; // "YYYY-MM-DD" or null (closed)
  slips: SlipWithStatus[];
  toggling: Record<string, boolean>;
  onClose: () => void;
  onStatusToggle: (slip: Slip) => Promise<void>;
  onAddBill: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatPanelDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const label = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Sort order: pending → overdue → paid
function sortSlips(slips: SlipWithStatus[]): SlipWithStatus[] {
  const order = { pending: 0, overdue: 1, paid: 2 };
  return [...slips].sort(
    (a, b) => order[a.derivedStatus] - order[b.derivedStatus]
  );
}

export default function DayDetailPanel({
  dateKey,
  slips,
  toggling,
  onClose,
  onStatusToggle,
  onAddBill,
}: DayDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!dateKey) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    // Focus the close button when panel opens
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [dateKey, onClose]);

  if (!dateKey) return null;

  const sorted = sortSlips(slips);

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.panelBackdrop}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Boletos do dia ${formatPanelDate(dateKey)}`}
        className={styles.panel}
      >
        {/* Header */}
        <div className={styles.panelHeader}>
          <h2 className={styles.panelDate}>{formatPanelDate(dateKey)}</h2>
          <button
            ref={closeBtnRef}
            id={`panel-close-btn-${dateKey}`}
            className={styles.panelCloseBtn}
            onClick={onClose}
            aria-label="Fechar painel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slip list or empty state */}
        <div className={styles.panelSlipList}>
          {sorted.length === 0 ? (
            <div className={styles.panelEmpty}>
              <span className={styles.panelEmptyIcon}>📭</span>
              <p className={styles.panelEmptyText}>
                Nenhum boleto neste dia.
              </p>
              <button
                id={`panel-add-bill-${dateKey}`}
                className={styles.panelAddBtn}
                onClick={onAddBill}
                aria-label="Adicionar boleto para este dia"
              >
                <Plus size={16} />
                Adicionar Boleto
              </button>
            </div>
          ) : (
            sorted.map((slip, i) => {
              const isToggling = toggling[slip.id] ?? false;
              const isPaid = slip.derivedStatus === "paid";

              return (
                <div
                  key={slip.id}
                  className={styles.panelSlipRow}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Category swatch */}
                  <span
                    className={styles.categorySwatch}
                    style={{ background: slip.category.colorCode }}
                    aria-hidden="true"
                  />

                  {/* Info */}
                  <div className={styles.panelSlipInfo}>
                    <p className={styles.panelSlipTitle} title={slip.title}>
                      {slip.title}
                    </p>
                    <div className={styles.panelSlipMeta}>
                      <span className={styles.panelCategoryName}>
                        {slip.category.name}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`badge ${
                          slip.derivedStatus === "paid"
                            ? "badge-success"
                            : slip.derivedStatus === "overdue"
                              ? "badge-danger"
                              : "badge-warning"
                        }`}
                        style={{ animation: isToggling ? "pulseBadge 0.4s ease" : undefined }}
                      >
                        {slip.derivedStatus === "paid"
                          ? "Pago"
                          : slip.derivedStatus === "overdue"
                            ? "Vencido"
                            : "Pendente"}
                      </span>
                    </div>
                    <span className={styles.panelAmount}>
                      {formatCurrency(slip.amount)}
                    </span>
                  </div>

                  {/* Toggle button */}
                  <button
                    id={`panel-toggle-${slip.id}`}
                    className={`${styles.toggleBtn} ${isPaid ? styles.toggleBtnPaid : styles.toggleBtnPending} ${isToggling ? styles.toggleBtnLoading : ""}`}
                    onClick={() => onStatusToggle(slip)}
                    disabled={isToggling}
                    aria-label={
                      isToggling
                        ? "Atualizando status..."
                        : isPaid
                          ? "Marcar como Pendente"
                          : "Marcar como Pago"
                    }
                    title={isPaid ? "Marcar como Pendente" : "Marcar como Pago"}
                  >
                    {isToggling ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : isPaid ? (
                      <Clock size={12} />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    <span className="sr-only">
                      {isPaid ? "Pendente" : "Pago"}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — Add bill shortcut (when there are existing slips) */}
        {sorted.length > 0 && (
          <div className={styles.panelFooter}>
            <button
              id={`panel-footer-add-${dateKey}`}
              className={styles.panelAddBtn}
              onClick={onAddBill}
              aria-label="Adicionar novo boleto"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Plus size={16} />
              Adicionar Boleto
            </button>
          </div>
        )}
      </div>
    </>
  );
}
