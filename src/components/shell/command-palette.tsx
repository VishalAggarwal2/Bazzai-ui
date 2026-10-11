"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Boxes, Compass, KeyRound, LayoutDashboard, Package, Paintbrush, Plus, ReceiptText, Settings2, Store, Users, Warehouse, ArrowLeftRight, Globe,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { tenants, ROOT_DOMAIN } from "@/lib/data";
import { useStudio } from "@/lib/store";

const pages = [
  { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { label: "Products", href: "/manager/products", icon: Package },
  { label: "Inventory", href: "/manager/inventory", icon: Warehouse },
  { label: "Orders", href: "/manager/orders", icon: ReceiptText },
  { label: "Custom data", href: "/manager/entities", icon: Boxes },
  { label: "Website builder", href: "/manager/site", icon: Paintbrush },
  { label: "People", href: "/manager/people", icon: Users },
  { label: "Roles and access", href: "/manager/roles", icon: KeyRound },
  { label: "Domains and billing", href: "/manager/settings", icon: Settings2 },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const setTenant = useStudio((s) => s.setTenant);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[22%] translate-y-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Jump to</DialogTitle>
        <Command>
          <CommandInput placeholder="Jump to a page, switch store, or run an action…" />
          <CommandList>
            <CommandEmpty>Nothing matches that. Try “products” or “roles”.</CommandEmpty>
            <CommandGroup heading="Go to">
              {pages.map((p) => (
                <CommandItem key={p.href} onSelect={() => go(p.href)}>
                  <p.icon /> {p.label}
                </CommandItem>
              ))}
              <CommandItem onSelect={() => go("/store")}>
                <Store /> Open storefront
              </CommandItem>
              <CommandItem onSelect={() => go("/")}>
                <Compass /> Project flow map
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Switch store">
              {tenants.filter((t) => t.status !== "suspended").map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => {
                    setTenant(t.id);
                    onOpenChange(false);
                    toast(`Switched to ${t.name}`, { description: `Now on ${t.slug}.${ROOT_DOMAIN}/manager` });
                  }}
                >
                  <ArrowLeftRight /> {t.name}
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{t.slug}.{ROOT_DOMAIN}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => go("/manager/people")}><Plus /> Invite a teammate</CommandItem>
              <CommandItem onSelect={() => go("/manager/entities")}><Plus /> Create a custom table</CommandItem>
              <CommandItem onSelect={() => go("/manager/settings")}><Globe /> Connect a domain</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
