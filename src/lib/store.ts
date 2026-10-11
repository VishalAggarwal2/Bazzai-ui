"use client";
import { create } from "zustand";
import {
  categorySeed, entitySeed, people as seedPeople, productSeed, seedMatrix, teamSeed, roles as seedRoles,
  type Category, type Entity, type Field, type Person, type Product, type Rec, type Role, type Team,
} from "./data";
import type { EntityTemplate } from "./entity-templates";

export const uid = () => Math.random().toString(36).slice(2, 8);
const slugify = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type State = {
  helpers: boolean;
  setHelpers: (v: boolean) => void;
  tenantId: string;
  setTenant: (id: string) => void;

  /* products */
  products: Product[];
  categories: Category[];
  addProduct: (p: Partial<Product>) => string;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  bulkUpdateProducts: (ids: string[], patch: Partial<Product>) => void;
  removeProducts: (ids: string[]) => void;
  duplicateProduct: (id: string) => string;
  addCategory: (name: string, parentId: string | null) => string;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  moveCategory: (id: string, parentId: string | null, index?: number) => void;

  /* people */
  people: Person[];
  teams: Team[];
  addPeople: (emails: string[], base: { roleId: string; parentId: string | null; scope: string; teamIds?: string[] }) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  bulkUpdatePeople: (ids: string[], patch: Partial<Person>) => void;
  removePeople: (ids: string[]) => void;
  setParent: (id: string, parentId: string | null) => boolean;
  setPersonRole: (personId: string, roleId: string) => void;
  setOverride: (personId: string, res: string, value: string | null) => void;
  addTeam: (name: string) => string;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  removeTeam: (id: string) => void;

  /* roles */
  roles: Role[];
  matrix: Record<string, Record<string, string>>;
  addRole: (name: string, copyFrom: string) => string;
  updateRole: (id: string, patch: Partial<Role>) => void;
  removeRole: (id: string, reassignTo: string) => void;
  togglePerm: (role: string, res: string, act: string) => void;
  setPerm: (role: string, res: string, value: string) => void;

  /* custom data */
  entities: Entity[];
  addEntity: (name: string, tpl?: EntityTemplate) => string;
  updateEntity: (id: string, patch: Partial<Entity>) => void;
  removeEntity: (id: string) => void;
  duplicateEntity: (id: string) => string;
  addField: (entityId: string, f: Omit<Field, "id">) => string;
  updateField: (entityId: string, fieldId: string, patch: Partial<Field>) => void;
  removeField: (entityId: string, fieldId: string) => void;
  reorderFields: (entityId: string, fields: Field[]) => void;
  setEntityPublic: (entityId: string, v: boolean) => void;
  addRecord: (entityId: string, rec: Rec) => string;
  updateRecord: (entityId: string, recId: string, patch: Rec) => void;
  removeRecords: (entityId: string, ids: string[]) => void;
  duplicateRecord: (entityId: string, recId: string) => void;
};

const mapE = (s: State, id: string, fn: (e: Entity) => Entity) => ({ entities: s.entities.map((e) => (e.id === id ? fn(e) : e)) });

/** Drop links to deleted records so nothing points at a ghost. */
const unlink = (entities: Entity[], target: string, ids: string[]): Entity[] =>
  entities.map((e) => {
    if (!e.fields.some((f) => f.type === "relation" && f.target === target)) return e;
    return {
      ...e,
      records: e.records.map((r) => {
        let next = r;
        for (const f of e.fields) {
          if (f.type !== "relation" || f.target !== target) continue;
          const cur = r[f.key];
          const arr = Array.isArray(cur) ? cur : cur ? [String(cur)] : [];
          const kept = arr.filter((x) => !ids.includes(x));
          if (kept.length !== arr.length) next = { ...next, [f.key]: kept };
        }
        return next;
      }),
    };
  });

export const useStudio = create<State>((set, get) => ({
  helpers: true,
  setHelpers: (helpers) => set({ helpers }),
  tenantId: "t1",
  setTenant: (tenantId) => set({ tenantId }),

  /* ---------- products ---------- */
  products: productSeed,
  categories: categorySeed,
  addProduct: (p) => {
    const id = `p-${uid()}`;
    const first = get().categories[0];
    set((s) => ({
      products: [
        {
          id, name: "Untitled product", sku: `KT-NEW-${Math.floor(100 + Math.random() * 900)}`, price: 0, stock: 0, reorder: 10, status: "draft",
          tone: first?.tone ?? ["#3340ff", "#dfe3ff"], pattern: first?.pattern ?? "stripes", sold: 0, categoryId: first?.id ?? "", description: "",
          tags: [], options: [], custom: {}, ...p,
        },
        ...s.products,
      ],
    }));
    return id;
  },
  updateProduct: (id, patch) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  bulkUpdateProducts: (ids, patch) => set((s) => ({ products: s.products.map((p) => (ids.includes(p.id) ? { ...p, ...patch } : p)) })),
  removeProducts: (ids) => set((s) => ({ products: s.products.filter((p) => !ids.includes(p.id)), entities: unlink(s.entities, "@products", ids) })),
  duplicateProduct: (id) => {
    const nid = `p-${uid()}`;
    set((s) => {
      const src = s.products.find((p) => p.id === id);
      if (!src) return s;
      return { products: [{ ...src, id: nid, name: `${src.name} (copy)`, sku: `${src.sku}-C`, status: "draft", sold: 0 }, ...s.products] };
    });
    return nid;
  },
  addCategory: (name, parentId) => {
    const id = `c-${uid()}`;
    const parent = get().categories.find((c) => c.id === parentId);
    set((s) => ({
      categories: [...s.categories, { id, name, parentId, description: "", tone: parent?.tone ?? ["#3340ff", "#ffb61e"], pattern: parent?.pattern ?? "stripes", visible: true }],
    }));
    return id;
  },
  updateCategory: (id, patch) => set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  removeCategory: (id) =>
    set((s) => {
      const target = s.categories.find((c) => c.id === id);
      const up = target?.parentId ?? null;
      return {
        categories: s.categories.filter((c) => c.id !== id).map((c) => (c.parentId === id ? { ...c, parentId: up } : c)),
        products: s.products.map((p) => (p.categoryId === id ? { ...p, categoryId: up ?? "" } : p)),
      };
    }),
  moveCategory: (id, parentId, index) =>
    set((s) => {
      // refuse to drop a category inside itself
      let cur = parentId;
      while (cur) { if (cur === id) return s; cur = s.categories.find((c) => c.id === cur)?.parentId ?? null; }
      const moving = s.categories.find((c) => c.id === id);
      if (!moving) return s;
      const rest = s.categories.filter((c) => c.id !== id);
      const sibs = rest.filter((c) => c.parentId === parentId);
      const at = index === undefined || index >= sibs.length ? -1 : rest.indexOf(sibs[index]);
      const next = { ...moving, parentId };
      if (at === -1) return { categories: [...rest, next] };
      return { categories: [...rest.slice(0, at), next, ...rest.slice(at)] };
    }),

  /* ---------- people ---------- */
  people: seedPeople,
  teams: teamSeed,
  addPeople: (emails, base) =>
    set((s) => ({
      people: [
        ...s.people,
        ...emails.map((email) => ({
          id: `u-${uid()}`, name: email, email, roleId: base.roleId, parentId: base.parentId, scope: base.scope || "All branches",
          status: "invited" as const, last: "Invite sent", color: "#888fb0", teamIds: base.teamIds ?? [],
        })),
      ],
    })),
  updatePerson: (id, patch) => set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  bulkUpdatePeople: (ids, patch) => set((s) => ({ people: s.people.map((p) => (ids.includes(p.id) ? { ...p, ...patch } : p)) })),
  removePeople: (ids) =>
    set((s) => {
      const gone = s.people.filter((p) => ids.includes(p.id));
      return {
        entities: unlink(s.entities, "@people", ids),
        people: s.people
          .filter((p) => !ids.includes(p.id))
          .map((p) => {
            let par = p.parentId;
            while (par && ids.includes(par)) par = gone.find((g) => g.id === par)?.parentId ?? null;
            return par === p.parentId ? p : { ...p, parentId: par };
          }),
      };
    }),
  setParent: (id, parentId) => {
    const s = get();
    let cur = parentId;
    while (cur) { if (cur === id) return false; cur = s.people.find((p) => p.id === cur)?.parentId ?? null; }
    set({ people: s.people.map((p) => (p.id === id ? { ...p, parentId } : p)) });
    return true;
  },
  setPersonRole: (personId, roleId) => set((s) => ({ people: s.people.map((p) => (p.id === personId ? { ...p, roleId } : p)) })),
  setOverride: (personId, res, value) =>
    set((s) => ({
      people: s.people.map((p) => {
        if (p.id !== personId) return p;
        const o = { ...(p.overrides ?? {}) };
        if (value === null) delete o[res]; else o[res] = value;
        return { ...p, overrides: o };
      }),
    })),
  addTeam: (name) => {
    const id = `tm-${uid()}`;
    const palette = ["#3340ff", "#1f7a4d", "#e08a00", "#d8386b", "#7a3cff", "#0f6b5c"];
    set((s) => ({ teams: [...s.teams, { id, name, color: palette[s.teams.length % palette.length], description: "" }] }));
    return id;
  },
  updateTeam: (id, patch) => set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  removeTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id), people: s.people.map((p) => ({ ...p, teamIds: (p.teamIds ?? []).filter((t) => t !== id) })) })),

  /* ---------- roles ---------- */
  roles: seedRoles,
  matrix: seedMatrix,
  addRole: (name, copyFrom) => {
    const id = `role-${uid()}`;
    set((s) => {
      const src = s.roles.find((r) => r.id === copyFrom);
      return {
        roles: [...s.roles, { id, name, description: "Custom role", tone: "#3340ff", flags: [...(src?.flags ?? [])], refundLimit: src?.refundLimit, discountLimit: src?.discountLimit }],
        matrix: { ...s.matrix, [id]: { ...(s.matrix[copyFrom] ?? {}) } },
      };
    });
    return id;
  },
  updateRole: (id, patch) => set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
  removeRole: (id, reassignTo) =>
    set((s) => ({
      roles: s.roles.filter((r) => r.id !== id).map((r) => (r.inherits === id ? { ...r, inherits: s.roles.find((x) => x.id === id)?.inherits } : r)),
      people: s.people.map((p) => (p.roleId === id ? { ...p, roleId: reassignTo } : p)),
    })),
  togglePerm: (role, res, act) =>
    set((s) => {
      const cur = s.matrix[role]?.[res] ?? "";
      const next = cur.includes(act) ? cur.replace(act, "") : cur + act;
      const fixed = next.length && !next.includes("v") ? "v" + next : next;
      const cleaned = act === "v" && cur.includes("v") ? "" : fixed;
      return { matrix: { ...s.matrix, [role]: { ...s.matrix[role], [res]: cleaned } } };
    }),
  setPerm: (role, res, value) => set((s) => ({ matrix: { ...s.matrix, [role]: { ...s.matrix[role], [res]: value } } })),

  /* ---------- custom data ---------- */
  entities: entitySeed,
  addEntity: (name, tpl) => {
    const id = `e-${uid()}`;
    const slug = slugify(name) || id;
    set((s) => ({
      entities: [
        ...s.entities,
        {
          id, name, plural: tpl?.plural ?? name, slug, icon: tpl?.icon ?? "Boxes", color: tpl?.color ?? "#3340ff", publicOnStore: false,
          description: tpl?.description ?? "Describe what this collects.", view: tpl?.view ?? "table", boardField: tpl?.boardField, titleField: tpl?.titleField ?? "title",
          fields: tpl ? tpl.fields.map((f) => ({ ...f, id: `f-${uid()}` })) : [{ id: `f-${uid()}`, key: "title", label: "Title", type: "text", required: true, inList: true }],
          records: tpl ? tpl.records.map((r) => ({ ...r, id: `r-${uid()}` })) : [],
        },
      ],
    }));
    return id;
  },
  updateEntity: (id, patch) => set((s) => mapE(s, id, (e) => ({ ...e, ...patch }))),
  removeEntity: (id) => set((s) => ({
    entities: s.entities.filter((e) => e.id !== id).map((e) => ({ ...e, fields: e.fields.filter((f) => !(f.type === "relation" && f.target === id)).filter((f) => !((f.type === "lookup" || f.type === "rollup") && !e.fields.some((x) => x.key === f.via && !(x.type === "relation" && x.target === id)))) })),
  })),
  duplicateEntity: (id) => {
    const nid = `e-${uid()}`;
    set((s) => {
      const src = s.entities.find((e) => e.id === id);
      if (!src) return s;
      return { entities: [...s.entities, { ...src, id: nid, name: `${src.name} copy`, plural: `${src.plural} copy`, slug: `${src.slug}-copy`, system: false, publicOnStore: false, records: [] }] };
    });
    return nid;
  },
  addField: (entityId, f) => {
    const id = `f-${uid()}`;
    set((s) => mapE(s, entityId, (e) => ({ ...e, fields: [...e.fields, { ...f, id }] })));
    return id;
  },
  updateField: (entityId, fieldId, patch) => set((s) => mapE(s, entityId, (e) => ({ ...e, fields: e.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) }))),
  removeField: (entityId, fieldId) => set((s) => mapE(s, entityId, (e) => ({ ...e, fields: e.fields.filter((f) => f.id !== fieldId) }))),
  reorderFields: (entityId, fields) => set((s) => mapE(s, entityId, (e) => ({ ...e, fields }))),
  setEntityPublic: (entityId, v) => set((s) => mapE(s, entityId, (e) => ({ ...e, publicOnStore: v }))),
  addRecord: (entityId, rec) => {
    const id = `r-${uid()}`;
    set((s) => mapE(s, entityId, (e) => ({ ...e, records: [{ id, ...rec }, ...e.records] })));
    return id;
  },
  updateRecord: (entityId, recId, patch) => set((s) => mapE(s, entityId, (e) => ({ ...e, records: e.records.map((r) => (r.id === recId ? { ...r, ...patch } : r)) }))),
  removeRecords: (entityId, ids) => set((s) => ({ ...mapE(s, entityId, (e) => ({ ...e, records: e.records.filter((r) => !ids.includes(String(r.id))) })), entities: unlink(mapE(s, entityId, (e) => ({ ...e, records: e.records.filter((r) => !ids.includes(String(r.id))) })).entities, entityId, ids) })),
  duplicateRecord: (entityId, recId) =>
    set((s) => mapE(s, entityId, (e) => {
      const src = e.records.find((r) => r.id === recId);
      return src ? { ...e, records: [{ ...src, id: `r-${uid()}` }, ...e.records] } : e;
    })),
}));

export const catPath = (cats: Category[], id: string) => {
  const out: string[] = [];
  let cur = cats.find((c) => c.id === id);
  while (cur) { out.unshift(cur.name); cur = cats.find((c) => c.id === cur!.parentId); }
  return out.join(" › ");
};
