import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { recomputeAchievements } from "@/lib/achievements";

// GET /api/slips?month=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // e.g. "2026-06"

    let dateFilter = {};
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1); // exclusive
      dateFilter = { dueDate: { gte: start, lt: end } };
    }

    const slips = await prisma.paymentSlip.findMany({
      where: dateFilter,
      include: { category: true },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(slips);
  } catch (error) {
    console.error("[GET /api/slips]", error);
    return NextResponse.json(
      { error: "Failed to fetch slips" },
      { status: 500 }
    );
  }
}

// POST /api/slips  (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const status = formData.get("status") as string;
    const isCreditCardPayment =
      formData.get("isCreditCardPayment") === "true";
    const categoryId = formData.get("categoryId") as string;
    const file = formData.get("document") as File | null;

    // Validation
    if (!title || isNaN(amount) || amount <= 0 || !categoryId || !status) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    let documentPath: string | null = null;
    if (file && file.size > 0) {
      documentPath = await saveUploadedFile(file);
    }

    const slip = await prisma.paymentSlip.create({
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

    return NextResponse.json(slip, { status: 201 });
  } catch (error) {
    console.error("[POST /api/slips]", error);
    return NextResponse.json(
      { error: "Failed to create slip" },
      { status: 500 }
    );
  }
}
