import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { StudentsWorkspace } from "@/components/tables/students-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCrmOptions, getStudents } from "@/lib/queries";

export default async function StudentsPage({ searchParams }: { searchParams?: Promise<{ status?: string; program?: string }> }) {
  const params = await searchParams;
  const [students, options, branches, selectedBranchId] = await Promise.all([getStudents(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);
  const requestedStatus = typeof params?.status === "string" ? params.status : "ALL";
  const statusExists = requestedStatus === "ALL" || (options.applicationStatus ?? []).some((status) => status.value === requestedStatus);
  const initialStatusFilter = statusExists ? requestedStatus : "ALL";
  const requestedProgram = typeof params?.program === "string" ? params.program : "ALL";
  const programExists = requestedProgram === "ALL" || (options.programTrack ?? []).some((program) => program.value === requestedProgram);
  const initialProgramFilter = programExists ? requestedProgram : "ALL";

  return (
    <div className="space-y-6">
      <PageHeading
        icon={GraduationCap}
        eyebrow="Students"
        title="Student Management"
        description="Maintain student profiles, counseling stage, target intake, Japanese level, preferred city, branch, and application status."
      />
      <StudentsWorkspace
        initialStudents={students}
        options={options}
        branches={branches}
        defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId}
        initialStatusFilter={initialStatusFilter}
        initialProgramFilter={initialProgramFilter}
      />
    </div>
  );
}
