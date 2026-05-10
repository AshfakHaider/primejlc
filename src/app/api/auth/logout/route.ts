import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  await signOut();
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  await signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
