import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Default Categories (System-Protected) ────────────────────────────────
  const categories = [
    { name: "Sem Categoria", colorCode: "#6b7280", iconRef: "FolderOpen", isSystemDefault: true },
    { name: "Moradia",       colorCode: "#f59e0b", iconRef: "Home",       isSystemDefault: true },
    { name: "Utilidades",    colorCode: "#3b82f6", iconRef: "Zap",        isSystemDefault: true },
    { name: "Alimentação",   colorCode: "#10b981", iconRef: "Utensils",   isSystemDefault: true },
    { name: "Lazer",         colorCode: "#8b5cf6", iconRef: "Music",      isSystemDefault: true },
    { name: "Cartão de Crédito", colorCode: "#ef4444", iconRef: "CreditCard", isSystemDefault: true },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { name: cat.name },
      update: { isSystemDefault: cat.isSystemDefault },
      create: cat,
    });
  }

  console.log(`✅ Seeded ${categories.length} system-default categories`);

  // ── Singleton UserStats ───────────────────────────────────────────────────
  await prisma.userStats.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      monthlyBudgetLimit: 2000.0,
      totalCreditLimit: 1000.0,
      currentStreakDays: 0,
    },
  });

  console.log("✅ Seeded UserStats singleton");

  // ── Default Achievements ──────────────────────────────────────────────────
  const achievements = [
    {
      title: "Econômico",
      description:
        "Mantenha o gasto no cartão de crédito abaixo de 20% do total mensal.",
      type: "CARD_THRESHOLD",
      conditionValue: 20.0,
    },
    {
      title: "Sem Cartão",
      description:
        "Pague todos os boletos do mês sem usar o cartão de crédito.",
      type: "STREAK",
      conditionValue: 30.0,
    },
    {
      title: "Poupador",
      description: "Gaste menos de 50% do seu limite mensal de orçamento.",
      type: "SAVINGS",
      conditionValue: 50.0,
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { title: ach.title },
      update: {},
      create: ach,
    });
  }

  console.log(`✅ Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
