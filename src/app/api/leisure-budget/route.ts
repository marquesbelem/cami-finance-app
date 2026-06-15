import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leisure-budget?month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    // Fetch configured leisure budget
    const stats = await prisma.userStats.findUnique({
      where: { id: userId },
    });

    const budget = stats?.leisureBudget ?? 0;

    // If no budget configured, return zeroed state
    if (budget <= 0) {
      return NextResponse.json({
        budget: 0,
        spent: 0,
        remaining: 0,
        isOverBudget: false,
        percentUsed: 0,
        configured: false,
      });
    }

    // Build date filter for the month
    let dateFilter: any = {};
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      dateFilter = { gte: start, lt: end };
    }

    // Find all "Lazer" category IDs (system default + user-created with same name)
    const lazerCategories = await prisma.category.findMany({
      where: {
        name: "Lazer",
        OR: [{ userId: null }, { userId }],
      },
      select: { id: true },
    });
    const lazerIds = lazerCategories.map((c) => c.id);

    // Sum leisure spending
    const result = await prisma.paymentSlip.aggregate({
      where: {
        userId,
        categoryId: { in: lazerIds },
        ...(month ? { dueDate: dateFilter } : {}),
      },
      _sum: { amount: true },
    });

    const spent = result._sum.amount ?? 0;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

    return NextResponse.json({
      budget,
      spent,
      remaining,
      isOverBudget: remaining < 0,
      percentUsed,
      configured: true,
    });
  } catch (error) {
    console.error("[GET /api/leisure-budget]", error);
    return NextResponse.json(
      { error: "Falha ao calcular orçamento de lazer" },
      { status: 500 }
    );
  }
}
