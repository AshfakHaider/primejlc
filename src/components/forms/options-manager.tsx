"use client";

import type React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { humanize } from "@/lib/utils";

type Option = { value: string; label: string };
type GroupedOptions = Record<string, Option[]>;

const editableGroups = [
  "programTrack",
  "japaneseLevel",
  "targetIntake",
  "preferredCity",
  "applicationStatus",
  "feeStatus",
  "preparationStatus",
  "batchStatus",
  "partnerStatus",
  "expenseCategory"
];

export function OptionsManager({ initialOptions }: { initialOptions: GroupedOptions }) {
  const [options, setOptions] = useState(initialOptions);
  const [message, setMessage] = useState("");

  async function addOption(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setMessage("Connect PostgreSQL and run migrations to save new options.");
      return;
    }
    const option = await response.json();
    setOptions((current) => ({
      ...current,
      [option.group]: [...(current[option.group] ?? []), { value: option.value, label: option.label }]
    }));
    event.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic CRM options</CardTitle>
        <CardDescription>These values drive student forms, intakes, cities, statuses, batches, schools, and expenses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]" onSubmit={addOption}>
          <div className="space-y-2">
            <Label>Option group</Label>
            <Select name="group">
              {editableGroups.map((group) => <option key={group} value={group}>{humanize(group)}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input name="value" placeholder="JANUARY_INTAKE" required />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input name="label" placeholder="January Intake" required />
          </div>
          <Button className="self-end"><Plus className="h-4 w-4" />Add</Button>
        </form>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {editableGroups.map((group) => (
            <div key={group} className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-semibold">{humanize(group)}</p>
              <div className="flex flex-wrap gap-2">
                {(options[group] ?? []).map((option) => (
                  <Badge key={option.value} variant="outline">{option.label}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
