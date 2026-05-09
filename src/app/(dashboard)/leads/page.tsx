import { LeadsWorkspace } from "@/components/tables/leads-workspace";
import { getLeads } from "@/lib/queries";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Lead Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track inquiries, follow-ups, interests, and conversion status in a simple CRM Kanban board.</p>
      </div>
      <LeadsWorkspace initialLeads={leads} />
    </div>
  );
}
