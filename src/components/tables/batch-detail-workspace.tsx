"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchForm, BatchProfile } from "@/components/tables/courses-workspace";
import { humanize } from "@/lib/utils";

type Option = { value: string; label: string };
type CrmOptions = Record<string, Option[]>;
type BranchOption = { id: string; name: string };
type StudentOption = { id: string; fullName: string; studentId: string; programTrack: string; japaneseLevel: string; branchId?: string | null };
type Course = {
  id: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  name: string;
  teacherName: string;
  classSchedule: string;
  programTrack: string;
  targetLevel: string;
  syllabusName: string;
  totalLessons: number;
  completedLessons: number;
  feeStatus: string;
  preparationStatus: string;
  batchStatus: string;
  startDate?: string | null;
  endDate?: string | null;
  enrollments: { student: { id: string; fullName: string; studentId: string; phone?: string }; feeStatus?: string; progressPercent?: number }[];
  attendance: { studentId: string; present: boolean; date?: string | Date; note?: string | null }[];
  sessions?: {
    id: string;
    lessonNo: number;
    title: string;
    classDate: string | Date;
    status: string;
    homework?: string | null;
    teacherNote?: string | null;
    attendance: { studentId: string; present: boolean; date?: string | Date; note?: string | null }[];
  }[];
};

export function BatchDetailWorkspace({ initialCourse, students, options, branches, defaultBranchId }: { initialCourse: Course; students: StudentOption[]; options: CrmOptions; branches: BranchOption[]; defaultBranchId?: string }) {
  const [course, setCourse] = useState(initialCourse);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const languageStudents = students.filter(
    (student) =>
      (student.programTrack === "LANGUAGE_PROGRAM" || student.programTrack === "LANGUAGE_AND_VISA") &&
      (!course.branchId || !student.branchId || student.branchId === course.branchId)
  );
  const availableStudents = useMemo(() => {
    const enrolledIds = new Set(course.enrollments.map((item) => item.student.id));
    return languageStudents.filter((student) => !enrolledIds.has(student.id));
  }, [course.enrollments, languageStudents]);

  async function saveBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      setCourse(await response.json());
      setEditing(false);
    }
  }

  async function enrollStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${course.id}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const enrollment = await response.json();
      setCourse((current) => ({
        ...current,
        enrollments: [enrollment, ...current.enrollments.filter((item) => item.student.id !== enrollment.student.id)]
      }));
      event.currentTarget.reset();
    }
  }

  async function recordSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${course.id}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const session = await response.json();
      setCourse((current) => ({
        ...current,
        completedLessons: Math.max(current.completedLessons, session.lessonNo),
        sessions: [session, ...(current.sessions ?? [])],
        attendance: [...session.attendance, ...current.attendance]
      }));
      event.currentTarget.reset();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
              Back to batches
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{course.name}</h1>
            <Badge variant={course.batchStatus === "COMPLETED" ? "success" : "outline"}>{humanize(course.batchStatus)}</Badge>
            <Badge variant="secondary">{course.targetLevel}</Badge>
            {course.branch?.name ? <Badge variant="outline">{course.branch.name}</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{course.syllabusName} · {course.teacherName} · {course.classSchedule}</p>
        </div>
        <Button variant={editing ? "ghost" : "outline"} onClick={() => setEditing((current) => !current)}>
          {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {editing ? "Cancel edit" : "Edit batch"}
        </Button>
      </div>

      {editing ? (
        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle>Edit batch</CardTitle>
            <CardDescription>Update batch setup, schedule, instructor, progress plan, and status.</CardDescription>
          </CardHeader>
          <CardContent>
            <BatchForm course={course} options={options} branches={branches} defaultBranchId={defaultBranchId} onSubmit={saveBatch} saving={saving} submitLabel="Save batch" />
          </CardContent>
        </Card>
      ) : (
        <BatchProfile
          course={course}
          options={options}
          availableStudents={availableStudents}
          onEnroll={enrollStudent}
          onRecordSession={recordSession}
        />
      )}
    </div>
  );
}
