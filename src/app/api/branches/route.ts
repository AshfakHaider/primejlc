import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { canViewAllBranches } from "@/lib/branch-access";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const branches = await prisma.branch.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canViewAllBranches(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const payload = {
    name: String(body.name || "").trim(),
    address: String(body.address || "").trim(),
    phone: String(body.phone || "").trim(),
    managerName: String(body.managerName || "").trim(),
    status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"
  };

  if (!payload.name || !payload.address || !payload.phone || !payload.managerName) {
    return NextResponse.json({ error: "Name, address, phone, and manager name are required." }, { status: 400 });
  }

  try {
    const branch = await prisma.branch.create({ data: payload });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A branch with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create branch." }, { status: 500 });
  }
}
