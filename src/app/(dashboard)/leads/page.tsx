import { MessageSquareMore } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { LeadsWorkspace } from "@/components/tables/leads-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getLeads } from "@/lib/queries";

export default async function LeadsPage() {
  const [leads, branches, selectedBranchId] = await Promise.all([getLeads(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <PageHeading
        icon={MessageSquareMore}
        eyebrow="Pipeline"
        title="Lead Management"
        description="Track inquiries, follow-ups, interests, city filters, branch ownership, and conversion status in list or Kanban view."
      />
      <LeadsWorkspace initialLeads={leads} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
