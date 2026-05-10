import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookieName, secret } from "@/lib/session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "ADMIN" | "COUNSELOR" | "TEACHER" | "ACCOUNTANT" | "STAFF";
  branchId?: string | null;
  branchName?: string | null;
};

export async function signIn(email: string, password: string) {
  if (!process.env.DATABASE_URL && email === "admin@primejlc.com" && password === "Prime@12345") {
    const sessionUser: SessionUser = {
      id: "sample-admin",
      name: "Prime Admin",
      email,
      role: "SUPER_ADMIN",
      branchId: null,
      branchName: null
    };
    await setSessionCookie(sessionUser);
    return sessionUser;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { branch: { select: { id: true, name: true } } }
  });
  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
    branchName: user.branch?.name ?? null
  };

  await setSessionCookie(sessionUser);

  return sessionUser;
}

async function setSessionCookie(sessionUser: SessionUser) {
  const token = await new SignJWT(sessionUser)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function signOut() {
  (await cookies()).delete(cookieName);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as SessionUser["role"],
      branchId: typeof payload.branchId === "string" ? payload.branchId : null,
      branchName: typeof payload.branchName === "string" ? payload.branchName : null
    };
  } catch {
    return null;
  }
}

export function canAccess(role: SessionUser["role"], allowed: SessionUser["role"][]) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || allowed.includes(role);
}
