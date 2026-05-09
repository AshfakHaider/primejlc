import type React from "react";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 lg:pl-72">
        <Topbar userName={session.name} role={session.role} />
        <main className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden p-4 pb-20 sm:p-6 lg:pb-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
