import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const student = await prisma.student.update({
    where: { id },
    data: {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      address: body.address,
      passportNumber: body.passportNumber || null,
      educationLevel: body.educationLevel,
      programTrack: body.programTrack,
      japaneseLevel: body.japaneseLevel,
      targetIntake: body.targetIntake,
      preferredCity: body.preferredCity,
      applicationStatus: body.applicationStatus,
      admission: { update: { currentStage: body.applicationStatus } }
    },
    include: { assignedCounselor: { select: { name: true } } }
  });
  return NextResponse.json(student);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
