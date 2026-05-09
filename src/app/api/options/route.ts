import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const options = await prisma.crmOption.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { label: "asc" }]
  });
  return NextResponse.json(options);
}

export async function POST(request: Request) {
  const body = await request.json();
  const option = await prisma.crmOption.create({
    data: {
      group: String(body.group),
      value: String(body.value).trim().toUpperCase().replaceAll(" ", "_"),
      label: String(body.label),
      sortOrder: Number(body.sortOrder || 0),
      isActive: body.isActive ?? true
    }
  });
  return NextResponse.json(option, { status: 201 });
}
