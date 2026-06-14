import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stats = await prisma.userStats.findUnique({
      where: { id: userId },
    });

    if (!stats) {
      // Auto-create if missing
      stats = await prisma.userStats.create({
        data: {
          id: userId,
          monthlyBudgetLimit: 50.0,
          totalCreditLimit: 1000.0,
          currentStreakDays: 0,
          level: 1,
          xp: 0,
          scheduledSalaryAmount: 3000.0,
          salaryPaymentDay: 5,
        },
      });
    }

    // Salary validation logic (hybrid approach: projected from day 1, celebrated on payment day)
    let celebrateSalary = false;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentDay = now.getDate();

    if (
      stats.scheduledSalaryAmount > 0 &&
      currentDay >= stats.salaryPaymentDay &&
      stats.lastSalaryValidationMonth !== currentMonthStr
    ) {
      // Validate the salary and save to database
      stats = await prisma.userStats.update({
        where: { id: userId },
        data: { lastSalaryValidationMonth: currentMonthStr },
      });
      celebrateSalary = true;
    }

    return NextResponse.json({
      ...stats,
      celebrateSalary,
    });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// PUT /api/stats
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      monthlyBudgetLimit,
      totalCreditLimit,
      currentStreakDays,
      scheduledSalaryAmount,
      salaryPaymentDay,
    } = body;

    const updated = await prisma.userStats.upsert({
      where: { id: userId },
      update: {
        ...(monthlyBudgetLimit !== undefined && { monthlyBudgetLimit }),
        ...(totalCreditLimit !== undefined && { totalCreditLimit }),
        ...(currentStreakDays !== undefined && { currentStreakDays }),
        ...(scheduledSalaryAmount !== undefined && { scheduledSalaryAmount }),
        ...(salaryPaymentDay !== undefined && { salaryPaymentDay }),
      },
      create: {
        id: userId,
        monthlyBudgetLimit: monthlyBudgetLimit ?? 50.0,
        totalCreditLimit: totalCreditLimit ?? 1000,
        currentStreakDays: currentStreakDays ?? 0,
        scheduledSalaryAmount: scheduledSalaryAmount ?? 3000,
        salaryPaymentDay: salaryPaymentDay ?? 5,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/stats]", error);
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
