import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const enrollment = await prisma.enrollment.upsert({
    where: { studentId_batchId: { studentId: body.studentId, batchId: id } },
    update: {
      feeStatus: body.feeStatus || undefined,
      progressPercent: typeof body.progressPercent === "undefined" ? undefined : Number(body.progressPercent),
      notes: body.notes || undefined
    },
    create: {
      studentId: body.studentId,
      batchId: id,
      feeStatus: body.feeStatus || "UNPAID",
      progressPercent: Number(body.progressPercent || 0),
      notes: body.notes || null
    },
    include: { student: true }
  });
  return NextResponse.json(enrollment, { status: 201 });
}
