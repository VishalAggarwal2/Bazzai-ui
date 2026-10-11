"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { href: "/manager", name: "Dashboard", tip: "This is what the owner sees on a Monday morning. The right-hand list is the day’s to-dos. Try the store switcher at the top of the sidebar to jump to another tenant." },
  { href: "/manager/products", name: "Products", tip: "Open any row. The shaded box at the bottom holds custom fields this store defined itself. Click Add product, then click each input for sample values." },
  { href: "/manager/inventory", name: "Inventory", tip: "Counts per location, shaded when low. Open Transfer stock and try moving eight sarees from the warehouse to Jaipur." },
  { href: "/manager/orders", name: "Orders", tip: "Open a paid order and move it to packed. Website, till and WhatsApp orders share this queue." },
  { href: "/manager/entities", name: "Custom data", tip: "Open Reviews and click a customer chip to jump to that record. Try the Links map to see how tables connect, then open Enquiries and add a field." },
  { href: "/manager/people", name: "People", tip: "Click anyone in the org chart to see what they can do. Invite a teammate and choose who they report to." },
  { href: "/manager/roles", name: "Roles", tip: "Select Regional manager. Dashed cells are inherited from Store manager and can’t be changed here. Watch the menu preview underneath." },
  { href: "/manager/site", name: "Website", tip: "Open the Contact page, click the form and reorder its fields. Press Preview, send a message, then check Enquiries under Custom data." },
  { href: "/manager/settings", name: "Domains", tip: "Type shop.marigoldhome.in, copy the two DNS records, then verify. The store now answers on the new domain with HTTPS." },
];

export function FlowGuide() {
  const path = usePathname();
  const [open, setOpen] = useState(path !== "/manager/site");
  const idx = steps.findIndex((s) => (s.href === "/manager" ? path === s.href : path.startsWith(s.href)));
  if (idx < 0) return null;
  const s = steps[idx];
  const next = steps[idx + 1];
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]">
      {open ? (
        <div className="w-[320px] max-w-full rounded-2xl border bg-primary p-4 text-primary-foreground shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium"><Compass className="size-4 text-saffron" /> Step {idx + 1} of {steps.length}: {s.name}</div>
            <button onClick={() => setOpen(false)} aria-label="Hide guide" className="rounded p-0.5 opacity-70 hover:opacity-100"><X className="size-4" /></button>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden>
            {steps.map((x, i) => <span key={x.href} className={cn("h-1 flex-1 rounded-full", i <= idx ? "bg-saffron" : "bg-white/20")} />)}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed opacity-85">{s.tip}</p>
          {next ? (
            <Button asChild variant="saffron" size="sm" className="mt-3 w-full"><Link href={next.href}>Next: {next.name}</Link></Button>
          ) : (
            <Button asChild variant="saffron" size="sm" className="mt-3 w-full"><Link href="/store">See the storefront</Link></Button>
          )}
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} className="rounded-full shadow-xl"><Compass className="text-saffron" /> Flow guide</Button>
      )}
    </div>
  );
}
