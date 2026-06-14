import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    const cleanUsername = username?.trim();

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Nome de usuário é obrigatório." },
        { status: 400 }
      );
    }

    // 1. Search for existing user (exact match)
    let user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    // 2. If the user does not exist, create the profile and seed initial stats/achievements
    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: { username: cleanUsername },
        });

        // Initialize UserStats scoped to the new user ID
        await tx.userStats.create({
          data: {
            id: newUser.id,
            monthlyBudgetLimit: 50.0,
            totalCreditLimit: 1000.0,
            currentStreakDays: 0,
            level: 1,
            xp: 0,
            lastRegistrationDate: null,
            registrationStreak: 0,
            scheduledSalaryAmount: 3000.0,
            salaryPaymentDay: 5,
            lastSalaryValidationMonth: null,
          },
        });

        // Clone/Seed default achievements for the new user (9 chained achievements)
        const defaultAchievements = [
          // CARD_THRESHOLD
          {
            title: "Cartão sob Controle",
            description: "Mantenha o gasto no cartão de crédito abaixo de 40% do limite mensal.",
            type: "CARD_THRESHOLD",
            conditionValue: 40.0,
            level: 1,
            userId: newUser.id,
          },
          {
            title: "Uso Consciente",
            description: "Mantenha o gasto no cartão de crédito abaixo de 20% do limite mensal.",
            type: "CARD_THRESHOLD",
            conditionValue: 20.0,
            level: 2,
            userId: newUser.id,
          },
          {
            title: "Cartão Zero",
            description: "Evite totalmente o uso do cartão de crédito no mês (0% do limite).",
            type: "CARD_THRESHOLD",
            conditionValue: 0.0,
            level: 3,
            userId: newUser.id,
          },
          // STREAK
          {
            title: "Foco Inicial",
            description: "Fique 3 dias seguidos sem usar o cartão de crédito.",
            type: "STREAK",
            conditionValue: 3.0,
            level: 1,
            userId: newUser.id,
          },
          {
            title: "Hábito Saudável",
            description: "Fique 7 dias seguidos sem usar o cartão de crédito.",
            type: "STREAK",
            conditionValue: 7.0,
            level: 2,
            userId: newUser.id,
          },
          {
            title: "Mestre do Débito",
            description: "Fique 30 dias seguidos sem usar o cartão de crédito.",
            type: "STREAK",
            conditionValue: 30.0,
            level: 3,
            userId: newUser.id,
          },
          // SAVINGS
          {
            title: "Pé de Meia",
            description: "Guarde pelo menos 10% da sua receita mensal.",
            type: "SAVINGS",
            conditionValue: 10.0,
            level: 1,
            userId: newUser.id,
          },
          {
            title: "Investidor Iniciante",
            description: "Guarde pelo menos 50% da sua receita mensal.",
            type: "SAVINGS",
            conditionValue: 50.0,
            level: 2,
            userId: newUser.id,
          },
          {
            title: "Independência Financeira",
            description: "Guarde pelo menos 70% da sua receita mensal.",
            type: "SAVINGS",
            conditionValue: 70.0,
            level: 3,
            userId: newUser.id,
          },
        ];

        await tx.achievement.createMany({
          data: defaultAchievements,
        });

        return newUser;
      });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("[POST /api/auth]", error);
    return NextResponse.json(
      { error: "Falha ao processar autenticação." },
      { status: 500 }
    );
  }
}
