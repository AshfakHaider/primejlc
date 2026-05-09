import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdmissions } from "@/lib/queries";
import { pipelineStages } from "@/lib/sample-data";
import { humanize } from "@/lib/utils";

export default async function AdmissionsPage() {
  const admissions = await getAdmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Admission Tracking</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lead to counseling, school application, COE, visa, and flight readiness pipeline.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {pipelineStages.map((stage) => {
          const stageAdmissions = admissions.filter((admission) => admission.currentStage === stage);
          return (
            <Card key={stage} className="min-h-40">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{humanize(stage)}</CardTitle>
                <CardDescription>{stageAdmissions.length} students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {stageAdmissions.length ? stageAdmissions.map((admission) => (
                  <div key={admission.id} className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">{admission.student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{admission.student.studentId}</p>
                  </div>
                )) : <Badge variant="outline">No records</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
