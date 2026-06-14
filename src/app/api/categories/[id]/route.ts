import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Shared validation helpers ───────────────────────────────────────────────
const VALID_ICONS = new Set([
  "Home", "ShoppingCart", "Zap", "Car", "Heart", "Utensils", "CreditCard",
  "Briefcase", "Plane", "Dumbbell", "GraduationCap", "Music", "Gift", "Tv",
  "Wifi", "Coffee", "Baby", "Dog", "Wrench", "Landmark", "Shirt", "Pill",
  "TreePine", "Star", "FolderOpen", "UtensilsCrossed", "Bus", "Bike",
]);

function isValidHex(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
}

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/categories/[id] — update name, colorCode, or iconRef
export async function PUT(request: Request, context: RouteContext) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, colorCode, iconRef } = body as {
      name?: string;
      colorCode?: string;
      iconRef?: string;
    };

    // ── Verify existence and ownership ──────────────────────────────────────
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada ou não autorizada." }, { status: 404 });
    }

    // ── Validate provided fields ────────────────────────────────────────────
    if (name !== undefined) {
      if (!name.trim()) {
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
      // Case-insensitive uniqueness check excluding current record
      const conflict = await prisma.category.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          OR: [
            { userId: null },
            { userId },
          ],
          NOT: { id },
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Uma categoria com este nome já existe." },
          { status: 409 }
        );
      }
    }
    if (colorCode !== undefined && !isValidHex(colorCode)) {
      return NextResponse.json(
        { error: "Um código de cor hexadecimal válido é obrigatório (ex: #3b82f6)." },
        { status: 400 }
      );
    }
    if (iconRef !== undefined && !VALID_ICONS.has(iconRef)) {
      return NextResponse.json(
        { error: "Uma referência de ícone válida é obrigatória." },
        { status: 400 }
      );
    }

    // ── Apply update ────────────────────────────────────────────────────────
    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (colorCode !== undefined) updateData.colorCode = colorCode;
    if (iconRef !== undefined) updateData.iconRef = iconRef;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/categories/[id]]", error);
    return NextResponse.json({ error: "Falha ao atualizar categoria" }, { status: 500 });
  }
}

// DELETE /api/categories/[id] — delete category, reassign slips to "Sem Categoria"
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    // ── Verify existence and ownership ──────────────────────────────────────
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada ou não autorizada." }, { status: 404 });
    }

    // ── Block system-default deletion ───────────────────────────────────────
    if (category.isSystemDefault) {
      return NextResponse.json(
        { error: "Categorias padrão do sistema não podem ser excluídas." },
        { status: 403 }
      );
    }

    // ── Find the "Sem Categoria" fallback ───────────────────────────────────
    const fallback = await prisma.category.findFirst({
      where: { name: "Sem Categoria" },
    });
    if (!fallback) {
      return NextResponse.json(
        { error: "A categoria padrão 'Sem Categoria' está ausente. Por favor, execute o seed novamente." },
        { status: 500 }
      );
    }

    // ── Atomic transaction: reassign slips → delete category ────────────────
    await prisma.$transaction([
      prisma.paymentSlip.updateMany({
        where: { categoryId: id, userId },
        data: { categoryId: fallback.id },
      }),
      prisma.category.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error);
    return NextResponse.json({ error: "Falha ao excluir categoria" }, { status: 500 });
  }
}
