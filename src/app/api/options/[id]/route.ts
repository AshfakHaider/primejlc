import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const option = await prisma.crmOption.update({
    where: { id },
    data: {
      label: body.label,
      sortOrder: typeof body.sortOrder === "undefined" ? undefined : Number(body.sortOrder),
      isActive: body.isActive
    }
  });
  return NextResponse.json(option);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.crmOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
