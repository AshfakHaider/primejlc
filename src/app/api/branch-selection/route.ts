import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { allBranchesValue, branchCookieName, canViewAllBranches } from "@/lib/branch-access";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const requestedBranchId = typeof body.branchId === "string" ? body.branchId : allBranchesValue;

  if (!canViewAllBranches(session.role) && requestedBranchId !== session.branchId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (requestedBranchId !== allBranchesValue && process.env.DATABASE_URL) {
    const branch = await prisma.branch.findUnique({ where: { id: requestedBranchId }, select: { id: true } });
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }

  (await cookies()).set(branchCookieName, requestedBranchId, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60
  });

  return NextResponse.json({ branchId: requestedBranchId });
}
