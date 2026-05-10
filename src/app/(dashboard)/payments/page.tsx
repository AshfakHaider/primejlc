import { PaymentsWorkspace } from "@/components/tables/payments-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getPayments, getStudents } from "@/lib/queries";

export default async function PaymentsPage() {
  const [payments, students, branches, selectedBranchId] = await Promise.all([getPayments(), getStudents(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Payment Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage admission fee, course fee, service charge, due amount, paid amount, and receipts.</p>
      </div>
      <PaymentsWorkspace
        initialPayments={payments}
        students={students.map((student) => ({ id: student.id, fullName: student.fullName, studentId: student.studentId, branchId: student.branchId }))}
        branches={branches}
        defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId}
      />
    </div>
  );
}
