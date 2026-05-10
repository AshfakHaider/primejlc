import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
  const body = isFormPost ? Object.fromEntries(await request.formData()) : await request.json();
  const user = await signIn(String(body.email || ""), String(body.password || ""));

  if (!user) {
    if (isFormPost) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url), { status: 303 });
    }
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  if (isFormPost) {
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  return NextResponse.json({ user });
}
