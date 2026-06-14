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
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          colorCode: cat.colorCode,
          iconRef: cat.iconRef,
          isSystemDefault: cat.isSystemDefault,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name: cat.name,
          colorCode: cat.colorCode,
          iconRef: cat.iconRef,
          isSystemDefault: cat.isSystemDefault,
          userId: null,
        },
      });
    }
  }

  console.log(`✅ Seeded ${categories.length} system-default categories`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
