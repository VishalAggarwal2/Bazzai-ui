"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell, Boxes, Check, ChevronsUpDown, ExternalLink, KeyRound, LayoutDashboard, Menu, Package, Paintbrush, Plus, ReceiptText, Search, Settings2, Users, Warehouse,
} from "lucide-react";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HelperToggle } from "@/components/helper-toggle";
import { FlowGuide } from "@/components/flow-guide";
import { HostBar } from "./host-bar";
import { CommandPalette } from "./command-palette";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { initials } from "@/lib/format";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { group: "Run the store", items: [
    { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/products", label: "Products", icon: Package },
    { href: "/manager/inventory", label: "Inventory", icon: Warehouse },
    { href: "/manager/orders", label: "Orders", icon: ReceiptText },
  ] },
  { group: "Shape it your way", items: [
    { href: "/manager/entities", label: "Custom data", icon: Boxes },
    { href: "/manager/site", label: "Website builder", icon: Paintbrush },
  ] },
  { group: "Your team", items: [
    { href: "/manager/people", label: "People", icon: Users },
    { href: "/manager/roles", label: "Roles and access", icon: KeyRound },
  ] },
  { group: "Account", items: [{ href: "/manager/settings", label: "Domains and billing", icon: Settings2 }] },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const tenantId = useStudio((s) => s.tenantId);
  const setTenant = useStudio((s) => s.setTenant);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const pending = useStudio((s) => s.entities.reduce((n, e) => n + e.records.filter((r) => r._pending).length, 0));
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-4 pt-4">
        <Link href="/" onClick={onNavigate}><Wordmark dark className="text-white" /></Link>
      </div>
      <div className="px-3 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent p-2 text-left outline-none transition hover:border-white/20 focus-visible:ring-2 focus-visible:ring-saffron">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white" style={{ background: t.color }}>{initials(t.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-white">{t.name}</span>
                <span className="block truncate font-mono text-[11px] text-sidebar-muted">{t.slug}.{ROOT_DOMAIN}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sidebar-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Your stores</DropdownMenuLabel>
            {tenants.filter((x) => x.status !== "suspended").slice(0, 4).map((x) => (
              <DropdownMenuItem
                key={x.id}
                onSelect={() => {
                  setTenant(x.id);
                  toast(`Switched to ${x.name}`, { description: `Requests now resolve to ${x.slug}.${ROOT_DOMAIN}. Data is isolated per store.` });
                }}
              >
                <span className="size-2.5 rounded-full" style={{ background: x.color }} />
                <span className="flex-1 truncate text-foreground">{x.name}</span>
                {x.id === tenantId && <Check />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/onboarding"><Plus /> Create another store</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {nav.map((g) => (
          <div key={g.group}>
            <div className="px-2 pb-1.5 text-xs text-sidebar-muted">{g.group}</div>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const active = i.href === "/manager" ? path === i.href : path === i.href || path.startsWith(i.href + "/");
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors",
                        active ? "bg-white/10 text-white" : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-saffron" />}
                      <i.icon className={cn("size-4", active ? "text-saffron" : "text-sidebar-muted group-hover:text-sidebar-foreground")} />
                      {i.label}
                      {i.href === "/manager/entities" && pending > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-saffron px-1.5 text-[11px] font-semibold text-ink" aria-label={`${pending} waiting for approval`}>{pending}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 overflow-hidden rounded-xl border border-sidebar-border">
        <div className="awning h-2.5" style={{ ["--stripe-a" as string]: "#ffb61e", ["--stripe-b" as string]: "#141a3a" }} />
        <div className="space-y-2 bg-sidebar-accent p-3">
          <div className="flex items-center gap-2 text-xs text-white">
            <span className="size-2 animate-pulse-ring rounded-full bg-emerald-400" /> Storefront is live
          </div>
          <Button asChild variant="saffron" size="sm" className="w-full">
            <Link href="/store" target="_blank"><ExternalLink /> Open {t.slug}.{ROOT_DOMAIN}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  const wide = pathname === "/manager/site";
  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><SidebarBody /></aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setMobile(false)} />
        </SheetContent>
      </Sheet>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu /></Button>
        <HostBar className="max-w-[420px]" />
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="hidden w-52 justify-start text-muted-foreground sm:inline-flex" onClick={() => setPalette(true)}>
            <Search /> Search or jump to…
            <kbd className="ml-auto rounded border bg-secondary px-1.5 font-sans text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={() => setPalette(true)} aria-label="Search"><Search /></Button>
          <HelperToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
            <Bell />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand" />
          </Button>
          <Avatar className="ml-1 size-8"><AvatarFallback className="bg-brand text-white">MI</AvatarFallback></Avatar>
        </div>
      </header>
      <CommandPalette open={palette} onOpenChange={setPalette} />
      <FlowGuide />
      <main className={cn("mx-auto w-full", wide ? "max-w-none px-3 py-3" : "max-w-[1280px] px-4 py-8 sm:px-6")}>{children}</main>
    </div>
  );
}
