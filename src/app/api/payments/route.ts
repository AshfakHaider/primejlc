import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.payment.findMany({ include: { student: true }, orderBy: { paymentDate: "desc" } });
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const total = Number(body.admissionFee || 0) + Number(body.courseFee || 0) + Number(body.serviceCharge || 0);
  const paid = Number(body.paidAmount || 0);
  const count = await prisma.payment.count();
  const payment = await prisma.payment.create({
    data: {
      receiptNo: body.receiptNo || `MR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      studentId: body.studentId,
      admissionFee: Number(body.admissionFee || 0),
      courseFee: Number(body.courseFee || 0),
      serviceCharge: Number(body.serviceCharge || 0),
      paidAmount: paid,
      dueAmount: Math.max(total - paid, 0),
      paymentDate: new Date(body.paymentDate || Date.now()),
      method: body.method || "Cash",
      note: body.note || null
    },
    include: { student: true }
  });
  return NextResponse.json(payment, { status: 201 });
}
