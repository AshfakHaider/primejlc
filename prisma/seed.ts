import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const isProtectedDatabase = databaseUrl.includes("neon.tech") || process.env.NODE_ENV === "production";

  if (isProtectedDatabase && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    console.log("Protected database detected. Seed skipped to avoid overwriting live CRM records.");
    console.log("Set ALLOW_PRODUCTION_SEED=true only when you intentionally want to reset sample data.");
    return;
  }

  const passwordHash = await bcrypt.hash("Prime@12345", 12);

  const dhaka = await prisma.branch.upsert({
    where: { name: "Dhaka" },
    update: {
      address: "House# 68 (2nd Floor), Road# 12, Sector# 10, Uttara, Dhaka-1230",
      phone: "01798562705",
      managerName: "Prime Admin",
      status: "ACTIVE"
    },
    create: {
      name: "Dhaka",
      address: "House# 68 (2nd Floor), Road# 12, Sector# 10, Uttara, Dhaka-1230",
      phone: "01798562705",
      managerName: "Prime Admin",
      status: "ACTIVE"
    }
  });

  const bogura = await prisma.branch.upsert({
    where: { name: "Bogura" },
    update: {
      address: "Prime Japanese Language Centre, Bogura Branch",
      phone: "01711001001",
      managerName: "Arif Mahmud",
      status: "ACTIVE"
    },
    create: {
      name: "Bogura",
      address: "Prime Japanese Language Centre, Bogura Branch",
      phone: "01711001001",
      managerName: "Arif Mahmud",
      status: "ACTIVE"
    }
  });

  const jamalpur = await prisma.branch.upsert({
    where: { name: "Jamalpur" },
    update: {
      address: "Prime Japanese Language Centre, Jamalpur Branch",
      phone: "01711001002",
      managerName: "Maliha Sultana",
      status: "ACTIVE"
    },
    create: {
      name: "Jamalpur",
      address: "Prime Japanese Language Centre, Jamalpur Branch",
      phone: "01711001002",
      managerName: "Maliha Sultana",
      status: "ACTIVE"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@primejlc.com" },
    update: { role: UserRole.SUPER_ADMIN, branchId: dhaka.id },
    create: {
      name: "Prime Admin",
      email: "admin@primejlc.com",
      phone: "01798562705",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      branchId: dhaka.id
    }
  });

  const counselor = await prisma.user.upsert({
    where: { email: "counselor@primejlc.com" },
    update: { branchId: dhaka.id },
    create: {
      name: "Nusrat Jahan",
      email: "counselor@primejlc.com",
      phone: "01811000001",
      passwordHash,
      role: UserRole.COUNSELOR,
      branchId: dhaka.id
    }
  });

  const teacher = await prisma.user.upsert({
    where: { email: "sensei@primejlc.com" },
    update: { branchId: dhaka.id },
    create: {
      name: "Tanaka Sensei",
      email: "sensei@primejlc.com",
      phone: "01811000002",
      passwordHash,
      role: UserRole.TEACHER,
      branchId: dhaka.id
    }
  });

  const accountant = await prisma.user.upsert({
    where: { email: "accounts@primejlc.com" },
    update: { branchId: dhaka.id },
    create: {
      name: "Mehedi Hasan",
      email: "accounts@primejlc.com",
      phone: "01811000003",
      passwordHash,
      role: UserRole.ACCOUNTANT,
      branchId: dhaka.id
    }
  });

  await prisma.user.upsert({
    where: { email: "bogura.manager@primejlc.com" },
    update: { branchId: bogura.id, role: UserRole.BRANCH_MANAGER },
    create: {
      name: "Arif Mahmud",
      email: "bogura.manager@primejlc.com",
      phone: "01711001001",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      branchId: bogura.id
    }
  });

  await prisma.user.upsert({
    where: { email: "jamalpur.manager@primejlc.com" },
    update: { branchId: jamalpur.id, role: UserRole.BRANCH_MANAGER },
    create: {
      name: "Maliha Sultana",
      email: "jamalpur.manager@primejlc.com",
      phone: "01711001002",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      branchId: jamalpur.id
    }
  });

  await prisma.agencySetting.deleteMany();
  await prisma.agencySetting.create({
    data: {
      name: "Prime Japanese Language Centre",
      mobile: "01798562705",
      email: "primejapaneselanguagecentrez@gmail.com",
      address: "House# 68 (2nd Floor), Road# 12, Sector# 10, Uttara, Dhaka-1230"
    }
  });

  await prisma.crmOption.deleteMany();
  await prisma.crmOption.createMany({
    data: [
      ...[
        ["LANGUAGE_PROGRAM", "Language Program"],
        ["STUDY_VISA", "Study Visa"],
        ["LANGUAGE_AND_VISA", "Language + Study Visa"]
      ].map(([value, label], sortOrder) => ({ group: "programTrack", value, label, sortOrder })),
      ...[
        ["BEGINNER", "Beginner"],
        ["N5", "N5"],
        ["N4", "N4"],
        ["N3", "N3"],
        ["N2", "N2"]
      ].map(([value, label], sortOrder) => ({ group: "japaneseLevel", value, label, sortOrder })),
      ...[
        ["OCTOBER", "October"],
        ["APRIL", "April"],
        ["JUNE_JULY", "June/July"],
        ["JANUARY", "January"]
      ].map(([value, label], sortOrder) => ({ group: "targetIntake", value, label, sortOrder })),
      ...[
        "TOKYO",
        "OSAKA",
        "KOBE",
        "FUKUOKA",
        "HIROSHIMA",
        "NAGANO",
        "OKAYAMA",
        "SHIZUOKA",
        "NIIGATA"
      ].map((value, sortOrder) => ({ group: "preferredCity", value, label: value[0] + value.slice(1).toLowerCase(), sortOrder })),
      ...[
        "LEAD",
        "COUNSELING",
        "DOCUMENTS_PENDING",
        "DOCUMENTS_COMPLETE",
        "SCHOOL_APPLIED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_PASSED",
        "COE_APPLIED",
        "COE_ISSUED",
        "VISA_APPLIED",
        "VISA_APPROVED",
        "FLY_TO_JAPAN"
      ].map((value, sortOrder) => ({ group: "applicationStatus", value, label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()), sortOrder })),
      ...["UNPAID", "PARTIAL", "PAID"].map((value, sortOrder) => ({ group: "feeStatus", value, label: value[0] + value.slice(1).toLowerCase(), sortOrder })),
      ...["NOT_STARTED", "ON_TRACK", "NEEDS_ATTENTION", "READY"].map((value, sortOrder) => ({ group: "preparationStatus", value, label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()), sortOrder })),
      ...["PLANNED", "RUNNING", "COMPLETED", "PAUSED"].map((value, sortOrder) => ({ group: "batchStatus", value, label: value[0] + value.slice(1).toLowerCase(), sortOrder })),
      ...["PROSPECT", "ACTIVE", "PAUSED"].map((value, sortOrder) => ({ group: "partnerStatus", value, label: value[0] + value.slice(1).toLowerCase(), sortOrder })),
      ...["OFFICE_RENT", "SENSEI_SALARY", "COMPUTER_OPERATOR_SALARY", "OFFICE_BOY_SALARY", "MARKETING_COST", "UTILITY_BILL", "STATIONERY", "OTHER_EXPENSES"].map((value, sortOrder) => ({ group: "expenseCategory", value, label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()), sortOrder }))
    ]
  });

  await prisma.school.deleteMany();
  await prisma.school.createMany({
    data: [
      {
        name: "Tokyo International Japanese Academy",
        cityPrefecture: "Tokyo",
        intakeAvailability: ["OCTOBER", "APRIL"],
        tuitionFee: 820000,
        applicationDeadline: new Date("2026-07-15"),
        contactEmail: "admission@tija.jp",
        partnerStatus: "ACTIVE",
        notes: "Strong placement history for N5-N4 students."
      },
      {
        name: "Kobe Sakura Language School",
        cityPrefecture: "Kobe, Hyogo",
        intakeAvailability: ["APRIL", "JUNE_JULY"],
        tuitionFee: 760000,
        applicationDeadline: new Date("2026-02-10"),
        contactEmail: "partner@kobesakura.jp",
        partnerStatus: "ACTIVE",
        notes: "Responsive interview team."
      },
      {
        name: "Fukuoka Nihongo Institute",
        cityPrefecture: "Fukuoka",
        intakeAvailability: ["OCTOBER"],
        tuitionFee: 690000,
        applicationDeadline: new Date("2026-06-20"),
        contactEmail: "intl@fni.jp",
        partnerStatus: "PROSPECT",
        notes: "Good cost profile for budget-sensitive families."
      }
    ]
  });

  await prisma.lead.deleteMany();
  await prisma.lead.createMany({
    data: [
      {
        branchId: dhaka.id,
        name: "Arafat Rahman",
        city: "Uttara",
        phoneNumber: "01722000001",
        whatsappNumber: "01722000001",
        facebookProfile: "https://facebook.com/arafat.rahman",
        interestedIn: "FULL_JAPAN_PROCESSING",
        status: "NEW",
        nextFollowUpDate: new Date("2026-05-11"),
        notes: "Asked about October intake and service charge."
      },
      {
        branchId: dhaka.id,
        name: "Nishat Tasnim",
        city: "Mirpur",
        phoneNumber: "01833000002",
        whatsappNumber: "01833000002",
        facebookProfile: "https://facebook.com/nishat.tasnim",
        interestedIn: "LANGUAGE_COURSE",
        status: "FOLLOW_UP",
        nextFollowUpDate: new Date("2026-05-10"),
        notes: "Wants evening N5 batch schedule."
      },
      {
        branchId: bogura.id,
        name: "Fahim Ahmed",
        city: "Gazipur",
        phoneNumber: "01944000003",
        whatsappNumber: "01944000003",
        facebookProfile: "https://facebook.com/fahim.ahmed",
        interestedIn: "JLPT_NAT",
        status: "INTERESTED",
        nextFollowUpDate: new Date("2026-05-13"),
        notes: "Preparing for NAT N4."
      },
      {
        branchId: jamalpur.id,
        name: "Mahmudul Hasan",
        city: "Uttara",
        phoneNumber: "01766000005",
        whatsappNumber: "01766000005",
        facebookProfile: "https://facebook.com/mahmudul.hasan",
        interestedIn: "FULL_JAPAN_PROCESSING",
        status: "PROCESSING",
        nextFollowUpDate: new Date("2026-05-15"),
        notes: "Documents discussion started."
      },
      {
        branchId: bogura.id,
        name: "Tanha Akter",
        city: "Dhanmondi",
        phoneNumber: "01877000006",
        whatsappNumber: "01877000006",
        facebookProfile: "https://facebook.com/tanha.akter",
        interestedIn: "LANGUAGE_COURSE",
        status: "ADMITTED",
        notes: "Joined language course batch."
      }
    ]
  });

  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.courseSession.deleteMany();
  await prisma.courseBatch.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.documentFile.deleteMany();
  await prisma.documentChecklist.deleteMany();
  await prisma.student.deleteMany();

  const students = await Promise.all([
    prisma.student.create({
      data: {
        branchId: dhaka.id,
        studentId: "PJLC-2026-001",
        fullName: "Rahim Uddin",
        phone: "01711000001",
        email: "rahim@example.com",
        address: "Uttara, Dhaka",
        passportNumber: "A12345678",
        educationLevel: "HSC",
        programTrack: "LANGUAGE_AND_VISA",
        japaneseLevel: "N5",
        targetIntake: "OCTOBER",
        preferredCity: "TOKYO",
        assignedCounselorId: counselor.id,
        applicationStatus: "COE_APPLIED",
        coeStatus: "APPLIED",
        visaStatus: "NOT_APPLIED",
        documents: {
          create: {
            passport: true,
            photo: true,
            academicCertificates: true,
            transcript: true,
            bankSolvency: true,
            bankStatement: false,
            sponsorDocuments: true,
            japaneseCertificate: true,
            applicationForm: true,
            sop: false
          }
        },
        admission: {
          create: {
            branchId: dhaka.id,
            currentStage: "COE_APPLIED",
            coeAppliedAt: new Date("2026-04-18"),
            notes: "Awaiting COE update from Tokyo partner."
          }
        }
      }
    }),
    prisma.student.create({
      data: {
        branchId: dhaka.id,
        studentId: "PJLC-2026-002",
        fullName: "Sadia Akter",
        phone: "01711000002",
        email: "sadia@example.com",
        address: "Mirpur, Dhaka",
        passportNumber: "B12345678",
        educationLevel: "Bachelor",
        programTrack: "STUDY_VISA",
        japaneseLevel: "N4",
        targetIntake: "APRIL",
        preferredCity: "KOBE",
        assignedCounselorId: counselor.id,
        applicationStatus: "VISA_APPROVED",
        coeStatus: "ISSUED",
        visaStatus: "APPROVED",
        documents: {
          create: {
            passport: true,
            photo: true,
            academicCertificates: true,
            transcript: true,
            bankSolvency: true,
            bankStatement: true,
            sponsorDocuments: true,
            japaneseCertificate: true,
            applicationForm: true,
            sop: true
          }
        },
        admission: {
          create: {
            branchId: dhaka.id,
            currentStage: "VISA_APPROVED",
            coeAppliedAt: new Date("2026-01-12"),
            coeIssuedAt: new Date("2026-03-05"),
            visaAppliedAt: new Date("2026-03-11"),
            visaApprovedAt: new Date("2026-04-02"),
            flightDate: new Date("2026-04-18")
          }
        }
      }
    }),
    prisma.student.create({
      data: {
        branchId: bogura.id,
        studentId: "PJLC-2026-003",
        fullName: "Imran Hossain",
        phone: "01711000003",
        email: "imran@example.com",
        address: "Gazipur",
        passportNumber: "C12345678",
        educationLevel: "Diploma",
        programTrack: "LANGUAGE_PROGRAM",
        japaneseLevel: "BEGINNER",
        targetIntake: "JUNE_JULY",
        preferredCity: "FUKUOKA",
        assignedCounselorId: counselor.id,
        applicationStatus: "DOCUMENTS_PENDING",
        documents: {
          create: {
            passport: true,
            photo: false,
            academicCertificates: true,
            transcript: false,
            bankSolvency: false,
            bankStatement: false,
            sponsorDocuments: false,
            japaneseCertificate: false,
            applicationForm: false,
            sop: false
          }
        },
        admission: {
          create: {
            branchId: bogura.id,
            currentStage: "DOCUMENTS_PENDING",
            notes: "Family bank statement pending."
          }
        }
      }
    }),
    prisma.student.create({
      data: {
        branchId: jamalpur.id,
        studentId: "PJLC-2026-004",
        fullName: "Maliha Rahman",
        phone: "01711000004",
        email: "maliha@example.com",
        address: "Banani, Dhaka",
        passportNumber: "D12345678",
        educationLevel: "HSC",
        programTrack: "LANGUAGE_AND_VISA",
        japaneseLevel: "N5",
        targetIntake: "OCTOBER",
        preferredCity: "OSAKA",
        assignedCounselorId: counselor.id,
        applicationStatus: "INTERVIEW_SCHEDULED",
        coeStatus: "NOT_APPLIED",
        visaStatus: "NOT_APPLIED",
        documents: {
          create: {
            passport: true,
            photo: true,
            academicCertificates: true,
            transcript: true,
            bankSolvency: true,
            bankStatement: true,
            sponsorDocuments: true,
            japaneseCertificate: false,
            applicationForm: true,
            sop: true
          }
        },
        admission: {
          create: {
            branchId: jamalpur.id,
            currentStage: "INTERVIEW_SCHEDULED",
            interviewDate: new Date("2026-05-20")
          }
        }
      }
    })
  ]);

  const batch = await prisma.courseBatch.create({
    data: {
      branchId: dhaka.id,
      name: "N5 Evening Batch - May 2026",
      teacherId: teacher.id,
      teacherName: "Tanaka Sensei",
      classSchedule: "Sun, Tue, Thu - 7:00 PM",
      programTrack: "LANGUAGE_PROGRAM",
      targetLevel: "N5",
      syllabusName: "Minna no Nihongo + JLPT/NAT N5",
      totalLessons: 48,
      completedLessons: 14,
      feeStatus: "PARTIAL",
      preparationStatus: "ON_TRACK",
      batchStatus: "RUNNING",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-08-30")
    }
  });

  const n4Batch = await prisma.courseBatch.create({
    data: {
      branchId: bogura.id,
      name: "N4 Morning Batch - April 2026",
      teacherId: teacher.id,
      teacherName: "Sakura Sensei",
      classSchedule: "Sat, Mon, Wed - 10:00 AM",
      programTrack: "LANGUAGE_PROGRAM",
      targetLevel: "N4",
      syllabusName: "Intermediate Grammar + NAT N4",
      totalLessons: 56,
      completedLessons: 22,
      feeStatus: "PARTIAL",
      preparationStatus: "ON_TRACK",
      batchStatus: "RUNNING",
      startDate: new Date("2026-04-06"),
      endDate: new Date("2026-09-15")
    }
  });

  await prisma.enrollment.createMany({
    data: [
      { studentId: students[0].id, batchId: batch.id, feeStatus: "PARTIAL", progressPercent: 32 },
      { studentId: students[2].id, batchId: batch.id, feeStatus: "PARTIAL", progressPercent: 18 },
      { studentId: students[1].id, batchId: n4Batch.id, feeStatus: "PAID", progressPercent: 48 },
      { studentId: students[3].id, batchId: n4Batch.id, feeStatus: "PARTIAL", progressPercent: 36 }
    ]
  });

  const n5Sessions = await Promise.all([
    prisma.courseSession.create({
      data: {
        batchId: batch.id,
        lessonNo: 12,
        title: "Te-form practice and classroom commands",
        classDate: new Date("2026-05-05"),
        status: "COMPLETED",
        homework: "Workbook lesson 14 exercises",
        teacherNote: "Rahim needs speaking practice."
      }
    }),
    prisma.courseSession.create({
      data: {
        batchId: batch.id,
        lessonNo: 13,
        title: "Particle review and short conversation",
        classDate: new Date("2026-05-08"),
        status: "COMPLETED",
        homework: "Conversation script memorization",
        teacherNote: "Imran absent; counselor should follow up."
      }
    })
  ]);

  const n4Sessions = await Promise.all([
    prisma.courseSession.create({
      data: {
        batchId: n4Batch.id,
        lessonNo: 21,
        title: "Keigo basics and interview responses",
        classDate: new Date("2026-05-06"),
        status: "COMPLETED",
        homework: "Prepare self-introduction for interview."
      }
    }),
    prisma.courseSession.create({
      data: {
        batchId: n4Batch.id,
        lessonNo: 22,
        title: "Reading comprehension drill",
        classDate: new Date("2026-05-09"),
        status: "COMPLETED",
        homework: "NAT reading set B."
      }
    })
  ]);

  await prisma.attendance.createMany({
    data: [
      { studentId: students[0].id, batchId: batch.id, sessionId: n5Sessions[0].id, date: n5Sessions[0].classDate, present: true },
      { studentId: students[2].id, batchId: batch.id, sessionId: n5Sessions[0].id, date: n5Sessions[0].classDate, present: true },
      { studentId: students[0].id, batchId: batch.id, sessionId: n5Sessions[1].id, date: n5Sessions[1].classDate, present: true },
      { studentId: students[2].id, batchId: batch.id, sessionId: n5Sessions[1].id, date: n5Sessions[1].classDate, present: false, note: "Absent, called family." },
      { studentId: students[1].id, batchId: n4Batch.id, sessionId: n4Sessions[0].id, date: n4Sessions[0].classDate, present: true },
      { studentId: students[3].id, batchId: n4Batch.id, sessionId: n4Sessions[0].id, date: n4Sessions[0].classDate, present: true },
      { studentId: students[1].id, batchId: n4Batch.id, sessionId: n4Sessions[1].id, date: n4Sessions[1].classDate, present: true },
      { studentId: students[3].id, batchId: n4Batch.id, sessionId: n4Sessions[1].id, date: n4Sessions[1].classDate, present: false, note: "Late notice from student." }
    ]
  });

  await prisma.payment.createMany({
    data: [
      {
        branchId: dhaka.id,
        receiptNo: "MR-2026-0001",
        studentId: students[0].id,
        admissionFee: 25000,
        courseFee: 18000,
        serviceCharge: 45000,
        paidAmount: 50000,
        dueAmount: 38000,
        paymentDate: new Date("2026-05-01"),
        method: "Bank",
        receivedById: accountant.id
      },
      {
        branchId: dhaka.id,
        receiptNo: "MR-2026-0002",
        studentId: students[1].id,
        admissionFee: 25000,
        courseFee: 20000,
        serviceCharge: 50000,
        paidAmount: 95000,
        dueAmount: 0,
        paymentDate: new Date("2026-05-05"),
        method: "Cash",
        receivedById: accountant.id
      },
      {
        branchId: jamalpur.id,
        receiptNo: "MR-2026-0003",
        studentId: students[3].id,
        admissionFee: 25000,
        courseFee: 18000,
        serviceCharge: 45000,
        paidAmount: 40000,
        dueAmount: 48000,
        paymentDate: new Date("2026-05-07"),
        method: "bKash",
        receivedById: admin.id
      }
    ]
  });

  await prisma.expense.deleteMany();
  await prisma.expense.createMany({
    data: [
      {
        branchId: dhaka.id,
        category: "OFFICE_RENT",
        title: "May office rent",
        amount: 55000,
        expenseDate: new Date("2026-05-02"),
        vendor: "Building owner",
        recordedById: accountant.id
      },
      {
        branchId: dhaka.id,
        category: "SENSEI_SALARY",
        title: "Tanaka Sensei salary advance",
        amount: 45000,
        expenseDate: new Date("2026-05-04"),
        vendor: "Tanaka Sensei",
        recordedById: accountant.id
      },
      {
        branchId: bogura.id,
        category: "MARKETING_COST",
        title: "Facebook campaign",
        amount: 18000,
        expenseDate: new Date("2026-05-06"),
        vendor: "Meta Ads",
        recordedById: accountant.id
      }
    ]
  });

  console.log("Seed complete. Login: admin@primejlc.com / Prime@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
