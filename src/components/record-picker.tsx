"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { entityIcons } from "@/lib/entity-icons";
import { asIds, targetInfo, titleKeyOf, useResolver, useSrc } from "@/lib/relations";
import { useStudio } from "@/lib/store";
import type { Field } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Boxes } from "lucide-react";

/** Lets chips anywhere jump to the record they point at (set by the Custom data page). */
export const JumpCtx = createContext<((entityId: string, recId: string) => void) | null>(null);

export function TargetDot({ target, className }: { target: string; className?: string }) {
  const src = useSrc();
  const t = targetInfo(src, target);
  const I = (t && entityIcons[t.icon]) ?? Boxes;
  return <span className={cn("grid size-4 shrink-0 place-items-center rounded text-white", className)} style={{ background: t?.color ?? "#8c8c9c" }}><I className="size-2.5" /></span>;
}

export function RelChips({ field, value, max = 3, small }: { field: Field; value: unknown; max?: number; small?: boolean }) {
  const r = useResolver();
  const jump = useContext(JumpCtx);
  const ids = asIds(value);
  if (!field.target || !ids.length) return <span className="text-muted-foreground/60">–</span>;
  const shown = ids.slice(0, max);
  const canJump = !!jump && !field.target.startsWith("@");
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {shown.map((id) => {
        const label = r.label(field.target!, id);
        const body = <><TargetDot target={field.target!} className="size-3.5" /><span className="max-w-[160px] truncate">{label}</span></>;
        const cls = cn("inline-flex items-center gap-1.5 rounded-full border bg-card py-0.5 pl-1 pr-2.5", small ? "text-[11px]" : "text-xs", canJump && "hover:border-brand hover:text-brand");
        return canJump ? (
          <span key={id} role="link" tabIndex={0} className={cn(cls, "cursor-pointer")} onClick={(e) => { e.stopPropagation(); jump!(field.target!, id); }} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); jump!(field.target!, id); } }}>{body}</span>
        ) : <span key={id} className={cls}>{body}</span>;
      })}
      {ids.length > max && <span className="text-xs text-muted-foreground">+{ids.length - max}</span>}
    </span>
  );
}

/** Pick one or many records from the linked table, or create one on the spot. */
export function RelationPicker({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: string[]) => void }) {
  const src = useSrc();
  const r = useResolver();
  const addRecord = useStudio((s) => s.addRecord);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const target = field.target ?? "@products";
  const info = targetInfo(src, target);
  const ids = asIds(value);
  const rows = useMemo(() => Array.from(r.rows(target).values()), [r, target]);
  const list = rows.filter((x) => (x.label + " " + (x.sub ?? "")).toLowerCase().includes(q.toLowerCase()));
  const entity = src.entities.find((e) => e.id === target);
  const canCreate = !!entity && q.trim().length > 0 && !rows.some((x) => x.label.toLowerCase() === q.trim().toLowerCase());
  const toggle = (id: string) => {
    if (field.many) onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    else { onChange(ids[0] === id ? [] : [id]); setOpen(false); }
  };
  const create = () => {
    if (!entity) return;
    const tk = titleKeyOf(entity) ?? "title";
    const id = addRecord(entity.id, { [tk]: q.trim() });
    toggle(id); setQ("");
  };
  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(""); }}>
        <PopoverTrigger asChild>
          <button type="button" className="flex min-h-9 w-full items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-left text-sm shadow-xs transition hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {ids.length ? ids.map((id) => (
                <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary py-0.5 pl-1 pr-1 text-xs">
                  <TargetDot target={target} className="size-3.5" /><span className="truncate">{r.label(target, id)}</span>
                  {field.many && <span role="button" tabIndex={0} aria-label={`Remove ${r.label(target, id)}`} className="grid size-4 place-items-center rounded-full hover:bg-foreground/10" onClick={(e) => { e.stopPropagation(); onChange(ids.filter((x) => x !== id)); }}><X className="size-3" /></span>}
                </span>
              )) : <span className="text-muted-foreground">{field.placeholder ?? `Choose ${field.many ? "one or more " : ""}${info?.name.toLowerCase() ?? "record"}${field.many ? "s" : ""}`}</span>}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0">
          <div className="border-b p-2"><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${info?.plural.toLowerCase() ?? "records"}`} className="h-8 w-full rounded-md bg-secondary/60 px-2.5 text-sm outline-none placeholder:text-muted-foreground" aria-label="Search records" /></div>
          <div className="max-h-60 overflow-y-auto p-1">
            {list.map((x) => {
              const on = ids.includes(x.id);
              return (
                <button key={x.id} type="button" onClick={() => toggle(x.id)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent", on && "bg-brand/5")}>
                  <span className={cn("grid size-4 shrink-0 place-items-center rounded border", on ? "border-brand bg-brand text-white" : "text-transparent")}><Check className="size-3" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate">{x.label}</span>{x.sub && <span className="block truncate text-xs text-muted-foreground">{x.sub}</span>}</span>
                </button>
              );
            })}
            {!list.length && !canCreate && <div className="px-3 py-6 text-center text-xs text-muted-foreground">Nothing matches “{q}”.</div>}
            {canCreate && <button type="button" onClick={create} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-brand hover:bg-brand/5"><Plus className="size-4" /> Create {entity!.name.toLowerCase()} “{q.trim()}”</button>}
          </div>
          {field.many && <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground"><span>{ids.length} linked</span><button type="button" className="font-medium text-foreground hover:underline" onClick={() => setOpen(false)}>Done</button></div>}
        </PopoverContent>
      </Popover>
    </div>
  );
}
