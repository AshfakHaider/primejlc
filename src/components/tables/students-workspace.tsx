"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Edit3, Mail, MapPin, Phone, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { humanize } from "@/lib/utils";

type Student = {
  id: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  studentId: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address: string;
  passportNumber?: string | null;
  educationLevel: string;
  programTrack: string;
  japaneseLevel: string;
  targetIntake: string;
  preferredCity: string;
  applicationStatus: string;
  assignedCounselor?: { name: string } | null;
};

type Option = { value: string; label: string };
type CrmOptions = Record<string, Option[]>;
type BranchOption = { id: string; name: string };

const emptyStudent: Student = {
  id: "",
  studentId: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  passportNumber: "",
  educationLevel: "HSC",
  programTrack: "LANGUAGE_AND_VISA",
  japaneseLevel: "BEGINNER",
  targetIntake: "OCTOBER",
  preferredCity: "TOKYO",
  applicationStatus: "LEAD"
};

export function StudentsWorkspace({ initialStudents, options, branches, defaultBranchId }: { initialStudents: Student[]; options: CrmOptions; branches: BranchOption[]; defaultBranchId?: string }) {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [mode, setMode] = useState<"closed" | "create" | "view" | "edit">("closed");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(initialStudents[0] ?? null);
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery = [student.fullName, student.studentId, student.phone, student.email, student.passportNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = filter === "ALL" || student.applicationStatus === filter;
      const matchesBranch = branchFilter === "ALL" || student.branchId === branchFilter;
      return matchesQuery && matchesFilter && matchesBranch;
    });
  }, [branchFilter, students, query, filter]);

  async function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const editing = mode === "edit" && selectedStudent?.id;
    const response = await fetch(editing ? `/api/students/${selectedStudent.id}` : "/api/students", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const student = await response.json();
      setStudents((current) => (editing ? current.map((item) => (item.id === student.id ? student : item)) : [student, ...current]));
      setSelectedStudent(student);
      setMode("view");
      event.currentTarget.reset();
    }
  }

  async function updateStatus(student: Student, applicationStatus: string) {
    const response = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...student, applicationStatus })
    });
    const updated = response.ok ? await response.json() : { ...student, applicationStatus };
    setStudents((current) => current.map((item) => (item.id === student.id ? updated : item)));
    if (selectedStudent?.id === student.id) setSelectedStudent(updated);
  }

  async function deleteStudent(id: string) {
    const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (response.ok) {
      setStudents((current) => current.filter((student) => student.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
      if (selectedStudent?.id === id) setMode("closed");
    }
  }

  const formStudent = mode === "edit" && selectedStudent ? selectedStudent : emptyStudent;
  const modalOpen = mode !== "closed";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Search, filter, update status, and open a student profile for full editing.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredStudents.length} label="records" />
              <Button onClick={() => { setMode("create"); setSelectedStudent(null); }}>
                <Plus className="h-4 w-4" />
                Add student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name, ID, phone, passport..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="ALL">All statuses</option>
              {(options.applicationStatus ?? []).map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </Select>
            <Select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filter students by branch">
              <option value="ALL">All branches</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </Select>
          </div>

          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className={selectedStudent?.id === student.id ? "cursor-pointer bg-muted/45" : "cursor-pointer"}
                    onClick={() => { setSelectedStudent(student); setMode("view"); }}
                  >
                    <TableCell>
                      <button className="text-left" onClick={() => { setSelectedStudent(student); setMode("view"); }}>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <TagChip>{student.studentId}</TagChip>
                          <TagChip>{humanize(student.japaneseLevel)}</TagChip>
                          <TagChip>{humanize(student.preferredCity)}</TagChip>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>{student.phone}</div>
                      <div className="text-xs text-muted-foreground">{student.email || "No email"}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{student.branch?.name ?? "Unassigned"}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{humanize(student.programTrack)}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{humanize(student.targetIntake)}</Badge></TableCell>
                    <TableCell>
                      <StatusSelect value={student.applicationStatus} options={options.applicationStatus} onChange={(value) => updateStatus(student, value)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="icon" aria-label="Edit student" onClick={() => { setSelectedStudent(student); setMode("edit"); }}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete student" onClick={() => deleteStudent(student.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:bg-muted/40"
                onClick={() => { setSelectedStudent(student); setMode("view"); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{student.fullName}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TagChip>{student.studentId}</TagChip>
                      <TagChip>{humanize(student.japaneseLevel)}</TagChip>
                      <TagChip>{humanize(student.preferredCity)}</TagChip>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1" onClick={(event) => event.stopPropagation()}>
                    <Button variant="ghost" size="icon" aria-label="Edit student" onClick={() => { setSelectedStudent(student); setMode("edit"); }}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete student" onClick={() => deleteStudent(student.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoMini label="Contact" value={student.email ? `${student.phone} · ${student.email}` : student.phone} />
                  <InfoMini label="Branch" value={student.branch?.name ?? "Unassigned"} />
                  <InfoMini label="Program" value={`${humanize(student.programTrack)} · ${humanize(student.targetIntake)}`} />
                </div>
                <div className="mt-4" onClick={(event) => event.stopPropagation()}>
                  <StatusSelect value={student.applicationStatus} options={options.applicationStatus} onChange={(value) => updateStatus(student, value)} fullWidth />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {modalOpen ? (
        <StudentModal onClose={() => setMode("closed")}>
          <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">
                {mode === "create" ? "Add student" : mode === "edit" ? `Edit ${formStudent.fullName}` : selectedStudent?.fullName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "create"
                  ? "Create a new applicant or language program student."
                  : mode === "edit"
                    ? "Update status, contact, program, intake, city, and academic information."
                    : `${selectedStudent?.studentId} · ${selectedStudent ? humanize(selectedStudent.applicationStatus) : ""}`}
              </p>
            </div>
            <div className="flex gap-2">
              {mode === "view" && selectedStudent ? (
                <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={() => setMode("closed")} aria-label="Close popup">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5">
            {mode === "view" && selectedStudent ? (
              <StudentProfile student={selectedStudent} options={options} onEdit={() => setMode("edit")} />
            ) : (
              <StudentForm
                key={mode === "create" ? "create-student" : selectedStudent?.id}
                student={formStudent}
                options={options}
                branches={branches}
                defaultBranchId={defaultBranchId}
                onSubmit={saveStudent}
                saving={saving}
                submitLabel={mode === "create" ? "Create student" : "Save changes"}
              />
            )}
          </div>
        </StudentModal>
      ) : null}
    </div>
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

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function StatusSelect({ value, options = [], onChange, fullWidth = false }: { value: string; options?: Option[]; onChange: (value: string) => void; fullWidth?: boolean }) {
  return (
    <Select
      className={`${fullWidth ? "w-full" : "w-full max-w-[13rem]"} h-9 rounded-full border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-foreground`}
      value={value}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((status) => (
        <option key={status.value} value={status.value}>{status.label}</option>
      ))}
    </Select>
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

function StudentModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" aria-label="Close popup overlay" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-lg border bg-card text-card-foreground shadow-soft">
        {children}
      </div>
    </div>
  );
}

function StudentProfile({ student, onEdit }: { student: Student; options: CrmOptions; onEdit: () => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-5">
        <ProfileStat label="Branch" value={student.branch?.name ?? "Unassigned"} />
        <ProfileStat label="Program" value={humanize(student.programTrack)} />
        <ProfileStat label="Japanese level" value={humanize(student.japaneseLevel)} />
        <ProfileStat label="Target intake" value={humanize(student.targetIntake)} />
        <ProfileStat label="Preferred city" value={humanize(student.preferredCity)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoRow icon={Phone} label="Phone" value={student.phone} />
        <InfoRow icon={Mail} label="Email" value={student.email || "No email added"} />
        <InfoRow icon={MapPin} label="Address" value={student.address} />
        <InfoRow icon={UserRound} label="Passport" value={student.passportNumber || "Not added"} />
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Application status</p>
            <p className="text-sm text-muted-foreground">Current pipeline status for this student.</p>
          </div>
          <Badge variant={student.applicationStatus.includes("APPROVED") ? "success" : "outline"}>
            {humanize(student.applicationStatus)}
          </Badge>
        </div>
      </div>

      <Button onClick={onEdit}>
        <Edit3 className="h-4 w-4" />
        Edit student information
      </Button>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function StudentForm({ student, options, branches, defaultBranchId, onSubmit, saving, submitLabel }: { student: Student; options: CrmOptions; branches: BranchOption[]; defaultBranchId?: string; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Branch" name="branchId" options={branches.map((branch) => ({ value: branch.id, label: branch.name }))} defaultValue={student.branchId || defaultBranchId} />
        <Field label="Full name" name="fullName" defaultValue={student.fullName} required />
        <Field label="Phone" name="phone" defaultValue={student.phone} required />
        <Field label="Email" name="email" type="email" defaultValue={student.email ?? ""} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="Address" name="address" defaultValue={student.address} required />
        <Field label="Passport number" name="passportNumber" defaultValue={student.passportNumber ?? ""} />
        <Field label="Education level" name="educationLevel" defaultValue={student.educationLevel} required />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Program track" name="programTrack" options={options.programTrack} defaultValue={student.programTrack} />
        <SelectField label="Japanese level" name="japaneseLevel" options={options.japaneseLevel} defaultValue={student.japaneseLevel} />
        <SelectField label="Application status" name="applicationStatus" options={options.applicationStatus} defaultValue={student.applicationStatus} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Target intake" name="targetIntake" options={options.targetIntake} defaultValue={student.targetIntake} />
        <SelectField label="Preferred city" name="preferredCity" options={options.preferredCity} defaultValue={student.preferredCity} />
      </div>
      <Button className="w-fit" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </Button>
    </form>
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Select>
    </div>
  );
}
