import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchWhere, getReadBranchId, resolveWriteBranchId } from "@/lib/branch-access";

export async function GET() {
  const branchId = await getReadBranchId();
  const expenses = await prisma.expense.findMany({
    where: branchWhere(branchId),
    include: { branch: { select: { id: true, name: true } } },
    orderBy: { expenseDate: "desc" }
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const branchId = await resolveWriteBranchId(body.branchId);
  const expense = await prisma.expense.create({
    data: {
      branchId,
      category: body.category,
      title: body.title,
      amount: Number(body.amount || 0),
      expenseDate: new Date(body.expenseDate || Date.now()),
      vendor: body.vendor || null,
      note: body.note || null
    },
    include: { branch: { select: { id: true, name: true } } }
  });
  return NextResponse.json(expense, { status: 201 });
}
