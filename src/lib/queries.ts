import { prisma } from "@/lib/prisma";
import * as sample from "@/lib/sample-data";
import { branchWhere, getReadBranchId } from "@/lib/branch-access";

const studentSelect = {
  id: true,
  branchId: true,
  branch: { select: { id: true, name: true } },
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
  updatedAt: true,
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

function filterSampleByBranch<T extends { branchId?: string | null }>(items: T[], branchId: string | null) {
  return branchId ? items.filter((item) => item.branchId === branchId) : items;
}

export async function getBranches() {
  return safe<any[]>(
    async () => {
      const branches = await prisma.branch.findMany({
        orderBy: [{ status: "asc" }, { name: "asc" }]
      });
      return branches.map((branch) => ({
        ...branch,
        createdAt: branch.createdAt.toISOString(),
        updatedAt: branch.updatedAt.toISOString()
      }));
    },
    sample.branches
  );
}

export async function getStudents() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    () =>
      prisma.student.findMany({
        where: branchWhere(branchId),
        select: studentSelect,
        orderBy: { createdAt: "desc" }
      }),
    filterSampleByBranch(sample.students, branchId)
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
  const branchId = await getReadBranchId();
  return safe<any[]>(
    async () => {
      const courses = await prisma.courseBatch.findMany({
        where: branchWhere(branchId),
        include: {
          branch: { select: { id: true, name: true } },
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
    filterSampleByBranch(sample.courses, branchId).map((course) => ({
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
  const branchId = await getReadBranchId();
  return safe<any[]>(
    async () => {
      const leads = await prisma.lead.findMany({
        where: branchWhere(branchId),
        include: { branch: { select: { id: true, name: true } } },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      });
      return leads.map((lead) => ({
        ...lead,
        nextFollowUpDate: lead.nextFollowUpDate?.toISOString() ?? null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString()
      }));
    },
    filterSampleByBranch(sample.leads, branchId).map((lead) => ({
      ...lead,
      nextFollowUpDate: lead.nextFollowUpDate?.toISOString() ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  );
}

export async function getPayments() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    async () => {
      const payments = await prisma.payment.findMany({
        where: branchWhere(branchId),
        include: {
          branch: { select: { id: true, name: true } },
          student: { select: { id: true, fullName: true, studentId: true } }
        },
        orderBy: { paymentDate: "desc" }
      });
      return payments.map((payment) => ({
        id: payment.id,
        receiptNo: payment.receiptNo,
        branchId: payment.branchId,
        branch: payment.branch,
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
    filterSampleByBranch(sample.payments, branchId).map((payment) => ({ ...payment, paymentDate: payment.paymentDate.toISOString() }))
  );
}

export async function getExpenses() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    async () => {
      const expenses = await prisma.expense.findMany({
        where: branchWhere(branchId),
        include: { branch: { select: { id: true, name: true } }, recordedBy: { select: { name: true } } },
        orderBy: { expenseDate: "desc" }
      });
      return expenses.map((expense) => ({
        id: expense.id,
        branchId: expense.branchId,
        branch: expense.branch,
        category: expense.category,
        title: expense.title,
        amount: toNumber(expense.amount),
        expenseDate: expense.expenseDate.toISOString(),
        vendor: expense.vendor,
        note: expense.note,
        recordedBy: expense.recordedBy
      }));
    },
    filterSampleByBranch(sample.expenses, branchId).map((expense) => ({ ...expense, expenseDate: expense.expenseDate.toISOString() }))
  );
}

export async function getDocuments() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    () =>
      prisma.documentChecklist.findMany({
        where: branchId ? { student: { branchId } } : undefined,
        include: { student: true, files: true },
        orderBy: { updatedAt: "desc" }
      }),
    []
  );
}

export async function getAdmissions() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    () =>
      prisma.admission.findMany({
        where: branchWhere(branchId),
        include: { student: true },
        orderBy: { updatedAt: "desc" }
      }),
    filterSampleByBranch(sample.students, branchId).map((student) => ({ id: `admission-${student.id}`, currentStage: student.applicationStatus, student }))
  );
}

export async function getUsers() {
  const branchId = await getReadBranchId();
  return safe<any[]>(
    () =>
      prisma.user.findMany({
        where: branchWhere(branchId),
        select: { id: true, name: true, email: true, phone: true, role: true, branchId: true, branch: { select: { id: true, name: true } }, isActive: true }
      }),
    [
      { id: "user-1", name: "Prime Admin", email: "admin@primejlc.com", phone: "01798562705", role: "SUPER_ADMIN", branchId: sample.branches[0].id, branch: { id: sample.branches[0].id, name: sample.branches[0].name }, isActive: true },
      { id: "user-2", name: "Nusrat Jahan", email: "counselor@primejlc.com", phone: "01811000001", role: "COUNSELOR", branchId: sample.branches[0].id, branch: { id: sample.branches[0].id, name: sample.branches[0].name }, isActive: true }
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
  const [students, payments, expenses, leads, admissions] = await Promise.all([getStudents(), getPayments(), getExpenses(), getLeads(), getAdmissions()]);
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
    totalLeads: leads.length,
    followUpPending: leads.filter((lead) => lead.status === "FOLLOW_UP" || (lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) <= new Date())).length,
    admissions: admissions.length,
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

export async function getBranchDetail(branchId: string) {
  return safe<any | null>(
    async () => {
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) return null;

      const [leads, students, payments, expenses, admissions, users] = await Promise.all([
        prisma.lead.findMany({ where: { branchId }, orderBy: { updatedAt: "desc" }, take: 8 }),
        prisma.student.findMany({ where: { branchId }, select: studentSelect, orderBy: { updatedAt: "desc" }, take: 8 }),
        prisma.payment.findMany({ where: { branchId }, orderBy: { paymentDate: "desc" } }),
        prisma.expense.findMany({ where: { branchId }, orderBy: { expenseDate: "desc" } }),
        prisma.admission.findMany({ where: { branchId }, include: { student: true }, orderBy: { updatedAt: "desc" } }),
        prisma.user.findMany({ where: { branchId }, select: { id: true, name: true, email: true, phone: true, role: true, isActive: true } })
      ]);

      const monthlyIncome = payments.reduce((sum, payment) => sum + toNumber(payment.paidAmount), 0);
      const monthlyExpenses = expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
      const paymentDue = payments.reduce((sum, payment) => sum + toNumber(payment.dueAmount), 0);

      return {
        branch: {
          ...branch,
          createdAt: branch.createdAt.toISOString(),
          updatedAt: branch.updatedAt.toISOString()
        },
        totalLeads: leads.length,
        totalStudents: students.length,
        languageStudents: students.filter((student) => student.programTrack === "LANGUAGE_PROGRAM").length,
        processingStudents: students.filter((student) => student.programTrack !== "LANGUAGE_PROGRAM").length,
        followUpPending: leads.filter((lead) => lead.status === "FOLLOW_UP" || (lead.nextFollowUpDate && lead.nextFollowUpDate <= new Date())).length,
        monthlyIncome,
        monthlyExpenses,
        profitLoss: monthlyIncome - monthlyExpenses,
        paymentDue,
        admissionStatus: sample.pipelineStages.map((stage) => ({
          stage,
          count: admissions.filter((admission) => admission.currentStage === stage).length
        })),
        staff: users,
        recentActivity: [
          ...leads.slice(0, 4).map((lead) => ({ id: lead.id, title: lead.name, type: "Lead", detail: lead.status, at: lead.updatedAt.toISOString() })),
          ...students.slice(0, 4).map((student) => ({ id: student.id, title: student.fullName, type: "Student", detail: student.applicationStatus, at: student.updatedAt?.toISOString?.() ?? new Date().toISOString() }))
        ]
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
          .slice(0, 8)
      };
    },
    (() => {
      const branch = sample.branches.find((item) => item.id === branchId);
      if (!branch) return null;
      const students = filterSampleByBranch(sample.students, branchId);
      const leads = filterSampleByBranch(sample.leads, branchId);
      const payments = filterSampleByBranch(sample.payments, branchId);
      const expenses = filterSampleByBranch(sample.expenses, branchId);
      const monthlyIncome = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
      const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        branch,
        totalLeads: leads.length,
        totalStudents: students.length,
        languageStudents: students.filter((student) => student.programTrack === "LANGUAGE_PROGRAM").length,
        processingStudents: students.filter((student) => student.programTrack !== "LANGUAGE_PROGRAM").length,
        followUpPending: leads.filter((lead) => lead.status === "FOLLOW_UP").length,
        monthlyIncome,
        monthlyExpenses,
        profitLoss: monthlyIncome - monthlyExpenses,
        paymentDue: payments.reduce((sum, payment) => sum + payment.dueAmount, 0),
        admissionStatus: sample.pipelineStages.map((stage) => ({ stage, count: students.filter((student) => student.applicationStatus === stage).length })),
        staff: [],
        recentActivity: leads.map((lead) => ({ id: lead.id, title: lead.name, type: "Lead", detail: lead.status, at: new Date().toISOString() }))
      };
    })()
  );
}
