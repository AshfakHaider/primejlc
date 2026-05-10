import { ExpensesWorkspace } from "@/components/tables/expenses-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getCrmOptions, getExpenses } from "@/lib/queries";

export default async function ExpensesPage() {
  const [expenses, options, branches, selectedBranchId] = await Promise.all([getExpenses(), getCrmOptions(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Expense Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record office rent, salaries, marketing cost, utilities, stationery, and other expenses.</p>
      </div>
      <ExpensesWorkspace initialExpenses={expenses} categories={options.expenseCategory ?? []} branches={branches} defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId} />
    </div>
  );
}
