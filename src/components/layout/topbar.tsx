"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MobileSidebar } from "@/components/layout/sidebar";

type BranchOption = { id: string; name: string };
const allBranchesValue = "ALL";

export function Topbar({
  userName,
  role,
  branches,
  selectedBranchId,
  canViewAllBranches
}: {
  userName: string;
  role: string;
  branches: BranchOption[];
  selectedBranchId: string;
  canViewAllBranches: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function changeBranch(branchId: string) {
    await fetch("/api/branch-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId })
    });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:py-0">
        <MobileSidebar />
        <div className="hidden min-w-0 flex-1 sm:block">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search students, receipts, schools..." />
          </div>
        </div>
        <div className="min-w-0 flex-1 sm:hidden">
          <p className="truncate text-sm font-semibold">Prime Japanese</p>
          <p className="text-xs text-muted-foreground">Agency CRM</p>
        </div>
        <div className="order-last w-full sm:order-none sm:w-[220px]">
          <Select
            aria-label="Global branch filter"
            value={selectedBranchId}
            disabled={!canViewAllBranches}
            onChange={(event) => changeBranch(event.target.value)}
            className="h-10 rounded-lg border-border/80 bg-card text-sm font-medium"
          >
            {canViewAllBranches ? <option value={allBranchesValue}>All Branches</option> : null}
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-semibold">{userName}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
