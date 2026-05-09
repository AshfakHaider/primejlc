"use client";

import type React from "react";
import { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Building2,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Landmark,
  Mail,
  MapPin,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, humanize } from "@/lib/utils";

type School = {
  id: string;
  name: string;
  cityPrefecture: string;
  intakeAvailability: string[];
  tuitionFee: number | string;
  applicationDeadline: Date | string;
  contactEmail: string;
  partnerStatus: string;
  notes?: string | null;
};

type Option = { value: string; label: string };
type CrmOptions = Record<string, Option[]>;
type WorkspaceMode = "closed" | "create" | "view" | "edit";

const emptySchool: School = {
  id: "",
  name: "",
  cityPrefecture: "",
  intakeAvailability: ["OCTOBER"],
  tuitionFee: "",
  applicationDeadline: "",
  contactEmail: "",
  partnerStatus: "PROSPECT",
  notes: ""
};

export function SchoolsWorkspace({ initialSchools, options }: { initialSchools: School[]; options: CrmOptions }) {
  const [schools, setSchools] = useState(initialSchools);
  const [mode, setMode] = useState<WorkspaceMode>("closed");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const filteredSchools = useMemo(() => {
    const search = query.trim().toLowerCase();
    return schools.filter((school) => {
      const matchesStatus = statusFilter === "ALL" || school.partnerStatus === statusFilter;
      const matchesSearch =
        !search ||
        [school.name, school.cityPrefecture, school.contactEmail, school.partnerStatus, ...school.intakeAvailability]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [query, schools, statusFilter]);

  const stats = useMemo(() => {
    const active = schools.filter((school) => school.partnerStatus === "ACTIVE").length;
    const prospect = schools.filter((school) => school.partnerStatus === "PROSPECT").length;
    const upcoming = schools.filter((school) => isUpcomingDeadline(school.applicationDeadline)).length;
    const averageTuition = schools.length ? schools.reduce((sum, school) => sum + Number(school.tuitionFee || 0), 0) / schools.length : 0;
    return { active, prospect, upcoming, averageTuition };
  }, [schools]);

  async function saveSchool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      cityPrefecture: String(formData.get("cityPrefecture") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      intakeAvailability: formData.getAll("intakeAvailability").map(String),
      partnerStatus: String(formData.get("partnerStatus") ?? "PROSPECT"),
      tuitionFee: String(formData.get("tuitionFee") ?? "0"),
      applicationDeadline: String(formData.get("applicationDeadline") ?? ""),
      notes: String(formData.get("notes") ?? "")
    };
    const editing = mode === "edit" && selectedSchool?.id;
    const response = await fetch(editing ? `/api/schools/${selectedSchool.id}` : "/api/schools", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const school = await response.json();
      setSchools((current) => (editing ? current.map((item) => (item.id === school.id ? school : item)) : [school, ...current]));
      setSelectedSchool(school);
      setMode("view");
      event.currentTarget.reset();
    }
  }

  async function deleteSchool(id: string) {
    const response = await fetch(`/api/schools/${id}`, { method: "DELETE" });
    if (response.ok) {
      setSchools((current) => current.filter((school) => school.id !== id));
      if (selectedSchool?.id === id) {
        setSelectedSchool(null);
        setMode("closed");
      }
    }
  }

  function openCreate() {
    setSelectedSchool(null);
    setMode("create");
  }

  function openProfile(school: School) {
    setSelectedSchool(school);
    setMode("view");
  }

  function openEdit(school: School) {
    setSelectedSchool(school);
    setMode("edit");
  }

  const formSchool = mode === "edit" && selectedSchool ? selectedSchool : emptySchool;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Partner schools" value={schools.length.toString()} tone="bg-primary/10 text-primary" />
        <MetricCard icon={CheckCircle2} label="Active partners" value={stats.active.toString()} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
        <MetricCard icon={CalendarClock} label="Upcoming deadlines" value={stats.upcoming.toString()} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300" />
        <MetricCard icon={BadgeDollarSign} label="Average tuition" value={formatCurrency(Math.round(stats.averageTuition))} tone="bg-secondary/10 text-secondary" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>School Directory</CardTitle>
              <CardDescription>Track partner status, intake availability, deadlines, tuition, and admission contacts.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredSchools.length} label={filteredSchools.length === 1 ? "record" : "records"} />
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add school
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search school, city, email, intake..."
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter schools by partner status">
              <option value="ALL">All partner statuses</option>
              {options.partnerStatus?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </div>

          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Intakes</TableHead>
                  <TableHead>Tuition</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id} className="cursor-pointer transition-colors hover:bg-muted/45" onClick={() => openProfile(school)}>
                    <TableCell>
                      <div className="min-w-[260px]">
                        <div className="font-medium">{school.name}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <TagChip icon={MapPin}>{school.cityPrefecture}</TagChip>
                          <TagChip icon={Mail}>{school.contactEmail}</TagChip>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[260px] flex-wrap gap-1.5">
                        {school.intakeAvailability.map((intake) => <Badge key={intake} variant="outline">{humanize(intake)}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(school.tuitionFee)}</TableCell>
                    <TableCell>{formatDate(school.applicationDeadline)}</TableCell>
                    <TableCell><StatusBadge status={school.partnerStatus} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit school"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(school);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete school"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSchool(school.id);
                          }}
                        >
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
            {filteredSchools.map((school) => (
              <button key={school.id} className="rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/35" onClick={() => openProfile(school)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{school.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TagChip icon={MapPin}>{school.cityPrefecture}</TagChip>
                      <TagChip icon={Mail}>{school.contactEmail}</TagChip>
                    </div>
                  </div>
                  <StatusBadge status={school.partnerStatus} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Tuition" value={formatCurrency(school.tuitionFee)} />
                  <InfoMini label="Deadline" value={formatDate(school.applicationDeadline)} />
                  <InfoMini label="Intakes" value={`${school.intakeAvailability.length} open`} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {school.intakeAvailability.map((intake) => <Badge key={intake} variant="outline">{humanize(intake)}</Badge>)}
                </div>
              </button>
            ))}
          </div>

          {filteredSchools.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No schools match this view.</p>
              <p className="mt-1 text-sm text-muted-foreground">Adjust the search, clear the status filter, or add a new school profile.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode !== "closed" ? (
        <SchoolModal
          title={mode === "create" ? "Add partner school" : mode === "edit" ? `Edit ${formSchool.name}` : selectedSchool?.name ?? "School profile"}
          description={mode === "view" ? "School profile, intake readiness, admission deadline, and contact details." : "Keep school partner data accurate for counseling and admissions."}
          onClose={() => setMode("closed")}
          wide={mode === "view"}
        >
          {mode === "view" && selectedSchool ? (
            <SchoolProfile school={selectedSchool} onEdit={() => setMode("edit")} onDelete={() => deleteSchool(selectedSchool.id)} />
          ) : (
            <SchoolForm school={formSchool} options={options} onSubmit={saveSchool} saving={saving} submitLabel={mode === "create" ? "Create school" : "Save school"} />
          )}
        </SchoolModal>
      ) : null}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SchoolModal({ title, description, children, onClose, wide = false }: { title: string; description: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-xl border bg-card shadow-2xl ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary/10 text-secondary">
              <Landmark className="h-5 w-5" />
            </div>
            <h2 className="truncate text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close school modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-132px)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

function SchoolProfile({ school, onEdit, onDelete }: { school: School; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <ProfileStat label="Partner status" value={humanize(school.partnerStatus)} />
        <ProfileStat label="Tuition fee" value={formatCurrency(school.tuitionFee)} />
        <ProfileStat label="Deadline" value={formatDate(school.applicationDeadline)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={school.partnerStatus} />
            {isUpcomingDeadline(school.applicationDeadline) ? <Badge variant="warning">Deadline upcoming</Badge> : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock icon={MapPin} label="City / prefecture" value={school.cityPrefecture} />
            <InfoBlock icon={Mail} label="Admission contact" value={school.contactEmail} />
            <InfoBlock icon={BadgeDollarSign} label="Tuition" value={formatCurrency(school.tuitionFee)} />
            <InfoBlock icon={CalendarClock} label="Application deadline" value={formatDate(school.applicationDeadline)} />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold">Available intakes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {school.intakeAvailability.map((intake) => <Badge key={intake} variant="outline">{humanize(intake)}</Badge>)}
          </div>
          <div className="mt-5 rounded-md bg-muted/45 p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Internal notes</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{school.notes || "No notes added yet."}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
          Delete
        </Button>
        <Button onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
          Edit school
        </Button>
      </div>
    </div>
  );
}

function SchoolForm({ school, options, onSubmit, saving, submitLabel }: { school: School; options: CrmOptions; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  const intakeOptions = options.targetIntake ?? [];
  const selectedIntakes = new Set(school.intakeAvailability.length ? school.intakeAvailability : [intakeOptions[0]?.value ?? "OCTOBER"]);

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="School name" name="name" defaultValue={school.name} required />
        <Field label="City / prefecture" name="cityPrefecture" defaultValue={school.cityPrefecture} required />
        <Field label="Contact email" name="contactEmail" type="email" defaultValue={school.contactEmail} required />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Partner status" name="partnerStatus" options={options.partnerStatus} defaultValue={school.partnerStatus} />
        <Field label="Tuition fee" name="tuitionFee" type="number" defaultValue={String(school.tuitionFee)} required />
        <Field label="Deadline" name="applicationDeadline" type="date" defaultValue={dateInput(school.applicationDeadline)} required />
      </div>
      <div className="space-y-2">
        <Label>Intake availability</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {intakeOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-md border bg-muted/25 px-3 py-2 text-sm">
              <input
                className="h-4 w-4 accent-primary"
                type="checkbox"
                name="intakeAvailability"
                value={option.value}
                defaultChecked={selectedIntakes.has(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={school.notes ?? ""} placeholder="Admission requirements, interview style, commission terms, or counselor notes." />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
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

function StatusBadge({ status }: { status: string }) {
  const variant = status === "ACTIVE" ? "success" : status === "PAUSED" ? "warning" : "outline";
  return <Badge variant={variant}>{humanize(status)}</Badge>;
}

function TagChip({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
      <span className="truncate">{children}</span>
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

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/35 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
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
      <Select id={name} name={name} defaultValue={defaultValue ?? options[0]?.value}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
    </div>
  );
}

function formatDate(value?: Date | string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString();
}

function dateInput(value?: Date | string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function isUpcomingDeadline(value?: Date | string) {
  if (!value) return false;
  const deadline = new Date(value).getTime();
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  return deadline >= now && deadline <= now + ninetyDays;
}
