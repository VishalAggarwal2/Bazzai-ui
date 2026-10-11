"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Boxes, Check, Globe, KeyRound, LayoutDashboard, Paintbrush, Rocket, Store, UserPlus } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HelperToggle } from "@/components/helper-toggle";
import { Suggest } from "@/components/suggest";
import { Button } from "@/components/ui/button";
import { patternStyle } from "@/components/product-art";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const flow = [
  { icon: UserPlus, title: "A store signs up", text: "The owner names the store, claims an address like marigold.bazzar.app and picks a starting look. Four screens, no technical setup.", links: [["Try the signup", "/onboarding"]] },
  { icon: Store, title: "The platform provisions it", text: "Bazzar creates an isolated workspace with starter roles, a Reviews table, one location and a homepage. Support can see every store and its domain health.", links: [["Platform admin", "/platform"]] },
  { icon: LayoutDashboard, title: "The owner stocks the shelves", text: "Products, variants, locations and live inventory. Sales on the till and the website draw from the same counts.", links: [["Products", "/manager/products"], ["Inventory", "/manager/inventory"], ["Orders", "/manager/orders"]] },
  { icon: Boxes, title: "They add the data only they have", text: "Reviews, feedback, warranty claims, size guides. Create a table, drag in fields, and forms, lists and permissions appear on their own.", links: [["Custom data", "/manager/entities"]] },
  { icon: KeyRound, title: "They set up the team", text: "An org chart with who reports to whom, and roles that can inherit from each other. People only see what their role allows.", links: [["People", "/manager/people"], ["Roles", "/manager/roles"]] },
  { icon: Paintbrush, title: "They design the website", text: "Reorder sections, change the palette and type, hide what they don’t need, and decide which custom tables show up for shoppers.", links: [["Website builder", "/manager/site"]] },
  { icon: Globe, title: "They go live on their own domain", text: "Point a CNAME, verify, and HTTPS is issued automatically. The manager portal stays at /manager on every domain.", links: [["Domains", "/manager/settings"], ["Storefront", "/store"]] },
];

export default function Home() {
  const [slug, setSlug] = useState("kaveri");
  const setTenant = useStudio((s) => s.setTenant);
  const t = tenants.find((x) => x.slug === slug.trim().toLowerCase());
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "yourstore";

  return (
    <div className="overflow-x-clip">
      <header className="relative z-10 mx-auto flex max-w-[1280px] items-center gap-6 px-5 py-4 sm:px-8">
        <Wordmark />
        <nav className="ml-auto hidden items-center gap-1 text-sm md:flex">
          {[["Platform admin", "/platform"], ["Store manager", "/manager"], ["Storefront", "/store"]].map(([l, h]) => <Link key={h} href={h} className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">{l}</Link>)}
        </nav>
        <HelperToggle />
        <ThemeToggle />
        <Button variant="brand" asChild className="hidden sm:inline-flex"><Link href="/onboarding">Create a store</Link></Button>
      </header>

      {/* awning */}
      <div className="relative">
        <div className="awning scallop awning-roll h-12" style={{ ["--stripe-a" as string]: "var(--brand)", ["--stripe-b" as string]: "var(--card)" }} />
        <div className="absolute inset-x-0 top-0 h-12 shadow-[0_18px_30px_-18px_rgb(20_26_58/0.35)]" style={{ clipPath: "inset(100% 0 -40px 0)" }} />
      </div>

      <section className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <div>
          <h1 className="font-display text-[56px] sm:text-[84px] lg:text-[104px]">A front door for every store.</h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Bazzar gives each business its own website, back office, team and data, all running on one platform. This is the phase one mockup of the whole journey, from signup to first sale.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant="brand" size="lg" asChild><a href="#flow">Walk the flow</a></Button>
            <Button variant="outline" size="lg" asChild><Link href="/manager">Open a store’s manager</Link></Button>
          </div>
        </div>

        {/* resolver */}
        <div className="relative">
          <div className="absolute -inset-3 -z-10 rotate-2 rounded-[36px] bg-saffron" />
          <div className="rounded-[28px] border bg-card p-6 shadow-xl">
            <label htmlFor="slug" className="text-sm font-medium">Type a store name to see where it lives</label>
            <Suggest className="mt-2" options={tenants.map((x) => ({ value: x.slug, hint: x.name }))}>
              <div className="flex items-center overflow-hidden rounded-xl border bg-background focus-within:ring-[3px] focus-within:ring-ring/25">
                <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent px-4 font-mono text-[15px] outline-none" />
                <span className="pr-4 font-mono text-[15px] text-muted-foreground">.{ROOT_DOMAIN}</span>
              </div>
            </Suggest>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tenants.slice(0, 5).map((x) => <button key={x.id} onClick={() => setSlug(x.slug)} className={cn("rounded-full border px-3 py-1 text-xs transition", slug === x.slug ? "border-brand bg-brand/10 text-brand" : "hover:bg-accent")}>{x.slug}</button>)}
            </div>

            <div className="mt-6 space-y-2.5">
              {[
                ["Shoppers", `${clean}.${ROOT_DOMAIN}`, "", "/store"],
                ["Your team", `${clean}.${ROOT_DOMAIN}`, "/manager", "/manager"],
                ...(t?.domain ? [["Custom domain", t.domain, "", "/store"]] : []),
              ].map(([who, host, path, href]) => (
                <Link key={who + host} href={href} onClick={() => t && setTenant(t.id)} className="group flex items-center gap-3 rounded-xl border bg-background/70 px-4 py-3 transition hover:border-brand hover:bg-brand/5">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">{who}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{host}<span className="text-brand">{path}</span></span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-brand" />
                </Link>
              ))}
            </div>

            <div className={cn("mt-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm", t ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : "bg-secondary text-muted-foreground")}>
              {t ? (<><Check className="size-4 shrink-0" /> Resolved to <b>{t.name}</b> <span className="font-mono text-xs opacity-70">tenant {t.id}</span></>) : (<>Nothing lives here yet. <Link href="/onboarding" className="font-medium text-brand underline underline-offset-2">Claim {clean}</Link></>)}
            </div>
          </div>
        </div>
      </section>

      {/* three doors */}
      <section className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
        <h2 className="font-display max-w-2xl text-[40px] sm:text-6xl">Three doors, one platform.</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.15fr_1fr]">
          <Link href="/platform" className="group flex flex-col justify-between rounded-[32px] bg-primary p-7 text-primary-foreground transition hover:-translate-y-1">
            <div>
              <div className="font-mono text-sm text-saffron">admin.{ROOT_DOMAIN}</div>
              <h3 className="font-display mt-4 text-4xl">For us</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-75">Create stores, watch domains and revenue, switch features by plan, and step into a store to help.</p>
            </div>
            <div className="mt-10 flex items-center gap-1.5 text-sm font-medium"><span className="border-b border-current pb-0.5">Open platform admin</span></div>
          </Link>
          <Link href="/manager" className="group flex flex-col justify-between rounded-[32px] bg-saffron p-7 text-[#141a3a] transition hover:-translate-y-1">
            <div>
              <div className="font-mono text-sm">store.{ROOT_DOMAIN}<b>/manager</b></div>
              <h3 className="font-display mt-4 text-5xl">For the store team</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-80">Inventory, orders, people and permissions, custom tables and the website builder. Each person sees only what their role allows.</p>
            </div>
            <div className="mt-10 flex items-center gap-1.5 text-sm font-medium"><span className="border-b border-current pb-0.5">Open the store manager</span></div>
          </Link>
          <Link href="/store" className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border bg-card p-7 transition hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 size-40 rounded-full opacity-90" style={patternStyle("diamond", ["#3340ff", "#dfe3ff"])} />
            <div className="relative">
              <div className="font-mono text-sm text-muted-foreground">store.{ROOT_DOMAIN}</div>
              <h3 className="font-display mt-4 text-4xl">For shoppers</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">A fast storefront in the store’s own colours, type and domain.</p>
            </div>
            <div className="relative mt-10 flex items-center gap-1.5 text-sm font-medium"><span className="border-b border-current pb-0.5">Open the storefront</span></div>
          </Link>
        </div>
      </section>

      {/* flow */}
      <section id="flow" className="bg-sidebar py-24 text-sidebar-foreground">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 sm:px-8 lg:grid-cols-[360px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <LogoMark a="#ffb61e" b="#f4f5fa" className="size-12" />
            <h2 className="font-display mt-6 text-[44px] text-white sm:text-6xl">The journey, end to end.</h2>
            <p className="mt-5 text-[15px] leading-relaxed opacity-70">Every screen in this mockup is clickable and keeps its state while you move around. Change a role, rename a section or add a field, then watch it show up elsewhere.</p>
          </div>
          <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-px before:bg-white/15">
            {flow.map((s, i) => (
              <li key={s.title} className="relative flex gap-5">
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-white/15 bg-sidebar-accent">
                  <s.icon className="size-5 text-saffron" />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-saffron text-[11px] font-bold text-[#141a3a]">{i + 1}</span>
                </span>
                <div className="flex-1 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-display text-3xl text-white">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed opacity-70">{s.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.links.map(([l, h]) => <Link key={h} href={h} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-saffron hover:text-[#141a3a]">{l} <ArrowUpRight className="size-3.5" /></Link>)}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* tenancy */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8">
        <h2 className="font-display max-w-3xl text-[40px] sm:text-6xl">Stores share the platform, never each other’s data.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["At the edge", "The web address is read on every request and matched to a store. Subdomains and custom domains both work.", "shop.kaveritextiles.in → tenant t1"],
            ["In the API", "The store is part of the signed-in session and is attached to every request. Pages can’t ask for another store’s data.", "X-Tenant: t1 · role: manager"],
            ["In the database", "Every row carries its store id, and row-level security enforces it, even if application code slips.", "WHERE tenant_id = 't1'"],
          ].map(([h, p, c], i) => (
            <div key={h} className={cn("rounded-3xl border p-6", i === 1 ? "bg-card md:-translate-y-4" : "bg-card/60")}>
              <h3 className="font-display text-3xl">{h}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p}</p>
              <code className="mt-5 block rounded-xl bg-secondary px-3 py-2.5 font-mono text-xs">{c}</code>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4 px-5 py-8 text-sm text-muted-foreground sm:px-8">
          <Wordmark />
          <span>Phase one mockup. Interface only, no backend. Data is sample data and resets on refresh.</span>
          <Button variant="brand" className="ml-auto" asChild><Link href="/onboarding"><Rocket /> Start with signup</Link></Button>
        </div>
      </footer>
    </div>
  );
}
