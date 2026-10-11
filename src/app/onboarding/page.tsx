"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { Suggest } from "@/components/suggest";
import { HelperToggle } from "@/components/helper-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROOT_DOMAIN, themePresets } from "@/lib/data";
import { patternStyle } from "@/components/product-art";
import { useStudio } from "@/lib/store";
import { useSite } from "@/lib/site-store";
import { cn } from "@/lib/utils";

const steps = ["Business", "Address", "Look", "Team", "Launch"];
const taken = ["kaveri", "nila", "pedal", "haat", "bluelotus", "dhaga", "admin", "www", "api", "app"];
const kinds = ["Fashion and textiles", "Food and coffee", "Home and living", "Electronics", "Beauty", "Something else"];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const [name, setName] = useState("Marigold Home");
  const [kind, setKind] = useState(kinds[2]);
  const [slug, setSlug] = useState("marigold");
  const [preset, setPreset] = useState("indigo");
  const [emails, setEmails] = useState(["", ""]);
  const [launching, setLaunching] = useState(false);
  const applyPreset = useSite((s) => s.applyPreset);
  const p = themePresets.find((x) => x.id === preset)!;
  const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const ok = clean.length >= 3 && !taken.includes(clean);
  const canNext = i === 0 ? name.trim().length > 1 : i === 1 ? ok : true;

  const next = () => {
    if (i === 3) { setLaunching(true); setTimeout(() => { setLaunching(false); applyPreset(preset); setI(4); }, 1800); }
    else setI(i + 1);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between"><Link href="/"><Wordmark /></Link><div className="flex items-center gap-2"><HelperToggle /><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Exit</Link></div></div>
        <ol className="mt-10 flex items-center gap-2 text-sm">
          {steps.map((s, k) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn("grid size-6 place-items-center rounded-full text-xs font-semibold", k < i ? "bg-emerald-500 text-white" : k === i ? "bg-brand text-white" : "bg-secondary text-muted-foreground")}>{k < i ? <Check className="size-3.5" strokeWidth={3} /> : k + 1}</span>
              <span className={cn(k === i ? "font-medium" : "hidden text-muted-foreground")}>{s}</span>
              {k < steps.length - 1 && <span className="mx-0.5 h-px w-6 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="flex-1 py-10">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              {i === 0 && (
                <div className="space-y-6">
                  <h1 className="font-display text-5xl">What are we calling your store?</h1>
                  <div className="space-y-1.5"><Label>Store name</Label><Input suggest="storeName" className="h-11 text-base" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>What do you sell?</Label>
                    <div className="flex flex-wrap gap-2">{kinds.map((k) => <button key={k} onClick={() => setKind(k)} className={cn("rounded-full border px-4 py-2 text-sm transition", kind === k ? "border-brand bg-brand/10 font-medium text-brand" : "hover:bg-accent")}>{k}</button>)}</div>
                  </div>
                </div>
              )}
              {i === 1 && (
                <div className="space-y-6">
                  <h1 className="font-display text-5xl">Pick your web address.</h1>
                  <p className="-mt-3 text-sm text-muted-foreground">You can add your own domain later. This one always works.</p>
                  <div className="space-y-2">
                    <Suggest options="slug">
                      <div className="flex items-center overflow-hidden rounded-xl border bg-card focus-within:ring-[3px] focus-within:ring-ring/25">
                        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent px-4 font-mono text-base outline-none" aria-label="Subdomain" />
                        <span className="pr-4 font-mono text-base text-muted-foreground">.{ROOT_DOMAIN}</span>
                      </div>
                    </Suggest>
                    <div className={cn("flex items-center gap-1.5 text-sm", ok ? "text-emerald-600" : "text-chili")}>
                      {ok ? <Check className="size-4" /> : <X className="size-4" />}
                      {clean.length < 3 ? "Use at least 3 letters or numbers." : ok ? `${clean}.${ROOT_DOMAIN} is yours if you want it.` : `${clean} is already taken. Try ${clean}-store.`}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary/70 p-4 text-sm">
                    <div className="text-muted-foreground">You and your team sign in at</div>
                    <div className="mt-1 font-mono">{clean || "yourstore"}.{ROOT_DOMAIN}<span className="text-brand">/manager</span></div>
                  </div>
                </div>
              )}
              {i === 2 && (
                <div className="space-y-6">
                  <h1 className="font-display text-5xl">Choose a starting look.</h1>
                  <div className="grid grid-cols-2 gap-3">
                    {themePresets.map((t) => (
                      <button key={t.id} onClick={() => setPreset(t.id)} className={cn("rounded-2xl border p-3 text-left transition", preset === t.id ? "border-brand ring-4 ring-brand/15" : "hover:bg-accent")}>
                        <div className="relative h-24 overflow-hidden rounded-xl" style={{ background: t.bg }}>
                          <div className="awning absolute inset-x-0 top-0 h-4" style={{ ["--stripe-a" as string]: t.brand, ["--stripe-b" as string]: t.surface }} />
                          <div className="absolute bottom-3 left-3 h-7 w-16 rounded-full" style={{ background: t.brand }} />
                          <div className="absolute bottom-3 right-3 size-9 rounded-full" style={{ background: t.accent }} />
                        </div>
                        <div className="mt-2 text-sm font-medium">{t.name}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Everything is editable later in the website builder.</p>
                </div>
              )}
              {i === 3 && (
                <div className="space-y-6">
                  <h1 className="font-display text-5xl">Who’s helping you run it?</h1>
                  <p className="-mt-3 text-sm text-muted-foreground">Optional. They’ll join as store managers. You can fine-tune roles after launch.</p>
                  <div className="space-y-2.5">
                    {emails.map((e, k) => <Input suggest="email" key={k} type="email" className="h-11" placeholder="teammate@company.com" value={e} onChange={(ev) => setEmails((s) => s.map((x, j) => (j === k ? ev.target.value : x)))} />)}
                    <Button variant="ghost" size="sm" onClick={() => setEmails((s) => [...s, ""])}>+ Add another</Button>
                  </div>
                </div>
              )}
              {i === 4 && (
                <div className="space-y-6">
                  <div className="grid size-14 place-items-center rounded-full bg-emerald-500 text-white"><Check className="size-7" strokeWidth={3} /></div>
                  <h1 className="font-display text-5xl">{name} is open.</h1>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"><span className="text-muted-foreground">Storefront</span><span className="font-mono">{clean}.{ROOT_DOMAIN}</span></div>
                    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"><span className="text-muted-foreground">Manager portal</span><span className="font-mono">{clean}.{ROOT_DOMAIN}/manager</span></div>
                  </div>
                  <div className="rounded-2xl bg-secondary/70 p-4 text-sm leading-relaxed text-muted-foreground">
                    We also set up: 5 starter roles, a Reviews table, one location, and a homepage you can edit.
                  </div>
                  <div className="flex gap-2"><Button variant="brand" size="lg" asChild><Link href="/manager">Open the manager</Link></Button><Button variant="outline" size="lg" asChild><Link href="/store">See storefront</Link></Button></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {i < 4 && (
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft /> Back</Button>
            <Button variant="brand" size="lg" disabled={!canNext || launching} onClick={next}>
              {launching ? <><Loader2 className="animate-spin" /> Setting things up…</> : i === 3 ? "Create my store" : "Continue"}
            </Button>
          </div>
        )}
      </div>

      {/* live preview */}
      <div className="dot-grid hidden items-center justify-center bg-secondary/60 p-10 lg:flex">
        <div className="w-full max-w-[640px]">
          <motion.div layout className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b px-3 py-2"><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-chili/70" /><span className="size-2.5 rounded-full bg-saffron" /><span className="size-2.5 rounded-full bg-emerald-500/80" /></div>
              <div className="mx-auto rounded-full bg-secondary px-3 py-1 font-mono text-xs">{clean || "yourstore"}.{ROOT_DOMAIN}</div><div className="w-10" /></div>
            <div className="transition-colors duration-500" style={{ background: p.bg, color: p.fg }}>
              <div className="flex items-center justify-between px-6 py-4"><span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>{name || "Your store"}</span><span className="text-xs opacity-60">Shop · About · Bag</span></div>
              <div className="awning scallop h-5 transition-colors" style={{ ["--stripe-a" as string]: p.brand, ["--stripe-b" as string]: p.surface }} />
              <div className="grid grid-cols-[1.2fr_1fr] items-center gap-6 px-6 py-10">
                <div>
                  <div className="text-[40px] leading-[0.95]" style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.035em" }}>Welcome to {name || "your store"}.</div>
                  <div className="mt-3 text-xs opacity-70">{kind}, made simple.</div>
                  <div className="mt-5 inline-block rounded-full px-5 py-2.5 text-xs font-medium" style={{ background: p.brand, color: "#fff" }}>Shop now</div>
                </div>
                <div className="relative aspect-square">
                  <div className="absolute inset-0 rounded-[28px_28px_28px_90px]" style={patternStyle("diamond", [p.brand, p.surface])} />
                  <div className="absolute -bottom-2 -left-3 size-16 rounded-full" style={patternStyle("dots", [p.accent, p.surface])} />
                </div>
              </div>
            </div>
          </motion.div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Live preview. This is the page your first visitors will see.</p>
        </div>
      </div>
    </div>
  );
}
