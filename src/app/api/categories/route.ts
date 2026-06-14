import { NextRequest, NextResponse } from "next/server";
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
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const categories: CategoryWithCount[] = await prisma.category.findMany({
      where: {
        OR: [
          { userId: null },
          { userId },
        ],
      },
      include: {
        _count: {
          select: {
            slips: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json({ error: "Falha ao carregar categorias" }, { status: 500 });
  }
}

// POST /api/categories — create a new category
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, colorCode, iconRef } = body as {
      name?: string;
      colorCode?: string;
      iconRef?: string;
    };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "O nome da categoria é obrigatório e deve ter 50 caracteres ou menos." },
        { status: 400 }
      );
    }
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "O nome da categoria é obrigatório e deve ter 50 caracteres ou menos." },
        { status: 400 }
      );
    }
    if (!colorCode || !isValidHex(colorCode)) {
      return NextResponse.json(
        { error: "Um código de cor hexadecimal válido é obrigatório (ex: #3b82f6)." },
        { status: 400 }
      );
    }
    if (!iconRef || !VALID_ICONS.has(iconRef)) {
      return NextResponse.json(
        { error: "Uma referência de ícone válida é obrigatória." },
        { status: 400 }
      );
    }

    // ── Case-insensitive uniqueness check ───────────────────────────────────
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        OR: [
          { userId: null },
          { userId },
        ],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Uma categoria com este nome já existe." },
        { status: 409 }
      );
    }

    // ── Create ──────────────────────────────────────────────────────────────
    const created = await prisma.category.create({
      data: { name: name.trim(), colorCode, iconRef, userId },
      include: {
        _count: {
          select: {
            slips: {
              where: { userId },
            },
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json({ error: "Falha ao criar categoria" }, { status: 500 });
  }
}
