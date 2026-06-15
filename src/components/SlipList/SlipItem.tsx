"use client";

import { useState } from "react";
import { Pencil, Trash2, FileText, CreditCard, AlertCircle, CheckCircle2, Clock, Repeat } from "lucide-react";
import styles from "./SlipItem.module.css";

interface Category {
  id: string;
  name: string;
  colorCode: string;
  iconRef: string;
}

export interface Slip {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  isCreditCardPayment: boolean;
  isRecurring: boolean;
  categoryId: string;
  documentPath: string | null;
  category: Category;
}

interface Props {
  slip: Slip;
  onEdit: (slip: Slip) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (slip: Slip) => void;
}

function getSlipState(slip: Slip): "paid" | "overdue" | "pending" {
  if (slip.status === "PAGO") return "paid";
  const due = new Date(slip.dueDate);
  if (due < new Date()) return "overdue";
  return "pending";
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function SlipItem({ slip, onEdit, onDelete, onStatusToggle }: Props) {
  const [confirming, setConfirming] = useState(false);
  const state = getSlipState(slip);

  function handleDeleteClick() {
    if (confirming) {
      onDelete(slip.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      // Auto-cancel confirmation after 3 s
      setTimeout(() => setConfirming(false), 3000);
    }
  }

  const StateIcon =
    state === "paid"
      ? CheckCircle2
      : state === "overdue"
        ? AlertCircle
        : Clock;

  return (
    <article
      className={`${styles.item} ${styles[`state_${state}`]}`}
      aria-label={`Despesa: ${slip.title}`}
    >
      {/* Color accent bar */}
      <span
        className={styles.colorBar}
        style={{ background: slip.category.colorCode }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className={styles.body}>
        {/* Top row */}
        <div className={styles.topRow}>
          <div className={styles.titleRow}>
            <StateIcon
              size={16}
              className={`${styles.stateIcon} ${styles[`stateIcon_${state}`]}`}
              aria-hidden="true"
            />
            <h3 className={styles.title}>{slip.title}</h3>
            {slip.isCreditCardPayment && (
              <span className={styles.creditBadge} title="Cartão de Crédito">
                <CreditCard size={12} />
              </span>
            )}
            {slip.isRecurring && (
              <span className={styles.recurringBadge} title="Despesa Recorrente">
                <Repeat size={12} />
              </span>
            )}
          </div>
          <span className={styles.amount}>{formatCurrency(slip.amount)}</span>
        </div>

        {/* Meta row */}
        <div className={styles.metaRow}>
          <span
            className={styles.categoryTag}
            style={{
              background: `${slip.category.colorCode}22`,
              color: slip.category.colorCode,
              borderColor: `${slip.category.colorCode}44`,
            }}
          >
            {slip.category.name}
          </span>

          <span className={styles.dueDate}>
            Vence {formatDate(slip.dueDate)}
          </span>

          {slip.documentPath && (
            <a
              href={slip.documentPath}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docLink}
              title="Ver documento anexo"
              id={`doc-link-${slip.id}`}
            >
              <FileText size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Status toggle */}
        <button
          id={`toggle-status-${slip.id}`}
          className={`${styles.actionBtn} ${state === "paid" ? styles.paidBtn : styles.pendingBtn}`}
          onClick={() => onStatusToggle(slip)}
          title={state === "paid" ? "Marcar como pendente" : "Marcar como pago"}
          aria-label={state === "paid" ? "Marcar como pendente" : "Marcar como pago"}
        >
          {state === "paid" ? <Clock size={15} /> : <CheckCircle2 size={15} />}
        </button>

        <button
          id={`edit-slip-${slip.id}`}
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={() => onEdit(slip)}
          title="Editar despesa"
          aria-label={`Editar ${slip.title}`}
        >
          <Pencil size={15} />
        </button>

        <button
          id={`delete-slip-${slip.id}`}
          className={`${styles.actionBtn} ${confirming ? styles.deleteConfirm : styles.deleteBtn}`}
          onClick={handleDeleteClick}
          title={confirming ? "Clique novamente para confirmar" : "Excluir despesa"}
          aria-label={confirming ? "Confirmar exclusão" : `Excluir ${slip.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
