import { PaymentsWorkspace } from "@/components/tables/payments-workspace";
import { getPayments, getStudents } from "@/lib/queries";

export default async function PaymentsPage() {
  const [payments, students] = await Promise.all([getPayments(), getStudents()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Payment Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage admission fee, course fee, service charge, due amount, paid amount, and receipts.</p>
      </div>
      <PaymentsWorkspace initialPayments={payments} students={students.map((student) => ({ id: student.id, fullName: student.fullName, studentId: student.studentId }))} />
    </div>
  );
}
