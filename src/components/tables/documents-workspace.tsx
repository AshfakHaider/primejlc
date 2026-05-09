"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, FileCheck2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const documentFields = [
  ["passport", "Passport"],
  ["photo", "Photo"],
  ["academicCertificates", "Academic certificates"],
  ["transcript", "Transcript"],
  ["bankSolvency", "Bank solvency"],
  ["bankStatement", "Bank statement"],
  ["sponsorDocuments", "Sponsor documents"],
  ["japaneseCertificate", "Japanese certificate"],
  ["applicationForm", "Application form"],
  ["sop", "SOP"]
] as const;

type DocumentKey = (typeof documentFields)[number][0];
type Checklist = Record<DocumentKey, boolean> & {
  id: string;
  student: { id: string; studentId: string; fullName: string; phone?: string };
  files?: unknown[];
};

export function DocumentsWorkspace({ initialRows }: { initialRows: Checklist[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const missing = missingFields(row);
      const searchable = `${row.student.fullName} ${row.student.studentId} ${missing.join(" ")}`.toLowerCase();
      return searchable.includes(query.toLowerCase());
    });
  }, [rows, query]);

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  async function toggleDocument(row: Checklist, key: DocumentKey, value: boolean) {
    const optimistic = { ...row, [key]: value };
    setRows((current) => current.map((item) => (item.id === row.id ? optimistic : item)));
    const response = await fetch(`/api/documents/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value })
    });
    if (response.ok) {
      const updated = await response.json();
      setRows((current) => current.map((item) => (item.id === row.id ? updated : item)));
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Students Missing Documents</CardTitle>
              <CardDescription>Open a student to review missing documents and mark received items.</CardDescription>
            </div>
            <CountPill value={filteredRows.length} label="students" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search student or missing document..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Missing documents</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const missing = missingFields(row);
                  const percent = completionPercent(row);
                  return (
                    <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelectedId(row.id)}>
                      <TableCell>
                        <div className="font-medium">{row.student.fullName}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <TagChip>{row.student.studentId}</TagChip>
                          <TagChip>{row.student.phone || "No phone"}</TagChip>
                        </div>
                      </TableCell>
                      <TableCell>
                        {missing.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {missing.slice(0, 3).map((item) => <Badge key={item} variant="warning">{item}</Badge>)}
                            {missing.length > 3 ? <Badge variant="outline">+{missing.length - 3} more</Badge> : null}
                          </div>
                        ) : (
                          <Badge variant="success">Complete</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-32 space-y-1">
                          <Progress value={percent} />
                          <p className="text-xs text-muted-foreground">{percent}% complete</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={percent === 100 ? "success" : "outline"}>{percent === 100 ? "Ready" : "Follow up"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 lg:hidden">
            {filteredRows.map((row) => {
              const missing = missingFields(row);
              const percent = completionPercent(row);
              return (
                <button key={row.id} className="rounded-lg border bg-card p-4 text-left shadow-sm transition hover:bg-muted/40" onClick={() => setSelectedId(row.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{row.student.fullName}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <TagChip>{row.student.studentId}</TagChip>
                        <TagChip>{row.student.phone || "No phone"}</TagChip>
                      </div>
                    </div>
                    <Badge variant={percent === 100 ? "success" : "outline"}>{percent === 100 ? "Ready" : "Follow up"}</Badge>
                  </div>
                  <div className="mt-4 space-y-1">
                    <Progress value={percent} />
                    <p className="text-xs text-muted-foreground">{percent}% complete</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {missing.length ? missing.slice(0, 4).map((item) => <Badge key={item} variant="warning">{item}</Badge>) : <Badge variant="success">Complete</Badge>}
                    {missing.length > 4 ? <Badge variant="outline">+{missing.length - 4} more</Badge> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selected ? (
        <DocumentReviewDrawer row={selected} onClose={() => setSelectedId("")} onToggle={toggleDocument} />
      ) : null}
    </div>
  );
}

function DocumentReviewDrawer({
  row,
  onClose,
  onToggle
}: {
  row: Checklist;
  onClose: () => void;
  onToggle: (row: Checklist, key: DocumentKey, value: boolean) => void;
}) {
  const percent = completionPercent(row);
  const missing = documentFields.filter(([key]) => !row[key]);
  const received = documentFields.filter(([key]) => row[key]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" aria-label="Close document review overlay" onClick={onClose} />
      <aside className="absolute right-0 top-0 z-10 flex h-full w-full max-w-3xl flex-col border-l bg-card shadow-soft">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-normal">{row.student.fullName}</h2>
              <Badge variant={percent === 100 ? "success" : "warning"}>{percent}% complete</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{row.student.studentId} · Document receiving workspace</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close document review" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checklist progress</CardTitle>
                <CardDescription>Mark documents as received as soon as the counselor verifies them.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={percent} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Received" value={String(received.length)} />
                  <InfoMini label="Missing" value={String(missing.length)} />
                  <InfoMini label="Files" value={String(row.files?.length ?? 0)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Follow-up focus</CardTitle>
                <CardDescription>What the counselor should collect next.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {missing.length ? missing.map(([, label]) => <Badge key={label} variant="warning">{label}</Badge>) : <Badge variant="success">All documents received</Badge>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {documentFields.map(([key, label]) => (
              <div key={key} className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className={row[key] ? "mt-0.5 text-emerald-600" : "mt-0.5 text-muted-foreground"}>
                      {row[key] ? <CheckCircle2 className="h-5 w-5" /> : <FileCheck2 className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{row[key] ? "Received and verified" : "Missing or not verified yet"}</p>
                    </div>
                  </div>
                  <Badge variant={row[key] ? "success" : "outline"}>{row[key] ? "Done" : "Pending"}</Badge>
                </div>
                <Button className="mt-4 w-full" size="sm" variant={row[key] ? "secondary" : "outline"} onClick={() => onToggle(row, key, !row[key])}>
                  {row[key] ? "Mark pending" : "Mark received"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/45 p-3">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="inline-flex h-10 w-fit items-center gap-2 rounded-full border bg-muted/60 px-3 text-sm font-semibold">
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

function missingFields(row: Checklist) {
  return documentFields.filter(([key]) => !row[key]).map(([, label]) => label);
}

function completionPercent(row: Checklist) {
  const done = documentFields.filter(([key]) => row[key]).length;
  return Math.round((done / documentFields.length) * 100);
}
