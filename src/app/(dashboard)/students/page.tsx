import { StudentsWorkspace } from "@/components/tables/students-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCrmOptions, getStudents } from "@/lib/queries";

export default async function StudentsPage() {
  const [students, options, branches, selectedBranchId] = await Promise.all([getStudents(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Student Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain student profiles, counseling stage, target intake, Japanese level, and preferred city.
        </p>
      </div>
      <StudentsWorkspace initialStudents={students} options={options} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
