import { ExpensesWorkspace } from "@/components/tables/expenses-workspace";
import { getCrmOptions, getExpenses } from "@/lib/queries";

export default async function ExpensesPage() {
  const [expenses, options] = await Promise.all([getExpenses(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Expense Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record office rent, salaries, marketing cost, utilities, stationery, and other expenses.</p>
      </div>
      <ExpensesWorkspace initialExpenses={expenses} categories={options.expenseCategory ?? []} />
    </div>
  );
}
