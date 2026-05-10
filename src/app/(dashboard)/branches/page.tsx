import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Branch Management</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Monitor Dhaka, Bogura, Jamalpur, and future database branches from one owner-level view.</p>
        </div>
        <Badge variant="secondary" className="w-fit">{branches.length} branches</Badge>
      </div>

      <BranchesWorkspace initialBranches={branches} canManageBranches={canManageBranches} />
    </div>
  );
}
