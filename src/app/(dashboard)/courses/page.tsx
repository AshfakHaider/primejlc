import { CoursesWorkspace } from "@/components/tables/courses-workspace";
import { getCourses, getCrmOptions, getStudents } from "@/lib/queries";

export default async function CoursesPage() {
  const [courses, students, options] = await Promise.all([getCourses(), getStudents(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Language Course Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dynamic language program students, batch enrollment, lesson progress, attendance, fee status, and JLPT/NAT preparation.
        </p>
      </div>
      <CoursesWorkspace initialCourses={courses} students={students} options={options} />
    </div>
  );
}
