"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, X } from "lucide-react";
import styles from "./Celebration.module.css";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type?: "success" | "warning" | "danger" | "info";
}

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

// ── Toast Host ─────────────────────────────────────────────────────────────────
export default function Celebration({ toasts, onDismiss }: Props) {
  return (
    <div className={styles.host} aria-live="assertive" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Individual Toast ───────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 320);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[`toast_${toast.type ?? "success"}`]} ${exiting ? styles.exiting : ""}`}
      role="alert"
      aria-label={toast.title}
    >
      {/* Particles */}
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={styles.particle} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* Icon */}
      <div className={styles.iconWrap}>
        <Trophy size={20} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <strong className={styles.toastTitle}>{toast.title}</strong>
        <span className={styles.toastMsg}>{toast.message}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar} />

      {/* Dismiss */}
      <button
        id={`dismiss-toast-${toast.id}`}
        className={styles.dismissBtn}
        onClick={dismiss}
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── useToasts hook ─────────────────────────────────────────────────────────────
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const celebrateAchievement = useCallback(
    (title: string) => {
      addToast({
        title: "🏆 Conquista Desbloqueada!",
        message: title,
        type: "success",
      });
    },
    [addToast]
  );

  return { toasts, addToast, dismissToast, celebrateAchievement };
}
