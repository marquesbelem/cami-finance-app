import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats
export async function GET() {
  try {
    const stats = await prisma.userStats.findUnique({
      where: { id: "singleton" },
    });

    if (!stats) {
      // Auto-create if missing
      const created = await prisma.userStats.create({
        data: { id: "singleton" },
      });
      return NextResponse.json(created);
    }

    return NextResponse.json(stats);
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
    const body = await request.json();
    const { monthlyBudgetLimit, totalCreditLimit, currentStreakDays } = body;

    const updated = await prisma.userStats.upsert({
      where: { id: "singleton" },
      update: {
        ...(monthlyBudgetLimit !== undefined && { monthlyBudgetLimit }),
        ...(totalCreditLimit !== undefined && { totalCreditLimit }),
        ...(currentStreakDays !== undefined && { currentStreakDays }),
      },
      create: {
        id: "singleton",
        monthlyBudgetLimit: monthlyBudgetLimit ?? 2000,
        totalCreditLimit: totalCreditLimit ?? 1000,
        currentStreakDays: currentStreakDays ?? 0,
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
