"use client";
import { CalendarDays, Calculator, Check, ImagePlus, Star } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RelChips, RelationPicker } from "@/components/record-picker";
import type { Entity, Field, Rec } from "@/lib/data";
import { useResolver } from "@/lib/relations";
import { fieldSuggest } from "@/lib/mock";
import { cn } from "@/lib/utils";

export type Val = string | number | boolean | string[] | undefined;

export function Stars({ value = 0, onChange, size = "size-5" }: { value?: number; onChange?: (n: number) => void; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Star className={cn(size, n <= value ? "fill-saffron text-saffron" : "text-muted-foreground/40")} />;
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} className="transition-transform hover:scale-110" aria-label={`${n} star${n > 1 ? "s" : ""}`}>{star}</button>
        ) : <span key={n}>{star}</span>;
      })}
    </div>
  );
}

function Computed({ entity, rec, field }: { entity?: Entity; rec?: Rec; field: Field }) {
  const r = useResolver();
  const c = entity && rec ? r.compute(entity, rec, field) : null;
  if (!c || c.value === undefined) return <span className="text-muted-foreground/60">–</span>;
  return <CellValue field={{ ...c.field, type: c.type }} value={c.value} />;
}

export function CellValue({ field, value, entity, rec }: { field: Field; value: Val; entity?: Entity; rec?: Rec }) {
  if (field.type === "lookup" || field.type === "rollup") return <Computed entity={entity} rec={rec} field={field} />;
  if (field.type === "relation") return <RelChips field={field} value={value} />;
  if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) return <span className="text-muted-foreground/60">–</span>;
  switch (field.type) {
    case "rating": return <Stars value={Number(value)} size="size-3.5" />;
    case "boolean": return value ? <span className="inline-flex items-center gap-1 text-emerald-700"><Check className="size-3.5" /> Yes</span> : <span className="text-muted-foreground">No</span>;
    case "currency": return <span className="tabular-nums">₹{Number(value).toLocaleString("en-IN")}</span>;
    case "percent": return <span className="tabular-nums">{Number(value)}%</span>;
    case "color": return <span className="inline-flex items-center gap-1.5"><i className="size-3.5 rounded-full border" style={{ background: String(value) }} />{String(value)}</span>;
    case "select": {
      const c = field.optionColors?.[String(value)];
      return <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs"><i className="size-2 rounded-full" style={{ background: c ?? "#8c8c9c" }} />{String(value)}</span>;
    }
    case "multiselect":
      return <span className="flex flex-wrap gap-1">{(value as string[]).map((v) => <span key={v} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{v}</span>)}</span>;
    case "url": return <span className="text-brand underline-offset-2">{String(value).replace(/^https?:\/\//, "")}</span>;
    case "file": return <span className="text-xs text-muted-foreground">{String(value)}</span>;
    case "number": return <span className="tabular-nums">{typeof value === "number" ? value.toLocaleString("en-IN") : String(value)}</span>;
    default: return <span>{String(value)}</span>;
  }
}

export function DynamicField({ field, value, onChange, compact, entity, draft }: { field: Field; value: Val; onChange?: (v: Val) => void; compact?: boolean; entity?: Entity; draft?: Rec }) {
  const set = (v: Val) => onChange?.(v);
  let control: React.ReactNode;
  switch (field.type) {
    case "longtext":
      control = <Textarea suggest={fieldSuggest(field)} rows={3} value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder={field.placeholder ?? `Add ${field.label.toLowerCase()}`} />;
      break;
    case "number":
    case "currency":
    case "percent":
      control = (
        <div className="relative">
          {field.type === "currency" && <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">₹</span>}
          <Input suggest={fieldSuggest(field)} type="number" min={field.min} max={field.type === "percent" ? field.max ?? 100 : field.max} className={cn(field.type === "currency" && "pl-7", field.type === "percent" && "pr-8")} value={value === undefined || value === "" ? "" : Number(value)} onChange={(e) => set(e.target.value === "" ? undefined : Number(e.target.value))} placeholder={field.placeholder} />
          {field.type === "percent" && <span className="pointer-events-none absolute right-3 top-2 text-sm text-muted-foreground">%</span>}
        </div>
      );
      break;
    case "email":
      control = <Input suggest={fieldSuggest(field)} type="email" value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder={field.placeholder ?? "name@example.com"} />;
      break;
    case "phone":
      control = <Input type="tel" value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder={field.placeholder ?? "+91 98765 43210"} suggest={["+91 98450 12345", "+91 99001 54321"]} />;
      break;
    case "url":
      control = <Input type="url" value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder={field.placeholder ?? "https://"} suggest={["https://instagram.com/kaveritextiles", "https://kaveritextiles.in/size-guide"]} />;
      break;
    case "color":
      control = (
        <div className="flex items-center gap-2">
          <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border" style={{ background: String(value || "#3340ff") }}><input type="color" value={String(value || "#3340ff")} onChange={(e) => set(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label={field.label} /></label>
          <Input value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder="#3340ff" className="font-mono" />
        </div>
      );
      break;
    case "date":
      control = (
        <div className="relative">
          <Input type="date" value={String(value ?? "")} onChange={(e) => set(e.target.value)} />
          <CalendarDays className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
        </div>
      );
      break;
    case "rating":
      control = <Stars value={Number(value ?? 0)} onChange={(n) => set(n)} />;
      break;
    case "boolean":
      control = (
        <div className="flex h-9 items-center gap-2">
          <Switch checked={Boolean(value)} onCheckedChange={(v) => set(v)} />
          <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
        </div>
      );
      break;
    case "multiselect": {
      const cur = Array.isArray(value) ? value : [];
      control = (
        <div className="flex flex-wrap gap-1.5">
          {(field.options ?? []).map((o) => {
            const on = cur.includes(o);
            return <button key={o} type="button" onClick={() => set(on ? cur.filter((x) => x !== o) : [...cur, o])} className={cn("rounded-full border px-3 py-1 text-xs transition", on ? "border-brand bg-brand/10 text-brand" : "text-muted-foreground hover:border-foreground/30")} aria-pressed={on}>{o}</button>;
          })}
          {!(field.options ?? []).length && <span className="text-xs text-muted-foreground">Add choices in the field settings.</span>}
        </div>
      );
      break;
    }
    case "relation":
      control = <RelationPicker field={field} value={value} onChange={(v) => set(v)} />;
      break;
    case "lookup":
    case "rollup":
      control = (
        <div className="flex min-h-9 items-center gap-2 rounded-lg border border-dashed bg-secondary/40 px-3 py-1.5 text-sm">
          <Calculator className="size-3.5 shrink-0 text-muted-foreground" />
          <Computed entity={entity} rec={draft} field={field} />
          <span className="ml-auto text-[11px] text-muted-foreground">Calculated</span>
        </div>
      );
      break;
    case "select": {
      const opts = field.options ?? [];
      control = (
        <Select value={value ? String(value) : undefined} onValueChange={(v) => set(v)}>
          <SelectTrigger><SelectValue placeholder={field.placeholder ?? "Choose one"} /></SelectTrigger>
          <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{field.optionColors?.[o] && <i className="mr-1.5 inline-block size-2 rounded-full" style={{ background: field.optionColors[o] }} />}{o}</SelectItem>)}</SelectContent>
        </Select>
      );
      break;
    }
    case "file":
      control = (
        <button type="button" onClick={() => set("photo-" + Math.floor(Math.random() * 90 + 10) + ".jpg")} className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-background/50 text-sm text-muted-foreground hover:border-brand hover:text-brand">
          <ImagePlus className="size-4" /> {value ? String(value) : "Drop photos or browse"}
        </button>
      );
      break;
    default:
      control = <Input suggest={fieldSuggest(field)} value={String(value ?? "")} onChange={(e) => set(e.target.value)} placeholder={field.placeholder ?? field.label} />;
  }
  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      <Label>
        {field.label}
        {field.required && <span className="text-brand">*</span>}
      </Label>
      {control}
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
