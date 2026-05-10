"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Edit3, Facebook, Kanban, List, MapPin, MessageCircle, Phone, Plus, Search, Sparkles, StickyNote, Trash2, UserPlus, UsersRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { humanize } from "@/lib/utils";
import { leadInterestedInOptions, leadStatusOptions } from "@/lib/sample-data";

type Lead = {
  id: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  name: string;
  city?: string | null;
  phoneNumber: string;
  whatsappNumber?: string | null;
  facebookProfile?: string | null;
  interestedIn: string;
  status: string;
  nextFollowUpDate?: Date | string | null;
  notes?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
type BranchOption = { id: string; name: string };

type LeadMode = "closed" | "create" | "edit" | "note";

const emptyLead: Lead = {
  id: "",
  name: "",
  city: "",
  phoneNumber: "",
  whatsappNumber: "",
  facebookProfile: "",
  interestedIn: "LANGUAGE_COURSE",
  status: "NEW",
  nextFollowUpDate: "",
  notes: ""
};

export function LeadsWorkspace({ initialLeads, branches, defaultBranchId }: { initialLeads: Lead[]; branches: BranchOption[]; defaultBranchId?: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [mode, setMode] = useState<LeadMode>("closed");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [interestFilter, setInterestFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cityOptions = useMemo(() => Array.from(new Set(leads.map((lead) => lead.city?.trim()).filter(Boolean) as string[])).sort(), [leads]);

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const matchesCity = cityFilter === "ALL" || lead.city === cityFilter;
      const matchesInterest = interestFilter === "ALL" || lead.interestedIn === interestFilter;
      const matchesBranch = branchFilter === "ALL" || lead.branchId === branchFilter;
      const matchesSearch =
        !search ||
        [lead.name, lead.city, lead.phoneNumber, lead.whatsappNumber, lead.facebookProfile, lead.interestedIn, lead.status, lead.notes]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesCity && matchesInterest && matchesBranch && matchesSearch;
    });
  }, [branchFilter, cityFilter, interestFilter, leads, query, statusFilter]);

  const columns = useMemo(
    () => (statusFilter === "ALL" ? leadStatusOptions : leadStatusOptions.filter((status) => status.value === statusFilter)),
    [statusFilter]
  );

  const stats = useMemo(() => {
    return {
      newLeads: leads.filter((lead) => lead.status === "NEW").length,
      followUpPending: leads.filter((lead) => lead.status === "FOLLOW_UP" || isFollowUpDue(lead.nextFollowUpDate)).length,
      interested: leads.filter((lead) => lead.status === "INTERESTED").length,
      admitted: leads.filter((lead) => lead.status === "ADMITTED").length,
      processing: leads.filter((lead) => lead.status === "PROCESSING").length
    };
  }, [leads]);

  async function saveLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const editing = mode === "edit" && selectedLead?.id;
    const response = await fetch(editing ? `/api/leads/${selectedLead.id}` : "/api/leads", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const lead = await response.json();
      setLeads((current) => (editing ? current.map((item) => (item.id === lead.id ? lead : item)) : [lead, ...current]));
      setMode("closed");
      setSelectedLead(null);
      event.currentTarget.reset();
    }
  }

  async function deleteLead(id: string) {
    const response = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (response.ok) {
      setLeads((current) => current.filter((lead) => lead.id !== id));
      setMode("closed");
      setSelectedLead(null);
    }
  }

  async function saveLeadNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLead) return;
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/leads/${selectedLead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const lead = await response.json();
      setLeads((current) => current.map((item) => (item.id === lead.id ? lead : item)));
      setSelectedLead(null);
      setMode("closed");
    }
  }

  async function moveLead(leadId: string, status: string) {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead || lead.status === status) return;
    setLeads((current) => current.map((item) => (item.id === leadId ? { ...item, status } : item)));
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      setLeads((current) => current.map((item) => (item.id === leadId ? lead : item)));
      return;
    }
    const updatedLead = await response.json();
    setLeads((current) => current.map((item) => (item.id === leadId ? updatedLead : item)));
  }

  function openCreate() {
    setSelectedLead(null);
    setMode("create");
  }

  function openEdit(lead: Lead) {
    setSelectedLead(lead);
    setMode("edit");
  }

  function openNote(lead: Lead) {
    setSelectedLead(lead);
    setMode("note");
  }

  const formLead = mode === "edit" && selectedLead ? selectedLead : emptyLead;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={UserPlus} label="New Leads" value={stats.newLeads.toString()} tone="bg-primary/10 text-primary" />
        <MetricCard icon={CalendarClock} label="Follow-up Pending" value={stats.followUpPending.toString()} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300" />
        <MetricCard icon={Sparkles} label="Interested Students" value={stats.interested.toString()} tone="bg-cyan-500/10 text-cyan-600 dark:text-cyan-300" />
        <MetricCard icon={CheckCircle2} label="Admitted Students" value={stats.admitted.toString()} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
        <MetricCard icon={UsersRound} label="Processing Students" value={stats.processing.toString()} tone="bg-secondary/10 text-secondary" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>Manage walk-ins, phone inquiries, Facebook contacts, and follow-ups in Kanban or list view.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border bg-muted/40 p-1">
                <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")}>
                  <Kanban className="h-4 w-4" />
                  Kanban
                </Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
              <CountPill value={filteredLeads.length} label={filteredLeads.length === 1 ? "lead" : "leads"} />
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add lead
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_190px_190px_190px_210px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, city, phone, WhatsApp, Facebook, interest..." />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter leads by status">
              <option value="ALL">All statuses</option>
              {leadStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </Select>
            <Select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filter leads by branch">
              <option value="ALL">All branches</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </Select>
            <Select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} aria-label="Filter leads by city">
              <option value="ALL">All cities</option>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </Select>
            <Select value={interestFilter} onChange={(event) => setInterestFilter(event.target.value)} aria-label="Filter leads by interest">
              <option value="ALL">All interests</option>
              {leadInterestedInOptions.map((interest) => <option key={interest.value} value={interest.value}>{interest.label}</option>)}
            </Select>
          </div>

          {viewMode === "kanban" ? (
            <div className="grid gap-3 overflow-x-auto pb-2 xl:grid-flow-col xl:auto-cols-[minmax(280px,1fr)]">
              {columns.map((status) => {
                const columnLeads = filteredLeads.filter((lead) => lead.status === status.value);
                return (
                  <section
                    key={status.value}
                    className="min-h-[340px] rounded-lg border bg-muted/25 p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const leadId = event.dataTransfer.getData("text/plain") || draggingId;
                      if (leadId) moveLead(leadId, status.value);
                      setDraggingId(null);
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">{status.label}</h3>
                        <p className="text-xs text-muted-foreground">{columnLeads.length} {columnLeads.length === 1 ? "lead" : "leads"}</p>
                      </div>
                      <Badge variant={statusVariant(status.value)}>{columnLeads.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {columnLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onEdit={() => openEdit(lead)}
                          onNote={() => openNote(lead)}
                          onDelete={() => deleteLead(lead.id)}
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/plain", lead.id);
                            setDraggingId(lead.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                        />
                      ))}
                      {columnLeads.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-background/50 p-4 text-center text-sm text-muted-foreground">Drop leads here</div>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <LeadsList leads={filteredLeads} onEdit={openEdit} onNote={openNote} onDelete={deleteLead} />
          )}

          {filteredLeads.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No leads match this view.</p>
              <p className="mt-1 text-sm text-muted-foreground">Adjust search, status, city, or interested-in filters.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode !== "closed" ? (
        <LeadModal
          title={mode === "create" ? "Add lead" : mode === "note" ? `Notes for ${selectedLead?.name}` : `Edit ${formLead.name}`}
          description={mode === "note" ? "Capture follow-up details, conversation summary, or counselor reminders." : "Keep lead information simple: contact details, interest, status, follow-up date, and notes."}
          onClose={() => setMode("closed")}
        >
          {mode === "note" && selectedLead ? (
            <LeadNoteForm lead={selectedLead} onSubmit={saveLeadNote} saving={saving} />
          ) : (
            <LeadForm lead={formLead} branches={branches} defaultBranchId={defaultBranchId} onSubmit={saveLead} saving={saving} submitLabel={mode === "create" ? "Create lead" : "Save lead"} />
          )}
        </LeadModal>
      ) : null}
    </div>
  );
}

function LeadCard({
  lead,
  onEdit,
  onNote,
  onDelete,
  onDragStart,
  onDragEnd
}: {
  lead: Lead;
  onEdit: () => void;
  onNote: () => void;
  onDelete: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} className="rounded-lg border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{lead.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lead.phoneNumber}</p>
        </div>
        <Badge variant={statusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.city ? (
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {lead.city}
          </Badge>
        ) : null}
        {lead.branch?.name ? <Badge variant="secondary">{lead.branch.name}</Badge> : null}
        <Badge variant="outline">{interestLabel(lead.interestedIn)}</Badge>
        {lead.nextFollowUpDate ? <Badge variant={isFollowUpDue(lead.nextFollowUpDate) ? "warning" : "outline"}>{formatDate(lead.nextFollowUpDate)}</Badge> : null}
      </div>
      <div className="mt-3 rounded-md bg-muted/40 p-3">
        <p className="text-[11px] font-medium uppercase text-muted-foreground">Notes</p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{lead.notes || "No notes yet"}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <QuickAction href={whatsAppUrl(lead.whatsappNumber || lead.phoneNumber)} label="Open WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </QuickAction>
          <QuickAction href={facebookUrl(lead.facebookProfile)} label="Open Facebook profile" disabled={!lead.facebookProfile}>
            <Facebook className="h-4 w-4" />
          </QuickAction>
          <QuickAction href={`tel:${lead.phoneNumber}`} label="Call lead">
            <Phone className="h-4 w-4" />
          </QuickAction>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Add lead note" onClick={onNote}>
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Edit lead" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete lead" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadsList({ leads, onEdit, onNote, onDelete }: { leads: Lead[]; onEdit: (lead: Lead) => void; onNote: (lead: Lead) => void; onDelete: (id: string) => void }) {
  return (
    <>
      <div className="hidden rounded-lg border lg:block">
        <div className="overflow-x-auto">
        <Table className="min-w-[1460px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[230px]">Lead</TableHead>
              <TableHead className="w-[130px]">Branch</TableHead>
              <TableHead className="w-[130px]">City</TableHead>
              <TableHead className="w-[200px]">Interested In</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[160px]">Follow-up</TableHead>
              <TableHead className="w-[360px]">Notes</TableHead>
              <TableHead className="w-[130px]">Actions</TableHead>
              <TableHead className="w-[100px]">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="truncate font-medium">{lead.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{lead.phoneNumber}</div>
                </TableCell>
                <TableCell><Badge variant="secondary">{lead.branch?.name ?? "Unassigned"}</Badge></TableCell>
                <TableCell><span className="block truncate">{lead.city || "Not set"}</span></TableCell>
                <TableCell><Badge variant="outline">{interestLabel(lead.interestedIn)}</Badge></TableCell>
                <TableCell><Badge variant={statusVariant(lead.status)}>{statusLabel(lead.status)}</Badge></TableCell>
                <TableCell>
                  <Badge variant={isFollowUpDue(lead.nextFollowUpDate) ? "warning" : "outline"}>{formatDate(lead.nextFollowUpDate)}</Badge>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-3 whitespace-normal text-sm leading-6 text-muted-foreground">
                    {lead.notes || "No notes yet"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap gap-1">
                    <QuickAction href={whatsAppUrl(lead.whatsappNumber || lead.phoneNumber)} label="Open WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </QuickAction>
                    <QuickAction href={facebookUrl(lead.facebookProfile)} label="Open Facebook profile" disabled={!lead.facebookProfile}>
                      <Facebook className="h-4 w-4" />
                    </QuickAction>
                    <QuickAction href={`tel:${lead.phoneNumber}`} label="Call lead">
                      <Phone className="h-4 w-4" />
                    </QuickAction>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-nowrap gap-1">
                    <Button variant="ghost" size="icon" aria-label="Add lead note" onClick={() => onNote(lead)}>
                      <StickyNote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Edit lead" onClick={() => onEdit(lead)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete lead" onClick={() => onDelete(lead.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>
      <div className="grid gap-3 lg:hidden">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{lead.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lead.phoneNumber}</p>
              </div>
              <Badge variant={statusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lead.city ? <Badge variant="outline">{lead.city}</Badge> : null}
              {lead.branch?.name ? <Badge variant="secondary">{lead.branch.name}</Badge> : null}
              <Badge variant="outline">{interestLabel(lead.interestedIn)}</Badge>
              <Badge variant={isFollowUpDue(lead.nextFollowUpDate) ? "warning" : "outline"}>{formatDate(lead.nextFollowUpDate)}</Badge>
            </div>
            <div className="mt-3 rounded-md bg-muted/40 p-3">
              <p className="text-[11px] font-medium uppercase text-muted-foreground">Notes</p>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{lead.notes || "No notes yet"}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <QuickAction href={whatsAppUrl(lead.whatsappNumber || lead.phoneNumber)} label="Open WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </QuickAction>
                <QuickAction href={facebookUrl(lead.facebookProfile)} label="Open Facebook profile" disabled={!lead.facebookProfile}>
                  <Facebook className="h-4 w-4" />
                </QuickAction>
                <QuickAction href={`tel:${lead.phoneNumber}`} label="Call lead">
                  <Phone className="h-4 w-4" />
                </QuickAction>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Add lead note" onClick={() => onNote(lead)}>
                  <StickyNote className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Edit lead" onClick={() => onEdit(lead)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete lead" onClick={() => onDelete(lead.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function QuickAction({ href, label, disabled, children }: { href: string; label: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <Button variant="ghost" size="icon" aria-label={label} disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="ghost" size="icon" aria-label={label} asChild>
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        {children}
      </a>
    </Button>
  );
}

function LeadForm({ lead, branches, defaultBranchId, onSubmit, saving, submitLabel }: { lead: Lead; branches: BranchOption[]; defaultBranchId?: string; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Branch" name="branchId" options={branches.map((branch) => ({ value: branch.id, label: branch.name }))} defaultValue={lead.branchId || defaultBranchId} />
        <Field label="Name" name="name" defaultValue={lead.name} required />
        <Field label="City" name="city" defaultValue={lead.city ?? ""} />
        <Field label="Phone number" name="phoneNumber" defaultValue={lead.phoneNumber} required />
        <Field label="WhatsApp number" name="whatsappNumber" defaultValue={lead.whatsappNumber ?? ""} />
        <Field label="Facebook profile link" name="facebookProfile" type="url" defaultValue={lead.facebookProfile ?? ""} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Interested In" name="interestedIn" options={leadInterestedInOptions} defaultValue={lead.interestedIn} />
        <SelectField label="Status" name="status" options={leadStatusOptions} defaultValue={lead.status} />
        <Field label="Next follow-up date" name="nextFollowUpDate" type="date" defaultValue={dateInput(lead.nextFollowUpDate)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={lead.notes ?? ""} placeholder="Conversation summary, follow-up context, or admission interest." />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

function LeadNoteForm({ lead, onSubmit, saving }: { lead: Lead; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="rounded-lg border bg-muted/35 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>
          {lead.city ? <Badge variant="outline">{lead.city}</Badge> : null}
          <Badge variant="outline">{interestLabel(lead.interestedIn)}</Badge>
        </div>
        <p className="mt-3 font-semibold">{lead.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{lead.phoneNumber}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="lead-note">Lead notes</Label>
        <Textarea
          id="lead-note"
          name="notes"
          defaultValue={lead.notes ?? ""}
          placeholder="Write follow-up notes, objections, family discussion, fee conversation, or next counselor action."
          rows={8}
        />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving..." : "Save note"}</Button>
      </div>
    </form>
  );
}

function LeadModal({ title, description, children, onClose }: { title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="truncate text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close lead modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-132px)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
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

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-full border bg-muted/60 px-3 text-sm font-semibold">
      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-xs text-secondary-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
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

function SelectField({ label, name, options, defaultValue }: { label: string; name: string; options: readonly { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue ?? options[0]?.value}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
    </div>
  );
}

function statusLabel(status: string) {
  return leadStatusOptions.find((option) => option.value === status)?.label ?? humanize(status);
}

function interestLabel(interest: string) {
  return leadInterestedInOptions.find((option) => option.value === interest)?.label ?? humanize(interest);
}

function statusVariant(status: string) {
  if (["ADMITTED", "CONVERTED"].includes(status)) return "success";
  if (["FOLLOW_UP", "PROCESSING"].includes(status)) return "warning";
  if (status === "LOST") return "danger";
  return "outline";
}

function formatDate(value?: Date | string | null) {
  if (!value) return "No follow-up";
  return new Date(value).toLocaleDateString("en-GB", { timeZone: "UTC" });
}

function dateInput(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function isFollowUpDue(value?: Date | string | null) {
  if (!value) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(value).getTime() <= today.getTime();
}

function whatsAppUrl(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `880${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

function facebookUrl(value?: string | null) {
  if (!value) return "#";
  return value.startsWith("http") ? value : `https://${value}`;
}
