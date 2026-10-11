"use client";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { toast } from "sonner";
import {
  AlignLeft, AtSign, Boxes, CalendarDays, Columns3, Copy, Eye, Globe, GripVertical, Hash, IndianRupee, LayoutGrid, Link as LinkIcon, Link2, ListChecks, ListTodo, Palette, Paperclip, Percent, Phone,
  Plus, Search, Settings2, Inbox, CircleCheck, Star, Table2, ToggleLeft, Trash2, Type, X, BadgeCheck, Sparkles, Sigma, ScanSearch, Network, ArrowRight, ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CellValue, DynamicField, type Val } from "@/components/dynamic-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fieldTypes, type Entity, type Field, type FieldType, type Rec } from "@/lib/data";
import { entityTemplates, type EntityTemplate } from "@/lib/entity-templates";
import { entityColors, entityIcons, optionPalette } from "@/lib/entity-icons";
import { useStudio } from "@/lib/store";
import { JumpCtx, TargetDot } from "@/components/record-picker";
import { LinkTablesDialog, RelationMap, TargetSelect } from "@/components/relation-map";
import { asIds, attrsOf, targetInfo, titleKeyOf, useResolver, useSrc } from "@/lib/relations";
import type { Agg } from "@/lib/data";
import { cn } from "@/lib/utils";

const typeIcon: Record<FieldType, React.ElementType> = {
  text: Type, longtext: AlignLeft, number: Hash, currency: IndianRupee, percent: Percent, rating: Star, select: ListChecks, multiselect: ListTodo, boolean: ToggleLeft, date: CalendarDays,
  relation: Link2, lookup: ScanSearch, rollup: Sigma, file: Paperclip, email: AtSign, phone: Phone, url: LinkIcon, color: Palette,
};
const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const titleOf = (e: Entity, r: Rec) => {
  const f = e.fields.find((x) => x.key === e.titleField) ?? e.fields.find((x) => x.type === "text") ?? e.fields[0];
  return f ? String(r[f.key] ?? "Untitled") : "Untitled";
};

/* ---------- field row + inspector ---------- */
function FieldSub({ f, entity }: { f: Field; entity: Entity }) {
  const src = useSrc();
  if (f.type === "relation") { const t = targetInfo(src, f.target); return <> to {t?.plural ?? "a table"}, {f.many ? "many" : "one"}</>; }
  if (f.type === "lookup" || f.type === "rollup") {
    const rel = entity.fields.find((x) => x.key === f.via);
    const a = rel?.target ? attrsOf(src, rel.target).find((x) => x.key === f.show) : undefined;
    return <> {f.type === "rollup" ? `${f.agg ?? "count"} of ` : ""}{a?.label ?? (f.agg === "count" ? "records" : "…")} from {rel?.label ?? "…"}</>;
  }
  return null;
}

function FieldRow({ f, selected, onSelect, entity }: { f: Field; selected: boolean; onSelect: () => void; entity: Entity }) {
  const entityId = entity.id;
  const entityObj = entity;
  const controls = useDragControls();
  const { updateField } = useStudio();
  const Icon = typeIcon[f.type];
  return (
    <Reorder.Item value={f} dragListener={false} dragControls={controls} className={cn("flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors", selected && "border-brand ring-2 ring-brand/20")} whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px -10px rgb(20 26 58 / 0.35)" }}>
      <button onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing" aria-label="Drag to reorder"><GripVertical className="size-4" /></button>
      <button onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><Icon className="size-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 truncate text-sm font-medium">{f.label}{f.required && <span className="text-brand">*</span>}{f.locked && <Badge variant="secondary">Built-in</Badge>}{f.hidden && <Badge variant="outline">Private</Badge>}</span>
          <span className="block truncate text-xs text-muted-foreground">{fieldTypes.find((t) => t.type === f.type)?.label}{f.options ? `, ${f.options.length} choices` : ""}<FieldSub f={f} entity={entityObj} /></span>
        </span>
      </button>
      <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">In list <Switch checked={!!f.inList} onCheckedChange={(v) => updateField(entityId, f.id, { inList: v })} /></label>
      <Button variant="ghost" size="icon-sm" onClick={onSelect} aria-label={`Edit ${f.label}`}><Settings2 /></Button>
    </Reorder.Item>
  );
}

function OptionsEditor({ f, entityId }: { f: Field; entityId: string }) {
  const { updateField } = useStudio();
  const opts = f.options ?? [];
  const colors = f.optionColors ?? {};
  const rename = (i: number, v: string) => {
    const old = opts[i];
    const next = opts.map((o, j) => (j === i ? v : o));
    const c = { ...colors };
    if (old in c) { c[v] = c[old]; delete c[old]; }
    updateField(entityId, f.id, { options: next, optionColors: c });
  };
  return (
    <div className="space-y-1.5">
      {opts.map((o, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild><button className="size-6 shrink-0 rounded-full border" style={{ background: colors[o] ?? "#8c8c9c" }} aria-label={`Colour for ${o}`} /></PopoverTrigger>
            <PopoverContent className="w-auto p-2"><div className="grid grid-cols-4 gap-1.5">{optionPalette.map((c) => <button key={c} onClick={() => updateField(entityId, f.id, { optionColors: { ...colors, [o]: c } })} className="size-6 rounded-full border" style={{ background: c }} aria-label={c} />)}</div></PopoverContent>
          </Popover>
          <Input className="h-8" value={o} onChange={(e) => rename(i, e.target.value)} aria-label={`Choice ${i + 1}`} />
          <Button variant="ghost" size="icon-xs" disabled={i === 0} onClick={() => { const n = [...opts]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; updateField(entityId, f.id, { options: n }); }} aria-label="Move up">↑</Button>
          <Button variant="ghost" size="icon-xs" onClick={() => updateField(entityId, f.id, { options: opts.filter((_, j) => j !== i) })} aria-label="Remove choice"><X /></Button>
        </div>
      ))}
      <Button variant="outline" size="xs" onClick={() => updateField(entityId, f.id, { options: [...opts, `Option ${opts.length + 1}`], optionColors: { ...colors, [`Option ${opts.length + 1}`]: optionPalette[opts.length % optionPalette.length] } })}><Plus /> Add choice</Button>
    </div>
  );
}

const aggs: { v: Agg; l: string }[] = [
  { v: "count", l: "Number of linked records" }, { v: "sum", l: "Sum" }, { v: "avg", l: "Average" }, { v: "min", l: "Lowest" }, { v: "max", l: "Highest" }, { v: "list", l: "List of values" },
];

function RelationSettings({ entity, f, set }: { entity: Entity; f: Field; set: (p: Partial<Field>) => void }) {
  const src = useSrc();
  const t = targetInfo(src, f.target);
  return (
    <div className="space-y-3 rounded-2xl border border-brand/25 bg-brand/[0.04] p-3.5">
      <div className="space-y-1.5"><Label>Links to</Label><TargetSelect value={f.target ?? "@products"} onChange={(v) => set({ target: v })} /></div>
      <div className="space-y-1.5"><Label>Each {entity.name.toLowerCase()} can link to</Label>
        <div className="flex rounded-lg border bg-card p-0.5" role="radiogroup" aria-label="One or many">
          {([[false, "One"], [true, "Many"]] as const).map(([v, l]) => <Button key={l} role="radio" aria-checked={!!f.many === v} variant={!!f.many === v ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => set({ many: v })}>{l}</Button>)}
        </div>
      </div>
      <div className="space-y-1.5"><Label>Shown on {t?.plural ?? "the other table"} as</Label><Input value={f.inverse ?? ""} placeholder={entity.plural} onChange={(e) => set({ inverse: e.target.value })} /><p className="text-xs text-muted-foreground">Open any {t?.name.toLowerCase() ?? "record"} and you’ll see a “{f.inverse || entity.plural}” list of everything pointing at it.</p></div>
    </div>
  );
}

function ComputeSettings({ entity, f, set }: { entity: Entity; f: Field; set: (p: Partial<Field>) => void }) {
  const src = useSrc();
  const rels = entity.fields.filter((x) => x.type === "relation");
  const rel = rels.find((x) => x.key === f.via) ?? rels[0];
  const attrs = rel?.target ? attrsOf(src, rel.target) : [];
  const numeric = attrs.filter((a) => ["number", "currency", "percent", "rating"].includes(a.field.type));
  const agg = f.agg ?? "count";
  if (!rels.length) return <p className="rounded-2xl border border-dashed p-3.5 text-sm text-muted-foreground">Add a “Link to table” field first. {f.type === "lookup" ? "Lookups" : "Rollups"} read from the records it links to.</p>;
  const pool = f.type === "lookup" || agg === "list" ? attrs : numeric;
  return (
    <div className="space-y-3 rounded-2xl border border-brand/25 bg-brand/[0.04] p-3.5">
      <div className="space-y-1.5"><Label>Through the link</Label>
        <Select value={rel?.key} onValueChange={(v) => set({ via: v, show: undefined })}><SelectTrigger aria-label="Through the link"><SelectValue /></SelectTrigger><SelectContent>{rels.map((x) => <SelectItem key={x.id} value={x.key}>{x.label}</SelectItem>)}</SelectContent></Select>
      </div>
      {f.type === "rollup" && (
        <div className="space-y-1.5"><Label>Calculate</Label>
          <Select value={agg} onValueChange={(v) => set({ agg: v as Agg, via: rel?.key })}><SelectTrigger aria-label="Calculate"><SelectValue /></SelectTrigger><SelectContent>{aggs.map((a) => <SelectItem key={a.v} value={a.v}>{a.l}</SelectItem>)}</SelectContent></Select>
        </div>
      )}
      {(f.type === "lookup" || agg !== "count") && (
        <div className="space-y-1.5"><Label>{f.type === "lookup" ? "Show" : "Of"}</Label>
          <Select value={f.show ?? pool[0]?.key} onValueChange={(v) => set({ show: v, via: rel?.key })}><SelectTrigger aria-label="Field"><SelectValue placeholder="Pick a field" /></SelectTrigger><SelectContent>{pool.map((a) => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}</SelectContent></Select>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Calculated automatically from linked records. Nobody types into this field.</p>
    </div>
  );
}

function FieldInspector({ entity, f, onClose }: { entity: Entity; f: Field; onClose: () => void }) {
  const { updateField, removeField, addField } = useStudio();
  const set = (p: Partial<Field>) => updateField(entity.id, f.id, p);
  const numeric = ["number", "currency", "percent"].includes(f.type);
  return (
    <aside className="rounded-3xl border bg-card" aria-label="Field settings">
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div className="font-medium">Field settings</div>
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close field settings"><X /></Button>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-1.5"><Label>Label</Label><Input value={f.label} onChange={(e) => set({ label: e.target.value })} suggest="fieldLabel" /></div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={f.type} disabled={f.locked} onValueChange={(v) => set({ type: v as FieldType, options: ["select", "multiselect"].includes(v) ? f.options ?? ["Option 1", "Option 2"] : f.options, target: v === "relation" ? f.target ?? "@products" : f.target, via: v === "lookup" || v === "rollup" ? f.via ?? entity.fields.find((x) => x.type === "relation")?.key : f.via, agg: v === "rollup" ? f.agg ?? "count" : f.agg })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{fieldTypes.map((t) => <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {(f.type === "select" || f.type === "multiselect") && <div className="space-y-1.5"><Label>Choices</Label><OptionsEditor f={f} entityId={entity.id} /></div>}
        {f.type === "relation" && <RelationSettings entity={entity} f={f} set={set} />}
        {(f.type === "lookup" || f.type === "rollup") && <ComputeSettings entity={entity} f={f} set={set} />}
        <div className="space-y-1.5"><Label>Help text</Label><Input value={f.help ?? ""} onChange={(e) => set({ help: e.target.value })} placeholder="Shown under the field on forms" /></div>
        {["text", "longtext", "email", "number", "phone", "url", "select", "currency", "relation"].includes(f.type) && <div className="space-y-1.5"><Label>Placeholder</Label><Input value={f.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value })} /></div>}
        {numeric && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Minimum</Label><Input type="number" value={f.min ?? ""} onChange={(e) => set({ min: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Maximum</Label><Input type="number" value={f.max ?? ""} onChange={(e) => set({ max: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
          </div>
        )}
        <div className="space-y-2.5 rounded-2xl bg-secondary/60 p-3.5 text-sm">
          {([["required", "Required", "Forms can’t be saved without it."], ["inList", "Show in lists and tables", ""], ["half", "Half width on forms", "Pairs with the next half-width field."], ["unique", "Must be unique", "No two records can share a value."], ["hidden", "Keep private", "Never shown on your website."]] as const).map(([k, l, h]) => (
            <label key={k} className="flex items-center justify-between gap-3"><span>{l}{h && <span className="block text-xs text-muted-foreground">{h}</span>}</span><Switch checked={!!f[k]} disabled={f.locked && k === "required"} onCheckedChange={(v) => set({ [k]: v } as Partial<Field>)} /></label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { addField(entity.id, { ...f, key: f.key + "_2", label: `${f.label} copy`, locked: false }); toast("Field duplicated"); }}><Copy /> Duplicate</Button>
          <Button variant="ghost" size="sm" className="text-chili hover:text-chili" disabled={f.locked} onClick={() => { removeField(entity.id, f.id); onClose(); toast("Field removed", { description: "Existing records keep their data until you purge it." }); }}><Trash2 /> Delete</Button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- data views ---------- */
function RecordSheet({ entity, rec, onClose }: { entity: Entity; rec: Rec | "new"; onClose: () => void }) {
  const { addRecord, updateRecord, removeRecords, duplicateRecord } = useStudio();
  const r = useResolver();
  const jump = useContext(JumpCtx);
  const existing = rec === "new" ? null : rec;
  const [d, setD] = useState<Rec>(() => existing ?? Object.fromEntries(entity.fields.filter((f) => f.defaultValue).map((f) => [f.key, f.defaultValue as string])));
  const miss = entity.fields.filter((f) => f.required && (d[f.key] === undefined || d[f.key] === ""));
  const save = () => {
    if (miss.length) { toast.error(`${miss[0].label} is required`); return; }
    const clean = Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)) as Rec;
    if (existing) updateRecord(entity.id, String(existing.id), clean); else addRecord(entity.id, clean);
    toast.success(existing ? "Record updated" : "Record saved"); onClose();
  };
  return (
    <SheetContent>
      <SheetHeader><SheetTitle>{existing ? titleOf(entity, existing) : `New ${entity.name.toLowerCase()}`}</SheetTitle><SheetDescription>This form is generated from the fields you defined.</SheetDescription></SheetHeader>
      <div className="grid flex-1 content-start grid-cols-2 gap-4 overflow-y-auto px-6">
        {existing && (existing._src || existing._pending) && (
          <div className={cn("col-span-2 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs", existing._pending ? "bg-saffron/15" : "bg-secondary")}>
            <Inbox className="size-3.5 shrink-0" />
            <span className="flex-1">{existing._src ? `From your ${String(existing._src).toLowerCase()}${existing._at ? `, ${existing._at}` : ""}.` : ""} {existing._pending ? "Waiting for your approval before it shows on the site." : ""}</span>
            {existing._pending && <Button size="xs" variant="brand" onClick={() => { updateRecord(entity.id, String(existing.id), { _pending: false }); toast.success("Approved", { description: "It now shows in website blocks that list this table." }); onClose(); }}><CircleCheck /> Approve</Button>}
          </div>
        )}
        {entity.fields.map((f) => <div key={f.id} className={f.half ? "col-span-1" : "col-span-2"}><DynamicField field={f} value={d[f.key] as Val} entity={entity} draft={d} onChange={(v) => setD((s) => ({ ...s, [f.key]: v as never }))} /></div>)}
        {existing && (() => {
          const inb = r.inbound(entity.id, String(existing.id));
          return (
            <div className="col-span-2 mt-2 space-y-3 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium"><ArrowLeft className="size-4 text-brand" /> Linked from other tables</div>
              {!inb.length && <p className="text-xs text-muted-foreground">Nothing links to this {entity.name.toLowerCase()} yet. Records in other tables that pick it will appear here.</p>}
              {inb.map((g) => (
                <div key={g.entity.id + g.field.id} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><TargetDot target={g.entity.id} />{g.title} <span className="rounded-full bg-secondary px-1.5">{g.records.length}</span></div>
                  <div className="flex flex-wrap gap-1.5">{g.records.map((x) => <button key={x.id} onClick={() => { onClose(); jump?.(g.entity.id, x.id); }} className="rounded-full border bg-card px-2.5 py-1 text-xs hover:border-brand hover:text-brand">{x.label}</button>)}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      <SheetFooter>
        {existing && <><Button variant="ghost" size="icon" onClick={() => { duplicateRecord(entity.id, String(existing.id)); toast("Record duplicated"); onClose(); }} aria-label="Duplicate"><Copy /></Button><Button variant="ghost" size="icon" className="text-chili" onClick={() => { removeRecords(entity.id, [String(existing.id)]); toast("Record deleted"); onClose(); }} aria-label="Delete"><Trash2 /></Button></>}
        <Button variant="brand" className="ml-auto" onClick={save}>{existing ? "Save changes" : "Save record"}</Button>
      </SheetFooter>
    </SheetContent>
  );
}

const PendingChip = () => <span className="ml-auto shrink-0 rounded-full bg-saffron/25 px-2 py-0.5 text-[11px] font-medium text-[#8a5a00]">Needs approval</span>;

function Board({ entity, groupKey, onOpen, query }: { entity: Entity; groupKey: string; onOpen: (r: Rec | "new") => void; query: string }) {
  const { updateRecord, addRecord } = useStudio();
  const gf = entity.fields.find((f) => f.key === groupKey);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  if (!gf?.options?.length) return <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">Board view needs a Choice field to group by. Add one under Fields.</div>;
  const lanes = [...gf.options, ""];
  const recs = entity.records.filter((r) => titleOf(entity, r).toLowerCase().includes(query.toLowerCase()));
  const meta = entity.fields.filter((f) => f.inList && f !== gf && f.key !== entity.titleField).slice(0, 3);
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {lanes.map((lane) => {
        const items = recs.filter((r) => String(r[groupKey] ?? "") === lane);
        if (!lane && !items.length) return null;
        return (
          <div key={lane || "none"} onDragOver={(e) => { e.preventDefault(); setOver(lane); }} onDragLeave={() => setOver(null)} onDrop={(e) => { e.preventDefault(); if (drag) { updateRecord(entity.id, drag, { [groupKey]: lane }); toast(`Moved to ${lane || "No value"}`); } setDrag(null); setOver(null); }}
            className={cn("w-[264px] shrink-0 rounded-2xl border bg-secondary/50 p-2 transition", over === lane && "border-brand bg-brand/5")}>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium"><i className="size-2.5 rounded-full" style={{ background: gf.optionColors?.[lane] ?? "#8c8c9c" }} />{lane || "No value"}<span className="ml-auto text-xs text-muted-foreground">{items.length}</span></div>
            <div className="min-h-10 space-y-2">
              {items.map((r) => (
                <button key={String(r.id)} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(r.id)); setDrag(String(r.id)); }} onDragEnd={() => { setDrag(null); setOver(null); }} onClick={() => onOpen(r)}
                  className={cn("block w-full cursor-grab rounded-xl border bg-card p-3 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing", drag === String(r.id) && "opacity-40")}>
                  <div className="flex items-start gap-2 text-sm font-medium leading-snug"><span className="flex-1">{titleOf(entity, r)}</span>{r._pending && <PendingChip />}</div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">{meta.map((f) => r[f.key] !== undefined && r[f.key] !== "" && <div key={f.id} className="flex items-center gap-1.5"><span className="shrink-0">{f.label}:</span><CellValue field={f} entity={entity} rec={r} value={r[f.key] as Val} /></div>)}</div>
                </button>
              ))}
            </div>
            {lane && <button onClick={() => { const id = addRecord(entity.id, { [entity.titleField ?? "title"]: "New item", [groupKey]: lane }); void id; }} className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-card hover:text-foreground"><Plus className="size-3.5" /> Add card</button>}
          </div>
        );
      })}
    </div>
  );
}

function DataTab({ entity, openReq, onConsumed }: { entity: Entity; openReq: string | null; onConsumed: () => void }) {
  const { removeRecords, updateEntity, updateRecord } = useStudio();
  const res = useResolver();
  const pendingCount = entity.records.filter((r) => r._pending).length;
  const [open, setOpen] = useState<Rec | "new" | null>(null);
  useEffect(() => {
    if (!openReq) return;
    const r = entity.records.find((x) => String(x.id) === openReq);
    if (r) setOpen(r);
    onConsumed();
  }, [openReq, entity.records, onConsumed]);
  const textOf = (r: Rec) => entity.fields.map((f) => (f.type === "relation" ? asIds(r[f.key]).map((id) => res.label(f.target ?? "", id)).join(" ") : f.type === "lookup" || f.type === "rollup" ? "" : String(r[f.key] ?? ""))).join(" ").toLowerCase();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const view = entity.view ?? "table";
  const selectFields = entity.fields.filter((f) => f.type === "select");
  const groupKey = entity.boardField && selectFields.some((f) => f.key === entity.boardField) ? entity.boardField : selectFields[0]?.key ?? "";
  const listFields = entity.fields.filter((f) => f.inList);
  const rows = useMemo(() => {
    const l = entity.records.filter((r) => textOf(r).includes(q.toLowerCase()));
    if (!sortKey) return l;
    const sf = entity.fields.find((f) => f.key === sortKey);
    const key = (r: Rec) => sf?.type === "relation" ? asIds(r[sortKey]).map((id) => res.label(sf.target ?? "", id)).join(" ") : String(r[sortKey] ?? "");
    return [...l].sort((a, b) => key(a).localeCompare(key(b), undefined, { numeric: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.records, q, sortKey, res]);
  const body = entity.records.length === 0 ? (
    <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">No records yet. Add one here, or collect them from your website or till.</div>
  ) : view === "board" ? <Board entity={entity} groupKey={groupKey} onOpen={setOpen} query={q} />
  : view === "cards" ? (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => (
        <button key={String(r.id)} onClick={() => setOpen(r)} className="group rounded-2xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start gap-2"><span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: entity.color ?? "#3340ff" }} /><div className="font-medium leading-snug">{titleOf(entity, r)}</div>{r._pending && <PendingChip />}</div>
          <div className="mt-3 space-y-1.5 text-sm">{listFields.filter((f) => f.key !== entity.titleField).slice(0, 4).map((f) => <div key={f.id} className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{f.label}</span><CellValue field={f} entity={entity} rec={r} value={r[f.key] as Val} /></div>)}</div>
        </button>
      ))}
    </div>
  ) : (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="w-10"><Checkbox checked={rows.length > 0 && rows.every((r) => picked.includes(String(r.id)))} onCheckedChange={(v) => setPicked(v ? rows.map((r) => String(r.id)) : [])} aria-label="Select all" /></TableHead>
          {listFields.map((f) => <TableHead key={f.id}><button onClick={() => setSortKey(sortKey === f.key ? null : f.key)} className="inline-flex items-center gap-1 hover:text-foreground">{f.label}{sortKey === f.key && <span aria-hidden>↑</span>}</button></TableHead>)}
        </TableRow></TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={String(r.id)} className="cursor-pointer" data-state={picked.includes(String(r.id)) ? "selected" : undefined} onClick={() => setOpen(r)}>
              <TableCell onClick={(e) => e.stopPropagation()}><Checkbox checked={picked.includes(String(r.id))} onCheckedChange={(v) => setPicked((p) => (v ? [...p, String(r.id)] : p.filter((x) => x !== String(r.id))))} aria-label="Select record" /></TableCell>
              {listFields.map((f) => <TableCell key={f.id}><div className="flex max-w-[280px] items-center gap-2 truncate"><CellValue field={f} entity={entity} rec={r} value={r[f.key] as Val} />{r._pending && f.key === (entity.titleField ?? listFields[0]?.key) && <PendingChip />}</div></TableCell>)}
            </TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={listFields.length + 1} className="py-12 text-center text-muted-foreground">Nothing matches “{q}”.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border bg-card p-0.5" role="group" aria-label="View">
          {([["table", Table2, "Table"], ["cards", LayoutGrid, "Cards"], ["board", Columns3, "Board"]] as const).map(([k, I, l]) => (
            <Button key={k} variant={view === k ? "secondary" : "ghost"} size="sm" onClick={() => updateEntity(entity.id, { view: k })} aria-pressed={view === k}><I /> {l}</Button>
          ))}
        </div>
        {view === "board" && selectFields.length > 0 && (
          <Select value={groupKey} onValueChange={(v) => updateEntity(entity.id, { boardField: v })}>
            <SelectTrigger className="h-9 w-44" aria-label="Group by"><SelectValue /></SelectTrigger>
            <SelectContent>{selectFields.map((f) => <SelectItem key={f.id} value={f.key}>Group by {f.label}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <div className="relative ml-auto w-full sm:w-56"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search records" value={q} onChange={(e) => setQ(e.target.value)} suggest={["Ilkal", "In review", "Open"]} /></div>
        <Button variant="brand" size="sm" onClick={() => setOpen("new")}><Plus /> Add record</Button>
      </div>
      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-saffron/50 bg-saffron/10 px-4 py-3 text-sm">
          <Inbox className="size-4 text-[#8a5a00]" />
          <span className="flex-1"><b>{pendingCount}</b> new {pendingCount === 1 ? "entry is" : "entries are"} waiting for approval. They stay off your website until you approve them.</span>
          <Button size="sm" variant="outline" onClick={() => { entity.records.filter((r) => r._pending).forEach((r) => updateRecord(entity.id, String(r.id), { _pending: false })); toast.success(`${pendingCount} approved`); }}><CircleCheck /> Approve all</Button>
        </div>
      )}
      {picked.length > 0 && view === "table" && (
        <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm text-white"><span>{picked.length} selected</span>
          <Button size="xs" variant="ghost" className="text-rose-300 hover:bg-white/10 hover:text-rose-200" onClick={() => { removeRecords(entity.id, picked); toast(`${picked.length} records deleted`); setPicked([]); }}><Trash2 /> Delete</Button>
          <Button size="xs" variant="ghost" className="ml-auto text-white hover:bg-white/10 hover:text-white" onClick={() => setPicked([])}>Clear</Button></div>
      )}
      {body}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>{open && <RecordSheet key={open === "new" ? "new" : String(open.id)} entity={entity} rec={open} onClose={() => setOpen(null)} />}</Sheet>
    </div>
  );
}

function FieldsTab({ entity, initialSel }: { entity: Entity; initialSel?: string | null }) {
  const { reorderFields, addField } = useStudio();
  const [selField, setSelField] = useState<string | null>(initialSel ?? null);
  const [dlg, setDlg] = useState(false);
  const [ftype, setFtype] = useState<FieldType>("text");
  const [flabel, setFlabel] = useState("");
  const [ftarget, setFtarget] = useState("@products");
  const [fmany, setFmany] = useState(false);
  const [preview, setPreview] = useState<Record<string, Val>>({});
  const sel = entity.fields.find((f) => f.id === selField);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <div className="space-y-2">
        <Reorder.Group axis="y" values={entity.fields} onReorder={(f) => reorderFields(entity.id, f)} className="space-y-2">
          {entity.fields.map((f) => <FieldRow key={f.id} f={f} entity={entity} selected={selField === f.id} onSelect={() => setSelField(f.id)} />)}
        </Reorder.Group>
        <button onClick={() => { setFlabel(""); setFtype("text"); setFmany(false); setDlg(true); }} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3.5 text-sm text-muted-foreground transition hover:border-brand hover:bg-brand/5 hover:text-brand"><Plus className="size-4" /> Add a field</button>
      </div>
      <div className="xl:sticky xl:top-20 xl:h-fit">
        {sel ? <FieldInspector entity={entity} f={sel} onClose={() => setSelField(null)} /> : (
          <aside className="rounded-3xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium"><Eye className="size-4 text-brand" /> Live form preview</div>
            <div className="grid grid-cols-2 gap-4">{entity.fields.map((f) => <div key={f.id} className={f.half ? "col-span-1" : "col-span-2"}><DynamicField field={f} value={preview[f.key]} entity={entity} draft={preview as Rec} onChange={(v) => setPreview((s) => ({ ...s, [f.key]: v }))} /></div>)}</div>
            <p className="mt-4 text-xs text-muted-foreground">Click a field on the left to change its type, choices, rules and visibility.</p>
          </aside>
        )}
      </div>
      <Dialog open={dlg} onOpenChange={setDlg}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Add a field to {entity.plural}</DialogTitle><DialogDescription>Pick what kind of answer it holds. You can fine-tune it afterwards.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fieldTypes.map((t) => { const I = typeIcon[t.type]; return (
              <button key={t.type} onClick={() => setFtype(t.type)} className={cn("flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition", ftype === t.type ? "border-brand bg-brand/10 ring-2 ring-brand/20" : "hover:bg-accent")}>
                <I className={cn("size-4", ftype === t.type ? "text-brand" : "text-muted-foreground")} /><span className="text-[13px] font-medium leading-tight">{t.label}</span><span className="text-[11px] leading-tight text-muted-foreground">{t.hint}</span>
              </button>); })}
          </div>
          <div className="space-y-1.5"><Label>Label shown on forms</Label><Input suggest="fieldLabel" placeholder={ftype === "relation" ? "e.g. Customer" : "e.g. Order number"} value={flabel} onChange={(e) => setFlabel(e.target.value)} /></div>
          {ftype === "relation" && (
            <div className="grid gap-3 rounded-2xl border border-brand/25 bg-brand/[0.04] p-3.5 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Links to</Label><TargetSelect value={ftarget} onChange={setFtarget} /></div>
              <div className="space-y-1.5"><Label>Each {entity.name.toLowerCase()} links to</Label>
                <div className="flex rounded-lg border bg-card p-0.5" role="radiogroup" aria-label="One or many">{([[false, "One"], [true, "Many"]] as const).map(([v, l]) => <Button key={l} role="radio" aria-checked={fmany === v} variant={fmany === v ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => setFmany(v)}>{l}</Button>)}</div>
              </div>
            </div>
          )}
          {(ftype === "lookup" || ftype === "rollup") && !entity.fields.some((x) => x.type === "relation") && <p className="rounded-xl bg-saffron/15 p-3 text-xs">This reads from linked records. Add a “Link to table” field first, then come back.</p>}
          <DialogFooter><Button variant="brand" disabled={!flabel.trim() || ((ftype === "lookup" || ftype === "rollup") && !entity.fields.some((x) => x.type === "relation"))} onClick={() => {
            const id = addField(entity.id, { key: slug(flabel), label: flabel.trim(), type: ftype, inList: true, options: ["select", "multiselect"].includes(ftype) ? ["Option 1", "Option 2"] : undefined, target: ftype === "relation" ? ftarget : undefined, many: ftype === "relation" ? fmany : undefined, inverse: ftype === "relation" ? entity.plural : undefined, via: ftype === "lookup" || ftype === "rollup" ? entity.fields.find((x) => x.type === "relation")?.key : undefined, agg: ftype === "rollup" ? "count" : undefined });
            setDlg(false); setSelField(id); toast.success(`“${flabel.trim()}” added`, { description: "Forms and lists update instantly." });
          }}>Add field</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- links ---------- */
function LinksTab({ entity, onEditField, onOpenEntity }: { entity: Entity; onEditField: (id: string) => void; onOpenEntity: (id: string) => void }) {
  const src = useSrc();
  const [dlg, setDlg] = useState(false);
  const out = entity.fields.filter((f) => f.type === "relation");
  const calc = entity.fields.filter((f) => f.type === "lookup" || f.type === "rollup");
  const inc = src.entities.flatMap((e) => e.fields.filter((f) => f.type === "relation" && f.target === entity.id).map((f) => ({ e, f })));
  const Row = ({ title, sub, onClick, target, tail }: { title: string; sub: string; onClick: () => void; target: string; tail?: string }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
      <TargetDot target={target} className="size-7 rounded-lg [&>svg]:size-3.5" />
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{title}</span><span className="block truncate text-xs text-muted-foreground">{sub}</span></span>
      {tail && <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{tail}</span>}
    </button>
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">Links connect {entity.plural.toLowerCase()} to records in other tables. Picking happens on the record form, and the other side sees it automatically.</p>
        <Button variant="brand" size="sm" className="ml-auto" onClick={() => setDlg(true)}><Plus /> Add a link</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2"><h3 className="flex items-center gap-2 text-sm font-medium"><ArrowRight className="size-4 text-brand" /> {entity.plural} link to</h3>
          {out.map((f) => <Row key={f.id} target={f.target ?? ""} title={`${f.label} → ${targetInfo(src, f.target)?.plural ?? "?"}`} sub={`${f.many ? "Many" : "One"} per ${entity.name.toLowerCase()}`} onClick={() => onEditField(f.id)} />)}
          {!out.length && <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">No outgoing links. Add one to connect these records to a product, an order or another table.</p>}
        </section>
        <section className="space-y-2"><h3 className="flex items-center gap-2 text-sm font-medium"><ArrowLeft className="size-4 text-brand" /> Linked from</h3>
          {inc.map(({ e, f }) => <Row key={e.id + f.id} target={e.id} title={f.inverse || e.plural} sub={`${e.plural} · field “${f.label}”`} onClick={() => onOpenEntity(e.id)} tail={String(e.records.filter((r) => asIds(r[f.key]).length).length)} />)}
          {!inc.length && <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">Nothing links here yet.</p>}
        </section>
      </div>
      {calc.length > 0 && (
        <section className="space-y-2"><h3 className="flex items-center gap-2 text-sm font-medium"><Sigma className="size-4 text-brand" /> Calculated from links</h3>
          <div className="grid gap-2 sm:grid-cols-2">{calc.map((f) => <Row key={f.id} target={entity.fields.find((x) => x.key === f.via)?.target ?? ""} title={f.label} sub={f.type === "rollup" ? `${aggs.find((a) => a.v === (f.agg ?? "count"))?.l ?? ""} via ${entity.fields.find((x) => x.key === f.via)?.label ?? "…"}` : `Lookup via ${entity.fields.find((x) => x.key === f.via)?.label ?? "…"}`} onClick={() => onEditField(f.id)} />)}</div>
        </section>
      )}
      <LinkTablesDialog open={dlg} onOpenChange={setDlg} from={entity.id} onCreated={(_, fid) => onEditField(fid)} />
    </div>
  );
}

/* ---------- new table ---------- */
function NewTable({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (id: string) => void }) {
  const addEntity = useStudio((s) => s.addEntity);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<EntityTemplate | null>(null);
  const create = () => {
    const n = (picked && !name ? picked.name : name).trim();
    if (!n && !picked) return;
    const id = addEntity(n || picked!.name, picked ?? undefined);
    onCreated(id); setName(""); setPicked(null); onOpenChange(false);
    toast.success("Table created", { description: picked ? `Started from the ${picked.name.toLowerCase()} template.` : "Add fields to shape its form." });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">Create a table</DialogTitle><DialogDescription>Start from a template, or name your own and add fields next.</DialogDescription></DialogHeader>
        <div className="grid gap-2 sm:grid-cols-3">
          {entityTemplates.map((t) => { const I = entityIcons[t.icon] ?? Boxes; const on = picked?.id === t.id; return (
            <button key={t.id} onClick={() => { setPicked(on ? null : t); if (!on) setName(t.plural); }} className={cn("flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition", on ? "border-brand bg-brand/5 ring-2 ring-brand/20" : "hover:-translate-y-0.5 hover:shadow-md")} aria-pressed={on}>
              <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: t.color }}><I className="size-4" /></span>
              <span><span className="block text-sm font-medium">{t.plural}</span><span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{t.description}</span></span>
              <span className="mt-auto text-[11px] text-muted-foreground">{t.fields.length} fields · {t.view} view</span>
            </button>); })}
        </div>
        <div className="space-y-1.5"><Label>Table name</Label><Input suggest="tableName" autoFocus placeholder="e.g. Size guides, Repairs, Lookbooks" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter><Button variant="brand" disabled={!name.trim() && !picked} onClick={create}>Create table</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- page ---------- */
export default function EntitiesPage() {
  const { entities, updateEntity, removeEntity, duplicateEntity, setEntityPublic } = useStudio();
  const [selId, setSelId] = useState("e1");
  const [newTable, setNewTable] = useState(false);
  const [tab, setTab] = useState<"data" | "fields" | "links">("data");
  const [mode, setMode] = useState<"tables" | "map">("tables");
  const [openReq, setOpenReq] = useState<string | null>(null);
  const [fieldReq, setFieldReq] = useState<string | null>(null);
  const jump = (eid: string, rid: string) => { setMode("tables"); setSelId(eid); setTab("data"); setOpenReq(rid); };
  const entity = (entities.find((e) => e.id === selId) ?? entities[0]) as Entity;
  const Icon = entityIcons[entity.icon] ?? Boxes;
  const color = entity.color ?? "#3340ff";
  const linkCount = entity.fields.filter((f) => f.type === "relation").length + entities.reduce((n, e) => n + e.fields.filter((f) => f.type === "relation" && f.target === entity.id).length, 0);

  return (
    <JumpCtx.Provider value={jump}>
      <PageHeader
        title="Custom data"
        description="Need reviews, feedback, repairs or something only your business has? Create a table, shape its fields, pick how to see it, and decide what shows on your website. No developer needed."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-card p-0.5" role="group" aria-label="Screen">
              {([["tables", Table2, "Tables"], ["map", Network, "Links map"]] as const).map(([k, I, l]) => <Button key={k} variant={mode === k ? "secondary" : "ghost"} size="sm" onClick={() => setMode(k)} aria-pressed={mode === k}><I /> {l}</Button>)}
            </div>
            <Button variant="brand" onClick={() => setNewTable(true)}><Plus /> New table</Button>
          </div>
        }
      />
      {mode === "map" ? <RelationMap onOpen={(id) => { setSelId(id); setTab("links"); setMode("tables"); }} /> : (
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="h-fit space-y-1 rounded-3xl border bg-card p-2" aria-label="Tables">
          {entities.map((e) => {
            const I = entityIcons[e.icon] ?? Boxes;
            const on = selId === e.id;
            return (
              <button key={e.id} onClick={() => { setSelId(e.id); setTab("data"); setFieldReq(null); }} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors", on ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                <span className="grid size-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: e.color ?? "#3340ff" }}><I className="size-3.5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{e.plural}</span><span className={cn("block text-xs", on ? "opacity-70" : "text-muted-foreground")}>{e.system ? "Built-in" : `${e.records.length} records`} · {e.fields.length} fields</span></span>
                {e.publicOnStore && <Globe className="size-3.5 shrink-0 opacity-70" />}
              </button>
            );
          })}
          <button onClick={() => setNewTable(true)} className="flex w-full items-center gap-2 rounded-2xl border border-dashed px-3 py-2.5 text-sm text-muted-foreground hover:border-brand hover:text-brand"><Plus className="size-4" /> New table</button>
        </nav>

        <div className="min-w-0 space-y-5" key={entity.id}>
          <section className="rounded-3xl border bg-card p-5">
            <div className="flex items-start gap-3">
              <Popover>
                <PopoverTrigger asChild><button className="grid size-12 shrink-0 place-items-center rounded-2xl text-white transition hover:scale-105" style={{ background: color }} aria-label="Change icon and colour"><Icon className="size-5" /></button></PopoverTrigger>
                <PopoverContent align="start" className="w-64 space-y-3 p-3">
                  <div className="grid grid-cols-5 gap-1.5">{Object.entries(entityIcons).map(([n, I]) => <button key={n} onClick={() => updateEntity(entity.id, { icon: n })} className={cn("grid size-9 place-items-center rounded-lg border", entity.icon === n && "border-brand bg-brand/10 text-brand")} aria-label={n}><I className="size-4" /></button>)}</div>
                  <div className="flex gap-1.5">{entityColors.map((c) => <button key={c} onClick={() => updateEntity(entity.id, { color: c })} className={cn("size-6 rounded-full border-2", color === c ? "border-foreground" : "border-transparent")} style={{ background: c }} aria-label={c} />)}</div>
                </PopoverContent>
              </Popover>
              <div className="min-w-0 flex-1 space-y-1">
                <input value={entity.plural} onChange={(e) => updateEntity(entity.id, { plural: e.target.value })} aria-label="Table name" className="w-full bg-transparent font-display text-3xl outline-none focus:underline focus:decoration-brand/40 focus:underline-offset-4" />
                <input value={entity.description} onChange={(e) => updateEntity(entity.id, { description: e.target.value })} aria-label="Description" className="w-full bg-transparent text-sm text-muted-foreground outline-none focus:text-foreground" />
              </div>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline" size="sm"><Settings2 /> Settings</Button></PopoverTrigger>
                <PopoverContent align="end" className="w-72 space-y-3 p-3">
                  <div className="space-y-1.5"><Label>One record is called</Label><Input value={entity.name} onChange={(e) => updateEntity(entity.id, { name: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Record title comes from</Label>
                    <Select value={entity.titleField ?? entity.fields[0]?.key} onValueChange={(v) => updateEntity(entity.id, { titleField: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{entity.fields.map((f) => <SelectItem key={f.id} value={f.key}>{f.label}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <label className="flex items-center justify-between gap-3 text-sm"><span>Approve before publishing<span className="block text-xs text-muted-foreground">New public entries wait for a person.</span></span><Switch checked={!!entity.approval} onCheckedChange={(v) => updateEntity(entity.id, { approval: v })} /></label>
                  <div className="flex gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" onClick={() => { const id = duplicateEntity(entity.id); setSelId(id); toast("Table duplicated", { description: "Fields were copied, records were not." }); }}><Copy /> Duplicate</Button>
                    <Button variant="ghost" size="sm" className="text-chili hover:text-chili" disabled={entity.system} onClick={() => { removeEntity(entity.id); setSelId(entities.find((e) => e.id !== entity.id)?.id ?? ""); toast("Table deleted"); }}><Trash2 /> Delete</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 p-4">
                <div className="flex items-start gap-3"><Globe className="mt-0.5 size-4 text-brand" /><div><div className="text-sm font-medium">Show on your website</div><div className="text-xs text-muted-foreground">{entity.publicOnStore ? (entity.approval ? "Approved records appear in the website blocks you place." : "Records appear in the website blocks you place.") : "Only your team sees these records."}</div></div></div>
                <div className="flex items-center gap-3">{entity.publicOnStore && !entity.system && <Button asChild variant="outline" size="sm"><Link href="/manager/site">Place it</Link></Button>}<Switch checked={entity.publicOnStore} disabled={entity.system} onCheckedChange={(v) => { setEntityPublic(entity.id, v); toast(v ? `${entity.plural} are now public` : `${entity.plural} are now private`); }} aria-label="Show on your website" /></div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 p-4">
                <div className="flex items-start gap-3"><Inbox className="mt-0.5 size-4 text-brand" /><div><div className="text-sm font-medium">Accept website entries</div><div className="text-xs text-muted-foreground">{entity.collect ? "Forms from the builder save straight here." : "Turn on so website forms can save here."}</div></div></div>
                <div className="flex items-center gap-3">{entity.collect && !entity.system && <Button asChild variant="outline" size="sm"><Link href="/manager/site">Add a form</Link></Button>}<Switch checked={!!entity.collect} disabled={entity.system} onCheckedChange={(v) => { updateEntity(entity.id, { collect: v }); toast(v ? `${entity.plural} now accept website entries` : `Website forms can no longer save to ${entity.plural.toLowerCase()}`); }} aria-label="Accept entries from your website" /></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4"><BadgeCheck className="mt-0.5 size-4 text-brand" /><div className="text-sm"><div className="font-medium">Permissions are automatic</div><div className="text-xs text-muted-foreground">{entity.plural} get their own row in <Link href="/manager/roles" className="text-brand underline-offset-2 hover:underline">Roles and access</Link>.</div></div></div>
            </div>
          </section>

          <div className="flex gap-1 border-b" role="tablist">
            {([["data", `Data · ${entity.records.length}`], ["fields", `Fields · ${entity.fields.length}`], ["links", `Links · ${linkCount}`]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition", tab === k ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{l}</button>
            ))}
            <span className="ml-auto hidden items-center gap-1.5 pb-2 text-xs text-muted-foreground sm:flex"><Sparkles className="size-3.5" /> Changes apply everywhere instantly</span>
          </div>
          {entity.system && tab === "data" ? (
            <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">Products live in the <Link href="/manager/products" className="text-brand hover:underline">Products</Link> screen. Fields you add here appear there as custom columns and form inputs.</div>
          ) : tab === "data" ? <DataTab entity={entity} openReq={openReq} onConsumed={() => setOpenReq(null)} />
          : tab === "fields" ? <FieldsTab key={fieldReq ?? "f"} entity={entity} initialSel={fieldReq} />
          : <LinksTab entity={entity} onEditField={(id) => { setFieldReq(id); setTab("fields"); }} onOpenEntity={(id) => { setSelId(id); setTab("data"); }} />}
        </div>
      </div>)}
      <NewTable open={newTable} onOpenChange={setNewTable} onCreated={(id) => { setSelId(id); setTab("fields"); setFieldReq(null); }} />
    </JumpCtx.Provider>
  );
}
