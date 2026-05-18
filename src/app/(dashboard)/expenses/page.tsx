import { WalletCards } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { ExpensesWorkspace } from "@/components/tables/expenses-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCrmOptions, getExpenses } from "@/lib/queries";

export default async function ExpensesPage() {
  const [expenses, options, branches, selectedBranchId] = await Promise.all([getExpenses(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <PageHeading
        icon={WalletCards}
        eyebrow="Finance"
        title="Expense Management"
        description="Record office rent, salaries, marketing cost, utilities, stationery, vendors, and monthly operating cost."
      />
      <ExpensesWorkspace initialExpenses={expenses} categories={options.expenseCategory ?? []} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
