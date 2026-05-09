import { prisma } from "@/lib/prisma";
import * as sample from "@/lib/sample-data";

const studentSelect = {
  id: true,
  studentId: true,
  fullName: true,
  phone: true,
  email: true,
  address: true,
  passportNumber: true,
  educationLevel: true,
  programTrack: true,
  japaneseLevel: true,
  targetIntake: true,
  preferredCity: true,
  applicationStatus: true,
  coeStatus: true,
  visaStatus: true,
  isActive: true,
  assignedCounselor: { select: { name: true } }
};

async function safe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try {
    return await query();
  } catch {
    return fallback;
  }
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}

export async function getStudents() {
  return safe<any[]>(
    () =>
      prisma.student.findMany({
        select: studentSelect,
        orderBy: { createdAt: "desc" }
      }),
    sample.students
  );
}

export async function getSchools() {
  return safe<any[]>(
    async () => {
      const schools = await prisma.school.findMany({ orderBy: { applicationDeadline: "asc" } });
      return schools.map((school) => ({
        id: school.id,
        name: school.name,
        cityPrefecture: school.cityPrefecture,
        intakeAvailability: school.intakeAvailability,
        tuitionFee: toNumber(school.tuitionFee),
        applicationDeadline: school.applicationDeadline.toISOString(),
        contactEmail: school.contactEmail,
        partnerStatus: school.partnerStatus,
        notes: school.notes
      }));
    },
    sample.schools.map((school) => ({ ...school, applicationDeadline: school.applicationDeadline.toISOString() }))
  );
}

export async function getCourses() {
  return safe<any[]>(
    async () => {
      const courses = await prisma.courseBatch.findMany({
        include: {
          enrollments: { include: { student: true } },
          attendance: true,
          sessions: { include: { attendance: true }, orderBy: { classDate: "desc" } }
        },
        orderBy: { createdAt: "desc" }
      });
      return courses.map((course) => ({
        ...course,
        startDate: course.startDate?.toISOString() ?? null,
        endDate: course.endDate?.toISOString() ?? null,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        sessions: course.sessions.map((session) => ({
          ...session,
          classDate: session.classDate.toISOString(),
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString()
        }))
      }));
    },
    sample.courses.map((course) => ({
      ...course,
      startDate: course.startDate?.toISOString() ?? null,
      endDate: course.endDate?.toISOString() ?? null
    }))
  );
}

export async function getCrmOptions() {
  return safe<Record<string, { value: string; label: string }[]>>(
    async () => {
      const options = await prisma.crmOption.findMany({
        where: { isActive: true },
        orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { label: "asc" }]
      });
      return options.reduce<Record<string, { value: string; label: string }[]>>((acc, option) => {
        acc[option.group] = [...(acc[option.group] ?? []), { value: option.value, label: option.label }];
        return acc;
      }, {});
    },
    sample.crmOptions
  );
}

export async function getLeads() {
  return safe<any[]>(
    async () => {
      const leads = await prisma.lead.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      });
      return leads.map((lead) => ({
        ...lead,
        nextFollowUpDate: lead.nextFollowUpDate?.toISOString() ?? null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString()
      }));
    },
    sample.leads.map((lead) => ({
      ...lead,
      nextFollowUpDate: lead.nextFollowUpDate?.toISOString() ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  );
}

export async function getPayments() {
  return safe<any[]>(
    async () => {
      const payments = await prisma.payment.findMany({
        include: { student: { select: { id: true, fullName: true, studentId: true } } },
        orderBy: { paymentDate: "desc" }
      });
      return payments.map((payment) => ({
        id: payment.id,
        receiptNo: payment.receiptNo,
        student: payment.student,
        admissionFee: toNumber(payment.admissionFee),
        courseFee: toNumber(payment.courseFee),
        serviceCharge: toNumber(payment.serviceCharge),
        paidAmount: toNumber(payment.paidAmount),
        dueAmount: toNumber(payment.dueAmount),
        paymentDate: payment.paymentDate.toISOString(),
        method: payment.method,
        note: payment.note
      }));
    },
    sample.payments.map((payment) => ({ ...payment, paymentDate: payment.paymentDate.toISOString() }))
  );
}

export async function getExpenses() {
  return safe<any[]>(
    async () => {
      const expenses = await prisma.expense.findMany({
        include: { recordedBy: { select: { name: true } } },
        orderBy: { expenseDate: "desc" }
      });
      return expenses.map((expense) => ({
        id: expense.id,
        category: expense.category,
        title: expense.title,
        amount: toNumber(expense.amount),
        expenseDate: expense.expenseDate.toISOString(),
        vendor: expense.vendor,
        note: expense.note,
        recordedBy: expense.recordedBy
      }));
    },
    sample.expenses.map((expense) => ({ ...expense, expenseDate: expense.expenseDate.toISOString() }))
  );
}

export async function getDocuments() {
  return safe<any[]>(
    () =>
      prisma.documentChecklist.findMany({
        include: { student: true, files: true },
        orderBy: { updatedAt: "desc" }
      }),
    []
  );
}

export async function getAdmissions() {
  return safe<any[]>(
    () =>
      prisma.admission.findMany({
        include: { student: true },
        orderBy: { updatedAt: "desc" }
      }),
    sample.students.map((student) => ({ id: `admission-${student.id}`, currentStage: student.applicationStatus, student }))
  );
}

export async function getUsers() {
  return safe<any[]>(
    () => prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } }),
    [
      { id: "user-1", name: "Prime Admin", email: "admin@primejlc.com", phone: "01798562705", role: "ADMIN", isActive: true },
      { id: "user-2", name: "Nusrat Jahan", email: "counselor@primejlc.com", phone: "01811000001", role: "COUNSELOR", isActive: true }
    ]
  );
}

export async function getAgencySettings() {
  return safe(
    async () => (await prisma.agencySetting.findFirst()) ?? sample.agency,
    sample.agency
  );
}

export async function getDashboardMetrics() {
  const [students, payments, expenses] = await Promise.all([getStudents(), getPayments(), getExpenses()]);
  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student.isActive).length;
  const pendingDocuments = students.filter((student) => student.applicationStatus === "DOCUMENTS_PENDING").length;
  const coeIssued = students.filter((student) => student.coeStatus === "ISSUED").length;
  const coeApplied = students.filter((student) => ["APPLIED", "ISSUED"].includes(student.coeStatus)).length;
  const visaApproved = students.filter((student) => student.visaStatus === "APPROVED").length;
  const visaApplied = students.filter((student) => ["APPLIED", "APPROVED"].includes(student.visaStatus)).length;
  const monthlyIncome = payments.reduce((sum, payment) => sum + Number(payment.paidAmount), 0);
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const intakeData = ["OCTOBER", "APRIL", "JUNE_JULY"].map((intake) => ({
    name: intake === "JUNE_JULY" ? "June/July" : intake[0] + intake.slice(1).toLowerCase(),
    students: students.filter((student) => student.targetIntake === intake).length
  }));

  const financeData = [
    { month: "Jan", income: 92000, expenses: 61000 },
    { month: "Feb", income: 126000, expenses: 73000 },
    { month: "Mar", income: 148000, expenses: 79000 },
    { month: "Apr", income: 171000, expenses: 88000 },
    { month: "May", income: monthlyIncome, expenses: monthlyExpenses }
  ];

  const pipelineData = sample.pipelineStages.map((stage) => ({
    stage,
    count: students.filter((student) => student.applicationStatus === stage).length
  }));

  return {
    totalStudents,
    activeStudents,
    pendingDocuments,
    coeIssued,
    coeApplied,
    visaApproved,
    visaApplied,
    monthlyIncome,
    monthlyExpenses,
    profitLoss: monthlyIncome - monthlyExpenses,
    intakeData,
    financeData,
    pipelineData
  };
}
