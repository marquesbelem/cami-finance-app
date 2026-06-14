"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Star, Zap, TrendingDown, Settings, Lock } from "lucide-react";
import styles from "./AchievementsPanel.module.css";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  conditionValue: number;
  level: number;
  isUnlocked: boolean;
  progressPercentage: number;
  unlockedAt: string | null;
}

interface UserStats {
  monthlyBudgetLimit: number;
  totalCreditLimit: number;
  currentStreakDays: number;
  level: number;
  xp: number;
  scheduledSalaryAmount: number;
  salaryPaymentDay: number;
}

interface Props {
  onAchievementUnlocked?: (title: string) => void;
  onSettingsSaved?: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  CARD_THRESHOLD: <TrendingDown size={16} />,
  SAVINGS: <Star size={16} />,
  STREAK: <Zap size={16} />,
};

const TRAIL_LABELS: Record<string, string> = {
  CARD_THRESHOLD: "💳 Trilha Redução de Cartão",
  STREAK: "🔥 Trilha Consistência (Sem Cartão)",
  SAVINGS: "📈 Trilha Margem de Lucro",
};

// RPG Titles based on user level
function getCharacterClass(level: number): string {
  if (level <= 2) return "Poupador Iniciante";
  if (level <= 4) return "Guerreiro do Débito";
  if (level <= 6) return "Guardião da Margem";
  if (level <= 9) return "Paladino das Finanças";
  return "Mestre da Riqueza";
}

// RPG Emojis/Avatars based on level
function getCharacterEmoji(level: number): string {
  if (level <= 2) return "🌱";
  if (level <= 4) return "🛡️";
  if (level <= 6) return "💰";
  if (level <= 9) return "✨";
  return "👑";
}

export default function AchievementsPanel({ onAchievementUnlocked, onSettingsSaved }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Settings form state
  const [budgetLimit, setBudgetLimit] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [paymentDay, setPaymentDay] = useState("");

  // Stable ref so interval callback always reads the latest achievements list
  const achievementsRef = useRef<Achievement[]>([]);
  achievementsRef.current = achievements;

  const loadData = useCallback(async () => {
    const [achRes, statsRes] = await Promise.all([
      fetch("/api/achievements"),
      fetch("/api/stats"),
    ]);
    const [achData, statsData] = await Promise.all([achRes.json(), statsRes.json()]);
    const prev = achievementsRef.current;
    setAchievements(achData);
    setStats(statsData);

    // Populate configuration defaults if loaded
    if (statsData) {
      setBudgetLimit(statsData.monthlyBudgetLimit.toString());
      setCreditLimit(statsData.totalCreditLimit.toString());
      setSalaryAmount(statsData.scheduledSalaryAmount.toString());
      setPaymentDay(statsData.salaryPaymentDay.toString());
    }

    // Fire notification for newly unlocked achievements
    if (onAchievementUnlocked) {
      for (const ach of achData as Achievement[]) {
        const was = prev.find((p) => p.id === ach.id);
        if (ach.isUnlocked && was && !was.isUnlocked) {
          onAchievementUnlocked(ach.title);
        }
      }
    }
  }, [onAchievementUnlocked]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, [loadData]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyBudgetLimit: (budgetLimit !== "" && !isNaN(parseFloat(budgetLimit))) ? parseFloat(budgetLimit) : undefined,
        totalCreditLimit: (creditLimit !== "" && !isNaN(parseFloat(creditLimit))) ? parseFloat(creditLimit) : undefined,
        scheduledSalaryAmount: (salaryAmount !== "" && !isNaN(parseFloat(salaryAmount))) ? parseFloat(salaryAmount) : undefined,
        salaryPaymentDay: (paymentDay !== "" && !isNaN(parseInt(paymentDay))) ? parseInt(paymentDay) : undefined,
      }),
    });
    setShowSettings(false);
    // Reload panel data to refresh local state
    loadData();
    // Notify parent to silently refresh dashboard budget values
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  }

  if (loading) {
    return (
      <aside className={styles.panel}>
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
        <div className={styles.skeleton} />
      </aside>
    );
  }

  const xpRequired = stats ? stats.level * 100 : 100;
  const xpPct = stats ? Math.min(100, (stats.xp / xpRequired) * 100) : 0;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const trails = ["CARD_THRESHOLD", "STREAK", "SAVINGS"];

  const isChainedLocked = (ach: Achievement) => {
    if (ach.level === 1) return false;
    const prev = achievements.find((a) => a.type === ach.type && a.level === ach.level - 1);
    return !prev?.isUnlocked;
  };

  return (
    <aside className={styles.panel} aria-label="Painel de RPG e conquistas">
      {/* ── RPG User Profile HUD ── */}
      {stats && (
        <section className={styles.rpgProfile}>
          <div className={styles.profileHeader}>
            <span className={styles.profileAvatar} role="img" aria-label="Avatar">
              {getCharacterEmoji(stats.level)}
            </span>
            <div className={styles.profileMeta}>
              <h3 className={styles.profileClass}>{getCharacterClass(stats.level)}</h3>
              <div className={styles.profileLevelRow}>
                <span className={styles.levelLabel}>Nível {stats.level}</span>
                <span className={styles.streakBadge}>🔥 {stats.currentStreakDays} dias sem cartão</span>
              </div>
            </div>
          </div>
          <div className={styles.xpProgressRow}>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
              <div className={styles.xpBarGloss} />
            </div>
            <span className={styles.xpLabel}>
              {stats.xp} / {xpRequired} XP
            </span>
          </div>
        </section>
      )}

      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleRow}>
          <Trophy size={18} className={styles.trophyIcon} />
          <h2 className={styles.panelTitle}>Árvores de Conquistas</h2>
          <span className={styles.badge}>
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            id="open-achievement-settings"
            className={styles.iconBtn}
            onClick={() => setShowSettings((v) => !v)}
            title="Configurar limites e salário"
            aria-label="Configurar limites de orçamento e salário"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && stats && (
        <form onSubmit={handleSaveSettings} className={styles.inlineForm}>
          <h3 className={styles.inlineTitle}>⚙ Configurações de RPG</h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.inlineLabel} htmlFor="budget-limit">
                Orçamento HP (%)
              </label>
              <input
                id="budget-limit"
                type="number"
                min="0"
                max="100"
                step="1"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className={styles.inlineInput}
              />
            </div>
            <div>
              <label className={styles.inlineLabel} htmlFor="credit-limit">
                Limite do Cartão (R$)
              </label>
              <input
                id="credit-limit"
                type="number"
                min="0"
                step="0.01"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className={styles.inlineInput}
              />
            </div>
            <div>
              <label className={styles.inlineLabel} htmlFor="salary-amount">
                Salário Agendado (R$)
              </label>
              <input
                id="salary-amount"
                type="number"
                min="0"
                step="0.01"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                className={styles.inlineInput}
              />
            </div>
            <div>
              <label className={styles.inlineLabel} htmlFor="payment-day">
                Dia do Pagamento (1-31)
              </label>
              <input
                id="payment-day"
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className={styles.inlineInput}
              />
            </div>
          </div>
          <button id="save-settings-btn" type="submit" className={styles.saveBtn}>
            Salvar Parâmetros
          </button>
        </form>
      )}

      {/* Chained Achievement Trails */}
      {trails.map((trailType) => {
        const trailAchievements = achievements
          .filter((a) => a.type === trailType)
          .sort((a, b) => a.level - b.level);

        return (
          <section key={trailType} className={styles.section}>
            <h3 className={styles.sectionTitle}>{TRAIL_LABELS[trailType]}</h3>
            <div className={styles.trailContainer}>
              {trailAchievements.map((ach) => {
                const locked = isChainedLocked(ach);
                return (
                  <AchievementCard key={ach.id} achievement={ach} isLocked={locked} />
                );
              })}
            </div>
          </section>
        );
      })}

      {achievements.length === 0 && (
        <p className={styles.empty}>Nenhuma conquista disponível no momento.</p>
      )}
    </aside>
  );
}

// ── Achievement Card sub-component ────────────────────────────────────────────
function AchievementCard({
  achievement: ach,
  isLocked,
}: {
  achievement: Achievement;
  isLocked: boolean;
}) {
  return (
    <article
      className={`${styles.achCard} ${ach.isUnlocked ? styles.achUnlocked : ""} ${
        isLocked ? styles.achChainLocked : ""
      }`}
      aria-label={`Conquista: ${ach.title}`}
    >
      <div className={styles.achHeader}>
        <div className={`${styles.achIcon} ${ach.isUnlocked ? styles.achIconUnlocked : ""}`}>
          {isLocked ? <Lock size={16} /> : TYPE_ICONS[ach.type] ?? <Trophy size={16} />}
        </div>
        <div className={styles.achMeta}>
          <div className={styles.titleRow}>
            <span className={styles.achTitle}>{ach.title}</span>
            <span className={styles.lvlBadge}>Nv.{ach.level}</span>
          </div>
          <span className={styles.achDesc}>{ach.description}</span>
        </div>
      </div>
      {!ach.isUnlocked && !isLocked && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${ach.progressPercentage}%` }}
            />
          </div>
          <span className={styles.progressLabel}>
            {ach.progressPercentage.toFixed(0)}%
          </span>
        </div>
      )}
      {ach.isUnlocked && ach.unlockedAt && (
        <span className={styles.unlockedDate}>
          ✓ Desbloqueado em {new Date(ach.unlockedAt).toLocaleDateString("pt-BR")}
        </span>
      )}
      {isLocked && <span className={styles.lockedLabel}>🔒 Bloqueado: Requer nível anterior</span>}
    </article>
  );
}
