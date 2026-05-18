import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { BranchesWorkspace } from "@/components/tables/branches-workspace";
import { getSession } from "@/lib/auth";
import { canViewAllBranches } from "@/lib/branch-access";
import { getBranches } from "@/lib/queries";

export default async function BranchesPage() {
  const session = await getSession();
  const branches = await getBranches();
  const canManageBranches = Boolean(session && canViewAllBranches(session.role));

  return (
    <div className="space-y-6">
      <PageHeading
        icon={Building2}
        eyebrow="Branches"
        title="Branch Management"
        description="Monitor Dhaka, Bogura, Jamalpur, and future database branches from one owner-level view."
      >
        <Badge variant="secondary" className="w-fit">{branches.length} branches</Badge>
      </PageHeading>

      <BranchesWorkspace initialBranches={branches} canManageBranches={canManageBranches} />
    </div>
  );
}
