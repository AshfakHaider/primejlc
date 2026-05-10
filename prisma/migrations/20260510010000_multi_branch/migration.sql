-- Add multi-branch support and scoped access fields.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BRANCH_MANAGER';

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "managerName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

ALTER TABLE "User" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Student" ADD COLUMN "branchId" TEXT;
ALTER TABLE "CourseBatch" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Admission" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "branchId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "branchId" TEXT;

CREATE INDEX "User_branchId_idx" ON "User"("branchId");
CREATE INDEX "Lead_branchId_idx" ON "Lead"("branchId");
CREATE INDEX "Student_branchId_idx" ON "Student"("branchId");
CREATE INDEX "CourseBatch_branchId_idx" ON "CourseBatch"("branchId");
CREATE INDEX "Admission_branchId_idx" ON "Admission"("branchId");
CREATE INDEX "Payment_branchId_idx" ON "Payment"("branchId");
CREATE INDEX "Expense_branchId_idx" ON "Expense"("branchId");

ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CourseBatch" ADD CONSTRAINT "CourseBatch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
