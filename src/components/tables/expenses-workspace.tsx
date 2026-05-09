"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Banknote, CalendarDays, Edit3, Plus, ReceiptText, Search, Tags, Trash2, TrendingDown, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, humanize } from "@/lib/utils";

type Expense = {
  id: string;
  category: string;
  title: string;
  amount: number | string;
  expenseDate: Date | string;
  vendor?: string | null;
  note?: string | null;
};

type Option = { value: string; label: string };
type ExpenseMode = "closed" | "create" | "view" | "edit";

const emptyExpense: Expense = {
  id: "",
  category: "",
  title: "",
  amount: "",
  expenseDate: "",
  vendor: "",
  note: ""
};

export function ExpensesWorkspace({ initialExpenses, categories }: { initialExpenses: Expense[]; categories: Option[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [mode, setMode] = useState<ExpenseMode>("closed");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const filteredExpenses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesCategory = categoryFilter === "ALL" || expense.category === categoryFilter;
      const matchesSearch =
        !search ||
        [expense.title, expense.vendor, expense.category, expense.note]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, expenses, query]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const month = expenses.filter((expense) => isCurrentMonth(expense.expenseDate)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount || 0);
      return acc;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";
    const vendors = new Set(expenses.map((expense) => expense.vendor).filter(Boolean)).size;
    return { total, month, topCategory, vendors };
  }, [expenses]);

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const editing = mode === "edit" && selectedExpense?.id;
    const response = await fetch(editing ? `/api/expenses/${selectedExpense.id}` : "/api/expenses", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const expense = await response.json();
      setExpenses((current) => (editing ? current.map((item) => (item.id === expense.id ? expense : item)) : [expense, ...current]));
      setSelectedExpense(expense);
      setMode("view");
      event.currentTarget.reset();
    }
  }

  async function deleteExpense(id: string) {
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (response.ok) {
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      if (selectedExpense?.id === id) {
        setSelectedExpense(null);
        setMode("closed");
      }
    }
  }

  function openCreate() {
    setSelectedExpense(null);
    setMode("create");
  }

  function openView(expense: Expense) {
    setSelectedExpense(expense);
    setMode("view");
  }

  function openEdit(expense: Expense) {
    setSelectedExpense(expense);
    setMode("edit");
  }

  const formExpense = mode === "edit" && selectedExpense ? selectedExpense : { ...emptyExpense, category: categories[0]?.value ?? "" };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TrendingDown} label="Total expense" value={formatCurrency(stats.total)} tone="bg-rose-500/10 text-rose-600 dark:text-rose-300" />
        <MetricCard icon={CalendarDays} label="This month" value={formatCurrency(stats.month)} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300" />
        <MetricCard icon={Tags} label="Top category" value={stats.topCategory === "N/A" ? "N/A" : humanize(stats.topCategory)} tone="bg-primary/10 text-primary" />
        <MetricCard icon={UserRound} label="Vendors/payees" value={stats.vendors.toString()} tone="bg-secondary/10 text-secondary" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Expense Ledger</CardTitle>
              <CardDescription>Track office rent, salary, marketing, utilities, stationery, vendors, and monthly operating cost.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredExpenses.length} label={filteredExpenses.length === 1 ? "record" : "records"} />
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search expense, vendor, category, note..." />
            </div>
            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter expense category">
              <option value="ALL">All categories</option>
              {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </Select>
          </div>

          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor / payee</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="cursor-pointer transition-colors hover:bg-muted/45" onClick={() => openView(expense)}>
                    <TableCell>
                      <div className="font-medium">{expense.title}</div>
                      <div className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">{expense.note || "No note added"}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{humanize(expense.category)}</Badge></TableCell>
                    <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                    <TableCell>{expense.vendor || "No vendor"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit expense"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(expense);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete expense"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteExpense(expense.id);
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
            {filteredExpenses.map((expense) => (
              <button key={expense.id} className="rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/35" onClick={() => openView(expense)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{expense.title}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{expense.vendor || "No vendor"} · {formatDate(expense.expenseDate)}</p>
                  </div>
                  <Badge variant="outline">{humanize(expense.category)}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Amount" value={formatCurrency(expense.amount)} />
                  <InfoMini label="Date" value={formatDate(expense.expenseDate)} />
                  <InfoMini label="Vendor" value={expense.vendor || "No vendor"} />
                </div>
              </button>
            ))}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No expense records match this view.</p>
              <p className="mt-1 text-sm text-muted-foreground">Clear the filter or add a new operating cost.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode !== "closed" ? (
        <ExpenseModal
          title={mode === "create" ? "Add expense" : mode === "edit" ? `Edit ${formExpense.title}` : selectedExpense?.title ?? "Expense record"}
          description={mode === "view" ? "Expense detail, category, vendor/payee, amount, date, and note." : "Record agency operating cost with category and payment context."}
          onClose={() => setMode("closed")}
          wide={mode === "view"}
        >
          {mode === "view" && selectedExpense ? (
            <ExpenseProfile expense={selectedExpense} onEdit={() => setMode("edit")} onDelete={() => deleteExpense(selectedExpense.id)} />
          ) : (
            <ExpenseForm expense={formExpense} categories={categories} onSubmit={saveExpense} saving={saving} submitLabel={mode === "create" ? "Add expense" : "Save expense"} />
          )}
        </ExpenseModal>
      ) : null}
    </div>
  );
}

function ExpenseForm({ expense, categories, onSubmit, saving, submitLabel }: { expense: Expense; categories: Option[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={expense.category || categories[0]?.value} required>
            {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </Select>
        </div>
        <Field label="Title" name="title" type="text" defaultValue={expense.title} required />
        <Field label="Vendor / payee" name="vendor" type="text" defaultValue={expense.vendor ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" name="amount" defaultValue={String(expense.amount)} required />
        <Field label="Expense date" name="expenseDate" type="date" defaultValue={dateInput(expense.expenseDate)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" defaultValue={expense.note ?? ""} placeholder="Invoice number, month covered, approval note, or payment context." />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

function ExpenseProfile({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <ProfileStat label="Amount" value={formatCurrency(expense.amount)} />
        <ProfileStat label="Category" value={humanize(expense.category)} />
        <ProfileStat label="Expense date" value={formatDate(expense.expenseDate)} />
      </div>
      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{humanize(expense.category)}</Badge>
          <Badge variant="danger">{formatCurrency(expense.amount)}</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoBlock icon={ReceiptText} label="Expense title" value={expense.title} />
          <InfoBlock icon={UserRound} label="Vendor / payee" value={expense.vendor || "No vendor"} />
          <InfoBlock icon={CalendarDays} label="Expense date" value={formatDate(expense.expenseDate)} />
          <InfoBlock icon={Banknote} label="Amount" value={formatCurrency(expense.amount)} />
        </div>
        <div className="mt-4 rounded-md bg-muted/45 p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">Internal note</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{expense.note || "No note added yet."}</p>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
          Delete
        </Button>
        <Button onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
          Edit expense
        </Button>
      </div>
    </div>
  );
}

function ExpenseModal({ title, description, children, onClose, wide = false }: { title: string; description: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-xl border bg-card shadow-2xl ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-300">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h2 className="truncate text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close expense modal">
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

function Field({ label, name, type = "number", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
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

function isCurrentMonth(value?: Date | string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}
