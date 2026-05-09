import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      category: body.category,
      title: body.title,
      amount: Number(body.amount || 0),
      expenseDate: body.expenseDate ? new Date(body.expenseDate) : undefined,
      vendor: body.vendor || null,
      note: body.note || null
    }
  });
  return NextResponse.json(expense);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
