import { FileCheck2 } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { DocumentsWorkspace } from "@/components/tables/documents-workspace";
import { getDocuments, getStudents } from "@/lib/queries";

const keys = ["passport", "photo", "academicCertificates", "transcript", "bankSolvency", "bankStatement", "sponsorDocuments", "japaneseCertificate", "applicationForm", "sop"] as const;

export default async function DocumentsPage() {
  const [documents, students] = await Promise.all([getDocuments(), getStudents()]);
  const rows = documents.length
    ? documents
    : students.map((student) => Object.fromEntries([
        ["id", student.id],
        ["student", student],
        ["files", []],
        ...keys.map((key) => [key, false])
      ]));

  return (
    <div className="space-y-6">
      <PageHeading
        icon={FileCheck2}
        eyebrow="Documents"
        title="Document Checklist"
        description="See students with missing documents first, then open a student to review and mark received items without a noisy list."
      />
      <DocumentsWorkspace initialRows={rows} />
    </div>
  );
}
