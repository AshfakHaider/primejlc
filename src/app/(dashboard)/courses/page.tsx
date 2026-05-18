import { BookOpenCheck } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { CoursesWorkspace } from "@/components/tables/courses-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCourses, getCrmOptions, getStudents } from "@/lib/queries";

export default async function CoursesPage() {
  const [courses, students, options, branches, selectedBranchId] = await Promise.all([getCourses(), getStudents(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <PageHeading
        icon={BookOpenCheck}
        eyebrow="Language Program"
        title="Language Course Management"
        description="Manage language students, batch enrollment, lesson progress, attendance, fee status, and JLPT/NAT preparation."
      />
      <CoursesWorkspace initialCourses={courses} students={students} options={options} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
