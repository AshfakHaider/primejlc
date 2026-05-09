import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await signIn(String(body.email || ""), String(body.password || ""));
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
