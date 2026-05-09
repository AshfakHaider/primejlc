import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { expenseDate: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const expense = await prisma.expense.create({
    data: {
      category: body.category,
      title: body.title,
      amount: Number(body.amount || 0),
      expenseDate: new Date(body.expenseDate || Date.now()),
      vendor: body.vendor || null,
      note: body.note || null
    }
  });
  return NextResponse.json(expense, { status: 201 });
}
