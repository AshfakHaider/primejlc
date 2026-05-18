import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Banknote,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  Plane,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { DashboardMonthSelector } from "@/components/dashboard/month-selector";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardMetrics } from "@/lib/queries";
import { cn, formatCurrency, humanize } from "@/lib/utils";

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ month?: string }> }) {
  const params = await searchParams;
  const monthOptions = getDashboardMonthOptions();
  const selectedMonth = monthOptions.some((option) => option.value === params?.month) ? String(params?.month) : monthOptions[0].value;
  const metrics = await getDashboardMetrics(selectedMonth);
  const coeRate = metrics.coeApplied ? Math.round((metrics.coeIssued / metrics.coeApplied) * 100) : 0;
  const visaRate = metrics.visaApplied ? Math.round((metrics.visaApproved / metrics.visaApplied) * 100) : 0;
  const monthLabel = monthOptions.find((option) => option.value === selectedMonth)?.label ?? "Selected month";

  const cards = [
    { label: "Total students", value: metrics.totalStudents, icon: Users, note: `${metrics.activeStudents} active students`, badge: "CRM", href: "/students", action: "View students", tone: "text-sky-400 bg-sky-500/10" },
    { label: "Total leads", value: metrics.totalLeads, icon: UserPlus, note: `${metrics.followUpPending} follow-ups pending`, badge: "Leads", href: "/leads", action: "View leads", tone: "text-teal-400 bg-teal-500/10" },
    { label: "Pending documents", value: metrics.pendingDocuments, icon: FileClock, note: "Needs document follow-up", badge: "Docs", href: "/documents", action: "Review", tone: "text-amber-400 bg-amber-500/10" },
    { label: "Monthly income", value: formatCurrency(metrics.monthlyIncome), icon: TrendingUp, note: "Paid amount this month", badge: monthLabel, href: "/payments", action: "View payments", tone: "text-emerald-400 bg-emerald-500/10" },
    { label: "Monthly expenses", value: formatCurrency(metrics.monthlyExpenses), icon: TrendingDown, note: "Recorded spend this month", badge: monthLabel, href: "/expenses", action: "View expenses", tone: "text-rose-400 bg-rose-500/10" },
    { label: "Profit / loss", value: formatCurrency(metrics.profitLoss), icon: Banknote, note: metrics.profitLoss >= 0 ? "Positive month" : "Loss month", badge: "P&L", href: "/reports", action: "View report", tone: "text-cyan-400 bg-cyan-500/10" },
    { label: "Visa approved", value: metrics.visaApproved, icon: Plane, note: `${visaRate}% success from applied`, badge: "Visa", href: "/admissions", action: "View admissions", tone: "text-violet-400 bg-violet-500/10" }
  ];

  return (
    <div className="space-y-7">
      <PageHeading
        icon={LayoutDashboard}
        eyebrow="Overview"
        title="Agency Command Center"
        description="Live summary for leads, students, admissions, documents, payments, expenses, and branch performance."
      >
        <Badge variant="secondary" className="h-9 px-3">
          Prime Japanese Language Centre
        </Badge>
        <DashboardMonthSelector options={monthOptions} selectedMonth={selectedMonth} />
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="smooth-surface group overflow-hidden hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription className="uppercase tracking-wide">{card.label}</CardDescription>
                  <CardTitle className="mt-3 text-2xl sm:text-3xl">{card.value}</CardTitle>
                </div>
                <div className={cn("rounded-md p-2", card.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate">{card.note}</span>
                  <Badge variant="outline">{card.badge}</Badge>
                </div>
                <Link href={card.href} className="smooth-surface inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2">
                  {card.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Needs Attention</CardTitle>
              <CardDescription>Follow-ups, document gaps, and active admission blockers.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/leads">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {metrics.needsAttention.length ? (
              <div className="grid gap-3">
                {metrics.needsAttention.map((item) => (
                  <Link key={`${item.href}-${item.id}`} href={item.href} className="smooth-surface group rounded-lg border bg-muted/20 p-3 hover:border-primary/35 hover:bg-muted/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{humanize(item.detail)}</p>
                      </div>
                      <Badge variant="warning" className="shrink-0">{humanize(item.priority)}</Badge>
                    </div>
                    <span className="smooth-surface mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2">
                      View
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <ClipboardCheck className="mx-auto h-7 w-7 text-emerald-400" />
                <p className="mt-3 font-medium">Nothing urgent right now</p>
                <p className="mt-1 text-sm text-muted-foreground">Follow-ups and document issues will appear here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              COE Status
            </CardTitle>
            <CardDescription>{metrics.coeIssued} issued from {metrics.coeApplied} applied.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={coeRate} />
            <p className="text-sm font-medium">{coeRate}% COE success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Visa Status
            </CardTitle>
            <CardDescription>{metrics.visaApproved} approved from {metrics.visaApplied} applied.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={visaRate} />
            <p className="text-sm font-medium">{visaRate}% visa success rate</p>
          </CardContent>
        </Card>
        </div>
      </div>

      <DashboardCharts intakeData={metrics.intakeData} financeData={metrics.financeData} pipelineData={metrics.pipelineData} />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest leads, students, payments, and admission movements across the CRM.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/leads">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[760px] divide-y">
              {metrics.recentActivity.map((activity) => (
                <Link key={`${activity.type}-${activity.id}`} href={activity.href} className="grid grid-cols-[130px_1fr_160px_150px_90px] items-center gap-4 px-4 py-3 text-sm transition hover:bg-muted/45">
                  <div className="flex items-center gap-2">
                    <ActivityDot type={activity.type} />
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{activity.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{humanize(activity.detail)}</p>
                  </div>
                  <Badge variant={activity.status === "PAID" || activity.status === "VISA_APPROVED" ? "success" : activity.status === "DUE" ? "warning" : "secondary"} className="w-fit">
                    {humanize(activity.status)}
                  </Badge>
                  <span className="truncate text-xs text-muted-foreground">{activity.branch}</span>
                  <span className="justify-self-end text-xs font-medium text-primary">View →</span>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getDashboardMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = index === 0 ? "This month" : date.toLocaleDateString("en-BD", { month: "long", year: "numeric" });
    return { value, label };
  });
}

function ActivityDot({ type }: { type: string }) {
  const tone = type === "Lead" ? "bg-teal-400" : type === "Payment" ? "bg-emerald-400" : type === "Admission" ? "bg-violet-400" : "bg-sky-400";
  return <span className={cn("h-2.5 w-2.5 rounded-full", tone)} />;
}
