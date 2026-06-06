import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CategoryWithCount } from "@/lib/types";

// ── Curated icon set (from research.md) ────────────────────────────────────
const VALID_ICONS = new Set([
  "Home", "ShoppingCart", "Zap", "Car", "Heart", "Utensils", "CreditCard",
  "Briefcase", "Plane", "Dumbbell", "GraduationCap", "Music", "Gift", "Tv",
  "Wifi", "Coffee", "Baby", "Dog", "Wrench", "Landmark", "Shirt", "Pill",
  "TreePine", "Star", "FolderOpen", "UtensilsCrossed", "Bus", "Bike",
]);

function isValidHex(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
}

// GET /api/categories — list all categories with slip count
export async function GET() {
  try {
    const categories: CategoryWithCount[] = await prisma.category.findMany({
      include: { _count: { select: { slips: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, colorCode, iconRef } = body as {
      name?: string;
      colorCode?: string;
      iconRef?: string;
    };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required and must be 50 characters or fewer." },
        { status: 400 }
      );
    }
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Category name is required and must be 50 characters or fewer." },
        { status: 400 }
      );
    }
    if (!colorCode || !isValidHex(colorCode)) {
      return NextResponse.json(
        { error: "A valid hex color code is required (e.g. #3b82f6)." },
        { status: 400 }
      );
    }
    if (!iconRef || !VALID_ICONS.has(iconRef)) {
      return NextResponse.json(
        { error: "A valid icon reference is required." },
        { status: 400 }
      );
    }

    // ── Case-insensitive uniqueness check ───────────────────────────────────
    const existing = await prisma.category.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 }
      );
    }

    // ── Create ──────────────────────────────────────────────────────────────
    const created = await prisma.category.create({
      data: { name: name.trim(), colorCode, iconRef },
      include: { _count: { select: { slips: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
