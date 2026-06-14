import { prisma } from "@/lib/prisma";

const DEFAULT_ACHIEVEMENTS = [
  // Trilha 1: CARD_THRESHOLD (Redução de uso de cartão)
  {
    title: "Cartão sob Controle",
    description: "Mantenha o gasto no cartão de crédito abaixo de 40% do limite mensal.",
    type: "CARD_THRESHOLD",
    conditionValue: 40.0,
    level: 1,
  },
  {
    title: "Uso Consciente",
    description: "Mantenha o gasto no cartão de crédito abaixo de 20% do limite mensal.",
    type: "CARD_THRESHOLD",
    conditionValue: 20.0,
    level: 2,
  },
  {
    title: "Cartão Zero",
    description: "Evite totalmente o uso do cartão de crédito no mês (0% do limite).",
    type: "CARD_THRESHOLD",
    conditionValue: 0.0,
    level: 3,
  },
  // Trilha 2: STREAK (Ficar dias seguidos sem usar o cartão)
  {
    title: "Foco Inicial",
    description: "Fique 3 dias seguidos sem usar o cartão de crédito.",
    type: "STREAK",
    conditionValue: 3.0,
    level: 1,
  },
  {
    title: "Hábito Saudável",
    description: "Fique 7 dias seguidos sem usar o cartão de crédito.",
    type: "STREAK",
    conditionValue: 7.0,
    level: 2,
  },
  {
    title: "Mestre do Débito",
    description: "Fique 30 dias seguidos sem usar o cartão de crédito.",
    type: "STREAK",
    conditionValue: 30.0,
    level: 3,
  },
  // Trilha 3: SAVINGS (Margem de lucro)
  {
    title: "Pé de Meia",
    description: "Guarde pelo menos 10% da sua receita mensal.",
    type: "SAVINGS",
    conditionValue: 10.0,
    level: 1,
  },
  {
    title: "Investidor Iniciante",
    description: "Guarde pelo menos 50% da sua receita mensal.",
    type: "SAVINGS",
    conditionValue: 50.0,
    level: 2,
  },
  {
    title: "Independência Financeira",
    description: "Guarde pelo menos 70% da sua receita mensal.",
    type: "SAVINGS",
    conditionValue: 70.0,
    level: 3,
  },
];

/**
 * Recomputes progress for all achievements based on the current month's slips.
 * Called after every slip create / update / delete mutation.
 */
export async function recomputeAchievements(userId: string): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 1. Ensure user has exactly the 9 achievements of the new trails
  const existing = await prisma.achievement.findMany({
    where: { userId },
  });

  const isOldOrMissing =
    existing.length !== 9 || !existing.some((a) => a.title === "Cartão sob Controle");

  if (isOldOrMissing) {
    await prisma.achievement.deleteMany({ where: { userId } });
    await prisma.achievement.createMany({
      data: DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, userId })),
    });
  }

  // 2. Fetch updated data
  const slips = await prisma.paymentSlip.findMany({
    where: {
      userId,
      dueDate: { gte: monthStart, lt: monthEnd },
    },
  });

  const stats = await prisma.userStats.findUnique({
    where: { id: userId },
  });

  if (!stats) return;

  const totalSpent = slips.reduce((sum, s) => sum + s.amount, 0);
  const creditSpent = slips
    .filter((s) => s.isCreditCardPayment)
    .reduce((sum, s) => sum + s.amount, 0);

  // Card Limit calculations
  const cardLimit = stats.totalCreditLimit > 0 ? stats.totalCreditLimit : 1000.0;
  const creditPct = (creditSpent / cardLimit) * 100;

  // Streak calculations: consecutive days without credit card payments (within last 30 days)
  let cardFreeStreak = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const checkDateStr = checkDate.toISOString().slice(0, 10);
    const hasCardPayment = slips.some((s) => {
      const sDate = new Date(s.dueDate).toISOString().slice(0, 10);
      return sDate === checkDateStr && s.isCreditCardPayment;
    });

    if (!hasCardPayment) {
      cardFreeStreak++;
    } else {
      break;
    }
  }

  // Update stats.currentStreakDays
  await prisma.userStats.update({
    where: { id: userId },
    data: { currentStreakDays: cardFreeStreak },
  });

  // Margem de Lucro calculations: hybrid revenue model
  const revenue = stats.scheduledSalaryAmount > 0 ? stats.scheduledSalaryAmount : 3000.0;
  const savings = revenue - totalSpent;
  const marginPct = revenue > 0 ? (savings / revenue) * 100 : 0;

  // 3. Fetch achievements (ordered by level to process chains sequentially)
  const userAchievements = await prisma.achievement.findMany({
    where: { userId },
    orderBy: { level: "asc" },
  });

  // Track if previous level of each type was unlocked
  const chainUnlocked: Record<string, boolean> = {
    CARD_THRESHOLD: true,
    STREAK: true,
    SAVINGS: true,
  };

  for (const ach of userAchievements) {
    let progress = 0;
    let unlocked = false;
    const isPrevUnlocked = chainUnlocked[ach.type];

    if (isPrevUnlocked) {
      switch (ach.type) {
        case "CARD_THRESHOLD": {
          // Goal: card utilization below target %
          if (creditPct <= ach.conditionValue) {
            progress = 100;
            unlocked = true;
          } else {
            // Exceeded limit: progress decreases based on how far we went over
            const excess = creditPct - ach.conditionValue;
            progress = Math.max(0, 100 - excess);
            unlocked = false;
          }
          break;
        }
        case "STREAK": {
          // Goal: streak of card-free days >= target
          if (cardFreeStreak >= ach.conditionValue) {
            progress = 100;
            unlocked = true;
          } else {
            progress = (cardFreeStreak / ach.conditionValue) * 100;
            unlocked = false;
          }
          break;
        }
        case "SAVINGS": {
          // Goal: profit margin >= target %
          if (marginPct >= ach.conditionValue) {
            progress = 100;
            unlocked = true;
          } else {
            progress = Math.max(0, (marginPct / ach.conditionValue) * 100);
            unlocked = false;
          }
          break;
        }
      }
    } else {
      // Encadeado: next level is locked if previous is not unlocked
      progress = 0;
      unlocked = false;
    }

    // Update chain status for subsequent levels
    chainUnlocked[ach.type] = unlocked;

    await prisma.achievement.update({
      where: { id: ach.id },
      data: {
        progressPercentage: Math.round(progress * 10) / 10,
        isUnlocked: unlocked,
        unlockedAt: unlocked && !ach.isUnlocked ? now : ach.unlockedAt,
      },
    });
  }
}

/**
 * Awards XP to a user and handles level-up logic.
 * Returns information about the XP gained, new level, and level-up occurrence.
 */
export async function awardXp(
  userId: string,
  xpAmount: number
): Promise<{
  xpGained: number;
  oldXp: number;
  newXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}> {
  const stats = await prisma.userStats.findUnique({
    where: { id: userId },
  });

  if (!stats) {
    throw new Error("User stats not found");
  }

  const oldXp = stats.xp;
  const oldLevel = stats.level;
  let newXp = oldXp + xpAmount;
  let newLevel = oldLevel;

  // Level Up logic: level L requires L * 100 XP to reach L+1
  while (newXp >= newLevel * 100) {
    newXp -= newLevel * 100;
    newLevel += 1;
  }

  await prisma.userStats.update({
    where: { id: stats.id },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });

  return {
    xpGained: xpAmount,
    oldXp,
    newXp,
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
  };
}

/**
 * Processes daily registration consistency.
 * Concedes +10 XP for registration, and +20 XP Daily Consistency Bonus if registered on consecutive days.
 * Returns XP details.
 */
export async function handleExpenseRegistrationXp(
  userId: string
): Promise<{
  xpGained: number;
  streak: number;
  bonusAwarded: boolean;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}> {
  const stats = await prisma.userStats.findUnique({
    where: { id: userId },
  });

  if (!stats) {
    throw new Error("User stats not found");
  }

  // Get local date key YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newStreak = stats.registrationStreak;
  let bonusAwarded = false;
  let xpGained = 10; // Base XP for registration

  if (stats.lastRegistrationDate === yesterdayStr) {
    newStreak += 1;
    xpGained += 20; // +20 XP Daily Consistency Bonus
    bonusAwarded = true;
  } else if (stats.lastRegistrationDate === todayStr) {
    // Already registered today: keep streak but don't double award bonus/streak increment
    // (Still give base +10 XP for the new expense)
  } else {
    // Streak broken
    newStreak = 1;
  }

  // Update user stats
  await prisma.userStats.update({
    where: { id: userId },
    data: {
      lastRegistrationDate: todayStr,
      registrationStreak: newStreak,
    },
  });

  const xpResult = await awardXp(userId, xpGained);

  return {
    xpGained,
    streak: newStreak,
    bonusAwarded,
    oldLevel: xpResult.oldLevel,
    newLevel: xpResult.newLevel,
    leveledUp: xpResult.leveledUp,
  };
}


