import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { recomputeAchievements } from "@/lib/achievements";

// PUT /api/slips/[id]  (multipart/form-data — all fields optional)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const existing = await prisma.paymentSlip.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slip not found" }, { status: 404 });
    }

    const title = (formData.get("title") as string) || existing.title;
    const rawAmount = formData.get("amount");
    const amount = rawAmount ? parseFloat(rawAmount as string) : existing.amount;
    const rawDueDate = formData.get("dueDate");
    const dueDate = rawDueDate
      ? new Date(rawDueDate as string)
      : existing.dueDate;
    const status = (formData.get("status") as string) || existing.status;
    const rawCredit = formData.get("isCreditCardPayment");
    const isCreditCardPayment =
      rawCredit !== null ? rawCredit === "true" : existing.isCreditCardPayment;
    const categoryId =
      (formData.get("categoryId") as string) || existing.categoryId;
    const file = formData.get("document") as File | null;

    let documentPath = existing.documentPath;
    if (file && file.size > 0) {
      documentPath = await saveUploadedFile(file);
    }

    const updated = await prisma.paymentSlip.update({
      where: { id },
      data: {
        title,
        amount,
        dueDate,
        status,
        isCreditCardPayment,
        categoryId,
        documentPath,
      },
      include: { category: true },
    });

    // Recompute achievements asynchronously after mutation
    recomputeAchievements().catch(console.error);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/slips/:id]", error);
    return NextResponse.json(
      { error: "Failed to update slip" },
      { status: 500 }
    );
  }
}

// DELETE /api/slips/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.paymentSlip.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slip not found" }, { status: 404 });
    }

    await prisma.paymentSlip.delete({ where: { id } });

    // Recompute achievements asynchronously after mutation
    recomputeAchievements().catch(console.error);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/slips/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete slip" },
      { status: 500 }
    );
  }
}
