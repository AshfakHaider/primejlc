import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schools = await prisma.school.findMany({ orderBy: { applicationDeadline: "asc" } });
  return NextResponse.json(schools);
}

export async function POST(request: Request) {
  const body = await request.json();
  const school = await prisma.school.create({
    data: {
      name: body.name,
      cityPrefecture: body.cityPrefecture,
      intakeAvailability: Array.isArray(body.intakeAvailability) ? body.intakeAvailability : [body.intakeAvailability],
      tuitionFee: Number(body.tuitionFee || 0),
      applicationDeadline: new Date(body.applicationDeadline),
      contactEmail: body.contactEmail,
      partnerStatus: body.partnerStatus,
      notes: body.notes || null
    }
  });
  return NextResponse.json(school, { status: 201 });
}
