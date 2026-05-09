import { StudentsWorkspace } from "@/components/tables/students-workspace";
import { getCrmOptions, getStudents } from "@/lib/queries";

export default async function StudentsPage() {
  const [students, options] = await Promise.all([getStudents(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Student Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain student profiles, counseling stage, target intake, Japanese level, and preferred city.
        </p>
      </div>
      <StudentsWorkspace initialStudents={students} options={options} />
    </div>
  );
}
