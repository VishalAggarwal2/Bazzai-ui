"use client";
import { useMemo } from "react";
import { orders, type Agg, type Entity, type Field, type FieldType, type Person, type Product, type Rec } from "./data";
import { useStudio, catPath } from "./store";

/** A relation can point at one of your own tables ("e5") or at a built-in source ("@products", "@orders", "@people"). */
export type Src = { entities: Entity[]; products: Product[]; people: Person[]; categories: { id: string; name: string; parentId: string | null }[] };
export type TargetInfo = { id: string; name: string; plural: string; icon: string; color: string; builtin: boolean };
export type Row = { id: string; label: string; sub?: string; data: Record<string, unknown> };
export type Attr = { key: string; label: string; field: Field };

export type Val = string | number | boolean | string[] | undefined;

export const builtins: TargetInfo[] = [
  { id: "@products", name: "Product", plural: "Products", icon: "Package", color: "#7a3cff", builtin: true },
  { id: "@orders", name: "Order", plural: "Orders", icon: "Truck", color: "#e08a00", builtin: true },
  { id: "@people", name: "Team member", plural: "Team members", icon: "Users", color: "#1f7a4d", builtin: true },
];

export const asIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v === undefined || v === null || v === "" ? [] : [String(v)]);

export function targetsOf(src: Src): TargetInfo[] {
  const own = src.entities.filter((e) => !e.system).map((e) => ({ id: e.id, name: e.name, plural: e.plural, icon: e.icon, color: e.color ?? "#3340ff", builtin: false }));
  return [...own, ...builtins];
}
export const targetInfo = (src: Src, id?: string): TargetInfo | undefined => (id ? targetsOf(src).find((t) => t.id === id) : undefined);

const f = (key: string, label: string, type: FieldType, extra: Partial<Field> = {}): Attr => ({ key, label, field: { id: key, key, label, type, ...extra } });

export function attrsOf(src: Src, target: string): Attr[] {
  if (target === "@products") {
    const pe = src.entities.find((e) => e.system);
    const custom = (pe?.fields ?? []).filter((x) => !["name", "price"].includes(x.key)).map((x) => ({ key: x.key, label: x.label, field: x }));
    return [f("name", "Name", "text"), f("price", "Price", "currency"), f("sku", "SKU", "text"), f("stock", "Stock", "number"), f("status", "Status", "text"), f("category", "Category", "text"), ...custom];
  }
  if (target === "@orders") return [f("id", "Order no.", "text"), f("customer", "Customer", "text"), f("total", "Total", "currency"), f("items", "Items", "number"), f("status", "Status", "text"), f("channel", "Channel", "text"), f("city", "City", "text")];
  if (target === "@people") return [f("name", "Name", "text"), f("email", "Email", "email"), f("title", "Title", "text"), f("status", "Status", "text")];
  const e = src.entities.find((x) => x.id === target);
  return (e?.fields ?? []).filter((x) => x.type !== "relation" && x.type !== "lookup" && x.type !== "rollup").map((x) => ({ key: x.key, label: x.label, field: x }));
}

export const titleKeyOf = (e: Entity) => e.titleField && e.fields.some((x) => x.key === e.titleField) ? e.titleField : (e.fields.find((x) => x.type === "text") ?? e.fields[0])?.key;

export function rowsOf(src: Src, target: string): Row[] {
  if (target === "@products") return src.products.map((p) => ({ id: p.id, label: p.name, sub: p.sku, data: { ...p.custom, name: p.name, price: p.price, sku: p.sku, stock: p.stock, status: p.status, category: catPath(src.categories as never, p.categoryId) } }));
  if (target === "@orders") return orders.map((o) => ({ id: o.id, label: o.id, sub: `${o.customer} · ₹${o.total.toLocaleString("en-IN")}`, data: { ...o } }));
  if (target === "@people") return src.people.map((p) => ({ id: p.id, label: p.name, sub: p.title ?? p.email, data: { name: p.name, email: p.email, title: p.title, status: p.status } }));
  const e = src.entities.find((x) => x.id === target);
  if (!e) return [];
  const tk = titleKeyOf(e);
  const subF = e.fields.find((x) => x.inList && x.key !== tk && !["relation", "lookup", "rollup", "longtext", "file"].includes(x.type));
  return e.records.map((r) => ({ id: String(r.id), label: String(tk ? r[tk] ?? "" : "") || "Untitled", sub: subF && r[subF.key] !== undefined ? String(r[subF.key]) : undefined, data: r }));
}

/** Everything that needs the other tables, with a small cache so a big table doesn't re-scan per cell. */
export function makeResolver(src: Src) {
  const cache = new Map<string, Map<string, Row>>();
  const rows = (t: string) => {
    let m = cache.get(t);
    if (!m) { m = new Map(rowsOf(src, t).map((r) => [r.id, r])); cache.set(t, m); }
    return m;
  };
  const label = (t: string, id: string) => rows(t).get(id)?.label ?? "Deleted record";
  const row = (t: string, id: string) => rows(t).get(id);

  /** Value of a lookup or rollup column, plus how to draw it. */
  function compute(entity: Entity, rec: Rec, field: Field): { type: FieldType; field: Field; value: Val } | null {
    const rel = entity.fields.find((x) => x.key === field.via && x.type === "relation");
    if (!rel?.target) return null;
    const ids = asIds(rec[rel.key]);
    const attr = attrsOf(src, rel.target).find((a) => a.key === field.show);
    const picked = ids.map((id) => row(rel.target!, id)).filter(Boolean) as Row[];
    if (field.type === "lookup") {
      const af = attr?.field ?? { id: "x", key: "x", label: "", type: "text" as FieldType };
      const vals = picked.map((r) => r.data[field.show ?? ""]).filter((v) => v !== undefined && v !== "") as (string | number | boolean)[];
      if (!vals.length) return { type: "text", field: af, value: undefined };
      if (vals.length === 1) return { type: af.type, field: af, value: vals[0] };
      return { type: "multiselect", field: af, value: vals.map(String) };
    }
    const agg: Agg = field.agg ?? "count";
    if (agg === "count") return { type: "number", field, value: ids.length };
    if (agg === "list") return { type: "multiselect", field, value: picked.map((r) => attr ? String(r.data[attr.key] ?? "") : r.label).filter(Boolean) };
    const nums = picked.map((r) => Number(r.data[field.show ?? ""])).filter((n) => Number.isFinite(n));
    if (!nums.length) return { type: "number", field, value: undefined };
    const sum = nums.reduce((a, b) => a + b, 0);
    const v = agg === "sum" ? sum : agg === "avg" ? Math.round(sum / nums.length) : agg === "min" ? Math.min(...nums) : Math.max(...nums);
    return { type: attr?.field.type === "currency" ? "currency" : "number", field, value: v };
  }

  /** Records in other tables that point at this one. */
  function inbound(target: string, recId: string) {
    const out: { entity: Entity; field: Field; title: string; records: Row[] }[] = [];
    for (const e of src.entities) {
      for (const fl of e.fields) {
        if (fl.type !== "relation" || fl.target !== target) continue;
        const hits = e.records.filter((r) => asIds(r[fl.key]).includes(recId));
        if (!hits.length) continue;
        const tk = titleKeyOf(e);
        out.push({ entity: e, field: fl, title: fl.inverse || e.plural, records: hits.map((r) => ({ id: String(r.id), label: String(tk ? r[tk] ?? "" : "") || "Untitled", data: r })) });
      }
    }
    return out;
  }
  return { rows, label, row, compute, inbound };
}
export type Resolver = ReturnType<typeof makeResolver>;

export function useResolver(): Resolver {
  const entities = useStudio((s) => s.entities);
  const products = useStudio((s) => s.products);
  const people = useStudio((s) => s.people);
  const categories = useStudio((s) => s.categories);
  return useMemo(() => makeResolver({ entities, products, people, categories }), [entities, products, people, categories]);
}
export function useSrc(): Src {
  const entities = useStudio((s) => s.entities);
  const products = useStudio((s) => s.products);
  const people = useStudio((s) => s.people);
  const categories = useStudio((s) => s.categories);
  return useMemo(() => ({ entities, products, people, categories }), [entities, products, people, categories]);
}

/** Every relation in the workspace as an edge, for the map. */
export function relationEdges(src: Src) {
  const out: { from: string; to: string; field: Field; fromName: string }[] = [];
  for (const e of src.entities) for (const fl of e.fields) if (fl.type === "relation" && fl.target) out.push({ from: e.system ? "@products" : e.id, to: fl.target, field: fl, fromName: e.plural });
  return out;
}
