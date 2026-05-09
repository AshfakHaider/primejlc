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
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Document Checklist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See students with missing documents first, then open a student to review and mark received items.
        </p>
      </div>
      <DocumentsWorkspace initialRows={rows} />
    </div>
  );
}
