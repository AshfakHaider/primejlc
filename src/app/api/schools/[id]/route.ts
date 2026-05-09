import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const school = await prisma.school.update({
    where: { id },
    data: {
      name: body.name,
      cityPrefecture: body.cityPrefecture,
      intakeAvailability: Array.isArray(body.intakeAvailability) ? body.intakeAvailability : [body.intakeAvailability],
      tuitionFee: typeof body.tuitionFee === "undefined" ? undefined : Number(body.tuitionFee),
      applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
      contactEmail: body.contactEmail,
      partnerStatus: body.partnerStatus,
      notes: body.notes || null
    }
  });
  return NextResponse.json(school);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.school.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
