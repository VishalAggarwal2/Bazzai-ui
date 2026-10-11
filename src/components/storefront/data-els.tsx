"use client";
import { useMemo, useState, type CSSProperties } from "react";
import { BadgeCheck, Check, ChevronDown, ImagePlus, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProductArt } from "@/components/product-art";
import { EditableText, FS, btnRadius, cv, typeStyle, useMode, useNav } from "./render";
import { locateEl, useSite } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { asIds, attrsOf, titleKeyOf, useResolver, useSrc } from "@/lib/relations";
import { buildRecord, plain, resolveFormFields, validate, type FormItem } from "@/lib/forms";
import type { El, Theme } from "@/lib/builder";
import type { Entity, Field, Rec } from "@/lib/data";
import { cn } from "@/lib/utils";

const Note = ({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "warn" }) => (
  <div className={cn("rounded-[var(--s-radius)] border-2 border-dashed p-6 text-center font-sans text-sm", tone === "warn" ? "border-[#e08a00]/50 bg-[#ffb61e]/10" : "opacity-70")}>{children}</div>
);

/* =============================================================== FORM */

function Scale({ value, onChange, min, max, disabled }: { value?: number; onChange: (n: number) => void; min: number; max: number; disabled?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button key={n} type="button" disabled={disabled} role="radio" aria-checked={value === n} onClick={() => onChange(n)} className={cn("size-9 text-sm transition", value === n ? "bg-[var(--s-brand)] text-[var(--s-on-brand)]" : "bg-[var(--s-bg)] text-[var(--s-fg)] hover:-translate-y-0.5")} style={{ borderRadius: "calc(var(--s-radius) * 0.7)" }}>{n}</button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] opacity-55"><span>Not likely</span><span>Very likely</span></div>
    </div>
  );
}

function Control({ item, value, onChange, look, error, dis }: { item: FormItem; value: unknown; onChange: (v: string | number | boolean | string[] | undefined) => void; look: "filled" | "outlined" | "underline"; error?: string; dis: boolean }) {
  const { f, cfg } = item;
  const r = useResolver();
  const fill = look === "filled";
  const base = cn(
    "w-full px-3.5 py-2.5 text-sm text-[var(--s-fg)] outline-none transition placeholder:text-[var(--s-fg)]/45 focus:ring-2 focus:ring-[var(--s-brand)]/45",
    look === "filled" && "border border-transparent bg-[var(--fill)]",
    look === "outlined" && "border border-current/25 bg-transparent",
    look === "underline" && "rounded-none border-0 border-b-[1.5px] border-current/30 bg-transparent px-0.5",
    error && "!border-[#f0452b]",
  );
  const rad: CSSProperties = look === "underline" ? {} : { borderRadius: "calc(var(--s-radius) * 0.6)" };
  const chip = (on: boolean) => cn("px-3.5 py-1.5 text-[13px] transition", on ? "bg-[var(--s-brand)] text-[var(--s-on-brand)]" : "border border-current/20 hover:border-current/50");
  const chipRad: CSSProperties = { borderRadius: 999 };
  const common = { disabled: dis, tabIndex: dis ? -1 : undefined, "aria-invalid": !!error, "aria-label": f.label } as const;

  switch (f.type) {
    case "longtext": return <textarea {...common} rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={cn(base, "resize-y")} style={rad} />;
    case "number": case "currency": case "percent":
      if (cfg.as === "scale" || (f.type === "number" && f.min === 0 && f.max === 10 && cfg.as !== "default")) return <Scale value={value === undefined || value === "" ? undefined : Number(value)} onChange={onChange} min={f.min ?? 0} max={f.max ?? 10} disabled={dis} />;
      return (
        <div className="relative">
          {f.type === "currency" && <span className="pointer-events-none absolute left-3.5 top-2.5 text-sm opacity-60">₹</span>}
          <input {...common} type="number" min={f.min} max={f.max} value={value === undefined || value === "" ? "" : Number(value)} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} placeholder={f.placeholder} className={cn(base, f.type === "currency" && "pl-8")} style={rad} />
        </div>
      );
    case "rating":
      return <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" {...common} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}><Star className={cn("size-7 transition-transform hover:scale-110", n <= Number(value ?? 0) ? "fill-[var(--s-accent)] text-[var(--s-accent)]" : "opacity-30")} /></button>)}</div>;
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" disabled={dis} tabIndex={dis ? -1 : undefined} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-[18px] accent-[var(--s-brand)]" />
          <span className="opacity-80">{f.help || "Yes"}</span>
        </label>
      );
    case "select": {
      const opts = f.options ?? [];
      if (opts.length <= 4 || cfg.as === "chips")
        return <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={f.label}>{opts.map((o) => <button key={o} type="button" disabled={dis} role="radio" aria-checked={value === o} onClick={() => onChange(value === o ? undefined : o)} className={chip(value === o)} style={chipRad}>{o}</button>)}</div>;
      return (
        <div className="relative">
          <select {...common} value={String(value ?? "")} onChange={(e) => onChange(e.target.value || undefined)} className={cn(base, "appearance-none pr-9")} style={rad}>
            <option value="">{f.placeholder ?? "Choose one"}</option>{opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 opacity-55" />
        </div>
      );
    }
    case "multiselect": {
      const cur = Array.isArray(value) ? value : [];
      return <div className="flex flex-wrap gap-1.5">{(f.options ?? []).map((o) => { const on = cur.includes(o); return <button key={o} type="button" disabled={dis} aria-pressed={on} onClick={() => onChange(on ? cur.filter((x) => x !== o) : [...cur, o])} className={chip(on)} style={chipRad}>{o}</button>; })}</div>;
    }
    case "relation": {
      const rows = Array.from(r.rows(f.target ?? "").values());
      const ids = asIds(value);
      if (f.many) return <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">{rows.map((x) => { const on = ids.includes(x.id); return <button key={x.id} type="button" disabled={dis} aria-pressed={on} onClick={() => onChange(on ? ids.filter((i) => i !== x.id) : [...ids, x.id])} className={chip(on)} style={chipRad}>{x.label}</button>; })}</div>;
      return (
        <div className="relative">
          <select {...common} value={ids[0] ?? ""} onChange={(e) => onChange(e.target.value ? [e.target.value] : [])} className={cn(base, "appearance-none pr-9")} style={rad}>
            <option value="">{f.placeholder ?? "Choose one"}</option>{rows.map((x) => <option key={x.id} value={x.id}>{x.label}{x.sub ? `  ·  ${x.sub}` : ""}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 opacity-55" />
        </div>
      );
    }
    case "file":
      return (
        <button type="button" {...common} onClick={() => onChange("photo-" + Math.floor(Math.random() * 90 + 10) + ".jpg")} className={cn("flex h-20 w-full items-center justify-center gap-2 border border-dashed border-current/30 text-sm opacity-80 transition hover:opacity-100")} style={rad}>
          {value ? <><Check className="size-4" /> {String(value)}</> : <><ImagePlus className="size-4" /> Add a photo</>}
        </button>
      );
    case "color":
      return <input {...common} type="color" value={String(value || "#3340ff")} onChange={(e) => onChange(e.target.value)} className="h-10 w-16 cursor-pointer rounded-lg border-0 bg-transparent p-0" />;
    default: {
      const type = f.type === "email" ? "email" : f.type === "phone" ? "tel" : f.type === "url" ? "url" : f.type === "date" ? "date" : "text";
      return <input {...common} type={type} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder ?? (f.type === "email" ? "name@example.com" : f.type === "phone" ? "+91 98765 43210" : undefined)} className={base} style={rad} />;
    }
  }
}

export function FormEl({ el, t }: { el: El; t: Theme }) {
  const mode = useMode();
  const nav = useNav();
  const router = useRouter();
  const src = useSrc();
  const setP = useSite((s) => s.setP);
  const addRecord = useStudio((s) => s.addRecord);
  const updateEntity = useStudio((s) => s.updateEntity);
  const [vals, setVals] = useState<Rec>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const p = el.p;
  const entity = src.entities.find((e) => e.slug === p.slug);
  const edit = mode === "edit";

  if (!entity) return edit ? <Note>Pick the table this form saves into, in the panel on the right.</Note> : null;
  if (!entity.collect)
    return edit ? (
      <Note tone="warn">
        “{entity.plural}” doesn’t accept entries from your website yet.{" "}
        <button className="font-medium underline underline-offset-2" onClick={() => updateEntity(entity.id, { collect: true })}>Turn it on</button>
      </Note>
    ) : null;

  const items = resolveFormFields(entity, p.fields, src);
  const look = (p.fieldStyle ?? "filled") as "filled" | "outlined" | "underline";
  const card = p.look !== "plain";
  const br = btnRadius(t, el.s.radius);
  const patchField = (key: string, patch: Record<string, unknown>) =>
    useSite.getState().edit((d) => {
      const l = locateEl(d, el.id);
      if (!l) return;
      const cur = (l.el.p.fields as { key: string }[]).length ? l.el.p.fields : items.map((i) => ({ key: i.f.key }));
      l.el.p.fields = cur.map((c: { key: string }) => (c.key === key ? { ...c, ...patch } : c));
    }, `ff:${el.id}:${key}`);
  const ts = typeStyle({ ...el, s: { size: 28, font: "head" } }, t, "head");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (edit) return;
    const er = validate(items, vals);
    setErrs(er);
    if (Object.keys(er).length) { (document.querySelector(`[data-ferr="${el.id}"]`) as HTMLElement | null)?.focus(); return; }
    addRecord(entity.id, buildRecord(entity, items, vals));
    toast.success(`Saved to ${entity.plural}`, { description: entity.approval ? "It waits for approval before showing on the site." : "Open Custom data in the manager to see it.", action: { label: "Open", onClick: () => router.push("/manager/entities") } });
    if (p.after === "page" && p.page) { nav(p.page); return; }
    if (p.after === "reset") { setVals({}); return; }
    setDone(true);
  };

  if (done)
    return (
      <div className={cn("text-center", card && "bg-[var(--s-surface)] p-8")} style={card ? { borderRadius: "calc(var(--s-radius) * 1.3)" } : undefined} role="status">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--s-brand)] text-[var(--s-on-brand)]"><Check className="size-6" /></span>
        <h3 className="mt-4 text-2xl" style={ts}>{p.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm opacity-75">{p.success}</p>
        <button type="button" onClick={() => { setVals({}); setDone(false); }} className="mt-5 text-sm font-medium underline underline-offset-4">Send another</button>
      </div>
    );

  const fillVar = card ? "var(--s-bg)" : "var(--s-surface)";
  const btnBg = p.btn === "accent" ? "var(--s-accent)" : p.btn === "ink" ? "var(--s-fg)" : "var(--s-brand)";
  const btnFg = p.btn === "accent" ? "var(--s-on-accent)" : p.btn === "ink" ? "var(--s-bg)" : "var(--s-on-brand)";
  const firstErr = Object.keys(errs)[0];

  return (
    <form onSubmit={submit} noValidate className={cn("@container w-full", card && "bg-[var(--s-surface)] p-6 @sm:p-8")} style={{ ...(card ? { borderRadius: "calc(var(--s-radius) * 1.3)" } : {}), ["--fill" as string]: fillVar, maxWidth: el.s.maxw || undefined, textAlign: "left", marginInline: el.s.align === "center" ? "auto" : undefined, marginLeft: el.s.align === "right" ? "auto" : undefined }}>
      {(p.showTitle || p.desc) && (
        <header className="mb-5">
          {p.showTitle && <EditableText tag="h3" value={p.title} onCommit={(x) => setP(el.id, "title", x)} single id={el.id} className={FS} style={{ ...ts, fontSize: undefined }} />}
          {(p.desc || edit) && <EditableText tag="p" value={p.desc} onCommit={(x) => setP(el.id, "desc", x)} id={el.id} className="mt-1.5 text-[15px] opacity-70" />}
        </header>
      )}
      {firstErr && <div role="alert" className="mb-4 rounded-lg bg-[#f0452b]/10 px-3.5 py-2.5 text-sm text-[#b3200a]">Please fix {Object.keys(errs).length === 1 ? "one thing" : `${Object.keys(errs).length} things`} below.</div>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {items.map((it) => {
          const err = errs[it.f.key];
          const isBool = it.f.type === "boolean";
          return (
            <div key={it.f.key} className={cn("col-span-2", it.f.half && "@sm:col-span-1")}>
              <label className="mb-1.5 block text-[13px] font-medium">
                {edit ? <EditableText value={it.f.label} onCommit={(x) => patchField(it.f.key, { label: x })} single /> : it.f.label}
                {it.f.required && <span aria-hidden className="ml-0.5 text-[var(--s-brand)]">*</span>}
                {!it.f.required && !isBool && <span className="ml-1.5 text-xs font-normal opacity-50">optional</span>}
              </label>
              <div className={edit ? "pointer-events-none" : undefined} {...(it.f.key === firstErr ? { "data-ferr": el.id, tabIndex: -1 } : {})}>
                <Control item={it} dis={edit} look={look} error={err} value={vals[it.f.key]} onChange={(v) => { setVals((s) => ({ ...s, [it.f.key]: v as never })); if (err) setErrs((s) => { const n = { ...s }; delete n[it.f.key]; return n; }); }} />
              </div>
              {err ? <p className="mt-1 text-xs text-[#b3200a]" role="alert">{err}</p> : it.f.help && !isBool ? <p className="mt-1 text-xs opacity-60">{it.f.help}</p> : null}
            </div>
          );
        })}
      </div>
      {!items.length && <Note>This form has no fields. Add some in the panel on the right.</Note>}
      <button type={edit ? "button" : "submit"} className="mt-6 inline-flex items-center gap-2 px-7 py-3 text-[15px] font-medium transition-transform hover:-translate-y-0.5" style={{ background: btnBg, color: btnFg, borderRadius: br }}>
        <EditableText value={p.submit} onCommit={(x) => setP(el.id, "submit", x)} single id={el.id} />
      </button>
      {edit && (
        <p className="mt-3 font-sans text-[11px] opacity-60">
          Saves to <b>{entity.plural}</b>{entity.approval ? ", then waits for approval" : ""}. Try it in Preview.
        </p>
      )}
    </form>
  );
}

/* ================================================================ DATA LIST */


export function DataListEl({ el, t }: { el: El; t: Theme }) {
  const mode = useMode();
  const src = useSrc();
  const r = useResolver();
  const products = useStudio((s) => s.products);
  const entity = src.entities.find((e) => e.slug === el.p.slug);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<string>("");
  const [shown, setShown] = useState<number | null>(null);
  const p = el.p;

  const pick = useMemo(() => {
    if (!entity) return null;
    const privateRel = (f: Field) => f.type === "relation" && !!f.target && !f.target.startsWith("@") && !src.entities.find((e) => e.id === f.target)?.publicOnStore;
    const f = entity.fields.filter((x) => !x.hidden && !privateRel(x) && !((x.type === "lookup" || x.type === "rollup") && privateRel(entity.fields.find((y) => y.key === x.via) ?? x)));
    const by = (k?: string) => (k && k !== "-" ? f.find((x) => x.key === k) : undefined);
    const titleF = by(p.titleKey) ?? f.find((x) => x.key === entity.titleField) ?? f.find((x) => x.type === "text") ?? f[0];
    const bodyF = p.bodyKey === "-" ? undefined : by(p.bodyKey) ?? f.find((x) => x.type === "longtext" && x !== titleF);
    const ratingF = p.ratingKey === "-" ? undefined : by(p.ratingKey) ?? f.find((x) => x.type === "rating");
    const picked = (p.fields as string[])?.length ? f.filter((x) => (p.fields as string[]).includes(x.key)) : f.filter((x) => x.inList && x !== titleF && x !== bodyF && x !== ratingF).slice(0, 4);
    const cover = p.coverKey ? entity.fields.find((x) => x.key === p.coverKey && x.type === "relation" && x.target === "@products") : undefined;
    const details = picked.filter((x) => x !== titleF && x !== bodyF && x !== ratingF && x !== cover);
    const filterF = p.filterKey ? f.find((x) => x.key === p.filterKey) : undefined;
    return { f, titleF, bodyF, ratingF, details, cover, filterF };
  }, [entity, src.entities, p.titleKey, p.bodyKey, p.ratingKey, p.fields, p.coverKey, p.filterKey]);

  if (!entity || !pick) return mode === "edit" ? <Note>Pick a table to show, in the panel on the right.</Note> : null;
  if (!entity.publicOnStore)
    return mode === "edit" ? <Note tone="warn">“{entity.plural}” is private, so visitors see nothing here.<br />Turn on “Show on your website” under Custom data → {entity.plural}.</Note> : null;

  const { titleF, bodyF, ratingF, details, cover, filterF } = pick;
  const disp = (f: Field, rec: Rec): string => {
    if (f.type === "relation") return asIds(rec[f.key]).map((id) => r.label(f.target ?? "", id)).join(", ");
    if (f.type === "lookup" || f.type === "rollup") {
      const c = r.compute(entity, rec, f);
      if (!c || c.value === undefined) return "";
      if (c.type === "currency") return `₹${Number(c.value).toLocaleString("en-IN")}`;
      return Array.isArray(c.value) ? c.value.join(", ") : String(typeof c.value === "number" ? c.value.toLocaleString("en-IN") : c.value);
    }
    if (f.type === "currency") return rec[f.key] === undefined ? "" : `₹${Number(rec[f.key]).toLocaleString("en-IN")}`;
    if (f.type === "percent") return rec[f.key] === undefined ? "" : `${rec[f.key]}%`;
    return plain(rec[f.key]);
  };

  let recs = entity.records.filter((x) => !(entity.approval && x._pending));
  if (p.where?.key && p.where?.value) {
    const wf = entity.fields.find((x) => x.key === p.where.key);
    recs = recs.filter((x) => { const v = x[p.where.key]; return Array.isArray(v) ? v.includes(p.where.value) : wf?.type === "relation" ? asIds(v).some((id) => r.label(wf.target ?? "", id) === p.where.value) : plain(v) === p.where.value; });
  }
  const chipValues = (rec: Rec): string[] => !filterF ? [] : filterF.type === "relation" ? asIds(rec[filterF.key]).map((id) => r.label(filterF.target ?? "", id)) : Array.isArray(rec[filterF.key]) ? (rec[filterF.key] as string[]) : rec[filterF.key] === undefined || rec[filterF.key] === "" ? [] : [plain(rec[filterF.key])];
  const chipOptions = filterF ? Array.from(new Set(recs.flatMap(chipValues))) : [];
  if (filterF && chip) recs = recs.filter((x) => chipValues(x).includes(chip));
  if (q.trim()) {
    const needle = q.toLowerCase();
    recs = recs.filter((x) => pick.f.some((f) => disp(f, x).toLowerCase().includes(needle)));
  }
  const sortVal = (x: Rec, f?: Field) => (f ? (f.type === "rating" || f.type === "number" || f.type === "currency" ? Number(x[f.key] ?? 0) : disp(f, x).toLowerCase()) : 0);
  if (p.sort === "oldest") recs = [...recs].reverse();
  else if (p.sort === "az" || p.sort === "za") recs = [...recs].sort((a, b) => String(sortVal(a, titleF)).localeCompare(String(sortVal(b, titleF)))), p.sort === "za" && recs.reverse();
  else if (p.sort === "rating" && ratingF) recs = [...recs].sort((a, b) => Number(b[ratingF.key] ?? 0) - Number(a[ratingF.key] ?? 0));
  else if (p.sort === "field" && p.sortKey) { const sf = entity.fields.find((x) => x.key === p.sortKey); recs = [...recs].sort((a, b) => { const x = sortVal(a, sf), y = sortVal(b, sf); return typeof x === "number" && typeof y === "number" ? y - x : String(x).localeCompare(String(y)); }); }

  const total = recs.length;
  const limit = shown ?? p.count;
  const list = recs.slice(0, limit);
  const ts = typeStyle({ ...el, s: { size: 20, font: "head" } }, t, "head");
  const showLabels = p.labels !== false;
  const coverProd = (rec: Rec) => cover ? products.find((x) => x.id === asIds(rec[cover.key])[0]) : undefined;

  const Detail = ({ f, rec, onDark }: { f: Field; rec: Rec; onDark?: boolean }) => {
    if (f.type === "boolean") return rec[f.key] ? <span className="inline-flex items-center gap-1"><BadgeCheck className="size-3.5" /> {f.label}</span> : null;
    if (f.type === "rating") return <span className="inline-flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-3.5", n <= Number(rec[f.key]) ? "fill-current" : "opacity-25")} />)}</span>;
    if (f.type === "color") return rec[f.key] ? <span className="inline-flex items-center gap-1"><i className="size-3 rounded-full border border-current/30" style={{ background: String(rec[f.key]) }} />{f.label}</span> : null;
    if (f.type === "multiselect" || f.type === "relation") {
      const vs = f.type === "relation" ? asIds(rec[f.key]).map((id) => r.label(f.target ?? "", id)) : (rec[f.key] as string[] | undefined) ?? [];
      if (!vs.length) return null;
      return <span className="inline-flex flex-wrap items-center gap-1">{showLabels && <span className="opacity-60">{f.label}:</span>}{vs.map((v) => <span key={v} className={cn("rounded-full px-2 py-0.5", onDark ? "bg-white/20" : "bg-current/10")}>{v}</span>)}</span>;
    }
    const v = disp(f, rec);
    if (!v) return null;
    return <span>{showLabels && <span className="opacity-60">{f.label} </span>}<span className={f.type === "select" ? "rounded-full bg-current/10 px-2 py-0.5" : ""}>{v}</span></span>;
  };

  const controls = (p.search || filterF) && (
    <div className="mb-5 flex flex-wrap items-center gap-3 font-sans">
      {p.search && (
        <label className="relative min-w-48 flex-1 @md:max-w-xs">
          <Search className="absolute left-3.5 top-3 size-4 opacity-50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={p.searchHint || `Search ${entity.plural.toLowerCase()}`} aria-label={`Search ${entity.plural}`} className="w-full bg-[var(--s-surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--s-fg)] outline-none focus:ring-2 focus:ring-[var(--s-brand)]/40" style={{ borderRadius: 999 }} />
        </label>
      )}
      {filterF && chipOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Filter by ${filterF.label}`}>
          {["", ...chipOptions].map((o) => <button key={o || "all"} onClick={() => setChip(o)} aria-pressed={chip === o} className={cn("px-3.5 py-1.5 text-[13px] transition", chip === o ? "bg-[var(--s-brand)] text-[var(--s-on-brand)]" : "border border-current/20 hover:border-current/50")} style={{ borderRadius: 999 }}>{o || "All"}</button>)}
        </div>
      )}
    </div>
  );

  let body: React.ReactNode;
  if (!list.length) body = <Note>{q || chip ? "Nothing matches. Try clearing the search or filter." : p.empty || `No ${entity.plural.toLowerCase()} yet.`}</Note>;
  else if (p.view === "accordion")
    body = (
      <div className="divide-y divide-current/15 border-y border-current/15">
        {list.map((x) => {
          const id = String(x.id); const isOpen = open === id;
          return (
            <div key={id}>
              <button onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 py-4 text-left text-lg font-medium">
                {titleF ? disp(titleF, x) : ""}<ChevronDown className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && <div className="pb-5 text-[15px] leading-relaxed opacity-75">{bodyF && <p>{disp(bodyF, x)}</p>}{details.length > 0 && <p className="mt-2 flex flex-wrap gap-x-3 text-sm opacity-80">{details.map((f) => <Detail key={f.id} f={f} rec={x} />)}</p>}</div>}
            </div>
          );
        })}
      </div>
    );
  else if (p.view === "list")
    body = (
      <ul className="divide-y divide-current/15">
        {list.map((x) => (
          <li key={String(x.id)} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
            <span className="font-medium">{titleF ? disp(titleF, x) : ""}</span>
            <span className="flex flex-wrap gap-x-4 text-sm opacity-70">{[ratingF, ...details].filter(Boolean).map((f) => <Detail key={f!.id} f={f!} rec={x} />)}</span>
          </li>
        ))}
      </ul>
    );
  else if (p.view === "table")
    body = (
      <div className="overflow-x-auto" style={{ borderRadius: "var(--s-radius)", background: "var(--s-surface)" }}>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-current/15 text-xs opacity-65">{[titleF, ratingF, ...details].filter(Boolean).map((f) => <th key={f!.id} className="px-4 py-3 font-medium">{f!.label}</th>)}</tr></thead>
          <tbody>{list.map((x) => <tr key={String(x.id)} className="border-b border-current/10 last:border-0">{[titleF, ratingF, ...details].filter(Boolean).map((f, i) => <td key={f!.id} className={cn("px-4 py-3", i === 0 && "font-medium")}>{f!.type === "rating" ? <Detail f={f!} rec={x} /> : disp(f!, x) || <span className="opacity-40">–</span>}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  else
    body = (
      <div className="grid gap-4 @3xl:[grid-template-columns:repeat(var(--ec),minmax(0,1fr))]" style={{ ["--ec" as string]: Math.max(1, p.cols) }}>
        {list.map((x, i) => {
          const hot = p.view === "quote" && i % 3 === 0;
          const prod = coverProd(x);
          return (
            <figure key={String(x.id)} className={cn("overflow-hidden", !prod && "p-5", hot ? "bg-[var(--s-brand)] text-[var(--s-on-brand)]" : "bg-[var(--s-surface)] text-[var(--s-fg)]")} style={{ borderRadius: "var(--s-radius)" }}>
              {prod && <ProductArt pattern={prod.pattern} tone={prod.tone} rounded="rounded-none" className="!aspect-[16/10]" />}
              <div className={cn(prod && "p-5")}>
                {ratingF && <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("size-4", n <= Number(x[ratingF.key]) ? "fill-current" : "opacity-25")} />)}</div>}
                {titleF && <div className={cn("font-medium leading-snug", ratingF && "mt-3")} style={{ fontFamily: ts.fontFamily, fontWeight: ts.fontWeight, letterSpacing: ts.letterSpacing, fontSize: 20, lineHeight: 1.2 }}>{disp(titleF, x)}</div>}
                {bodyF && <p className="mt-2 text-sm leading-relaxed opacity-80">{disp(bodyF, x)}</p>}
                {details.length > 0 && <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs opacity-85">{details.map((f) => <Detail key={f.id} f={f} rec={x} onDark={hot} />)}</figcaption>}
              </div>
            </figure>
          );
        })}
      </div>
    );

  return (
    <div className="@container w-full">
      {controls}
      {body}
      {p.more && total > limit && <div className="mt-6 text-center"><button onClick={() => setShown(limit + p.count)} className="px-6 py-2.5 text-sm font-medium transition hover:-translate-y-0.5" style={{ border: "1.5px solid currentColor", borderRadius: 999 }}>Show more ({total - limit})</button></div>}
      {mode === "edit" && <p className="mt-3 font-sans text-[11px] opacity-60">Live from <b>{entity.plural}</b> · {total} {total === 1 ? "record" : "records"}{entity.approval ? ", approved only" : ""}</p>}
    </div>
  );
}
