import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.student.findMany({
    include: { assignedCounselor: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json();
  const count = await prisma.student.count();
  const student = await prisma.student.create({
    data: {
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
      admission: { create: { currentStage: body.applicationStatus } }
    },
    include: { assignedCounselor: { select: { name: true } } }
  });
  return NextResponse.json(student, { status: 201 });
}
