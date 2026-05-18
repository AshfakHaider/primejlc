import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdmissions } from "@/lib/queries";
import { pipelineStages } from "@/lib/sample-data";
import { humanize } from "@/lib/utils";

export default async function AdmissionsPage() {
  const admissions = await getAdmissions();

  return (
    <div className="space-y-6">
      <PageHeading
        icon={ClipboardCheck}
        eyebrow="Admissions"
        title="Admission Tracking"
        description="Track each student from lead and counseling through school application, COE, visa, and flight readiness."
      />
      <div className="grid gap-4 xl:grid-cols-4">
        {pipelineStages.map((stage) => {
          const stageAdmissions = admissions.filter((admission) => admission.currentStage === stage);
          return (
            <Card key={stage} className="min-h-40 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4">
                <div>
                  <CardTitle className="text-sm">{humanize(stage)}</CardTitle>
                  <CardDescription>{stageAdmissions.length} students</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs">
                  <Link href={`/students?status=${encodeURIComponent(stage)}`}>View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {stageAdmissions.length ? stageAdmissions.map((admission) => (
                  <div key={admission.id} className="smooth-surface rounded-md border bg-background p-3 hover:border-primary/30 hover:bg-muted/30">
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
