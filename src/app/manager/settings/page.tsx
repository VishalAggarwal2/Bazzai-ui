"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Copy, Globe, Loader2, Lock, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

function Copyable({ v }: { v: string }) {
  return (
    <button onClick={() => { navigator.clipboard?.writeText(v); toast("Copied", { description: v }); }} className="group inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 font-mono text-xs hover:bg-accent">
      {v} <Copy className="size-3 opacity-50 group-hover:opacity-100" />
    </button>
  );
}

function ConnectDomain() {
  const [stage, setStage] = useState<"idle" | "records" | "checking" | "live">("idle");
  const [domain, setDomain] = useState("");
  const verify = () => { setStage("checking"); setTimeout(() => { setStage("live"); toast.success("Domain verified", { description: "SSL certificate issued. Your store now answers on this domain." }); }, 2200); };
  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-2 font-medium"><Globe className="size-4 text-brand" /> Connect your own domain</div>
      {stage === "idle" && (
        <div className="mt-4 flex max-w-xl gap-2">
          <Input suggest="domain" placeholder="shop.yourbrand.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="font-mono" />
          <Button variant="brand" disabled={!domain.includes(".")} onClick={() => setStage("records")}>Show DNS records</Button>
        </div>
      )}
      {stage !== "idle" && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Add these two records where you bought <span className="font-mono text-foreground">{domain}</span>. Changes can take a few minutes to spread.</p>
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">Name</th><th className="px-4 py-2 font-medium">Value</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3 font-medium">CNAME</td><td className="px-4 py-3"><Copyable v={domain.split(".")[0]} /></td><td className="px-4 py-3"><Copyable v={`edge.${ROOT_DOMAIN}`} /></td></tr>
                <tr><td className="px-4 py-3 font-medium">TXT</td><td className="px-4 py-3"><Copyable v="_bazzar-verify" /></td><td className="px-4 py-3"><Copyable v="tenant-t1-9f3c1a" /></td></tr>
              </tbody>
            </table>
          </div>
          {stage === "live" ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"><ShieldCheck className="size-4" /> Verified. HTTPS is on and {domain} now shows your storefront.</div>
          ) : (
            <Button variant="brand" onClick={verify} disabled={stage === "checking"}>{stage === "checking" ? <><Loader2 className="animate-spin" /> Checking DNS…</> : "Verify records"}</Button>
          )}
        </div>
      )}
    </div>
  );
}

const plans = [
  { n: "Starter", p: "₹0", d: "For testing the waters", f: ["1 location", "100 products", "3 staff", "2 custom tables"] },
  { n: "Growth", p: "₹9,900", d: "Per month, billed yearly", f: ["5 locations", "5,000 products", "25 staff", "10 custom tables", "Custom domain"] },
  { n: "Scale", p: "₹24,900", d: "Per month, billed yearly", f: ["Unlimited locations", "Unlimited products", "Unlimited staff", "Unlimited custom tables", "Priority support"] },
];

export default function SettingsPage() {
  const tenantId = useStudio((s) => s.tenantId);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  return (
    <>
      <PageHeader title="Domains and billing" description="Where your store lives on the internet, and what your plan includes." />
      <Tabs defaultValue="domains">
        <TabsList><TabsTrigger value="domains">Domains</TabsTrigger><TabsTrigger value="plan">Plan and usage</TabsTrigger></TabsList>
        <TabsContent value="domains" className="mt-4 space-y-5">
          <div className="overflow-hidden rounded-3xl border bg-card">
            {[
              { host: `${t.slug}.${ROOT_DOMAIN}`, note: "Included with every store", tag: "Default" },
              ...(t.domain ? [{ host: t.domain, note: "Your own domain, HTTPS is on and renews itself", tag: "Primary" }] : []),
            ].map((d) => (
              <div key={d.host} className="flex items-center gap-4 border-b px-5 py-4 last:border-0">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/12 text-emerald-600"><Lock className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="font-mono text-sm">{d.host}</div><div className="text-xs text-muted-foreground">{d.note}</div></div>
                <Badge variant={d.tag === "Primary" ? "brand" : "secondary"}>{d.tag}</Badge>
                <Badge variant="success"><Check /> Live</Badge>
              </div>
            ))}
            <div className="flex items-center gap-4 bg-secondary/50 px-5 py-4 text-sm"><span className="font-mono">{t.slug}.{ROOT_DOMAIN}/manager</span><span className="text-muted-foreground">Your team signs in here on every domain. Customers never see it.</span></div>
          </div>
          <ConnectDomain />
          <div className="rounded-3xl border bg-card p-6">
            <div className="mb-4 text-sm font-medium">How a visitor reaches your store</div>
            <div className="flex flex-col items-stretch gap-3 text-sm md:flex-row md:items-center">
              {[["Visitor types", t.domain ?? `${t.slug}.${ROOT_DOMAIN}`], ["Edge reads the host", "Looks up the store it belongs to"], ["Storefront renders", "Your theme, your sections, your data"], ["Only your data loads", `Every query is limited to ${t.id}`]].map(([a, b], i, arr) => (
                <div key={a} className="flex flex-1 items-center gap-3">
                  <div className="flex-1 rounded-2xl border bg-background/60 p-3.5"><div className="font-medium">{a}</div><div className="mt-0.5 break-all text-xs text-muted-foreground">{b}</div></div>
                  {i < arr.length - 1 && <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground md:block" />}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="plan" className="mt-4 space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((p) => {
              const cur = p.n === t.plan;
              return (
                <div key={p.n} className={cn("relative rounded-3xl border p-6", cur ? "border-transparent bg-primary text-primary-foreground" : "bg-card")}>
                  {cur && <Badge variant="saffron" className="absolute right-4 top-4">Your plan</Badge>}
                  <div className="font-display text-3xl">{p.n}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">{p.p}</div>
                  <div className={cn("text-xs", cur ? "opacity-70" : "text-muted-foreground")}>{p.d}</div>
                  <ul className="mt-5 space-y-2 text-sm">{p.f.map((f) => <li key={f} className="flex items-center gap-2"><Check className={cn("size-4", cur ? "text-saffron" : "text-brand")} />{f}</li>)}</ul>
                  {!cur && <Button variant="outline" className="mt-6 w-full" onClick={() => toast(`Switching to ${p.n} takes effect next cycle`)}>Choose {p.n}</Button>}
                </div>
              );
            })}
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <div className="mb-4 text-sm font-medium">This month’s usage</div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[["Products", 412, 1000], ["Staff seats", 11, 25], ["Custom tables", 4, 10], ["File storage (GB)", 18, 50]].map(([n, u, m]) => (
                <div key={String(n)}>
                  <div className="mb-1.5 flex justify-between text-sm"><Label className="text-foreground">{n}</Label><span className="tabular-nums text-muted-foreground">{u} / {m}</span></div>
                  <Progress value={(Number(u) / Number(m)) * 100} indicatorClassName="bg-brand" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
