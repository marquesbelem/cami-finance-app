import { PrismaClient, SlipStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database import...");
  const inputPath = path.resolve("prisma/data-export.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`Export file not found at ${inputPath}. Please run the export script first.`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(inputPath, "utf-8");
  const data = JSON.parse(fileContent);

  try {
    // 1. Create or retrieve the default user profile "Principal"
    console.log("Checking default user profile 'Principal'...");
    let user = await prisma.user.findUnique({
      where: { username: "Principal" },
    });

    if (!user) {
      console.log("Creating user profile 'Principal'...");
      user = await prisma.user.create({
        data: { username: "Principal" },
      });
    }

    // 2. Clean target database (except other users)
    console.log(`Cleaning existing records for user '${user.username}'...`);
    await prisma.paymentSlip.deleteMany({ where: { userId: user.id } });
    await prisma.category.deleteMany({ where: { userId: user.id } });
    await prisma.achievement.deleteMany({ where: { userId: user.id } });
    await prisma.userStats.deleteMany({ where: { id: user.id } });

    // 3. Import Categories
    console.log(`Importing ${data.categories.length} categories...`);
    for (const cat of data.categories) {
      // System default categories have no userId (they are shared/system default)
      if (cat.isSystemDefault) {
        // Check if system default category already exists
        const existing = await prisma.category.findFirst({
          where: { name: cat.name, userId: null },
        });

        if (existing) {
          await prisma.category.update({
            where: { id: existing.id },
            data: {
              colorCode: cat.colorCode,
              iconRef: cat.iconRef,
              isSystemDefault: true,
            },
          });
        } else {
          await prisma.category.create({
            data: {
              id: cat.id,
              name: cat.name,
              colorCode: cat.colorCode,
              iconRef: cat.iconRef,
              isSystemDefault: true,
              createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
            },
          });
        }
      } else {
        // User custom categories are linked to this user
        await prisma.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            colorCode: cat.colorCode,
            iconRef: cat.iconRef,
            isSystemDefault: false,
            userId: user.id,
            createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
          },
        });
      }
    }

    // 4. Import UserStats
    console.log(`Importing user stats...`);
    const oldStats = data.userStats && data.userStats[0];
    if (oldStats) {
      await prisma.userStats.create({
        data: {
          id: user.id,
          monthlyBudgetLimit: oldStats.monthlyBudgetLimit || 2000.0,
          totalCreditLimit: oldStats.totalCreditLimit || 1000.0,
          currentStreakDays: oldStats.currentStreakDays || 0,
        },
      });
    } else {
      // Default fallback
      await prisma.userStats.create({
        data: {
          id: user.id,
          monthlyBudgetLimit: 2000.0,
          totalCreditLimit: 1000.0,
          currentStreakDays: 0,
        },
      });
    }

    // 5. Import Achievements
    console.log(`Importing ${data.achievements.length} achievements...`);
    for (const ach of data.achievements) {
      await prisma.achievement.create({
        data: {
          id: ach.id,
          title: ach.title,
          description: ach.description,
          type: ach.type,
          conditionValue: ach.conditionValue,
          isUnlocked: ach.isUnlocked,
          progressPercentage: ach.progressPercentage,
          unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : null,
          userId: user.id,
        },
      });
    }

    // 6. Import PaymentSlips (mapping old string statuses to native enums)
    console.log(`Importing ${data.paymentSlips.length} payment slips...`);
    for (const slip of data.paymentSlips) {
      // Map "Paid" / "Pending" status strings to SlipStatus enums
      const status: SlipStatus =
        slip.status === "Paid" ? SlipStatus.PAGO : SlipStatus.PENDENTE;

      await prisma.paymentSlip.create({
        data: {
          id: slip.id,
          title: slip.title,
          amount: slip.amount,
          dueDate: new Date(slip.dueDate),
          status: status,
          isCreditCardPayment: slip.isCreditCardPayment,
          documentPath: slip.documentPath,
          createdAt: slip.createdAt ? new Date(slip.createdAt) : undefined,
          categoryId: slip.categoryId,
          userId: user.id,
        },
      });
    }

    console.log("Import completed successfully!");
  } catch (error) {
    console.error("Error importing to PostgreSQL:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
