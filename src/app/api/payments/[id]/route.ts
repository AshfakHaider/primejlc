import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const total = Number(body.admissionFee || 0) + Number(body.courseFee || 0) + Number(body.serviceCharge || 0);
  const paid = Number(body.paidAmount || 0);
  const payment = await prisma.payment.update({
    where: { id },
    data: {
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
    include: { student: { select: { id: true, fullName: true, studentId: true } } }
  });
  return NextResponse.json(payment);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
