import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriteBranchId } from "@/lib/branch-access";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const branchId = typeof body.branchId === "undefined" ? undefined : await resolveWriteBranchId(body.branchId);
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      branchId,
      name: body.name,
      city: typeof body.city === "undefined" ? undefined : body.city || null,
      phoneNumber: body.phoneNumber,
      whatsappNumber: typeof body.whatsappNumber === "undefined" ? undefined : body.whatsappNumber || null,
      facebookProfile: typeof body.facebookProfile === "undefined" ? undefined : body.facebookProfile || null,
      interestedIn: body.interestedIn,
      status: body.status,
      nextFollowUpDate: typeof body.nextFollowUpDate === "undefined" ? undefined : body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
      notes: typeof body.notes === "undefined" ? undefined : body.notes || null
    },
    include: { branch: { select: { id: true, name: true } } }
  });
  return NextResponse.json(lead);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
