"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { BadgeDollarSign, CalendarDays, CreditCard, Edit3, FileText, Plus, ReceiptText, Search, Trash2, UserRound, WalletCards, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type StudentOption = { id: string; fullName: string; studentId: string; branchId?: string | null };
type BranchOption = { id: string; name: string };
type Payment = {
  id: string;
  branchId?: string | null;
  branch?: { id: string; name: string } | null;
  receiptNo: string;
  admissionFee: number | string;
  courseFee: number | string;
  serviceCharge: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  paymentDate: Date | string;
  method: string;
  note?: string | null;
  student: StudentOption;
};

type PaymentMode = "closed" | "create" | "view" | "edit";

const emptyPayment: Payment = {
  id: "",
  receiptNo: "",
  admissionFee: "",
  courseFee: "",
  serviceCharge: "",
  paidAmount: "",
  dueAmount: "",
  paymentDate: "",
  method: "Cash",
  note: "",
  student: { id: "", fullName: "", studentId: "" }
};

const defaultMethods = ["Cash", "Bank transfer", "bKash", "Nagad", "Card"];

export function PaymentsWorkspace({ initialPayments, students, branches, defaultBranchId }: { initialPayments: Payment[]; students: StudentOption[]; branches: BranchOption[]; defaultBranchId?: string }) {
  const [payments, setPayments] = useState(initialPayments);
  const [mode, setMode] = useState<PaymentMode>("closed");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const methods = useMemo(() => Array.from(new Set([...defaultMethods, ...payments.map((payment) => payment.method).filter(Boolean)])), [payments]);

  const filteredPayments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesMethod = methodFilter === "ALL" || payment.method === methodFilter;
      const matchesBranch = branchFilter === "ALL" || payment.branchId === branchFilter;
      const matchesSearch =
        !search ||
        [payment.receiptNo, payment.method, payment.student?.fullName, payment.student?.studentId]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesMethod && matchesBranch && matchesSearch;
    });
  }, [branchFilter, methodFilter, payments, query]);

  const stats = useMemo(() => {
    const paid = payments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
    const due = payments.reduce((sum, payment) => sum + Number(payment.dueAmount || 0), 0);
    const monthPaid = payments
      .filter((payment) => isCurrentMonth(payment.paymentDate))
      .reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
    const clearReceipts = payments.filter((payment) => Number(payment.dueAmount || 0) <= 0).length;
    return { paid, due, monthPaid, clearReceipts };
  }, [payments]);

  async function savePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const editing = mode === "edit" && selectedPayment?.id;
    const response = await fetch(editing ? `/api/payments/${selectedPayment.id}` : "/api/payments", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (response.ok) {
      const payment = await response.json();
      setPayments((current) => (editing ? current.map((item) => (item.id === payment.id ? payment : item)) : [payment, ...current]));
      setSelectedPayment(payment);
      setMode("view");
      event.currentTarget.reset();
    }
  }

  async function deletePayment(id: string) {
    const response = await fetch(`/api/payments/${id}`, { method: "DELETE" });
    if (response.ok) {
      setPayments((current) => current.filter((payment) => payment.id !== id));
      if (selectedPayment?.id === id) {
        setSelectedPayment(null);
        setMode("closed");
      }
    }
  }

  function openCreate() {
    setSelectedPayment(null);
    setMode("create");
  }

  function openView(payment: Payment) {
    setSelectedPayment(payment);
    setMode("view");
  }

  function openEdit(payment: Payment) {
    setSelectedPayment(payment);
    setMode("edit");
  }

  const formPayment = mode === "edit" && selectedPayment ? selectedPayment : emptyPayment;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={WalletCards} label="Total collected" value={formatCurrency(stats.paid)} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
        <MetricCard icon={BadgeDollarSign} label="Total due" value={formatCurrency(stats.due)} tone="bg-amber-500/10 text-amber-600 dark:text-amber-300" />
        <MetricCard icon={CalendarDays} label="This month" value={formatCurrency(stats.monthPaid)} tone="bg-primary/10 text-primary" />
        <MetricCard icon={ReceiptText} label="Cleared receipts" value={`${stats.clearReceipts}/${payments.length}`} tone="bg-secondary/10 text-secondary" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <CardTitle>Payment Ledger</CardTitle>
              <CardDescription>Search receipts, verify dues, open receipts, and record student payments from one clean view.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CountPill value={filteredPayments.length} label={filteredPayments.length === 1 ? "receipt" : "receipts"} />
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Record payment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search receipt, student, ID, method..." />
            </div>
            <Select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} aria-label="Filter payment method">
              <option value="ALL">All payment methods</option>
              {methods.map((method) => <option key={method} value={method}>{method}</option>)}
            </Select>
            <Select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filter payments by branch">
              <option value="ALL">All branches</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </Select>
          </div>

          <div className="hidden overflow-x-auto rounded-lg border lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="cursor-pointer transition-colors hover:bg-muted/45" onClick={() => openView(payment)}>
                    <TableCell>
                      <div className="font-medium">{payment.receiptNo}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Total {formatCurrency(paymentTotal(payment))}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.student?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{payment.student?.studentId}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{payment.branch?.name ?? "Unassigned"}</Badge></TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.paidAmount)}</TableCell>
                    <TableCell><DueBadge value={payment.dueAmount} /></TableCell>
                    <TableCell><Badge variant="outline">{payment.method}</Badge></TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View receipt"
                          onClick={(event) => {
                            event.stopPropagation();
                            openView(payment);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete payment"
                          onClick={(event) => {
                            event.stopPropagation();
                            deletePayment(payment.id);
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
            {filteredPayments.map((payment) => (
              <button key={payment.id} className="rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/35" onClick={() => openView(payment)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{payment.receiptNo}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{payment.student?.fullName} · {payment.student?.studentId}</p>
                  </div>
                  <DueBadge value={payment.dueAmount} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <InfoMini label="Paid" value={formatCurrency(payment.paidAmount)} />
                  <InfoMini label="Branch" value={payment.branch?.name ?? "Unassigned"} />
                  <InfoMini label="Method" value={payment.method} />
                  <InfoMini label="Date" value={formatDate(payment.paymentDate)} />
                </div>
              </button>
            ))}
          </div>

          {filteredPayments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">No payment records match this view.</p>
              <p className="mt-1 text-sm text-muted-foreground">Clear the filter or record a new payment receipt.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode !== "closed" ? (
        <FinanceModal
          title={mode === "create" ? "Record payment" : mode === "edit" ? `Edit ${formPayment.receiptNo}` : selectedPayment?.receiptNo ?? "Payment receipt"}
          description={mode === "view" ? "Receipt details, student account, fees, dues, and collection method." : "Enter fee heads and paid amount. Due is calculated automatically."}
          onClose={() => setMode("closed")}
          wide={mode === "view"}
        >
          {mode === "view" && selectedPayment ? (
            <PaymentReceipt payment={selectedPayment} onEdit={() => setMode("edit")} onDelete={() => deletePayment(selectedPayment.id)} />
          ) : (
            <PaymentForm payment={formPayment} students={students} branches={branches} defaultBranchId={defaultBranchId} methods={methods} onSubmit={savePayment} saving={saving} submitLabel={mode === "create" ? "Generate receipt" : "Save payment"} />
          )}
        </FinanceModal>
      ) : null}
    </div>
  );
}

function PaymentForm({ payment, students, branches, defaultBranchId, methods, onSubmit, saving, submitLabel }: { payment: Payment; students: StudentOption[]; branches: BranchOption[]; defaultBranchId?: string; methods: string[]; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; saving: boolean; submitLabel: string }) {
  const studentId = payment.student?.id || students[0]?.id || "";

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="branchId">Branch</Label>
          <Select id="branchId" name="branchId" defaultValue={payment.branchId || defaultBranchId}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="studentId">Student</Label>
          <Select id="studentId" name="studentId" defaultValue={studentId} required>
            {students.map((student) => <option key={student.id} value={student.id}>{student.fullName} · {student.studentId}</option>)}
          </Select>
        </div>
        <Field label="Receipt no" name="receiptNo" type="text" defaultValue={payment.receiptNo} placeholder="Auto if blank" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Admission fee" name="admissionFee" defaultValue={String(payment.admissionFee)} />
        <Field label="Course fee" name="courseFee" defaultValue={String(payment.courseFee)} />
        <Field label="Service charge" name="serviceCharge" defaultValue={String(payment.serviceCharge)} />
        <Field label="Paid amount" name="paidAmount" defaultValue={String(payment.paidAmount)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment date" name="paymentDate" type="date" defaultValue={dateInput(payment.paymentDate)} />
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select id="method" name="method" defaultValue={payment.method || "Cash"}>
            {methods.map((method) => <option key={method} value={method}>{method}</option>)}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" defaultValue={payment.note ?? ""} placeholder="Reference number, installment note, or internal account comment." />
      </div>
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}

function PaymentReceipt({ payment, onEdit, onDelete }: { payment: Payment; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border p-4">
        <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Prime Japanese Language Centre</p>
            <h3 className="mt-1 text-2xl font-semibold">{payment.receiptNo}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Money receipt · {formatDate(payment.paymentDate)}</p>
          </div>
          <DueBadge value={payment.dueAmount} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <InfoBlock icon={ReceiptText} label="Branch" value={payment.branch?.name ?? "Unassigned"} />
          <InfoBlock icon={UserRound} label="Student" value={`${payment.student?.fullName ?? "Unknown"} · ${payment.student?.studentId ?? ""}`} />
          <InfoBlock icon={CreditCard} label="Method" value={payment.method} />
          <InfoBlock icon={CalendarDays} label="Payment date" value={formatDate(payment.paymentDate)} />
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <div className="grid grid-cols-2 border-b bg-muted/35 px-4 py-3 text-sm font-medium">
            <span>Fee head</span>
            <span className="text-right">Amount</span>
          </div>
          <ReceiptLine label="Admission fee" value={payment.admissionFee} />
          <ReceiptLine label="Course fee" value={payment.courseFee} />
          <ReceiptLine label="Service charge" value={payment.serviceCharge} />
          <ReceiptLine label="Paid amount" value={payment.paidAmount} emphasis />
          <ReceiptLine label="Due amount" value={payment.dueAmount} />
        </div>
        {payment.note ? <p className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">{payment.note}</p> : null}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
          Delete
        </Button>
        <Button onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
          Edit receipt
        </Button>
      </div>
    </div>
  );
}

function FinanceModal({ title, description, children, onClose, wide = false }: { title: string; description: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full overflow-hidden rounded-xl border bg-card shadow-2xl ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ReceiptText className="h-5 w-5" />
            </div>
            <h2 className="truncate text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close payment modal">
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

function DueBadge({ value }: { value: number | string }) {
  const amount = Number(value || 0);
  return <Badge variant={amount > 0 ? "warning" : "success"}>{amount > 0 ? `${formatCurrency(amount)} due` : "Cleared"}</Badge>;
}

function ReceiptLine({ label, value, emphasis }: { label: string; value: number | string; emphasis?: boolean }) {
  return (
    <div className={`grid grid-cols-2 border-b px-4 py-3 text-sm last:border-b-0 ${emphasis ? "bg-primary/5 font-semibold" : ""}`}>
      <span>{label}</span>
      <span className="text-right">{formatCurrency(value)}</span>
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

function Field({ label, name, type = "number", defaultValue, required, placeholder }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder} />
    </div>
  );
}

function paymentTotal(payment: Payment) {
  return Number(payment.admissionFee || 0) + Number(payment.courseFee || 0) + Number(payment.serviceCharge || 0);
}

function formatDate(value?: Date | string) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-GB", { timeZone: "UTC" });
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
