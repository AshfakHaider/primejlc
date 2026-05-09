import type React from "react";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionsManager } from "@/components/forms/options-manager";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAgencySettings, getCrmOptions } from "@/lib/queries";

export default async function SettingsPage() {
  const [agency, options] = await Promise.all([getAgencySettings(), getCrmOptions()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Agency profile, contact information, and CRM defaults.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Agency info</CardTitle>
            <CardDescription>Prime Japanese Language Centre public and receipt identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Info icon={Building2} label="Name" value={agency.name} />
            <Info icon={Phone} label="Mobile" value={agency.mobile} />
            <Info icon={Mail} label="Email" value={agency.email} />
            <Info icon={MapPin} label="Address" value={agency.address} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Editable profile form</CardTitle>
            <CardDescription>Ready to connect to an update endpoint when production permissions are finalized.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue={agency.name} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Mobile</Label><Input defaultValue={agency.mobile} /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={agency.email} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input defaultValue={agency.address} /></div>
          </CardContent>
        </Card>
      </div>
      <OptionsManager initialOptions={options} />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-md border p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
