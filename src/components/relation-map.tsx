"use client";
import { useMemo, useState } from "react";
import { ArrowRight, Boxes, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { entityIcons } from "@/lib/entity-icons";
import { relationEdges, targetInfo, targetsOf, useSrc } from "@/lib/relations";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TargetSelect({ value, onChange, exclude, label = "Links to" }: { value: string; onChange: (v: string) => void; exclude?: string; label?: string }) {
  const src = useSrc();
  const list = targetsOf(src).filter((t) => t.id !== exclude);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>{list.map((t) => <SelectItem key={t.id} value={t.id}>{t.plural}{t.builtin ? "  ·  built-in" : ""}</SelectItem>)}</SelectContent>
    </Select>
  );
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Create a relation without hunting for the right field settings: pick two tables and say how they relate. */
export function LinkTablesDialog({ open, onOpenChange, from: from0, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; from?: string; onCreated?: (entityId: string, fieldId: string) => void }) {
  const src = useSrc();
  const addField = useStudio((s) => s.addField);
  const own = src.entities.filter((e) => !e.system);
  const [from, setFrom] = useState(from0 ?? own[0]?.id ?? "");
  const [to, setTo] = useState("@products");
  const [many, setMany] = useState(false);
  const [label, setLabel] = useState("");
  const [inv, setInv] = useState("");
  const a = src.entities.find((e) => e.id === from);
  const b = targetInfo(src, to);
  const autoLabel = b?.name ?? "Link";
  const create = () => {
    if (!a || !b) return;
    const lab = (label || (many ? b.plural : b.name)).trim();
    const id = addField(a.id, { key: slug(lab) || "link", label: lab, type: "relation", target: to, many, inverse: (inv || a.plural).trim(), inList: true });
    toast.success(`${a.plural} now link to ${b.plural.toLowerCase()}`, { description: `Open any ${a.name.toLowerCase()} to pick ${many ? "records" : "a record"}.` });
    onCreated?.(a.id, id); onOpenChange(false); setLabel(""); setInv("");
  };
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v && from0) setFrom(from0); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Link two tables</DialogTitle><DialogDescription>Let one table point at records in another, like a review that belongs to a product or a claim that belongs to a customer.</DialogDescription></DialogHeader>
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-1.5"><Label>From</Label>
            <Select value={from} onValueChange={setFrom}><SelectTrigger aria-label="From table"><SelectValue /></SelectTrigger><SelectContent>{own.map((e) => <SelectItem key={e.id} value={e.id}>{e.plural}</SelectItem>)}</SelectContent></Select>
          </div>
          <ArrowRight className="mt-6 hidden size-4 text-muted-foreground sm:block" />
          <div className="space-y-1.5"><Label>To</Label><TargetSelect value={to} onChange={setTo} label="To table" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="How many">
          {([[false, "One", `Each ${a?.name.toLowerCase() ?? "record"} has one ${b?.name.toLowerCase() ?? "record"}`], [true, "Many", `Each ${a?.name.toLowerCase() ?? "record"} can have several ${b?.plural.toLowerCase() ?? "records"}`]] as const).map(([v, l, h]) => (
            <button key={l} role="radio" aria-checked={many === v} onClick={() => setMany(v)} className={cn("rounded-xl border p-3 text-left transition", many === v ? "border-brand bg-brand/5 ring-2 ring-brand/20" : "hover:bg-accent")}>
              <div className="text-sm font-medium">{l}</div><div className="text-xs text-muted-foreground">{h}</div>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Field name on {a?.plural ?? "the table"}</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={many ? b?.plural : autoLabel} /></div>
          <div className="space-y-1.5"><Label>Shown on {b?.plural ?? "the other table"} as</Label><Input value={inv} onChange={(e) => setInv(e.target.value)} placeholder={a?.plural} /></div>
        </div>
        <DialogFooter><Button variant="brand" disabled={!a || !b} onClick={create}><Link2 /> Create link</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- the map ---------- */
const W = 214, H = 76, GX = 140, GY = 46;

export function RelationMap({ onOpen }: { onOpen: (entityId: string) => void }) {
  const src = useSrc();
  const [hover, setHover] = useState<string | null>(null);
  const [dlg, setDlg] = useState(false);
  const edges = useMemo(() => relationEdges(src), [src]);

  const own = src.entities.filter((e) => !e.system);
  const used = new Set(edges.flatMap((e) => [e.from, e.to]));
  const builtinNodes = targetsOf(src).filter((t) => t.builtin && used.has(t.id));

  // layers: built-in sources on the left, a table sits one column right of the furthest table it links to
  const layerOf: Record<string, number> = {};
  builtinNodes.forEach((t) => (layerOf[t.id] = 0));
  const visiting = new Set<string>();
  const calc = (id: string): number => {
    if (id in layerOf) return layerOf[id];
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const outs = edges.filter((e) => e.from === id && e.to !== id).map((e) => calc(e.to));
    visiting.delete(id);
    return (layerOf[id] = outs.length ? Math.max(...outs) + 1 : 1);
  };
  own.forEach((e) => calc(e.id));
  const degree = (id: string) => edges.filter((e) => e.from === id || e.to === id).length;
  const nodes = [
    ...builtinNodes.map((t) => ({ id: t.id, name: t.plural, icon: t.icon, color: t.color, sub: "Built-in", builtin: true })),
    ...own.map((e) => ({ id: e.id, name: e.plural, icon: e.icon, color: e.color ?? "#3340ff", sub: `${e.records.length} records · ${e.fields.length} fields`, builtin: false })),
  ];
  const layers = Math.max(...nodes.map((n) => layerOf[n.id] ?? 1), 0) + 1;
  const byLayer: Record<number, typeof nodes> = {};
  nodes.forEach((n) => { (byLayer[layerOf[n.id] ?? 1] ??= []).push(n); });
  Object.values(byLayer).forEach((l) => l.sort((a, b) => degree(b.id) - degree(a.id)));
  const maxRows = Math.max(...Object.values(byLayer).map((l) => l.length), 1);
  const pos: Record<string, { x: number; y: number }> = {};
  Object.entries(byLayer).forEach(([li, l]) => l.forEach((n, i) => (pos[n.id] = { x: 20 + Number(li) * (W + GX), y: 16 + i * (H + GY) + ((maxRows - l.length) * (H + GY)) / 2 })));
  const height = 16 + maxRows * (H + GY);
  const width = 40 + layers * W + (layers - 1) * GX + 60;

  // spread edge ends along the node side so lines don't pile up
  const outIdx: Record<string, number> = {}, outN: Record<string, number> = {}, inIdx: Record<string, number> = {}, inN: Record<string, number> = {};
  edges.forEach((e) => { outN[e.from] = (outN[e.from] ?? 0) + 1; inN[e.to] = (inN[e.to] ?? 0) + 1; });
  const geo = edges.map((e) => {
    const a = pos[e.from], b = pos[e.to];
    if (!a || !b) return null;
    const i = (outIdx[e.from] = (outIdx[e.from] ?? -1) + 1), j = (inIdx[e.to] = (inIdx[e.to] ?? -1) + 1);
    const y1 = a.y + (H * (i + 1)) / (outN[e.from] + 1), y2 = b.y + (H * (j + 1)) / (inN[e.to] + 1);
    if (e.from === e.to) return { d: `M ${a.x + W} ${y1} C ${a.x + W + 64} ${y1 - 18}, ${a.x + W + 64} ${y1 + 36}, ${a.x + W} ${y1 + 22}`, x1: a.x + W, y1, lx: a.x + W + 36, ly: y1 + 2, mx: a.x + W + 60, my: y1 + 10 };
    const toLeft = a.x > b.x;
    const same = a.x === b.x;
    const x1 = same ? a.x + W : toLeft ? a.x : a.x + W;
    const x2 = same ? b.x + W : toLeft ? b.x + W : b.x;
    const dir = same ? 1 : toLeft ? -1 : 1;
    const k = same ? 90 : Math.max(50, Math.abs(x2 - x1) * 0.45);
    return { d: `M ${x1} ${y1} C ${x1 + dir * k} ${y1}, ${x2 - (same ? -k : dir * k)} ${y2}, ${x2} ${y2}`, x1, y1, lx: x1 + dir * 30, ly: y1, mx: (x1 + x2) / 2 + (same ? 70 : 0), my: (y1 + y2) / 2 };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">Every link between your tables, drawn out. Arrows point at the table being linked to. Hover a table to see what each link is called, click it to open.</p>
        <Button variant="brand" size="sm" className="ml-auto" onClick={() => setDlg(true)}><Plus /> Link two tables</Button>
      </div>
      <div className="overflow-x-auto rounded-3xl border bg-card bg-[radial-gradient(circle,rgb(20_26_58/0.08)_1px,transparent_1px)] [background-size:18px_18px]">
        <div className="relative mx-auto" style={{ width, height: height + 10, minWidth: width }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height + 10} aria-hidden>
            <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 1 L 8 5 L 0 9 z" fill="currentColor" /></marker></defs>
            {edges.map((e, i) => {
              const g = geo[i];
              if (!g) return null;
              const on = hover === e.from || hover === e.to;
              const txt = e.field.many ? "many" : "one";
              const full = `${e.field.label} · ${txt}`;
              return (
                <g key={i} className="transition-opacity" style={{ color: on ? "#3340ff" : "#8a8fb0", opacity: hover && !on ? 0.14 : 1 }}>
                  <path d={g.d} fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.5} markerEnd="url(#arr)" />
                  <circle cx={g.x1} cy={g.y1} r="3.5" fill="currentColor" />
                  {on ? (
                    <g transform={`translate(${g.mx}, ${g.my})`}>
                      <rect x={-(full.length * 3.2 + 10)} y="-11" width={full.length * 6.4 + 20} height="22" rx="11" fill="var(--card)" stroke="currentColor" />
                      <text textAnchor="middle" y="4" fontSize="11" fill="var(--foreground)">{full}</text>
                    </g>
                  ) : (
                    <g transform={`translate(${g.lx}, ${g.ly})`}>
                      <rect x="-15" y="-9" width="30" height="18" rx="9" fill="var(--card)" stroke="currentColor" strokeOpacity=".55" />
                      <text textAnchor="middle" y="3.5" fontSize="10" fill="var(--muted-foreground)">{e.field.many ? "N" : "1"}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          {nodes.map((n) => {
            const I = entityIcons[n.icon] ?? Boxes;
            const p = pos[n.id];
            return (
              <button key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(n.id)} onBlur={() => setHover(null)} onClick={() => !n.builtin && onOpen(n.id)} disabled={n.builtin}
                className={cn("absolute flex items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition", !n.builtin && "hover:-translate-y-0.5 hover:border-brand hover:shadow-md", hover === n.id && "border-brand ring-2 ring-brand/20", n.builtin && "cursor-default disabled:opacity-100")} style={{ left: p.x, top: p.y, width: W, height: H }}>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: n.color }}><I className="size-4" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{n.name}</span><span className="block truncate text-xs text-muted-foreground">{n.sub}</span></span>
              </button>
            );
          })}
        </div>
      </div>
      {!edges.length && <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">No links yet. Use “Link two tables” to connect, say, Reviews to Products.</div>}
      <LinkTablesDialog open={dlg} onOpenChange={setDlg} />
    </div>
  );
}
