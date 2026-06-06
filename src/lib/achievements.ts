import { prisma } from "@/lib/prisma";

/**
 * Recomputes progress for all achievements based on the current month's slips.
 * Called after every slip create / update / delete mutation.
 */
export async function recomputeAchievements(): Promise<void> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Fetch current month's paid slips
  const slips = await prisma.paymentSlip.findMany({
    where: {
      dueDate: { gte: monthStart, lt: monthEnd },
    },
  });

  const stats = await prisma.userStats.findUnique({
    where: { id: "singleton" },
  });

  const totalSpent = slips.reduce((sum, s) => sum + s.amount, 0);
  const creditSpent = slips
    .filter((s) => s.isCreditCardPayment)
    .reduce((sum, s) => sum + s.amount, 0);
  const creditPct = totalSpent > 0 ? (creditSpent / totalSpent) * 100 : 0;
  const budgetUsedPct = stats
    ? (totalSpent / stats.monthlyBudgetLimit) * 100
    : 100;
  const hasAnyCardPayment = slips.some((s) => s.isCreditCardPayment);

  const achievements = await prisma.achievement.findMany();

  for (const ach of achievements) {
    let progress = 0;
    let unlocked = false;

    switch (ach.type) {
      case "CARD_THRESHOLD": {
        // Goal: keep card spending below conditionValue %
        if (totalSpent === 0) {
          progress = 100;
          unlocked = true;
        } else {
          const remaining = Math.max(0, ach.conditionValue - creditPct);
          progress = Math.min(100, (remaining / ach.conditionValue) * 100);
          unlocked = creditPct <= ach.conditionValue;
        }
        break;
      }
      case "SAVINGS": {
        // Goal: spend less than conditionValue % of budget
        progress = Math.min(
          100,
          Math.max(0, 100 - (budgetUsedPct / ach.conditionValue) * 100)
        );
        unlocked = budgetUsedPct < ach.conditionValue;
        break;
      }
      case "STREAK": {
        // Goal: no credit card payments for conditionValue consecutive days
        if (!hasAnyCardPayment) {
          // Increment streak (approximate: days elapsed in month)
          const today = now.getDate();
          progress = Math.min(100, (today / ach.conditionValue) * 100);
          unlocked = today >= ach.conditionValue;
        } else {
          progress = 0;
          unlocked = false;
        }
        break;
      }
    }

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
