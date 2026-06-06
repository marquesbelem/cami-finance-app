"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Zap, TrendingDown, Plus, Settings } from "lucide-react";
import styles from "./AchievementsPanel.module.css";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  conditionValue: number;
  isUnlocked: boolean;
  progressPercentage: number;
  unlockedAt: string | null;
}

interface UserStats {
  monthlyBudgetLimit: number;
  totalCreditLimit: number;
  currentStreakDays: number;
}

interface Props {
  onAchievementUnlocked?: (title: string) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  CARD_THRESHOLD: <TrendingDown size={16} />,
  SAVINGS: <Star size={16} />,
  STREAK: <Zap size={16} />,
};

export default function AchievementsPanel({ onAchievementUnlocked }: Props) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // New achievement form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("CARD_THRESHOLD");
  const [newValue, setNewValue] = useState("");

  // Settings form
  const [budgetLimit, setBudgetLimit] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  async function loadData() {
    const [achRes, statsRes] = await Promise.all([
      fetch("/api/achievements"),
      fetch("/api/stats"),
    ]);
    const [achData, statsData] = await Promise.all([achRes.json(), statsRes.json()]);
    const prev = achievements;
    setAchievements(achData);
    setStats(statsData);
    // Fire notification for newly unlocked achievements
    if (onAchievementUnlocked) {
      for (const ach of achData as Achievement[]) {
        const was = prev.find((p) => p.id === ach.id);
        if (ach.isUnlocked && was && !was.isUnlocked) {
          onAchievementUnlocked(ach.title);
        }
      }
    }
  }

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
    // Refresh every 30 s
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateAchievement(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        type: newType,
        conditionValue: parseFloat(newValue),
      }),
    });
    setNewTitle(""); setNewDesc(""); setNewValue("");
    setShowNewForm(false);
    await loadData();
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyBudgetLimit: parseFloat(budgetLimit) || undefined,
        totalCreditLimit: parseFloat(creditLimit) || undefined,
      }),
    });
    setShowSettings(false);
    await loadData();
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

  const unlocked = achievements.filter((a) => a.isUnlocked);
  const locked = achievements.filter((a) => !a.isUnlocked);

  return (
    <aside className={styles.panel} aria-label="Painel de conquistas">
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleRow}>
          <Trophy size={18} className={styles.trophyIcon} />
          <h2 className={styles.panelTitle}>Conquistas</h2>
          <span className={styles.badge}>{unlocked.length}/{achievements.length}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            id="open-achievement-settings"
            className={styles.iconBtn}
            onClick={() => { setShowSettings((v) => !v); setShowNewForm(false); }}
            title="Configurar limites"
            aria-label="Configurar limites de orçamento"
          >
            <Settings size={16} />
          </button>
          <button
            id="add-achievement-btn"
            className={styles.iconBtn}
            onClick={() => { setShowNewForm((v) => !v); setShowSettings(false); }}
            title="Nova conquista"
            aria-label="Adicionar conquista personalizada"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && stats && (
        <form onSubmit={handleSaveSettings} className={styles.inlineForm}>
          <h3 className={styles.inlineTitle}>Limites de Orçamento</h3>
          <label className={styles.inlineLabel} htmlFor="budget-limit">
            Orçamento Mensal (R$)
          </label>
          <input
            id="budget-limit"
            type="number"
            min="0"
            step="0.01"
            defaultValue={stats.monthlyBudgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            className={styles.inlineInput}
          />
          <label className={styles.inlineLabel} htmlFor="credit-limit">
            Limite do Cartão (R$)
          </label>
          <input
            id="credit-limit"
            type="number"
            min="0"
            step="0.01"
            defaultValue={stats.totalCreditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            className={styles.inlineInput}
          />
          <button id="save-settings-btn" type="submit" className={styles.saveBtn}>
            Salvar Limites
          </button>
        </form>
      )}

      {/* New achievement form */}
      {showNewForm && (
        <form onSubmit={handleCreateAchievement} className={styles.inlineForm}>
          <h3 className={styles.inlineTitle}>Nova Conquista</h3>
          <input
            id="new-ach-title"
            type="text"
            placeholder="Título"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={styles.inlineInput}
            required
          />
          <input
            id="new-ach-desc"
            type="text"
            placeholder="Descrição"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className={styles.inlineInput}
            required
          />
          <select
            id="new-ach-type"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className={styles.inlineInput}
          >
            <option value="CARD_THRESHOLD">Limite de Cartão (%)</option>
            <option value="SAVINGS">Economia (% do orçamento)</option>
            <option value="STREAK">Sequência (dias)</option>
          </select>
          <input
            id="new-ach-value"
            type="number"
            min="0"
            step="0.1"
            placeholder="Valor alvo"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className={styles.inlineInput}
            required
          />
          <button id="save-achievement-btn" type="submit" className={styles.saveBtn}>
            Criar Conquista
          </button>
        </form>
      )}

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🏆 Conquistados</h3>
          {unlocked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </section>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🔒 Em Progresso</h3>
          {locked.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </section>
      )}

      {achievements.length === 0 && (
        <p className={styles.empty}>Nenhuma conquista ainda. Crie uma!</p>
      )}
    </aside>
  );
}

// ── Achievement Card sub-component ────────────────────────────────────────────
function AchievementCard({ achievement: ach }: { achievement: Achievement }) {
  return (
    <article
      className={`${styles.achCard} ${ach.isUnlocked ? styles.achUnlocked : ""}`}
      aria-label={`Conquista: ${ach.title}`}
    >
      <div className={styles.achHeader}>
        <div className={`${styles.achIcon} ${ach.isUnlocked ? styles.achIconUnlocked : ""}`}>
          {TYPE_ICONS[ach.type] ?? <Trophy size={16} />}
        </div>
        <div className={styles.achMeta}>
          <span className={styles.achTitle}>{ach.title}</span>
          <span className={styles.achDesc}>{ach.description}</span>
        </div>
      </div>
      {!ach.isUnlocked && (
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
          ✓ {new Date(ach.unlockedAt).toLocaleDateString("pt-BR")}
        </span>
      )}
    </article>
  );
}
