import { Receipt } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { PaymentsWorkspace } from "@/components/tables/payments-workspace";
import { allBranchesValue, getSelectedBranchCookie } from "@/lib/branch-access";
import { getBranches, getPayments, getStudents } from "@/lib/queries";

export default async function PaymentsPage() {
  const [payments, students, branches, selectedBranchId] = await Promise.all([getPayments(), getStudents(), getBranches(), getSelectedBranchCookie()]);

  return (
    <div className="space-y-6">
      <PageHeading
        icon={Receipt}
        eyebrow="Finance"
        title="Payment Management"
        description="Manage admission fee, course fee, service charge, due amount, paid amount, receipts, and branch-wise collections."
      />
      <PaymentsWorkspace
        initialPayments={payments}
        students={students.map((student) => ({ id: student.id, fullName: student.fullName, studentId: student.studentId, branchId: student.branchId }))}
        branches={branches}
        defaultBranchId={selectedBranchId === allBranchesValue ? branches[0]?.id : selectedBranchId}
      />
    </div>
  );
}
