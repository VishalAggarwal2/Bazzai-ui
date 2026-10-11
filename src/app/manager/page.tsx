"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart } from "@/components/charts";
import { ProductArt } from "@/components/product-art";
import { activity, revenue, tenants } from "@/lib/data";
import { inr } from "@/lib/format";
import { useStudio } from "@/lib/store";

const labels = Array.from({ length: 14 }, (_, i) => new Date(2026, 8, 27 + i).toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
const prev = [30, 34, 33, 40, 38, 44, 47, 45, 50, 52, 58, 57, 63, 70];

const attention = [
  { tone: "bg-chili", text: "3 products are below their reorder level", href: "/manager/inventory", cta: "Review stock" },
  { tone: "bg-chili", text: "Ajrakh Bedspread is out of stock everywhere", href: "/manager/inventory", cta: "Reorder" },
  { tone: "bg-saffron", text: "12 paid orders are waiting to be packed", href: "/manager/orders", cta: "Pack orders" },
  { tone: "bg-saffron", text: "4 reviews are waiting for approval", href: "/manager/entities", cta: "Moderate" },
  { tone: "bg-brand", text: "neha@kaveritextiles.in hasn't accepted the invite", href: "/manager/people", cta: "Resend" },
];

const steps = [
  { label: "Create your store", done: true },
  { label: "Add products and stock", done: true },
  { label: "Invite your team and set roles", done: true },
  { label: "Design your website", done: true },
  { label: "Connect shop.kaveritextiles.in", done: true },
  { label: "Add a custom table for warranty claims", done: false },
];

export default function Dashboard() {
  const tenantId = useStudio((s) => s.tenantId);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const [range, setRange] = useState("14d");
  const products = useStudio((s) => s.products);
  const top = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const maxSold = top[0].sold;
  const done = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Sunday 11 October, {t.name}</p>
          <h1 className="font-display mt-1 text-[40px] sm:text-[52px]">Good morning, Meera.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sales are up 18% on the last fortnight. Three things need you today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/manager/orders">New sale</Link></Button>
          <Button variant="brand" asChild><Link href="/manager/products"><Plus /> Add product</Link></Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Revenue, last 14 days</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-display text-[44px]">{inr(847000)}</span>
                <Badge variant="success"><TrendingUp /> 18.2%</Badge>
              </div>
            </div>
            <Tabs value={range} onValueChange={setRange}>
              <TabsList>
                <TabsTrigger value="14d">14 days</TabsTrigger>
                <TabsTrigger value="30d">30 days</TabsTrigger>
                <TabsTrigger value="90d">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <AreaChart className="mt-4" data={revenue} compare={prev} labels={labels} format={(n) => inr(n * 1000)} />
          <div className="mt-5 grid grid-cols-2 gap-y-4 border-t pt-5 sm:grid-cols-4 sm:divide-x">
            {[
              ["Orders", "318"],
              ["Average order", inr(2663)],
              ["Conversion", "3.4%"],
              ["Returns", "2.1%"],
            ].map(([k, v], i) => (
              <div key={k} className={i ? "sm:pl-5" : ""}>
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="mt-0.5 text-xl font-semibold tracking-tight">{v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-saffron/50 bg-saffron/15 p-5">
          <h2 className="text-sm font-semibold">Needs your attention</h2>
          <ul className="mt-3 divide-y">
            {attention.map((a) => (
              <li key={a.text}>
                <Link href={a.href} className="group flex items-start gap-3 py-3">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.tone}`} />
                  <span className="flex-1 text-[13.5px] leading-snug">{a.text}</span>
                  <span className="mt-0.5 flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition group-hover:text-foreground">
                    {a.cta} <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-3 lg:divide-x">
        <section className="p-6">
          <h2 className="text-sm font-semibold">Where sales come from</h2>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full">
            <div className="bg-brand" style={{ width: "58%" }} />
            <div className="bg-saffron" style={{ width: "27%" }} />
            <div className="bg-emerald-500" style={{ width: "15%" }} />
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[["Online store", "58%", "bg-brand", inr(491000)], ["In-store POS", "27%", "bg-saffron", inr(229000)], ["WhatsApp orders", "15%", "bg-emerald-500", inr(127000)]].map(([n, p, c, v]) => (
              <li key={n} className="flex items-center gap-2.5">
                <span className={`size-2.5 rounded-sm ${c}`} />
                <span className="flex-1">{n}</span>
                <span className="text-muted-foreground">{v}</span>
                <span className="w-9 text-right font-medium">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t pt-4">
            <div className="text-xs font-medium text-muted-foreground">Top cities</div>
            <ul className="mt-3 space-y-2.5">
              {[["Bengaluru", 34], ["Chennai", 21], ["Mumbai", 17]].map(([c, v]) => (
                <li key={String(c)} className="flex items-center gap-3 text-[13px]">
                  <span className="w-20">{c}</span>
                  <Progress value={Number(v) * 2.5} className="h-1 flex-1" indicatorClassName="bg-emerald-600" />
                  <span className="w-8 text-right tabular-nums text-muted-foreground">{v}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t p-6 lg:border-t-0">
          <h2 className="text-sm font-semibold">Best sellers</h2>
          <ul className="mt-4 space-y-3">
            {top.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <ProductArt pattern={p.pattern} tone={p.tone} className="!w-9 !aspect-square" rounded="rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{p.name}</div>
                  <Progress value={(p.sold / maxSold) * 100} className="mt-1.5 h-1" indicatorClassName="bg-brand" />
                </div>
                <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">{p.sold}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t p-6 lg:border-t-0">
          <h2 className="text-sm font-semibold">Audit trail</h2>
          <ol className="relative mt-4 space-y-4 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-border">
            {activity.map((a) => (
              <li key={a.id} className="relative pl-5 text-[13px] leading-snug">
                <span className="absolute left-0 top-1 size-[11px] rounded-full border-2 border-card bg-muted-foreground/60" />
                <span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span> <span className="font-medium">{a.target}</span>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.when}</div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border bg-card">
        <div className="awning h-3" style={{ ["--stripe-a" as string]: "var(--brand)", ["--stripe-b" as string]: "var(--saffron)" }} />
        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
          <div>
            <h2 className="font-display text-3xl">Almost fully set up</h2>
            <p className="mt-2 text-sm text-muted-foreground">{done} of {steps.length} steps done. One more and your store is fully equipped.</p>
            <Progress value={(done / steps.length) * 100} className="mt-4 h-2" indicatorClassName="bg-brand" />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 rounded-xl border bg-background/60 px-3.5 py-3 text-sm">
                <span className={`grid size-5 place-items-center rounded-full ${s.done ? "bg-emerald-500 text-white" : "border-2 border-dashed border-muted-foreground/50"}`}>
                  {s.done && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className={s.done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "font-medium"}>{s.label}</span>
                {!s.done && <Button asChild size="xs" variant="brand" className="ml-auto"><Link href="/manager/entities"><Sparkles /> Start</Link></Button>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
