"use client";
import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, GripVertical, Lock, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { El, FormField } from "@/lib/builder";
import { fieldTypes, type Field, type FieldType } from "@/lib/data";
import { computed, eligibleFields, resolveFormFields, type FormItem } from "@/lib/forms";
import { useSrc } from "@/lib/relations";
import { useSite } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field as Row, Group, MiniInput, Num, Seg, Toggle } from "./controls";

function Pick<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; label: string }[]; label: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-8 text-[13px]" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const NONE = "__none";

function TablePick({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const entities = useStudio((s) => s.entities);
  return <Pick label="Table" value={value} onChange={onChange} options={entities.filter((e) => !e.system).map((e) => ({ v: e.slug, label: e.plural }))} />;
}

/* ---------------------------------------------------------------- FORM */

function FormFieldRow({ item, open, onToggle, onChange, onRemove, locked }: { item: FormItem; open: boolean; onToggle: () => void; onChange: (p: Partial<FormField>) => void; onRemove: () => void; locked?: boolean }) {
  const controls = useDragControls();
  const { f, cfg } = item;
  return (
    <Reorder.Item value={item.cfg} dragListener={false} dragControls={controls} className="rounded-lg border bg-card" whileDrag={{ scale: 1.02, boxShadow: "0 10px 24px -10px rgb(20 26 58 / .35)" }}>
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        <button onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing" aria-label={`Drag ${f.label}`}><GripVertical className="size-3.5" /></button>
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[13px]" aria-expanded={open}>
          <span className="truncate font-medium">{f.label}</span>{f.required && <span className="text-brand">*</span>}
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{fieldTypes.find((t) => t.type === f.type)?.label}</span>
          <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        <Button variant="ghost" size="icon-xs" onClick={onRemove} aria-label={`Remove ${f.label} from the form`} disabled={locked}><X /></Button>
      </div>
      {open && (
        <div className="space-y-2.5 border-t bg-secondary/40 p-2.5">
          <Row label="Label"><MiniInput value={f.label} onChange={(e) => onChange({ label: e.target.value })} /></Row>
          {["text", "longtext", "email", "phone", "url", "number", "currency"].includes(f.type) && <Row label="Hint inside the box"><MiniInput value={f.placeholder ?? ""} onChange={(e) => onChange({ placeholder: e.target.value })} /></Row>}
          <Row label="Help text"><MiniInput value={f.help ?? ""} onChange={(e) => onChange({ help: e.target.value })} placeholder="Small note under the field" /></Row>
          <Toggle label="Required" checked={!!f.required} onChange={(v) => onChange({ required: v })} />
          <Toggle label="Half width" checked={!!f.half} onChange={(v) => onChange({ half: v })} hint="Sits beside the next half-width field." />
          {f.type === "number" && <Row label="Show as"><Seg value={cfg.as === "scale" ? "scale" : "default"} onChange={(v) => onChange({ as: v })} options={[{ v: "default", label: "Number box" }, { v: "scale", label: "0 to 10 scale" }]} /></Row>}
          {f.type === "select" && <Row label="Show as"><Seg value={cfg.as === "chips" ? "chips" : "default"} onChange={(v) => onChange({ as: v })} options={[{ v: "default", label: "Auto" }, { v: "chips", label: "Buttons" }]} /></Row>}
        </div>
      )}
    </Reorder.Item>
  );
}

const quickTypes: { t: FieldType; l: string }[] = [
  { t: "text", l: "Short text" }, { t: "longtext", l: "Long text" }, { t: "email", l: "Email" }, { t: "phone", l: "Phone" }, { t: "number", l: "Number" }, { t: "select", l: "Choice" }, { t: "rating", l: "Stars" }, { t: "boolean", l: "Yes / no" }, { t: "date", l: "Date" }, { t: "relation", l: "Link to product" },
];

export function FormPanel({ el }: { el: El }) {
  const { setP } = useSite();
  const src = useSrc();
  const { updateEntity, addField } = useStudio();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [nl, setNl] = useState("");
  const [nt, setNt] = useState<FieldType>("text");
  const p = el.p;
  const P = (k: string) => (v: unknown) => setP(el.id, k, v);
  const entity = src.entities.find((e) => e.slug === p.slug);
  const items = entity ? resolveFormFields(entity, p.fields, src) : [];
  const current: FormField[] = items.map((i) => i.cfg);
  const commit = (next: FormField[]) => P("fields")(next.length ? next : [{ key: NONE }]);
  const patch = (key: string, d: Partial<FormField>) => commit(current.map((c) => (c.key === key ? { ...c, ...d } : c)));
  const included = new Set(current.map((c) => c.key));
  const pool = entity ? entity.fields.filter((f) => !computed(f) && !included.has(f.key)) : [];
  const okKeys = entity ? new Set(eligibleFields(entity, src).map((f) => f.key)) : new Set<string>();
  const pages = useSite((s) => s.doc.pages);

  const addNew = () => {
    if (!entity || !nl.trim()) return;
    const key = slug(nl) || "field";
    addField(entity.id, { key, label: nl.trim(), type: nt, inList: true, options: nt === "select" ? ["Option 1", "Option 2"] : undefined, target: nt === "relation" ? "@products" : undefined, inverse: nt === "relation" ? entity.plural : undefined });
    commit([...current, { key }]);
    setNl(""); setOpenKey(key);
  };

  return (
    <>
      <Row label="Saves into">
        <TablePick value={p.slug} onChange={(v) => { P("slug")(v); P("fields")([]); setOpenKey(null); }} />
      </Row>
      {entity && !entity.collect && (
        <div className="rounded-lg bg-saffron/15 p-2.5 text-xs">
          <p>This table doesn’t accept website entries yet, so visitors won’t see this form.</p>
          <Button size="xs" variant="outline" className="mt-2" onClick={() => updateEntity(entity.id, { collect: true })}>Accept entries from the website</Button>
        </div>
      )}
      {entity?.approval && <p className="rounded-lg bg-brand/5 p-2.5 text-xs text-muted-foreground">New entries wait for approval in Custom data before they show on the site.</p>}

      <Group title="Fields on the form" aside={<span className="text-[11px] text-muted-foreground">{items.length} shown</span>}>
        <p className="text-xs text-muted-foreground">Drag to reorder. Open a field to rename it, mark it required or make it half width.</p>
        <Reorder.Group axis="y" values={current} onReorder={commit} className="space-y-1.5">
          {items.map((it) => (
            <FormFieldRow key={it.f.key} item={it} open={openKey === it.f.key} onToggle={() => setOpenKey(openKey === it.f.key ? null : it.f.key)} onChange={(d) => patch(it.f.key, d)} onRemove={() => commit(current.filter((c) => c.key !== it.f.key))} />
          ))}
        </Reorder.Group>
        {!items.length && <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">No fields yet. Add one below.</p>}
        {pool.length > 0 && (
          <Row label="Not on the form">
            <div className="flex flex-wrap gap-1.5">
              {pool.map((f) => (
                <button key={f.id} onClick={() => commit([...current, { key: f.key }])} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-brand hover:text-brand" title={okKeys.has(f.key) ? undefined : "Private or linked to a private table"}>
                  {!okKeys.has(f.key) && <Lock className="size-3" />}<Plus className="size-3" />{f.label}
                </button>
              ))}
            </div>
          </Row>
        )}
        <div className="space-y-1.5 rounded-lg border border-dashed p-2.5">
          <div className="text-xs font-medium">New field for {entity?.plural ?? "the table"}</div>
          <div className="flex gap-1.5">
            <MiniInput value={nl} onChange={(e) => setNl(e.target.value)} placeholder="e.g. Preferred colour" onKeyDown={(e) => e.key === "Enter" && addNew()} aria-label="New field name" />
            <Select value={nt} onValueChange={(v) => setNt(v as FieldType)}><SelectTrigger className="h-8 w-[118px] shrink-0 text-[13px]" aria-label="New field type"><SelectValue /></SelectTrigger><SelectContent>{quickTypes.map((q) => <SelectItem key={q.t} value={q.t}>{q.l}</SelectItem>)}</SelectContent></Select>
          </div>
          <Button size="xs" variant="outline" disabled={!nl.trim() || !entity} onClick={addNew}><Plus /> Add to table and form</Button>
        </div>
      </Group>

      <Group title="Words">
        <Toggle label="Show a title" checked={!!p.showTitle} onChange={P("showTitle")} />
        {p.showTitle && <Row label="Title"><MiniInput value={p.title} onChange={(e) => P("title")(e.target.value)} /></Row>}
        <Row label="Description"><Textarea rows={2} value={p.desc} onChange={(e) => P("desc")(e.target.value)} className="min-h-0 text-[13px]" /></Row>
        <Row label="Button"><MiniInput value={p.submit} onChange={(e) => P("submit")(e.target.value)} /></Row>
      </Group>

      <Group title="After sending">
        <Row label="Then"><Seg value={p.after} onChange={P("after")} options={[{ v: "message", label: "Thank you" }, { v: "reset", label: "Clear form" }, { v: "page", label: "Go to page" }]} /></Row>
        {p.after === "message" && (<>
          <Row label="Thank-you headline"><MiniInput value={p.successTitle} onChange={(e) => P("successTitle")(e.target.value)} /></Row>
          <Row label="Thank-you message"><Textarea rows={2} value={p.success} onChange={(e) => P("success")(e.target.value)} className="min-h-0 text-[13px]" /></Row>
        </>)}
        {p.after === "page" && <Row label="Page"><Pick label="Page" value={p.page || pages[0]?.path || "/"} onChange={P("page")} options={pages.map((pg) => ({ v: pg.path, label: pg.name }))} /></Row>}
      </Group>

      <Group title="Look" defaultOpen={false}>
        <Row label="Container"><Seg value={p.look} onChange={P("look")} options={[{ v: "card", label: "Card" }, { v: "plain", label: "Plain" }]} /></Row>
        <Row label="Inputs"><Seg value={p.fieldStyle} onChange={P("fieldStyle")} options={[{ v: "filled", label: "Filled" }, { v: "outlined", label: "Outlined" }, { v: "underline", label: "Line" }]} /></Row>
        <Row label="Button colour"><Seg value={p.btn} onChange={P("btn")} options={[{ v: "brand", label: "Brand" }, { v: "accent", label: "Accent" }, { v: "ink", label: "Ink" }]} /></Row>
      </Group>
    </>
  );
}

/* ----------------------------------------------------------- DATA LIST */

const sortOpts = (hasRating: boolean) => [
  { v: "newest", label: "Newest first" }, { v: "oldest", label: "Oldest first" }, { v: "az", label: "A to Z" }, { v: "za", label: "Z to A" },
  ...(hasRating ? [{ v: "rating", label: "Highest rated" }] : []), { v: "field", label: "By a field…" },
];

export function DataListPanel({ el }: { el: El }) {
  const { setP } = useSite();
  const src = useSrc();
  const updateEntity = useStudio((s) => s.updateEntity);
  const p = el.p;
  const P = (k: string) => (v: unknown) => setP(el.id, k, v);
  const entity = src.entities.find((e) => e.slug === p.slug);
  const f = entity?.fields.filter((x) => !x.hidden) ?? [];
  const opt = (type?: FieldType[]) => f.filter((x) => !type || type.includes(x.type)).map((x) => ({ v: x.key, label: x.label }));
  const productLinks = f.filter((x) => x.type === "relation" && x.target === "@products");
  const filterable = f.filter((x) => ["select", "multiselect", "relation"].includes(x.type));
  const hasRating = f.some((x) => x.type === "rating");
  const whereF = entity?.fields.find((x) => x.key === p.where?.key);
  const whereVals = whereF?.options ?? [];

  return (
    <>
      <Row label="Show records from"><TablePick value={p.slug} onChange={(v) => { P("slug")(v); P("fields")([]); P("titleKey")(""); P("bodyKey")(""); P("ratingKey")(""); P("coverKey")(""); P("filterKey")(""); P("where")({ key: "", value: "" }); P("sortKey")(""); }} /></Row>
      {entity && !entity.publicOnStore && (
        <div className="rounded-lg bg-saffron/15 p-2.5 text-xs">
          <p>This table is private, so visitors see nothing here yet.</p>
          <Button size="xs" variant="outline" className="mt-2" onClick={() => updateEntity(entity.id, { publicOnStore: true })}>Show it on the website</Button>
        </div>
      )}
      {entity?.approval && <p className="rounded-lg bg-brand/5 p-2.5 text-xs text-muted-foreground">Only approved records appear. Approve new ones in Custom data.</p>}

      <Group title="Layout">
        <Row label="Style"><Pick label="Layout" value={p.view} onChange={P("view")} options={[{ v: "cards", label: "Cards" }, { v: "quote", label: "Quotes" }, { v: "list", label: "List" }, { v: "table", label: "Table" }, { v: "accordion", label: "Accordion" }]} /></Row>
        <Num label="How many" value={p.count} min={1} max={24} onChange={(v) => P("count")(v ?? 4)} />
        {["cards", "quote"].includes(p.view) && <Num label="Columns" value={p.cols} min={1} max={4} onChange={(v) => P("cols")(v ?? 2)} />}
        <Toggle label="Show more button" checked={!!p.more} onChange={P("more")} hint="Lets visitors load the next batch." />
        <Row label="When empty, say"><MiniInput value={p.empty ?? ""} onChange={(e) => P("empty")(e.target.value)} /></Row>
      </Group>

      <Group title="What each record shows">
        <Row label="Title"><Pick label="Title field" value={p.titleKey || (entity?.titleField ?? f[0]?.key ?? "")} onChange={P("titleKey")} options={opt()} /></Row>
        <Row label="Body text"><Pick label="Body field" value={p.bodyKey || "auto"} onChange={(v) => P("bodyKey")(v === "auto" ? "" : v)} options={[{ v: "auto", label: "Automatic" }, { v: "-", label: "None" }, ...opt(["longtext", "text"])]} /></Row>
        {hasRating && <Row label="Stars"><Pick label="Rating field" value={p.ratingKey || "auto"} onChange={(v) => P("ratingKey")(v === "auto" ? "" : v)} options={[{ v: "auto", label: "Automatic" }, { v: "-", label: "None" }, ...opt(["rating"])]} /></Row>}
        {productLinks.length > 0 && <Row label="Photo from linked product"><Pick label="Cover" value={p.coverKey || "-"} onChange={(v) => P("coverKey")(v === "-" ? "" : v)} options={[{ v: "-", label: "No photo" }, ...productLinks.map((x) => ({ v: x.key, label: x.label }))]} /></Row>}
        <Row label="Extra details">
          <div className="flex flex-wrap gap-1.5">
            {f.map((x) => {
              const on = (p.fields as string[]).includes(x.key);
              return <button key={x.id} onClick={() => P("fields")(on ? (p.fields as string[]).filter((k) => k !== x.key) : [...(p.fields as string[]), x.key])} aria-pressed={on} className={cn("rounded-full border px-2.5 py-1 text-xs transition", on ? "border-brand bg-brand/10 text-brand" : "text-muted-foreground hover:border-foreground/30")}>{x.label}</button>;
            })}
          </div>
          {!(p.fields as string[]).length && <p className="mt-1.5 text-[11px] text-muted-foreground">None picked, so the first few list columns show.</p>}
        </Row>
        <Toggle label="Show field names" checked={p.labels !== false} onChange={P("labels")} />
      </Group>

      <Group title="Visitors can" defaultOpen={false}>
        <Toggle label="Search" checked={!!p.search} onChange={P("search")} />
        {p.search && <Row label="Search hint"><MiniInput value={p.searchHint ?? ""} onChange={(e) => P("searchHint")(e.target.value)} placeholder={`Search ${entity?.plural.toLowerCase() ?? ""}`} /></Row>}
        {filterable.length > 0 && <Row label="Filter by"><Pick label="Filter field" value={p.filterKey || "-"} onChange={(v) => P("filterKey")(v === "-" ? "" : v)} options={[{ v: "-", label: "No filter" }, ...filterable.map((x) => ({ v: x.key, label: x.label }))]} /></Row>}
      </Group>

      <Group title="Order and filter" defaultOpen={false}>
        <Row label="Sort"><Pick label="Sort" value={p.sort} onChange={P("sort")} options={sortOpts(hasRating)} /></Row>
        {p.sort === "field" && <Row label="Sort field"><Pick label="Sort field" value={p.sortKey || f[0]?.key || ""} onChange={P("sortKey")} options={opt()} /></Row>}
        <Row label="Only show where">
          <div className="space-y-1.5">
            <Pick label="Filter field" value={p.where?.key || "-"} onChange={(v) => P("where")({ key: v === "-" ? "" : v, value: "" })} options={[{ v: "-", label: "Show all records" }, ...f.filter((x) => !computed(x)).map((x) => ({ v: x.key, label: x.label }))]} />
            {p.where?.key && (whereVals.length ? <Pick label="Value" value={p.where.value || whereVals[0]} onChange={(v) => P("where")({ ...p.where, value: v })} options={whereVals.map((v) => ({ v, label: v }))} /> : <MiniInput value={p.where.value} onChange={(e) => P("where")({ ...p.where, value: e.target.value })} placeholder="is exactly…" />)}
          </div>
        </Row>
      </Group>
    </>
  );
}

