import { LeadsWorkspace } from "@/components/tables/leads-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getLeads } from "@/lib/queries";

export default async function LeadsPage() {
  const [leads, branches, selectedBranchId] = await Promise.all([getLeads(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Lead Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track inquiries, follow-ups, interests, and conversion status in a simple CRM Kanban board.</p>
      </div>
      <LeadsWorkspace initialLeads={leads} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
