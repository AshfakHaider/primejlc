import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const course = await prisma.courseBatch.findUnique({
    where: { id },
    include: { enrollments: true }
  });

  if (!course) {
    return NextResponse.json({ message: "Batch not found" }, { status: 404 });
  }

  const session = await prisma.courseSession.create({
    data: {
      batchId: id,
      lessonNo: Number(body.lessonNo || course.completedLessons + 1),
      title: body.title || `Lesson ${Number(body.lessonNo || course.completedLessons + 1)}`,
      classDate: new Date(body.classDate || Date.now()),
      status: body.status || "COMPLETED",
      homework: body.homework || null,
      teacherNote: body.teacherNote || null,
      attendance: {
        create: course.enrollments.map((enrollment) => ({
          batchId: id,
          studentId: enrollment.studentId,
          date: new Date(body.classDate || Date.now()),
          present: true
        }))
      }
    },
    include: { attendance: true }
  });

  await prisma.courseBatch.update({
    where: { id },
    data: {
      completedLessons: Math.min(course.totalLessons, Math.max(course.completedLessons, session.lessonNo)),
      batchStatus: session.lessonNo >= course.totalLessons ? "COMPLETED" : "RUNNING"
    }
  });

  return NextResponse.json(session, { status: 201 });
}
