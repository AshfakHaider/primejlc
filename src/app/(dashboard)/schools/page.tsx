import { SchoolsWorkspace } from "@/components/tables/schools-workspace";
import { getCrmOptions, getSchools } from "@/lib/queries";

export default async function SchoolsPage() {
  const [schools, options] = await Promise.all([getSchools(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">School Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage partner school contacts, intakes, tuition fees, deadlines, and notes.</p>
      </div>
      <SchoolsWorkspace initialSchools={schools} options={options} />
    </div>
  );
}
