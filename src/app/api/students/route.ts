import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchWhere, getReadBranchId, resolveWriteBranchId } from "@/lib/branch-access";

export async function GET() {
  const branchId = await getReadBranchId();
  const students = await prisma.student.findMany({
    where: branchWhere(branchId),
    include: { branch: { select: { id: true, name: true } }, assignedCounselor: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json();
  const branchId = await resolveWriteBranchId(body.branchId);
  const count = await prisma.student.count();
  const student = await prisma.student.create({
    data: {
      branchId,
      studentId: body.studentId || `PJLC-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || null,
      address: body.address,
      passportNumber: body.passportNumber || null,
      educationLevel: body.educationLevel,
      programTrack: body.programTrack || "LANGUAGE_AND_VISA",
      japaneseLevel: body.japaneseLevel,
      targetIntake: body.targetIntake,
      preferredCity: body.preferredCity,
      applicationStatus: body.applicationStatus,
      documents: { create: {} },
      admission: { create: { branchId, currentStage: body.applicationStatus } }
    },
    include: { branch: { select: { id: true, name: true } }, assignedCounselor: { select: { name: true } } }
  });
  return NextResponse.json(student, { status: 201 });
}
