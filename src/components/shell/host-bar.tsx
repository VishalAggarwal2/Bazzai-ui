"use client";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Shows what the browser address bar would read in production, so the multi-tenant routing is visible. */
export function HostBar({ platform, className }: { platform?: boolean; className?: string }) {
  const path = usePathname();
  const tenantId = useStudio((s) => s.tenantId);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const host = platform ? `admin.${ROOT_DOMAIN}` : `${t.slug}.${ROOT_DOMAIN}`;
  const shown = path.replace(/^\/(manager|platform)/, (m) => (m === "/manager" ? "/manager" : ""));
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-full border bg-card/80 py-1 pl-3 pr-1.5 text-[13px]", className)}>
      <Lock className="size-3 shrink-0 text-emerald-600" />
      <span className="truncate font-mono text-xs">
        <span>{host}</span>
        <span className="opacity-60">{shown || "/"}</span>
      </span>
      {!platform && (
        <span className="ml-1 hidden shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
          <span className="size-1.5 rounded-full" style={{ background: t.color }} />
          tenant {t.id}
        </span>
      )}
    </div>
  );
}
