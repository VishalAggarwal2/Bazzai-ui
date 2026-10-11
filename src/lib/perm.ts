import { resources, type Entity, type Role } from "./data";

export const roleChain = (roles: Role[], id: string): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  let cur = roles.find((r) => r.id === id)?.inherits;
  while (cur && !seen.has(cur)) { seen.add(cur); out.push(cur); cur = roles.find((r) => r.id === cur)?.inherits; }
  return out;
};
/** Resource rows = built-ins plus one row per custom table the store has created. */
export const resourceRows = (entities: Entity[]) => [
  ...resources.filter((r) => !("custom" in r && r.custom)).map((r) => ({ ...r, custom: false })),
  ...entities.filter((e) => !e.system).map((e) => ({ id: e.slug, label: e.plural, custom: true })),
];
export const effectivePerm = (roles: Role[], matrix: Record<string, Record<string, string>>, roleId: string, res: string, overrides?: Record<string, string>) => {
  if (roleId === "owner") return "vcedx";
  const own = matrix[roleId]?.[res] ?? "";
  const inh = roleChain(roles, roleId).map((i) => matrix[i]?.[res] ?? "").join("");
  const extra = overrides?.[res] ?? "";
  return Array.from(new Set((own + inh + extra).split(""))).join("");
};
