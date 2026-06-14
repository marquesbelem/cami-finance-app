import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/achievements
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId },
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
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      data: { title, description, type, conditionValue, userId },
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
