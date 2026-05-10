import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriteBranchId } from "@/lib/branch-access";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const branchId = typeof body.branchId === "undefined" ? undefined : await resolveWriteBranchId(body.branchId);
  const course = await prisma.courseBatch.update({
    where: { id },
    data: {
      branchId,
      name: body.name,
      teacherName: body.teacherName,
      classSchedule: body.classSchedule,
      programTrack: body.programTrack,
      targetLevel: body.targetLevel,
      syllabusName: body.syllabusName,
      totalLessons: typeof body.totalLessons === "undefined" ? undefined : Number(body.totalLessons),
      completedLessons: typeof body.completedLessons === "undefined" ? undefined : Number(body.completedLessons),
      feeStatus: body.feeStatus,
      preparationStatus: body.preparationStatus,
      batchStatus: body.batchStatus,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined
    },
    include: { branch: { select: { id: true, name: true } }, enrollments: { include: { student: true } }, attendance: true }
  });
  return NextResponse.json(course);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.courseBatch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
