import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { canViewAllBranches } from "@/lib/branch-access";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canViewAllBranches(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const data = {
    name: typeof body.name === "undefined" ? undefined : String(body.name || "").trim(),
    address: typeof body.address === "undefined" ? undefined : String(body.address || "").trim(),
    phone: typeof body.phone === "undefined" ? undefined : String(body.phone || "").trim(),
    managerName: typeof body.managerName === "undefined" ? undefined : String(body.managerName || "").trim(),
    status: typeof body.status === "undefined" ? undefined : body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"
  };

  if ([data.name, data.address, data.phone, data.managerName].some((value) => value === "")) {
    return NextResponse.json({ error: "Name, address, phone, and manager name cannot be empty." }, { status: 400 });
  }

  try {
    const branch = await prisma.branch.update({ where: { id }, data });

    return NextResponse.json(branch);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A branch with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not update branch." }, { status: 500 });
  }
}
