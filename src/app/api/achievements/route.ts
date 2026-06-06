import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/achievements
export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ isUnlocked: "desc" }, { progressPercentage: "desc" }],
    });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("[GET /api/achievements]", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// POST /api/achievements  — create a custom user-defined achievement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, conditionValue } = body;

    if (!title || !description || !type || conditionValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["STREAK", "CARD_THRESHOLD", "SAVINGS"].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "STREAK", "CARD_THRESHOLD", or "SAVINGS"' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: { title, description, type, conditionValue },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error("[POST /api/achievements]", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 }
    );
  }
}
