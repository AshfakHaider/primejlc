import { notFound } from "next/navigation";
import { BatchDetailWorkspace } from "@/components/tables/batch-detail-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCourses, getCrmOptions, getStudents } from "@/lib/queries";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [courses, students, options, branches, selectedBranchId] = await Promise.all([getCourses(), getStudents(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);
  const course = courses.find((item) => item.id === id);

  if (!course) notFound();

  return <BatchDetailWorkspace initialCourse={course} students={students} options={options} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />;
}
