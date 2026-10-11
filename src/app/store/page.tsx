"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { useStudio } from "@/lib/store";
import { useSite } from "@/lib/site-store";
import { ROOT_DOMAIN, tenants } from "@/lib/data";

export default function StorePage() {
  const tenantId = useStudio((s) => s.tenantId);
  const pageId = useSite((s) => s.pageId);
  const pages = useSite((s) => s.published.pages);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const path = (pages.find((p) => p.id === pageId) ?? pages[0]).path;
  return (
    <div className="min-h-dvh bg-neutral-900">
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-neutral-900 px-4 py-2 text-xs text-neutral-300">
        <Link href="/manager/site" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 hover:bg-white/20"><ArrowLeft className="size-3.5" /> Back to builder</Link>
        <span className="font-mono">https://{t.domain ?? `${t.slug}.${ROOT_DOMAIN}`}{path}</span>
        <span className="ml-auto hidden sm:inline">This is the last published version. Unpublished edits stay in the builder.</span>
      </div>
      <StorefrontView mode="live" source="published" />
    </div>
  );
}
