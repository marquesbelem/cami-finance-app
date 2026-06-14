import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting SQLite database export...");
  try {
    const categories = await prisma.category.findMany();
    const paymentSlips = await prisma.paymentSlip.findMany();
    const achievements = await prisma.achievement.findMany();
    const userStats = await prisma.userStats.findMany();

    const data = {
      categories,
      paymentSlips,
      achievements,
      userStats,
    };

    const outputPath = path.resolve("prisma/data-export.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Successfully exported data to ${outputPath}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Payment Slips: ${paymentSlips.length}`);
    console.log(`- Achievements: ${achievements.length}`);
    console.log(`- User Stats: ${userStats.length}`);
  } catch (error) {
    console.error("Error exporting SQLite database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
