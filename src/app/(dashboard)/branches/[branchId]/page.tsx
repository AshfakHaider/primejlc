import type React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, CalendarClock, ClipboardCheck, GraduationCap, ReceiptText, TrendingDown, TrendingUp, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getBranchDetail } from "@/lib/queries";
import { formatCurrency, humanize } from "@/lib/utils";

export default async function BranchDetailPage({ params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const detail = await getBranchDetail(branchId);
  if (!detail) notFound();

  const cards = [
    { label: "Total leads", value: detail.totalLeads, icon: UsersRound, tone: "bg-primary/10 text-primary" },
    { label: "Total students", value: detail.totalStudents, icon: GraduationCap, tone: "bg-secondary/10 text-secondary" },
    { label: "Language students", value: detail.languageStudents, icon: ClipboardCheck, tone: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300" },
    { label: "Full processing", value: detail.processingStudents, icon: TrendingUp, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
    { label: "Follow-up pending", value: detail.followUpPending, icon: CalendarClock, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
    { label: "Payment due", value: formatCurrency(detail.paymentDue), icon: ReceiptText, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/branches" className="mb-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to branches
        </Link>
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{detail.branch.name} Branch</h1>
              <Badge variant={detail.branch.status === "ACTIVE" ? "success" : "outline"}>{detail.branch.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{detail.branch.address} · {detail.branch.phone} · Manager: {detail.branch.managerName}</p>
          </div>
          <Badge variant={detail.profitLoss >= 0 ? "success" : "danger"}>{formatCurrency(detail.profitLoss)} profit/loss</Badge>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Branch finance</CardTitle>
            <CardDescription>Income, expenses, and profit/loss for the selected branch.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <FinanceBlock icon={Banknote} label="Monthly income" value={formatCurrency(detail.monthlyIncome)} />
            <FinanceBlock icon={TrendingDown} label="Monthly expenses" value={formatCurrency(detail.monthlyExpenses)} />
            <FinanceBlock icon={TrendingUp} label="Profit/loss" value={formatCurrency(detail.profitLoss)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff performance</CardTitle>
            <CardDescription>Assigned branch team and access role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.staff.length ? detail.staff.map((staff: any) => (
              <div key={staff.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{staff.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{staff.email}</p>
                </div>
                <Badge variant="outline">{humanize(staff.role)}</Badge>
              </div>
            )) : <p className="rounded-lg border p-4 text-sm text-muted-foreground">No staff assigned yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admission status</CardTitle>
            <CardDescription>Pipeline distribution for this branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.admissionStatus.filter((item: any) => item.count > 0).map((item: any) => (
              <div key={item.stage} className="space-y-2">
                <div className="flex justify-between gap-3 text-sm">
                  <span>{humanize(item.stage)}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
                <Progress value={(item.count / Math.max(detail.totalStudents, 1)) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest leads and student updates scoped to this branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.recentActivity.length ? detail.recentActivity.map((activity: any) => (
              <div key={`${activity.type}-${activity.id}`} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{activity.title}</p>
                  <Badge variant="secondary">{activity.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{humanize(activity.detail)} · {new Date(activity.at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>
              </div>
            )) : <p className="rounded-lg border p-4 text-sm text-muted-foreground">No recent activity yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: React.ReactNode; tone: string }) {
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

function FinanceBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="mt-3 text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
