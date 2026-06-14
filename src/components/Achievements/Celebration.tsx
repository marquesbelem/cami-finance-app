"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, X, Sparkles, Award, Wallet } from "lucide-react";
import styles from "./Celebration.module.css";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type?: "success" | "warning" | "danger" | "info" | "xp" | "levelup";
}

interface Props {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  salaryToCelebrate?: { amount: number; month: string } | null;
  onDismissSalary?: () => void;
}

// ── Toast Host & Salary Modal ──────────────────────────────────────────────────
export default function Celebration({
  toasts,
  onDismiss,
  salaryToCelebrate,
  onDismissSalary,
}: Props) {
  return (
    <>
      {/* Toasts list */}
      <div className={styles.host} aria-live="assertive" aria-atomic="false">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>

      {/* Salary Celebration Modal */}
      {salaryToCelebrate && (
        <div className={styles.salaryOverlay} role="dialog" aria-modal="true">
          {/* Confetti Rain Background */}
          <div className={styles.confettiRain}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className={styles.rainParticle}
                style={
                  {
                    "--delay": `${Math.random() * 5}s`,
                    "--left": `${Math.random() * 100}%`,
                    "--color": ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"][
                      Math.floor(Math.random() * 5)
                    ],
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div className={styles.salaryModal}>
            <div className={styles.salaryIconWrap}>
              <Wallet className={styles.salaryIcon} size={48} />
              <Sparkles className={styles.sparkleDecoration} size={24} />
            </div>

            <h2 className={styles.salaryTitle}>💰 Salário Validado!</h2>
            <p className={styles.salaryMessage}>
              Seu salário fixo agendado de{" "}
              <strong>
                {salaryToCelebrate.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>{" "}
              foi recebido e validado com sucesso para o mês de{" "}
              <strong>{salaryToCelebrate.month}</strong>!
            </p>
            <p className={styles.salarySubMessage}>
              Suas projeções de margem de lucro foram confirmadas retroativamente a 1º deste mês.
              Continue mantendo seus gastos sob controle!
            </p>

            <button
              onClick={onDismissSalary}
              className={styles.salaryClaimBtn}
              id="confirm-salary-celebration-btn"
            >
              Excelente! Continuar Minha Jornada
            </button>
          </div>
        </div>
      )}
    </>
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
    // Keep XP toasts visible for 3.5s, Levelups for 6s, others 5s
    const duration = toast.type === "levelup" ? 6000 : toast.type === "xp" ? 3500 : 5000;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, toast.type]);

  const getToastIcon = () => {
    if (toast.type === "levelup") return <Award size={22} className={styles.glowIcon} />;
    if (toast.type === "xp") return <Sparkles size={20} />;
    return <Trophy size={20} />;
  };

  return (
    <div
      className={`${styles.toast} ${styles[`toast_${toast.type ?? "success"}`]} ${
        exiting ? styles.exiting : ""
      }`}
      role="alert"
      aria-label={toast.title}
    >
      {/* Particle Explosion on render */}
      <div className={styles.particles} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={styles.particle}
            style={
              {
                "--i": i,
                "--color":
                  toast.type === "levelup"
                    ? "#a855f7"
                    : toast.type === "xp"
                    ? "#6366f1"
                    : "#f59e0b",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Icon */}
      <div className={styles.iconWrap}>{getToastIcon()}</div>

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

  const showXpToast = useCallback(
    (xpGained: number, message: string) => {
      addToast({
        title: `✨ +${xpGained} XP obtidos!`,
        message: message,
        type: "xp",
      });
    },
    [addToast]
  );

  const showLevelUpToast = useCallback(
    (newLevel: number) => {
      addToast({
        title: `🌟 LEVEL UP! Nível ${newLevel}`,
        message: "Você subiu de nível! Seus poderes de economia aumentaram!",
        type: "levelup",
      });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    celebrateAchievement,
    showXpToast,
    showLevelUpToast,
  };
}

