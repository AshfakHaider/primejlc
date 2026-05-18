import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({ compact = false, className, imageClassName }: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className={cn("shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm", compact ? "h-11 w-11 p-1" : "h-12 w-36 p-1.5")}>
        <Image
          src={compact ? "/brand/prime-logo-full.jpeg" : "/brand/prime-logo-horizontal.png"}
          alt="Prime Japanese Language Centre logo"
          width={compact ? 96 : 260}
          height={compact ? 96 : 104}
          className={cn("h-full w-full object-contain", imageClassName)}
          priority
        />
      </div>
      {compact ? (
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">Prime Japanese</p>
          <p className="text-xs text-muted-foreground">Agency CRM</p>
        </div>
      ) : null}
    </div>
  );
}
