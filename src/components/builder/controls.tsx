"use client";
import { useState, type ReactNode } from "react";
import { Check, ChevronDown, ImagePlus, Link2, Plus, Unlink2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { contrast, fonts, fontById, tokenHex, mixHex, type Device, type Theme } from "@/lib/builder";
import { useSite } from "@/lib/site-store";
import { cn } from "@/lib/utils";

export function Group({ title, children, defaultOpen = true, aside }: { title: string; children: ReactNode; defaultOpen?: boolean; aside?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b last:border-b-0">
      <div className="flex items-center">
        <button onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-1.5 px-4 py-3 text-left text-[13px] font-semibold">
          <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", !open && "-rotate-90")} /> {title}
        </button>
        {aside && <div className="pr-3">{aside}</div>}
      </div>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </section>
  );
}

export function Field({ label, children, inline }: { label: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={cn(inline ? "flex items-center justify-between gap-3" : "space-y-1.5")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export function Seg<T extends string | number>({ value, options, onChange, className }: { value: T; options: { v: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("flex rounded-lg border bg-secondary/60 p-0.5", className)} role="radiogroup">
      {options.map((o) => (
        <button key={String(o.v)} role="radio" aria-checked={value === o.v} title={o.title} onClick={() => onChange(o.v)}
          className={cn("flex h-7 flex-1 items-center justify-center rounded-md px-2 text-xs font-medium transition", value === o.v ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Num({ value, onChange, min = 0, max = 100, step = 1, unit, label, fallback }: { value: number | undefined; onChange: (v: number | undefined) => void; min?: number; max?: number; step?: number; unit?: string; label?: string; fallback?: number }) {
  const shown = value ?? fallback ?? min;
  return (
    <div className="flex items-center gap-2.5">
      {label && <span className="w-14 shrink-0 text-xs text-muted-foreground">{label}</span>}
      <input type="range" min={min} max={max} step={step} value={shown} onChange={(e) => onChange(Number(e.target.value))} className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-[var(--brand)]" aria-label={label} />
      <div className="relative w-[62px] shrink-0">
        <input type="number" min={min} max={max} step={step} value={shown} onChange={(e) => { const n = e.target.value === "" ? undefined : Number(e.target.value); onChange(n); }} className="h-7 w-full rounded-md border bg-card pl-2 pr-5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
        {unit && <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span><span className="block text-[13px]">{label}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

const tokenNames: Record<string, string> = { bg: "Page", surface: "Card", fg: "Ink", brand: "Brand", accent: "Accent" };
export function ColorField({ value, onChange, theme, allowNone = true, tokenSet = ["bg", "surface", "fg", "brand", "accent"], against, opacity }: { value?: string; onChange: (v: string | undefined) => void; theme: Theme; allowNone?: boolean; tokenSet?: string[]; against?: string; opacity?: number }) {
  const hex = tokenHex(theme, value);
  const addColor = useSite((s) => s.addPaletteColor);
  const fg = hex && against ? (opacity !== undefined && opacity < 100 ? mixHex(hex, against, opacity / 100) : hex) : undefined;
  const ratio = fg && against ? contrast(fg, against) : null;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {allowNone && (
          <button onClick={() => onChange(undefined)} title="None" aria-label="No colour" aria-pressed={!value} className={cn("relative grid size-7 place-items-center rounded-full border bg-card", !value && "ring-2 ring-brand ring-offset-1 ring-offset-card")}>
            <span className="absolute h-px w-5 rotate-45 bg-chili" />
          </button>
        )}
        {tokenSet.map((tk) => (
          <button key={tk} onClick={() => onChange(tk)} title={tokenNames[tk]} aria-label={tokenNames[tk]} aria-pressed={value === tk} className={cn("grid size-7 place-items-center rounded-full border", value === tk && "ring-2 ring-brand ring-offset-1 ring-offset-card")} style={{ background: tokenHex(theme, tk) }}>
            {value === tk && <Check className="size-3.5" style={{ color: value === tk ? (tokenHex(theme, tk) === theme.fg ? theme.bg : theme.fg) : undefined }} />}
          </button>
        ))}
        {(theme.swatches ?? []).map((c) => (
          <button key={c} onClick={() => onChange(c)} title={`Saved ${c}`} aria-label={`Saved colour ${c}`} aria-pressed={value === c} className={cn("size-7 rounded-full border", value === c && "ring-2 ring-brand ring-offset-1 ring-offset-card")} style={{ background: c }} />
        ))}
        <label className={cn("relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full border focus-within:ring-2 focus-within:ring-ring", value?.startsWith("#") && !(theme.swatches ?? []).includes(value) && "ring-2 ring-brand ring-offset-1 ring-offset-card")} style={{ background: value?.startsWith("#") && !(theme.swatches ?? []).includes(value) ? value : "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} title="Custom colour">
          <input type="color" value={hex ?? "#3340ff"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label="Custom colour" />
        </label>
      </div>
      {(value?.startsWith("#") || ratio !== null) && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {value?.startsWith("#") && <span className="font-mono">{value}</span>}
          {value?.startsWith("#") && !(theme.swatches ?? []).includes(value) && <button onClick={() => addColor(value)} className="rounded border px-1.5 py-0.5 hover:border-brand hover:text-brand">Save colour</button>}
          {ratio !== null && <span className={cn("ml-auto rounded-full px-2 py-0.5 font-medium", ratio >= 4.5 ? "bg-emerald-100 text-emerald-800" : ratio >= 3 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800")} title="WCAG contrast against the background">{ratio.toFixed(1)}:1 {ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "Large text only" : "Fails"}</span>}
        </div>
      )}
    </div>
  );
}

export function RawColor({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 rounded-lg border bg-card px-2 py-1.5">
      <span className="relative size-6 shrink-0 overflow-hidden rounded-md border" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label={label} />
      </span>
      <span className="min-w-0 flex-1"><span className="block text-xs">{label}</span><span className="block font-mono text-[10px] text-muted-foreground">{value}</span></span>
    </label>
  );
}

export function FontPicker({ value, onChange, inherit }: { value?: string; onChange: (v: string | undefined) => void; inherit?: string }) {
  const [open, setOpen] = useState(false);
  const f = value ? fontById(value) : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 text-sm shadow-xs" aria-label="Font">
          <span className="truncate" style={{ fontFamily: f?.family }}>{f ? f.name : inherit ?? "Theme font"}</span>
          <ChevronDown className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[360px] w-[280px] overflow-auto p-1" align="start">
        {inherit !== undefined && (
          <button onClick={() => { onChange(undefined); setOpen(false); }} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary", !value && "bg-secondary")}>
            {inherit} {!value && <Check className="size-4" />}
          </button>
        )}
        {fonts.map((x) => (
          <button key={x.id} onClick={() => { onChange(x.id); setOpen(false); }} className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-secondary", value === x.id && "bg-secondary")}>
            <span className="min-w-0">
              <span className="block truncate text-[22px] leading-tight" style={{ fontFamily: x.family, fontWeight: x.weight, fontVariationSettings: x.wdth ? `"wdth" ${x.wdth}` : undefined }}>{x.sample}</span>
              <span className="text-[11px] text-muted-foreground">{x.name} · {x.kind}</span>
            </span>
            {value === x.id && <Check className="size-4 shrink-0" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function DeviceVis({ hide, onChange }: { hide?: Device[]; onChange: (h: Device[]) => void }) {
  const h = hide ?? [];
  return (
    <div className="flex gap-1.5">
      {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
        <button key={d} onClick={() => onChange(h.includes(d) ? h.filter((x) => x !== d) : [...h, d])}
          className={cn("flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition", h.includes(d) ? "bg-secondary text-muted-foreground line-through" : "bg-card")}>
          {d}
        </button>
      ))}
    </div>
  );
}

export function ListEditor<T extends { id: string }>({ items, onChange, render, make, addLabel }: { items: T[]; onChange: (v: T[]) => void; render: (it: T, patch: (p: Partial<T>) => void) => ReactNode; make: () => T; addLabel: string }) {
  const patch = (i: number, p: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={it.id} className="flex items-start gap-1 rounded-lg border bg-card p-1.5">
          <div className="flex flex-col"><button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="h-3.5 px-0.5 text-[9px] leading-none text-muted-foreground hover:text-foreground disabled:opacity-25">▲</button><button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="h-3.5 px-0.5 text-[9px] leading-none text-muted-foreground hover:text-foreground disabled:opacity-25">▼</button></div>
          <div className="min-w-0 flex-1 space-y-1">{render(it, (p) => patch(i, p))}</div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove" className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-chili"><X className="size-3.5" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, make()])} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand"><Plus className="size-3.5" /> {addLabel}</button>
    </div>
  );
}

export const MiniInput = (p: React.ComponentProps<typeof Input>) => <Input {...p} className={cn("h-8 text-[13px]", p.className)} />;

/* ---------- more controls ---------- */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-secondary/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

/** Four-sided spacing: top, right, bottom, left, with a link toggle. */
export function Sides({ label, v, onChange, max = 120 }: { label: string; v: [number | undefined, number | undefined, number | undefined, number | undefined]; onChange: (i: 0 | 1 | 2 | 3, n: number | undefined) => void; max?: number }) {
  const [linked, setLinked] = useState(false);
  const names = ["Top", "Right", "Bottom", "Left"];
  const set = (i: 0 | 1 | 2 | 3, raw: string) => {
    const n = raw === "" ? undefined : Math.max(0, Math.min(max, Number(raw)));
    if (linked) ([0, 1, 2, 3] as const).forEach((j) => onChange(j, n)); else onChange(i, n);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <button onClick={() => setLinked(!linked)} aria-pressed={linked} aria-label="Change all sides together" title="Change all sides together" className={cn("grid size-6 place-items-center rounded-md hover:bg-secondary", linked && "bg-brand/10 text-brand")}>{linked ? <Link2 className="size-3.5" /> : <Unlink2 className="size-3.5" />}</button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {names.map((n, i) => (
          <label key={n} className="block">
            <input type="number" min={0} max={max} value={v[i] ?? ""} placeholder="0" onChange={(e) => set(i as 0 | 1 | 2 | 3, e.target.value)} className="h-8 w-full rounded-md border bg-card px-1.5 text-center text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30" aria-label={`${label} ${n.toLowerCase()}`} />
            <span className="mt-0.5 block text-center text-[10px] text-muted-foreground">{n}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/** Image from a web address or a file from the computer (kept in the page as a data link in this mockup). */
export function ImageField({ value, onChange, label = "Image" }: { value?: string; onChange: (v: string | undefined) => void; label?: string }) {
  const pick = (f?: File | null) => {
    if (!f) return;
    if (f.size > 3_000_000) return void toast.error("That image is over 3 MB", { description: "Choose a smaller file, or paste a web address." });
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(f);
  };
  const isData = value?.startsWith("data:");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-secondary/60">
          {value
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt="" className="size-full object-cover" />
            : <ImagePlus className="size-4 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <MiniInput value={isData ? "" : value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} placeholder={isData ? "Uploaded file" : "https://…/photo.jpg"} aria-label={`${label} address`} />
          <div className="flex gap-1.5">
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs hover:border-brand hover:text-brand focus-within:ring-2 focus-within:ring-ring">
              <Upload className="size-3" /> Upload
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label={`Upload ${label.toLowerCase()}`} />
            </label>
            {value && <button onClick={() => onChange(undefined)} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-chili">Remove</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GradientField({ a, b, deg, theme, onChange }: { a?: string; b?: string; deg?: number; theme: Theme; onChange: (p: { ga?: string; gb?: string; gdeg?: number }) => void }) {
  const on = !!(a && b);
  return (
    <div className="space-y-2">
      {!on ? (
        <button onClick={() => onChange({ ga: "brand", gb: "accent", gdeg: 135 })} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand"><Plus className="size-3.5" /> Add a gradient</button>
      ) : (
        <>
          <div className="h-8 rounded-lg border" style={{ backgroundImage: `linear-gradient(${deg ?? 135}deg, ${tokenHex(theme, a) ?? a}, ${tokenHex(theme, b) ?? b})` }} aria-hidden />
          <Field label="From"><ColorField value={a} onChange={(v) => onChange({ ga: v, gb: b, gdeg: deg })} theme={theme} allowNone={false} /></Field>
          <Field label="To"><ColorField value={b} onChange={(v) => onChange({ ga: a, gb: v, gdeg: deg })} theme={theme} allowNone={false} /></Field>
          <Num label="Angle" value={deg} fallback={135} min={0} max={360} unit="°" onChange={(v) => onChange({ ga: a, gb: b, gdeg: v })} />
          <button onClick={() => onChange({ ga: undefined, gb: undefined, gdeg: undefined })} className="text-xs text-muted-foreground hover:text-chili">Remove gradient</button>
        </>
      )}
    </div>
  );
}

export function CodeField({ value, onChange, placeholder, label }: { value?: string; onChange: (v: string) => void; placeholder?: string; label: string }) {
  return <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} spellCheck={false} rows={5} className="w-full resize-y rounded-lg border bg-card p-2.5 font-mono text-[12px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />;
}

export function Tabs3<T extends string>({ value, onChange, tabs, label }: { value: T; onChange: (v: T) => void; tabs: { v: T; label: string }[]; label: string }) {
  return (
    <div className="flex gap-1 border-b p-2" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.v} role="tab" aria-selected={value === t.v} onClick={() => onChange(t.v)} className={cn("flex-1 rounded-lg py-1.5 text-[13px] font-medium transition focus-visible:ring-2 focus-visible:ring-ring/40", value === t.v ? "bg-secondary" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>
      ))}
    </div>
  );
}
