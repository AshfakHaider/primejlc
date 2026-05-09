import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const body = await request.json();
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      city: body.city || null,
      phoneNumber: body.phoneNumber,
      whatsappNumber: body.whatsappNumber || null,
      facebookProfile: body.facebookProfile || null,
      interestedIn: body.interestedIn,
      status: body.status || "NEW",
      nextFollowUpDate: body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : null,
      notes: body.notes || null
    }
  });
  return NextResponse.json(lead, { status: 201 });
}
