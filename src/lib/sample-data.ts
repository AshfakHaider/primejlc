export const pipelineStages = [
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
] as const;

export const leadInterestedInOptions = [
  { value: "LANGUAGE_COURSE", label: "Language Course" },
  { value: "FULL_JAPAN_PROCESSING", label: "Full Japan Processing" },
  { value: "JLPT_NAT", label: "JLPT/NAT" },
  { value: "INFORMATION_ONLY", label: "Information Only" }
] as const;

export const leadStatusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "ADMITTED", label: "Admitted" },
  { value: "PROCESSING", label: "Processing" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" }
] as const;

export const crmOptions = {
  programTrack: [
    { value: "LANGUAGE_PROGRAM", label: "Language Program" },
    { value: "STUDY_VISA", label: "Study Visa" },
    { value: "LANGUAGE_AND_VISA", label: "Language + Study Visa" }
  ],
  japaneseLevel: [
    { value: "BEGINNER", label: "Beginner" },
    { value: "N5", label: "N5" },
    { value: "N4", label: "N4" },
    { value: "N3", label: "N3" },
    { value: "N2", label: "N2" }
  ],
  targetIntake: [
    { value: "OCTOBER", label: "October" },
    { value: "APRIL", label: "April" },
    { value: "JUNE_JULY", label: "June/July" },
    { value: "JANUARY", label: "January" }
  ],
  preferredCity: ["TOKYO", "OSAKA", "KOBE", "FUKUOKA", "HIROSHIMA", "NAGANO", "OKAYAMA", "SHIZUOKA", "NIIGATA"].map((value) => ({
    value,
    label: value[0] + value.slice(1).toLowerCase()
  })),
  applicationStatus: pipelineStages.map((value) => ({ value, label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) })),
  feeStatus: ["UNPAID", "PARTIAL", "PAID"].map((value) => ({ value, label: value[0] + value.slice(1).toLowerCase() })),
  preparationStatus: ["NOT_STARTED", "ON_TRACK", "NEEDS_ATTENTION", "READY"].map((value) => ({ value, label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) })),
  batchStatus: ["PLANNED", "RUNNING", "COMPLETED", "PAUSED"].map((value) => ({ value, label: value[0] + value.slice(1).toLowerCase() })),
  partnerStatus: ["PROSPECT", "ACTIVE", "PAUSED"].map((value) => ({ value, label: value[0] + value.slice(1).toLowerCase() })),
  expenseCategory: ["OFFICE_RENT", "SENSEI_SALARY", "COMPUTER_OPERATOR_SALARY", "OFFICE_BOY_SALARY", "MARKETING_COST", "UTILITY_BILL", "STATIONERY", "OTHER_EXPENSES"].map((value) => ({
    value,
    label: value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
  }))
};

export const leads = [
  {
    id: "lead-1",
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
    id: "lead-2",
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
    id: "lead-3",
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
    id: "lead-4",
    name: "Sanjida Islam",
    city: "Banani",
    phoneNumber: "01655000004",
    whatsappNumber: "01655000004",
    facebookProfile: "https://facebook.com/sanjida.islam",
    interestedIn: "INFORMATION_ONLY",
    status: "CONTACTED",
    nextFollowUpDate: new Date("2026-05-12"),
    notes: "Needs family discussion before admission."
  },
  {
    id: "lead-5",
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
    id: "lead-6",
    name: "Tanha Akter",
    city: "Dhanmondi",
    phoneNumber: "01877000006",
    whatsappNumber: "01877000006",
    facebookProfile: "https://facebook.com/tanha.akter",
    interestedIn: "LANGUAGE_COURSE",
    status: "ADMITTED",
    nextFollowUpDate: null,
    notes: "Joined language course batch."
  }
];

export const students = [
  {
    id: "sample-1",
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
    applicationStatus: "COE_APPLIED",
    coeStatus: "APPLIED",
    visaStatus: "NOT_APPLIED",
    isActive: true,
    assignedCounselor: { name: "Nusrat Jahan" }
  },
  {
    id: "sample-2",
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
    applicationStatus: "VISA_APPROVED",
    coeStatus: "ISSUED",
    visaStatus: "APPROVED",
    isActive: true,
    assignedCounselor: { name: "Nusrat Jahan" }
  },
  {
    id: "sample-3",
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
    applicationStatus: "DOCUMENTS_PENDING",
    coeStatus: "NOT_APPLIED",
    visaStatus: "NOT_APPLIED",
    isActive: true,
    assignedCounselor: { name: "Nusrat Jahan" }
  },
  {
    id: "sample-4",
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
    applicationStatus: "INTERVIEW_SCHEDULED",
    coeStatus: "NOT_APPLIED",
    visaStatus: "NOT_APPLIED",
    isActive: true,
    assignedCounselor: { name: "Nusrat Jahan" }
  }
];

export const schools = [
  {
    id: "school-1",
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
    id: "school-2",
    name: "Kobe Sakura Language School",
    cityPrefecture: "Kobe, Hyogo",
    intakeAvailability: ["APRIL", "JUNE_JULY"],
    tuitionFee: 760000,
    applicationDeadline: new Date("2026-02-10"),
    contactEmail: "partner@kobesakura.jp",
    partnerStatus: "ACTIVE",
    notes: "Responsive interview team."
  }
];

export const courses = [
  {
    id: "course-1",
    name: "N5 Evening Batch - May 2026",
    teacherName: "Tanaka Sensei",
    classSchedule: "Sun, Tue, Thu - 7:00 PM",
    programTrack: "LANGUAGE_PROGRAM",
    targetLevel: "N5",
    syllabusName: "Minna no Nihongo + JLPT/NAT N5",
    totalLessons: 48,
    completedLessons: 14,
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-08-30"),
    feeStatus: "PARTIAL",
    preparationStatus: "ON_TRACK",
    batchStatus: "RUNNING",
    enrollments: [
      { student: students[0], feeStatus: "PARTIAL", progressPercent: 32 },
      { student: students[1], feeStatus: "PAID", progressPercent: 45 },
      { student: students[2], feeStatus: "PARTIAL", progressPercent: 18 }
    ],
    attendance: [
      { studentId: students[0].id, present: true, date: new Date("2026-05-05") },
      { studentId: students[2].id, present: true, date: new Date("2026-05-05") },
      { studentId: students[0].id, present: true, date: new Date("2026-05-08") },
      { studentId: students[2].id, present: false, date: new Date("2026-05-08") }
    ],
    sessions: [
      {
        id: "session-1",
        lessonNo: 12,
        title: "Te-form practice and classroom commands",
        classDate: new Date("2026-05-05"),
        status: "COMPLETED",
        homework: "Workbook lesson 14 exercises",
        teacherNote: "Rahim needs speaking practice.",
        attendance: [
          { studentId: students[0].id, present: true },
          { studentId: students[2].id, present: true }
        ]
      },
      {
        id: "session-2",
        lessonNo: 13,
        title: "Particle review and short conversation",
        classDate: new Date("2026-05-08"),
        status: "COMPLETED",
        homework: "Conversation script memorization",
        teacherNote: "Imran absent; counselor should follow up.",
        attendance: [
          { studentId: students[0].id, present: true },
          { studentId: students[2].id, present: false }
        ]
      }
    ]
  },
  {
    id: "course-2",
    name: "N4 Morning Batch - April 2026",
    teacherName: "Sakura Sensei",
    classSchedule: "Sat, Mon, Wed - 10:00 AM",
    programTrack: "LANGUAGE_PROGRAM",
    targetLevel: "N4",
    syllabusName: "Intermediate Grammar + NAT N4",
    totalLessons: 56,
    completedLessons: 22,
    startDate: new Date("2026-04-06"),
    endDate: new Date("2026-09-15"),
    feeStatus: "PARTIAL",
    preparationStatus: "ON_TRACK",
    batchStatus: "RUNNING",
    enrollments: [
      { student: students[1], feeStatus: "PAID", progressPercent: 48 },
      { student: students[3], feeStatus: "PARTIAL", progressPercent: 36 }
    ],
    attendance: [
      { studentId: students[1].id, present: true, date: new Date("2026-05-06") },
      { studentId: students[3].id, present: true, date: new Date("2026-05-06") },
      { studentId: students[1].id, present: true, date: new Date("2026-05-09") },
      { studentId: students[3].id, present: false, date: new Date("2026-05-09") }
    ],
    sessions: [
      {
        id: "session-3",
        lessonNo: 21,
        title: "Keigo basics and interview responses",
        classDate: new Date("2026-05-06"),
        status: "COMPLETED",
        homework: "Prepare self-introduction for interview.",
        teacherNote: "Strong interview preparation class.",
        attendance: [
          { studentId: students[1].id, present: true },
          { studentId: students[3].id, present: true }
        ]
      },
      {
        id: "session-4",
        lessonNo: 22,
        title: "Reading comprehension drill",
        classDate: new Date("2026-05-09"),
        status: "COMPLETED",
        homework: "NAT reading set B.",
        teacherNote: "Maliha needs kanji review.",
        attendance: [
          { studentId: students[1].id, present: true },
          { studentId: students[3].id, present: false }
        ]
      }
    ]
  }
];

export const payments = [
  {
    id: "payment-1",
    receiptNo: "MR-2026-0001",
    admissionFee: 25000,
    courseFee: 18000,
    serviceCharge: 45000,
    paidAmount: 50000,
    dueAmount: 38000,
    paymentDate: new Date("2026-05-01"),
    method: "Bank",
    student: students[0]
  },
  {
    id: "payment-2",
    receiptNo: "MR-2026-0002",
    admissionFee: 25000,
    courseFee: 20000,
    serviceCharge: 50000,
    paidAmount: 95000,
    dueAmount: 0,
    paymentDate: new Date("2026-05-05"),
    method: "Cash",
    student: students[1]
  }
];

export const expenses = [
  { id: "expense-1", category: "OFFICE_RENT", title: "May office rent", amount: 55000, expenseDate: new Date("2026-05-02"), vendor: "Building owner" },
  { id: "expense-2", category: "SENSEI_SALARY", title: "Tanaka Sensei salary advance", amount: 45000, expenseDate: new Date("2026-05-04"), vendor: "Tanaka Sensei" },
  { id: "expense-3", category: "MARKETING_COST", title: "Facebook campaign", amount: 18000, expenseDate: new Date("2026-05-06"), vendor: "Meta Ads" }
];

export const agency = {
  name: "Prime Japanese Language Centre",
  mobile: "01798562705",
  email: "primejapaneselanguagecentrez@gmail.com",
  address: "House# 68 (2nd Floor), Road# 12, Sector# 10, Uttara, Dhaka-1230"
};
