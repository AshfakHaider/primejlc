import type React from "react";
import { cn } from "@/lib/utils";

export function PageHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  className
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 xl:flex-row xl:items-center", className)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{eyebrow}</span>
          <span>/</span>
          <span>Prime JLC CRM</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
