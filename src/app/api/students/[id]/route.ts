import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriteBranchId } from "@/lib/branch-access";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const branchId = typeof body.branchId === "undefined" ? undefined : await resolveWriteBranchId(body.branchId);
  const student = await prisma.student.update({
    where: { id },
    data: {
      branchId,
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
      admission: { update: { branchId, currentStage: body.applicationStatus } }
    },
    include: { branch: { select: { id: true, name: true } }, assignedCounselor: { select: { name: true } } }
  });
  return NextResponse.json(student);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
