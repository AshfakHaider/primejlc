import { notFound } from "next/navigation";
import { BatchDetailWorkspace } from "@/components/tables/batch-detail-workspace";
import { getCourses, getCrmOptions, getStudents } from "@/lib/queries";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [courses, students, options] = await Promise.all([getCourses(), getStudents(), getCrmOptions()]);
  const course = courses.find((item) => item.id === id);

  if (!course) notFound();

  return <BatchDetailWorkspace initialCourse={course} students={students} options={options} />;
}
