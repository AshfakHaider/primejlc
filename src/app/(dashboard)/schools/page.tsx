import { Landmark } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { SchoolsWorkspace } from "@/components/tables/schools-workspace";
import { getCrmOptions, getSchools } from "@/lib/queries";

export default async function SchoolsPage() {
  const [schools, options] = await Promise.all([getSchools(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <PageHeading
        icon={Landmark}
        eyebrow="Partners"
        title="School Management"
        description="Manage partner school contacts, intakes, tuition fees, deadlines, status, and internal notes."
      />
      <SchoolsWorkspace initialSchools={schools} options={options} />
    </div>
  );
}
