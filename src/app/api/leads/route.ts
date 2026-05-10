import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchWhere, getReadBranchId, resolveWriteBranchId } from "@/lib/branch-access";

export async function GET() {
  const branchId = await getReadBranchId();
  const leads = await prisma.lead.findMany({
    where: branchWhere(branchId),
    include: { branch: { select: { id: true, name: true } } },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const body = await request.json();
  const branchId = await resolveWriteBranchId(body.branchId);
  const lead = await prisma.lead.create({
    data: {
      branchId,
      name: body.name,
      city: body.city || null,
      phoneNumber: body.phoneNumber,
      whatsappNumber: body.whatsappNumber || null,
      facebookProfile: body.facebookProfile || null,
      interestedIn: body.interestedIn,
      status: body.status || "NEW",
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
      notes: body.notes || null
    },
    include: { branch: { select: { id: true, name: true } } }
  });
  return NextResponse.json(lead, { status: 201 });
}
