"use client";

import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function DashboardMonthSelector({ options, selectedMonth }: { options: { value: string; label: string }[]; selectedMonth: string }) {
  return (
    <form action="/dashboard" method="get" className="flex items-center gap-2">
      <div className="relative">
        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Select
          aria-label="Dashboard month"
          name="month"
          defaultValue={selectedMonth}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-9 min-w-40 rounded-full bg-card pl-8 text-xs font-semibold"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="outline" size="sm" className="rounded-full">
        Apply
      </Button>
    </form>
  );
}
