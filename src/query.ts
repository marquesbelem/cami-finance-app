import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "4b591fb5-4a40-49f8-a64f-d50154748da1"; // Principal
  console.log("Updating stats for Principal...");
  const updated = await prisma.userStats.update({
    where: { id: userId },
    data: {
      monthlyBudgetLimit: 12.0,
      scheduledSalaryAmount: 5000.0,
    },
  });
  console.log("Updated stats:", JSON.stringify(updated, null, 2));
}

main()
  .catch((e) => {
    console.error("UPDATE ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
