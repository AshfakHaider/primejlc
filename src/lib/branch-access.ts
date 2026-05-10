import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/auth";
import { getSession } from "@/lib/auth";

export const branchCookieName = "prime_branch_id";
export const allBranchesValue = "ALL";

export function canViewAllBranches(role?: SessionUser["role"] | string | null) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function getSelectedBranchCookie() {
  return (await cookies()).get(branchCookieName)?.value ?? allBranchesValue;
}

export async function getReadBranchId() {
  const session = await getSession();
  if (!session) return null;

  if (!canViewAllBranches(session.role)) {
    return session.branchId ?? null;
  }

  const selected = await getSelectedBranchCookie();
  return selected && selected !== allBranchesValue ? selected : null;
}

export async function resolveWriteBranchId(input?: unknown) {
  const session = await getSession();
  const requested = typeof input === "string" && input !== allBranchesValue ? input : null;

  if (!session) return requested;
  if (!canViewAllBranches(session.role)) return session.branchId ?? null;

  return requested ?? session.branchId ?? null;
}

export function branchWhere(branchId: string | null) {
  return branchId ? { branchId } : {};
}
