"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  GraduationCap,
  Plus,
  Search,
  TrendingUp,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { humanize } from "@/lib/utils";

type Option = { value: string; label: string };
type CrmOptions = Record<string, Option[]>;
type BranchOption = { id: string; name: string };
type StudentOption = { id: string; fullName: string; studentId: string; programTrack: string; japaneseLevel: string; branchId?: string | null };
type Enrollment = { student: { id: string; fullName: string; studentId: string; phone?: string }; feeStatus?: string; progressPercent?: number };
type Attendance = { studentId: string; present: boolean; date?: string | Date; note?: string | null };
type Session = {
  id: string;
  lessonNo: number;
  title: string;
  classDate: string | Date;
  status: string;
  homework?: string | null;
  teacherNote?: string | null;
  attendance: Attendance[];
};
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
  enrollments: Enrollment[];
  attendance: Attendance[];
  sessions?: Session[];
};

const emptyCourse: Course = {
  id: "",
  name: "",
  teacherName: "",
  classSchedule: "Sun, Tue, Thu - 7:00 PM",
  programTrack: "LANGUAGE_PROGRAM",
  targetLevel: "N5",
  syllabusName: "Minna no Nihongo + JLPT/NAT",
  totalLessons: 48,
  completedLessons: 0,
  feeStatus: "UNPAID",
  preparationStatus: "NOT_STARTED",
  batchStatus: "PLANNED",
  startDate: "",
  endDate: "",
  enrollments: [],
  attendance: [],
  sessions: []
};

export function CoursesWorkspace({ initialCourses, students, options, branches, defaultBranchId }: { initialCourses: Course[]; students: StudentOption[]; options: CrmOptions; branches: BranchOption[]; defaultBranchId?: string }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [selectedId, setSelectedId] = useState(initialCourses[0]?.id ?? "");
  const [mode, setMode] = useState<"closed" | "create" | "view" | "edit">("closed");
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const selectedCourse = courses.find((course) => course.id === selectedId) ?? courses[0] ?? null;
  const languageStudents = students.filter((student) => student.programTrack === "LANGUAGE_PROGRAM" || student.programTrack === "LANGUAGE_AND_VISA");
  const runningBatches = courses.filter((course) => course.batchStatus === "RUNNING").length;
  const averageProgress = courses.length ? Math.round(courses.reduce((sum, course) => sum + batchProgress(course), 0) / courses.length) : 0;

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesBranch = branchFilter === "ALL" || course.branchId === branchFilter;
      const matchesQuery = [course.name, course.teacherName, course.targetLevel, course.syllabusName, course.batchStatus, course.branch?.name]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesBranch && matchesQuery;
    });
  }, [branchFilter, courses, query]);

  const availableStudents = useMemo(() => {
    if (!selectedCourse) return languageStudents;
    const enrolledIds = new Set(selectedCourse.enrollments.map((item) => item.student.id));
    return languageStudents.filter((student) => !enrolledIds.has(student.id) && (!selectedCourse.branchId || !student.branchId || student.branchId === selectedCourse.branchId));
  }, [languageStudents, selectedCourse]);

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const course = await response.json();
      const normalized = { ...course, enrollments: [], attendance: [], sessions: [] };
      setCourses((current) => [normalized, ...current]);
      setSelectedId(course.id);
      router.push(`/courses/${course.id}`);
    }
  }

  async function saveBatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse) return;
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${selectedCourse.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const updated = await response.json();
      setCourses((current) => current.map((course) => (course.id === updated.id ? updated : course)));
      setMode("view");
    }
  }

  async function enrollStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse) return;
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const enrollment = await response.json();
      setCourses((current) =>
        current.map((course) =>
          course.id === selectedCourse.id
            ? { ...course, enrollments: [enrollment, ...course.enrollments.filter((item) => item.student.id !== enrollment.student.id)] }
            : course
        )
      );
      event.currentTarget.reset();
    }
  }

  async function recordSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse) return;
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/courses/${selectedCourse.id}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const session = await response.json();
      setCourses((current) =>
        current.map((course) =>
          course.id === selectedCourse.id
            ? {
                ...course,
                completedLessons: Math.max(course.completedLessons, session.lessonNo),
                sessions: [session, ...(course.sessions ?? [])],
                attendance: [...session.attendance, ...course.attendance]
              }
            : course
        )
      );
      event.currentTarget.reset();
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <ProgramMetric icon={GraduationCap} label="Language students" value={languageStudents.length} tone="primary" />
        <ProgramMetric icon={BookOpenCheck} label="Total batches" value={courses.length} tone="secondary" />
        <ProgramMetric icon={UsersRound} label="Running batches" value={runningBatches} tone="amber" />
        <ProgramMetric icon={TrendingUp} label="Avg progress" value={`${averageProgress}%`} tone="blue" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Batches</CardTitle>
              <CardDescription>Open a batch to manage students, class history, attendance, and owner-level progress.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredCourses.length} label="batches" />
              <Button onClick={() => setMode("create")}>
                <Plus className="h-4 w-4" />
                Create batch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search batch, instructor, level, status..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filter batches by branch">
              <option value="ALL">All branches</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </Select>
          </div>

          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id} className="cursor-pointer" onClick={() => router.push(`/courses/${course.id}`)}>
                    <TableCell>
                      <div className="font-medium">{course.name}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <TagChip>{course.targetLevel}</TagChip>
                        <TagChip>{course.syllabusName}</TagChip>
                      </div>
                    </TableCell>
                    <TableCell>{course.teacherName}</TableCell>
                    <TableCell><Badge variant="secondary">{course.branch?.name ?? "Unassigned"}</Badge></TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(course.startDate)}</div>
                      <div className="text-xs text-muted-foreground">{course.classSchedule}</div>
                    </TableCell>
                    <TableCell><CountMini value={course.enrollments.length} label="students" /></TableCell>
                    <TableCell>
                      <div className="min-w-32 space-y-1">
                        <Progress value={batchProgress(course)} />
                        <p className="text-xs text-muted-foreground">{batchProgress(course)}% · {course.completedLessons}/{course.totalLessons} lessons</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={course.batchStatus === "COMPLETED" ? "success" : "outline"}>{humanize(course.batchStatus)}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filteredCourses.map((course) => (
              <button key={course.id} className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:bg-muted/40" onClick={() => router.push(`/courses/${course.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{course.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TagChip>{course.targetLevel}</TagChip>
                      {course.branch?.name ? <TagChip>{course.branch.name}</TagChip> : null}
                      <TagChip>{course.syllabusName}</TagChip>
                    </div>
                  </div>
                  <Badge variant={course.batchStatus === "COMPLETED" ? "success" : "outline"}>{humanize(course.batchStatus)}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Instructor" value={course.teacherName} />
                  <InfoMini label="Start" value={formatDate(course.startDate)} />
                  <InfoMini label="Students" value={String(course.enrollments.length)} />
                </div>
                <div className="mt-4 space-y-1">
                  <Progress value={batchProgress(course)} />
                  <p className="text-xs text-muted-foreground">{batchProgress(course)}% progress</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {mode === "create" ? (
        <CreateBatchModal onClose={() => setMode("closed")}>
          <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">Create batch</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a new language batch with instructor, schedule, level, and progress plan.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMode("closed")} aria-label="Close create batch">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5">
            <BatchForm course={emptyCourse} options={options} branches={branches} defaultBranchId={defaultBranchId} onSubmit={createCourse} saving={saving} submitLabel="Create batch" />
          </div>
        </CreateBatchModal>
      ) : null}

    </div>
  );
}

function CreateBatchModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" aria-label="Close create batch overlay" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-lg border bg-card text-card-foreground shadow-soft">
        {children}
      </div>
    </div>
  );
}

export function BatchProfile({
  course,
  options,
  availableStudents,
  onEnroll,
  onRecordSession
}: {
  course: Course;
  options: CrmOptions;
  availableStudents: StudentOption[];
  onEnroll: (event: React.FormEvent<HTMLFormElement>) => void;
  onRecordSession: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [tab, setTab] = useState<"overview" | "students" | "classes">("overview");
  const nextLesson = Math.min(course.completedLessons + 1, course.totalLessons);
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "students", label: "Students" },
    { id: "classes", label: "Classes & attendance" }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${tab === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-5">
            <Detail icon={GraduationCap} label="Branch" value={course.branch?.name ?? "Unassigned"} />
            <Detail icon={CalendarDays} label="Starting date" value={formatDate(course.startDate)} />
            <Detail icon={CalendarDays} label="Class days" value={course.classSchedule} />
            <Detail icon={GraduationCap} label="Course type" value={humanize(course.programTrack)} />
            <Detail icon={BookOpenCheck} label="Instructor" value={course.teacherName} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batch progress</CardTitle>
                <CardDescription>{course.completedLessons}/{course.totalLessons} lessons completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={batchProgress(course)} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Progress" value={`${batchProgress(course)}%`} />
                  <InfoMini label="Preparation" value={humanize(course.preparationStatus)} />
                  <InfoMini label="Fee status" value={humanize(course.feeStatus)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Owner summary</CardTitle>
                <CardDescription>Fast read on batch health.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <InfoMini label="Assigned students" value={String(course.enrollments.length)} />
                <InfoMini label="Classes recorded" value={String(course.sessions?.length ?? 0)} />
                <InfoMini label="Target level" value={course.targetLevel} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "students" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign student</CardTitle>
              <CardDescription>Only unassigned language-program students appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-[1fr_160px_auto]" onSubmit={onEnroll}>
                <Select name="studentId" disabled={!availableStudents.length}>
                  {availableStudents.length ? availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>{student.fullName} · {student.japaneseLevel}</option>
                  )) : <option>No available language students</option>}
                </Select>
                <Select name="feeStatus">
                  {(options.feeStatus ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
                <Button variant="outline" disabled={!availableStudents.length}><UserPlus className="h-4 w-4" />Assign</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrolled students</CardTitle>
              <CardDescription>Performance and attendance for this batch only.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 lg:grid-cols-2">
                {course.enrollments.map((enrollment) => {
                  const stats = studentAttendance(course, enrollment.student.id);
                  return (
                    <div key={enrollment.student.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{enrollment.student.fullName}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <TagChip>{enrollment.student.studentId}</TagChip>
                            <TagChip>{humanize(enrollment.feeStatus || "UNPAID")}</TagChip>
                          </div>
                        </div>
                        <Badge variant={stats.rate >= 80 ? "success" : "warning"}>{stats.rate}% attendance</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <InfoMini label="Present" value={String(stats.present)} />
                        <InfoMini label="Absent" value={String(stats.absent)} />
                        <InfoMini label="Performance" value={`${enrollment.progressPercent ?? batchProgress(course)}%`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "classes" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record class</CardTitle>
              <CardDescription>Keep class history with attendance, homework, and teacher notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onRecordSession}>
                <div className="grid gap-4 lg:grid-cols-4">
                  <Field label="Lesson no." name="lessonNo" type="number" defaultValue={String(nextLesson)} />
                  <Field label="Class date" name="classDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                  <Field label="Topic" name="title" defaultValue={`Lesson ${nextLesson}`} />
                  <SelectField label="Status" name="status" options={[{ value: "COMPLETED", label: "Completed" }, { value: "SCHEDULED", label: "Scheduled" }, { value: "CANCELLED", label: "Cancelled" }]} defaultValue="COMPLETED" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="homework">Homework</Label>
                    <Textarea id="homework" name="homework" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherNote">Teacher note</Label>
                    <Textarea id="teacherNote" name="teacherNote" />
                  </div>
                </div>
                <Button className="w-fit"><ClipboardList className="h-4 w-4" />Save class history</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class history</CardTitle>
              <CardDescription>Owner view of completed classes, attendance health, homework, and teacher notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(course.sessions ?? []).length ? (course.sessions ?? []).map((session) => {
                const present = session.attendance.filter((item) => item.present).length;
                const total = session.attendance.length;
                return (
                  <div key={session.id} className="rounded-lg border p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Lesson {session.lessonNo}</Badge>
                          <Badge variant={session.status === "COMPLETED" ? "success" : "outline"}>{humanize(session.status)}</Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(session.classDate)}</span>
                        </div>
                        <p className="mt-2 font-semibold">{session.title}</p>
                        {session.homework ? <p className="mt-1 text-sm text-muted-foreground">Homework: {session.homework}</p> : null}
                        {session.teacherNote ? <p className="mt-1 text-sm text-muted-foreground">Note: {session.teacherNote}</p> : null}
                      </div>
                      <div className="rounded-md bg-muted/45 p-3 text-sm">
                        <p className="font-semibold">{present}/{total || course.enrollments.length}</p>
                        <p className="text-xs text-muted-foreground">present</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">No class history recorded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export function BatchForm({ course, options, branches = [], defaultBranchId, onSubmit, saving, submitLabel }: { course: Course; options: CrmOptions; branches?: BranchOption[]; defaultBranchId?: string; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        {branches.length ? <SelectField label="Branch" name="branchId" options={branches.map((branch) => ({ value: branch.id, label: branch.name }))} defaultValue={course.branchId || defaultBranchId} /> : null}
        <Field label="Batch name" name="name" defaultValue={course.name} required />
        <Field label="Course / syllabus name" name="syllabusName" defaultValue={course.syllabusName} required />
        <Field label="Instructor name" name="teacherName" defaultValue={course.teacherName} required />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Course type" name="programTrack" options={options.programTrack} defaultValue={course.programTrack} />
        <SelectField label="Target level" name="targetLevel" options={options.japaneseLevel} defaultValue={course.targetLevel} />
        <Field label="Class days / schedule" name="classSchedule" defaultValue={course.classSchedule} required />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <Field label="Starting date" name="startDate" type="date" defaultValue={dateInput(course.startDate)} />
        <Field label="Ending date" name="endDate" type="date" defaultValue={dateInput(course.endDate)} />
        <Field label="Total lessons" name="totalLessons" type="number" defaultValue={String(course.totalLessons)} required />
        <Field label="Completed lessons" name="completedLessons" type="number" defaultValue={String(course.completedLessons)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Fee status" name="feeStatus" options={options.feeStatus} defaultValue={course.feeStatus} />
        <SelectField label="Batch status" name="batchStatus" options={options.batchStatus} defaultValue={course.batchStatus} />
        <SelectField label="JLPT/NAT prep" name="preparationStatus" options={options.preparationStatus} defaultValue={course.preparationStatus} />
      </div>
      <Button className="w-fit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
    </form>
  );
}

function ProgramMetric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: React.ReactNode; tone: "primary" | "secondary" | "amber" | "blue" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300"
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-full border bg-muted/60 px-3 text-sm font-semibold">
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-xs text-secondary-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function CountMini({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/60 px-2.5 py-1 text-xs font-medium">
      <strong>{value}</strong>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-muted/45 p-3">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm">{value}</p>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "Not set"}</p>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function SelectField({ label, name, options = [], defaultValue }: { label: string; name: string; options?: Option[]; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
    </div>
  );
}

function batchProgress(course: Course) {
  return Math.min(100, Math.round((course.completedLessons / Math.max(course.totalLessons, 1)) * 100));
}

function studentAttendance(course: Course, studentId: string) {
  const rows = course.attendance.filter((item) => item.studentId === studentId);
  const present = rows.filter((item) => item.present).length;
  const absent = rows.filter((item) => !item.present).length;
  const rate = rows.length ? Math.round((present / rows.length) * 100) : 0;
  return { present, absent, rate };
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { timeZone: "UTC" });
}

function dateInput(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
