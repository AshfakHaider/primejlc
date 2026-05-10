import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriteBranchId } from "@/lib/branch-access";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const total = Number(body.admissionFee || 0) + Number(body.courseFee || 0) + Number(body.serviceCharge || 0);
  const paid = Number(body.paidAmount || 0);
  const student = body.studentId ? await prisma.student.findUnique({ where: { id: body.studentId }, select: { branchId: true } }) : null;
  const branchId = typeof body.branchId === "undefined" ? undefined : (await resolveWriteBranchId(body.branchId)) ?? student?.branchId ?? null;
  const payment = await prisma.payment.update({
    where: { id },
    data: {
      branchId,
      receiptNo: body.receiptNo || undefined,
      studentId: body.studentId,
      admissionFee: Number(body.admissionFee || 0),
      courseFee: Number(body.courseFee || 0),
      serviceCharge: Number(body.serviceCharge || 0),
      paidAmount: paid,
      dueAmount: Math.max(total - paid, 0),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      method: body.method || "Cash",
      note: body.note || null
    },
    include: { branch: { select: { id: true, name: true } }, student: { select: { id: true, fullName: true, studentId: true } } }
  });
  return NextResponse.json(payment);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
