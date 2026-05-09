"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Home,
  Landmark,
  Menu,
  MessageSquareMore,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: MessageSquareMore },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/courses", label: "Courses", icon: BookOpenCheck },
  { href: "/admissions", label: "Admissions", icon: ClipboardCheck },
  { href: "/documents", label: "Documents", icon: FileCheck2 },
  { href: "/schools", label: "Schools", icon: Landmark },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-card/80 backdrop-blur lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight">Prime Japanese</p>
          <p className="text-xs text-muted-foreground">Agency CRM</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        House# 68, Road# 12, Sector# 10, Uttara
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </Button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
              <button className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" aria-label="Close navigation menu" onClick={() => setOpen(false)} />
              <aside className="relative z-10 flex h-dvh w-[86vw] max-w-[340px] flex-col border-r bg-card shadow-2xl">
                <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-tight">Prime Japanese</p>
                      <p className="text-xs text-muted-foreground">Agency CRM</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                          active && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="shrink-0 border-t p-4 text-xs leading-5 text-muted-foreground">
                  House# 68, Road# 12, Sector# 10, Uttara
                </div>
              </aside>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
