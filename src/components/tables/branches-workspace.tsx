"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, CheckCircle2, Edit3, MapPin, Phone, Plus, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type BranchMode = "closed" | "create" | "edit";

const emptyBranch: Branch = {
  id: "",
  name: "",
  address: "",
  phone: "",
  managerName: "",
  status: "ACTIVE"
};

export function BranchesWorkspace({ initialBranches, canManageBranches }: { initialBranches: Branch[]; canManageBranches: boolean }) {
  const router = useRouter();
  const [branches, setBranches] = useState(initialBranches);
  const [mode, setMode] = useState<BranchMode>("closed");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredBranches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesStatus = statusFilter === "ALL" || branch.status === statusFilter;
      const matchesSearch =
        !search ||
        [branch.name, branch.address, branch.phone, branch.managerName, branch.status]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [branches, query, statusFilter]);

  const stats = useMemo(() => {
    const active = branches.filter((branch) => branch.status === "ACTIVE").length;
    const inactive = branches.filter((branch) => branch.status === "INACTIVE").length;
    return { active, inactive };
  }, [branches]);

  function openCreate() {
    setSelectedBranch(null);
    setError("");
    setMode("create");
  }

  function openEdit(branch: Branch) {
    setSelectedBranch(branch);
    setError("");
    setMode("edit");
  }

  function closeModal() {
    setMode("closed");
    setSelectedBranch(null);
    setError("");
  }

  async function saveBranch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      managerName: String(formData.get("managerName") ?? ""),
      status: String(formData.get("status") ?? "ACTIVE")
    };
    const editing = mode === "edit" && selectedBranch?.id;
    const response = await fetch(editing ? `/api/branches/${selectedBranch.id}` : "/api/branches", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error ?? "Could not save branch.");
      return;
    }

    setBranches((current) => (editing ? current.map((item) => (item.id === data.id ? data : item)) : [data, ...current]));
    router.refresh();
    closeModal();
  }

  const formBranch = mode === "edit" && selectedBranch ? selectedBranch : emptyBranch;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard icon={Building2} label="Total branches" value={branches.length.toString()} tone="bg-primary/10 text-primary" />
        <MetricCard icon={CheckCircle2} label="Active branches" value={stats.active.toString()} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
        <MetricCard icon={ShieldCheck} label="Inactive branches" value={stats.inactive.toString()} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Branch Directory</CardTitle>
              <CardDescription>Add future branches, update manager details, and open branch dashboards from one clean owner view.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredBranches.length} label={filteredBranches.length === 1 ? "branch" : "branches"} />
              {canManageBranches ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Add branch
                </Button>
              ) : null}
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
                placeholder="Search branch, manager, phone, address..."
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter branches by status">
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} canManage={canManageBranches} onEdit={() => openEdit(branch)} />
            ))}
          </div>

          {filteredBranches.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="mt-3 font-medium">No branches found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another search or create a new branch for the agency.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode !== "closed" ? (
        <BranchModal
          branch={formBranch}
          error={error}
          mode={mode}
          saving={saving}
          onClose={closeModal}
          onSubmit={saveBranch}
        />
      ) : null}
    </div>
  );
}

function BranchCard({ branch, canManage, onEdit }: { branch: Branch; canManage: boolean; onEdit: () => void }) {
  return (
    <div className="group relative rounded-lg border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <Link href={`/branches/${branch.id}`} className="absolute inset-0 rounded-lg" aria-label={`Open ${branch.name} branch`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          {canManage ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 h-9 w-9"
              aria-label={`Edit ${branch.name}`}
              onClick={(event) => {
                event.preventDefault();
                onEdit();
              }}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : null}
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
        </div>
      </div>

      <div className="relative mt-4 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-lg font-semibold">{branch.name}</h3>
          <StatusBadge status={branch.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <TagChip icon={UserRound}>{branch.managerName}</TagChip>
          <TagChip icon={Phone}>{branch.phone}</TagChip>
        </div>
        <div className="mt-3 flex gap-3 rounded-md bg-muted/35 p-3 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="min-w-0 break-words">{branch.address}</p>
        </div>
      </div>
    </div>
  );
}

function BranchModal({
  branch,
  error,
  mode,
  saving,
  onClose,
  onSubmit
}: {
  branch: Branch;
  error: string;
  mode: Exclude<BranchMode, "closed">;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const title = mode === "create" ? "Add Branch" : "Edit Branch";
  const description = mode === "create" ? "Create a new agency branch for future filtering, reporting, and role access." : "Update branch contact, manager, and activity status.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-card/95 p-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close branch modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Branch name">
              <Input name="name" defaultValue={branch.name} placeholder="Dhaka Uttara" required />
            </Field>
            <Field label="Manager name">
              <Input name="managerName" defaultValue={branch.managerName} placeholder="Branch manager" required />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={branch.phone} placeholder="017..." required />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={branch.status || "ACTIVE"}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </Field>
          </div>

          <Field label="Address">
            <Textarea name="address" defaultValue={branch.address} placeholder="Branch full address" required rows={4} />
          </Field>

          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : mode === "create" ? "Create branch" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
      {value} {label}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <Badge variant={active ? "success" : "warning"} className="gap-1">
      {active ? <CheckCircle2 className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function TagChip({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/35 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}
