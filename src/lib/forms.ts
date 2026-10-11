import type { Entity, Field, Rec } from "./data";
import type { FormField } from "./builder";
import { asIds, type Src } from "./relations";

export const computed = (f: Field) => f.type === "lookup" || f.type === "rollup";

/** Fields a visitor can sensibly fill in: no calculated or private fields, and no links to tables that aren't public. */
export function eligibleFields(entity: Entity, src: Src): Field[] {
  return entity.fields.filter((f) => {
    if (computed(f) || f.hidden) return false;
    if (f.type === "relation" && f.target && !f.target.startsWith("@")) return !!src.entities.find((e) => e.id === f.target)?.publicOnStore;
    return true;
  });
}

export type FormItem = { f: Field; cfg: FormField };

/** The form's field list. An empty config means "everything eligible, in table order". */
export function resolveFormFields(entity: Entity, cfg: FormField[] | undefined, src: Src): FormItem[] {
  const ok = eligibleFields(entity, src);
  const list: FormField[] = cfg && cfg.length ? cfg : ok.map((f) => ({ key: f.key }));
  const out: FormItem[] = [];
  for (const c of list) {
    const base = entity.fields.find((x) => x.key === c.key);
    if (!base || computed(base)) continue;
    out.push({
      cfg: c,
      f: { ...base, label: c.label ?? base.label, placeholder: c.placeholder ?? base.placeholder, help: c.help ?? base.help, required: c.required ?? base.required, half: c.half ?? base.half },
    });
  }
  return out;
}

export function validate(items: FormItem[], vals: Rec): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const { f } of items) {
    const v = vals[f.key];
    const empty = v === undefined || v === "" || (Array.isArray(v) && !v.length);
    if (empty) { if (f.required) errs[f.key] = f.type === "relation" ? `Choose ${f.label.toLowerCase()}` : `${f.label} is required`; continue; }
    if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(String(v))) errs[f.key] = "Enter a valid email address";
    if (f.type === "url" && !/^https?:\/\/\S+/.test(String(v))) errs[f.key] = "Start the link with https://";
    if (f.type === "phone" && String(v).replace(/\D/g, "").length < 8) errs[f.key] = "Enter a phone number with at least 8 digits";
    if (["number", "currency", "percent"].includes(f.type)) {
      const n = Number(v);
      if (f.min !== undefined && n < f.min) errs[f.key] = `Must be at least ${f.min}`;
      if (f.max !== undefined && n > f.max) errs[f.key] = `Must be at most ${f.max}`;
    }
  }
  return errs;
}

/** What gets saved: the visitor's answers plus bookkeeping, and defaults for private fields like status. */
export function buildRecord(entity: Entity, items: FormItem[], vals: Rec): Rec {
  const rec: Rec = {};
  for (const f of entity.fields) {
    if (computed(f)) continue;
    const shown = items.some((i) => i.f.key === f.key);
    const v = vals[f.key];
    if (shown && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)) rec[f.key] = v;
    else if (f.defaultValue) rec[f.key] = f.defaultValue;
    else if (!shown && f.type === "select" && f.options?.length && f.hidden) rec[f.key] = f.options[0];
  }
  rec._src = "Website form";
  rec._at = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  if (entity.approval) rec._pending = true;
  return rec;
}

/** Plain-text version of a stored value, resolving links to names. */
export function plain(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (v === true) return "Yes";
  if (v === false) return "No";
  return String(v ?? "");
}
export { asIds };
