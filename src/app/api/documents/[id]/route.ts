import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const documentFields = [
  "passport",
  "photo",
  "academicCertificates",
  "transcript",
  "bankSolvency",
  "bankStatement",
  "sponsorDocuments",
  "japaneseCertificate",
  "applicationForm",
  "sop"
] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const data = Object.fromEntries(
    documentFields
      .filter((field) => typeof body[field] !== "undefined")
      .map((field) => [field, Boolean(body[field])])
  );

  const checklist = await prisma.documentChecklist.update({
    where: { id },
    data,
    include: { student: true, files: true }
  });

  return NextResponse.json(checklist);
}
