import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchWhere, getReadBranchId, resolveWriteBranchId } from "@/lib/branch-access";

export async function GET() {
  const branchId = await getReadBranchId();
  const courses = await prisma.courseBatch.findMany({
    where: branchWhere(branchId),
    include: { branch: { select: { id: true, name: true } }, enrollments: { include: { student: true } }, attendance: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const branchId = await resolveWriteBranchId(body.branchId);
  const course = await prisma.courseBatch.create({
    data: {
      branchId,
      name: body.name,
      teacherName: body.teacherName,
      classSchedule: body.classSchedule,
      programTrack: body.programTrack || "LANGUAGE_PROGRAM",
      targetLevel: body.targetLevel || "N5",
      syllabusName: body.syllabusName || "JLPT/NAT Preparation",
      totalLessons: Number(body.totalLessons || 48),
      completedLessons: Number(body.completedLessons || 0),
      feeStatus: body.feeStatus,
      preparationStatus: body.preparationStatus,
      batchStatus: body.batchStatus || "PLANNED",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null
    },
    include: { branch: { select: { id: true, name: true } }, enrollments: { include: { student: true } }, attendance: true }
  });
  return NextResponse.json(course, { status: 201 });
}
