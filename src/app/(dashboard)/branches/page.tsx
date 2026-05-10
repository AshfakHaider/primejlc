import type React from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBranches } from "@/lib/queries";

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Branch Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor Dhaka, Bogura, Jamalpur, and future database branches from one owner-level view.</p>
        </div>
        <Badge variant="secondary" className="w-fit">{branches.length} branches</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {branches.map((branch) => (
          <Link key={branch.id} href={`/branches/${branch.id}`} className="group block">
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <CardTitle className="mt-4">{branch.name}</CardTitle>
                <CardDescription>{branch.managerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <BranchLine icon={MapPin} value={branch.address} />
                <BranchLine icon={Phone} value={branch.phone} />
                <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Status
                  </span>
                  <Badge variant={branch.status === "ACTIVE" ? "success" : "outline"}>
                    {branch.status === "ACTIVE" ? <CheckCircle2 className="h-3 w-3" /> : null}
                    {branch.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BranchLine({ icon: Icon, value }: { icon: React.ElementType; value: string }) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/35 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 break-words text-muted-foreground">{value}</p>
    </div>
  );
}
