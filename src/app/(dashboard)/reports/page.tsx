import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getDashboardMetrics, getExpenses, getPayments, getStudents } from "@/lib/queries";
import { formatCurrency, humanize } from "@/lib/utils";

export default async function ReportsPage() {
  const [metrics, students, payments, expenses, branches, selectedBranchId] = await Promise.all([getDashboardMetrics(), getStudents(), getPayments(), getExpenses(), getBranches(), getSelectedBranchCookie()]);
  const branchName = selectedBranchId === allBranchesValue ? "All Branches" : branches.find((branch) => branch.id === selectedBranchId)?.name ?? "Current branch";
  const coeRate = metrics.coeApplied ? Math.round((metrics.coeIssued / metrics.coeApplied) * 100) : 0;
  const visaRate = metrics.visaApplied ? Math.round((metrics.visaApproved / metrics.visaApplied) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Student, intake, payment, expense, profit/loss, visa success, and COE success reports.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard title="Branch filter" value={branchName} detail="Reports follow the global top-bar branch scope" />
        <ReportCard title="Student report" value={`${students.length} students`} detail={`${metrics.activeStudents} active records`} />
        <ReportCard title="Payment report" value={formatCurrency(metrics.monthlyIncome)} detail={`${payments.length} receipts`} />
        <ReportCard title="Expense report" value={formatCurrency(metrics.monthlyExpenses)} detail={`${expenses.length} expense entries`} />
        <ReportCard title="Profit/loss report" value={formatCurrency(metrics.profitLoss)} detail={metrics.profitLoss >= 0 ? "Positive balance" : "Needs attention"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intake-wise report</CardTitle>
            <CardDescription>Target intake volume for active admissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.intakeData.map((intake) => (
              <div key={intake.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{intake.name}</span>
                  <Badge variant="outline">{intake.students}</Badge>
                </div>
                <Progress value={(intake.students / Math.max(students.length, 1)) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success reports</CardTitle>
            <CardDescription>Visa success report and COE success rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>COE success rate</span><strong>{coeRate}%</strong></div>
              <Progress value={coeRate} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Visa success rate</span><strong>{visaRate}%</strong></div>
              <Progress value={visaRate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {students.slice(0, 4).map((student) => (
                <div key={student.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{humanize(student.applicationStatus)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="mt-2 text-xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  );
}
