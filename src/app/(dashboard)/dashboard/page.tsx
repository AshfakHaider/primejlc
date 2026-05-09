import { Activity, Banknote, FileClock, Plane, TrendingDown, TrendingUp, Users } from "lucide-react";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardMetrics } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const coeRate = metrics.coeApplied ? Math.round((metrics.coeIssued / metrics.coeApplied) * 100) : 0;
  const visaRate = metrics.visaApplied ? Math.round((metrics.visaApproved / metrics.visaApplied) * 100) : 0;

  const cards = [
    { label: "Total students", value: metrics.totalStudents, icon: Users, note: `${metrics.activeStudents} active`, badge: "CRM" },
    { label: "Pending documents", value: metrics.pendingDocuments, icon: FileClock, note: "Needs follow-up", badge: "Docs" },
    { label: "Monthly income", value: formatCurrency(metrics.monthlyIncome), icon: TrendingUp, note: "Paid amount", badge: "May" },
    { label: "Monthly expenses", value: formatCurrency(metrics.monthlyExpenses), icon: TrendingDown, note: "Recorded spend", badge: "May" },
    { label: "Profit / loss", value: formatCurrency(metrics.profitLoss), icon: Banknote, note: metrics.profitLoss >= 0 ? "Positive month" : "Loss month", badge: "P&L" },
    { label: "Visa approved", value: metrics.visaApproved, icon: Plane, note: `${visaRate}% success from applied`, badge: "Visa" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prime operations summary for students, intake, documents, COE, visa, and finance.
          </p>
        </div>
        <Badge variant="secondary">Prime Japanese Language Centre</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-3 text-2xl">{card.value}</CardTitle>
                </div>
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{card.note}</span>
                  <Badge variant="outline">{card.badge}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      <DashboardCharts intakeData={metrics.intakeData} financeData={metrics.financeData} pipelineData={metrics.pipelineData} />
    </div>
  );
}
