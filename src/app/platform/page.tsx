"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Clock, ExternalLink, LogIn, MoreHorizontal, Pause, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Sparkline } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { inr, initials } from "@/lib/format";
import { useStudio } from "@/lib/store";

const mrrSeries = [31, 36, 41, 48, 55, 61, 69, 78];
const planColor = { Starter: "secondary", Growth: "brand", Scale: "ink" } as const;
const statusColor = { active: "success", trial: "warn", suspended: "danger" } as const;

export default function PlatformPage() {
  const [q, setQ] = useState("");
  const setTenant = useStudio((s) => s.setTenant);
  const rows = tenants.filter((t) => (t.name + t.slug).toLowerCase().includes(q.toLowerCase()));
  const mrr = tenants.reduce((s, t) => s + t.mrr, 0);
  return (
    <>
      <PageHeader title="Every store on Bazzar" description="Create, support and bill the businesses running on your platform. Each one is fully isolated from the others."
        actions={<Button variant="brand" asChild><Link href="/onboarding"><Plus /> Create store</Link></Button>} />

      <div className="mb-6 grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="text-sm opacity-70">Monthly recurring revenue</div>
          <div className="mt-1 font-display text-[44px]">{inr(mrr)}</div>
          <Sparkline data={mrrSeries} color="#ffb61e" className="mt-2 h-10" />
        </div>
        {[["Stores", String(tenants.length), "2 joined this month"], ["Domains waiting", "1", "pedal.cycles is waiting on DNS"], ["On trial", "1", "Haat Spices, ends in 9 days"]].map(([k, v, s]) => (
          <div key={k} className="rounded-3xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-[44px]">{v}</div>
            <div className="text-xs text-muted-foreground">{s}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="tenants">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList><TabsTrigger value="tenants">Stores</TabsTrigger><TabsTrigger value="domains">Domains</TabsTrigger><TabsTrigger value="plans">Plans and limits</TabsTrigger></TabsList>
          <div className="relative ml-auto w-full sm:w-64"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input suggest="storeSearch" className="pl-9" placeholder="Search stores" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <TabsContent value="tenants" className="mt-3">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Store</TableHead><TableHead>Address</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Products</TableHead><TableHead className="text-right">MRR</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl text-xs font-bold text-white" style={{ background: t.color }}>{initials(t.name)}</span>
                        <div><div className="font-medium">{t.name}</div><div className="text-xs text-muted-foreground">{t.city}, since {t.since}</div></div>
                      </div>
                    </TableCell>
                    <TableCell><div className="font-mono text-xs">{t.slug}.{ROOT_DOMAIN}</div>{t.domain && <div className="font-mono text-xs text-muted-foreground">{t.domain}</div>}</TableCell>
                    <TableCell><Badge variant={planColor[t.plan]}>{t.plan}</Badge></TableCell>
                    <TableCell><Badge variant={statusColor[t.status]} className="capitalize">{t.status}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{t.products}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.mrr ? inr(t.mrr) : "–"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild onSelect={() => setTenant(t.id)}><Link href="/manager"><LogIn /> Sign in as support</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/store" target="_blank" onClick={() => setTenant(t.id)}><ExternalLink /> Open storefront</Link></DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => toast(`${t.name} suspended`, { description: "Storefront shows a maintenance page." })}><Pause /> Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="domains" className="mt-3">
          <div className="overflow-hidden rounded-2xl border bg-card">
            {tenants.filter((t) => t.domain).map((t) => (
              <div key={t.id} className="flex items-center gap-4 border-b px-5 py-4 last:border-0">
                <div className="min-w-0 flex-1"><div className="font-mono text-sm">{t.domain}</div><div className="text-xs text-muted-foreground">→ {t.name} ({t.id})</div></div>
                {t.domainStatus === "live" ? <Badge variant="success"><Check /> HTTPS active</Badge> : <Badge variant="warn"><Clock /> Waiting for DNS</Badge>}
                {t.domainStatus === "pending" && <Button size="sm" variant="outline" onClick={() => toast("Re-checking DNS")}>Check again</Button>}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="plans" className="mt-3">
          <div className="grid gap-4 md:grid-cols-3">
            {[["Starter", ["Custom domain", "Custom tables", "Multiple locations"], [false, true, false]], ["Growth", ["Custom domain", "Custom tables", "Multiple locations"], [true, true, true]], ["Scale", ["Custom domain", "Custom tables", "Multiple locations"], [true, true, true]]].map(([n, labels, on]) => (
              <div key={String(n)} className="rounded-3xl border bg-card p-5">
                <div className="font-display text-2xl">{String(n)}</div>
                <ul className="mt-4 space-y-3">
                  {(labels as string[]).map((l, i) => <li key={l} className="flex items-center justify-between text-sm">{l}<Switch defaultChecked={(on as boolean[])[i]} /></li>)}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
