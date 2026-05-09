import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookieName, secret } from "@/lib/session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COUNSELOR" | "TEACHER" | "ACCOUNTANT" | "STAFF";
};

export async function signIn(email: string, password: string) {
  if (!process.env.DATABASE_URL && email === "admin@primejlc.com" && password === "Prime@12345") {
    const sessionUser: SessionUser = {
      id: "sample-admin",
      name: "Prime Admin",
      email,
      role: "ADMIN"
    };
    await setSessionCookie(sessionUser);
    return sessionUser;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
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
      role: payload.role as SessionUser["role"]
    };
  } catch {
    return null;
  }
}

export function canAccess(role: SessionUser["role"], allowed: SessionUser["role"][]) {
  return role === "ADMIN" || allowed.includes(role);
}
