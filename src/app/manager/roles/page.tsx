"use client";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { CornerDownRight, Copy, Eye, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { actions, specialPerms, type Role } from "@/lib/data";
import { initials } from "@/lib/format";
import { effectivePerm, resourceRows, roleChain } from "@/lib/perm";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const tones = ["#3340ff", "#1f7a4d", "#e08a00", "#f0452b", "#7a3cff", "#d8386b", "#0f6b5c", "#244a63"];
const presets: { id: string; label: string; make: (core: boolean) => string }[] = [
  { id: "none", label: "No access", make: () => "" },
  { id: "read", label: "Read only", make: () => "v" },
  { id: "edit", label: "Editor", make: () => "vce" },
  { id: "full", label: "Full access", make: () => "vcedx" },
];

export default function RolesPage() {
  const { roles, matrix, togglePerm, setPerm, addRole, updateRole, removeRole, people, entities } = useStudio();
  const [sel, setSel] = useState("manager");
  const [dlg, setDlg] = useState(false);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("cashier");
  const [del, setDel] = useState(false);
  const [reassign, setReassign] = useState("cashier");
  const role = (roles.find((r) => r.id === sel) ?? roles[0]) as Role;
  const rows = resourceRows(entities);
  const inheritedIds = roleChain(roles, role.id);
  const own = matrix[role.id] ?? {};
  const inh = (res: string) => inheritedIds.map((i) => matrix[i]?.[res] ?? "").join("");
  const locked = role.id === "owner";
  const members = people.filter((p) => p.roleId === role.id);
  const downstream = (id: string): string[] => roles.filter((r) => r.inherits === id).flatMap((r) => [r.id, ...downstream(r.id)]);
  const flags = role.flags ?? [];
  const setFlag = (id: string, on: boolean) => updateRole(role.id, { flags: on ? [...flags, id] : flags.filter((f) => f !== id) });

  const ordered = (() => {
    const out: { r: Role; depth: number }[] = [];
    const walk = (r: Role, d: number) => { out.push({ r, depth: d }); roles.filter((x) => x.inherits === r.id).forEach((c) => walk(c, d + 1)); };
    roles.filter((r) => !r.inherits || !roles.some((o) => o.id === r.inherits)).forEach((r) => walk(r, 0));
    return out;
  })();
  const colAll = (a: string) => rows.every((r) => (own[r.id] ?? "").includes(a));

  return (
    <>
      <PageHeader
        title="Roles and access"
        description="Build roles that match how your business works. Roles can inherit from each other, set their own limits, and every custom table you create gets its own row automatically."
        actions={
          <Dialog open={dlg} onOpenChange={setDlg}>
            <DialogTrigger asChild><Button variant="brand"><Plus /> New role</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a role</DialogTitle><DialogDescription>Start from an existing role and adjust. You can change anything later.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5"><Label>Role name</Label><Input suggest="roleName" placeholder="e.g. Visual merchandiser" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Start from</Label>
                  <Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <DialogFooter><Button variant="brand" disabled={!name.trim()} onClick={() => { const id = addRole(name.trim(), from); setSel(id); setName(""); setDlg(false); toast.success("Role created", { description: "Copied permissions from " + roles.find((r) => r.id === from)?.name + "." }); }}>Create role</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="h-fit space-y-1 rounded-3xl border bg-card p-2" aria-label="Roles">
          {ordered.map(({ r, depth }) => (
            <button key={r.id} onClick={() => setSel(r.id)} style={{ marginLeft: depth * 14, width: `calc(100% - ${depth * 14}px)` }}
              className={cn("flex items-start gap-2 rounded-2xl px-3 py-2.5 text-left transition-colors", sel === r.id ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
              {depth > 0 && <CornerDownRight className="mt-0.5 size-3.5 shrink-0 opacity-50" />}
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: r.tone }} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">{r.name}{r.system && <Lock className="size-3 opacity-60" />}</span>
                <span className={cn("block truncate text-xs", sel === r.id ? "opacity-70" : "text-muted-foreground")}>{people.filter((p) => p.roleId === r.id).length} people{r.inherits ? ` · includes ${roles.find((x) => x.id === r.inherits)?.name}` : ""}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          <section className="rounded-3xl border bg-card p-5">
            <div className="flex flex-wrap items-start gap-3">
              <Popover>
                <PopoverTrigger asChild><button className="mt-1.5 size-6 shrink-0 rounded-full border-2 border-white shadow ring-1 ring-border" style={{ background: role.tone }} aria-label="Change role colour" disabled={role.system} /></PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2"><div className="grid grid-cols-4 gap-1.5">{tones.map((c) => <button key={c} onClick={() => updateRole(role.id, { tone: c })} className="size-7 rounded-full border" style={{ background: c }} aria-label={c} />)}</div></PopoverContent>
              </Popover>
              <div className="min-w-0 flex-1 space-y-1">
                <input value={role.name} disabled={role.system} onChange={(e) => updateRole(role.id, { name: e.target.value })} aria-label="Role name" className="w-full bg-transparent font-display text-3xl outline-none focus:underline focus:decoration-brand/40 focus:underline-offset-4 disabled:opacity-100" />
                <input value={role.description} disabled={role.system} onChange={(e) => updateRole(role.id, { description: e.target.value })} aria-label="Role description" className="w-full bg-transparent text-sm text-muted-foreground outline-none focus:text-foreground" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {locked && <Badge variant="secondary"><Lock /> Locked</Badge>}
                {!locked && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => { const id = addRole(role.name + " copy", role.id); setSel(id); toast("Role duplicated"); }}><Copy /> Duplicate</Button>
                    <Button variant="ghost" size="sm" className="text-chili hover:text-chili" onClick={() => { setReassign(roles.find((r) => r.id !== role.id && r.id !== "owner")?.id ?? "cashier"); setDel(true); }}><Trash2 /> Delete</Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Also gets everything from</Label>
                <Select value={role.inherits ?? "none"} disabled={locked} onValueChange={(v) => updateRole(role.id, { inherits: v === "none" ? undefined : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Nothing, start clean</SelectItem>{roles.filter((r) => r.id !== role.id && !downstream(role.id).includes(r.id)).map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>People with this role</Label>
                <div className="flex h-9 items-center gap-1.5">
                  {members.slice(0, 6).map((m) => <Avatar key={m.id} className="size-7" title={m.name}><AvatarFallback className="text-[10px] text-white" style={{ background: m.color }}>{initials(m.name)}</AvatarFallback></Avatar>)}
                  <span className="text-xs text-muted-foreground">{members.length ? `${members.length} ${members.length === 1 ? "person" : "people"}` : "Nobody yet"}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">What this role can do</h3>
              {!locked && <div className="flex flex-wrap items-center gap-1.5 text-xs"><span className="text-muted-foreground">Set every row to</span>{presets.map((p) => <Button key={p.id} variant="outline" size="xs" onClick={() => { rows.forEach((r) => setPerm(role.id, r.id, p.make(true))); toast(`${role.name}: ${p.label.toLowerCase()}`); }}>{p.label}</Button>)}</div>}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Area</th>
                    {actions.map((a) => (
                      <th key={a.id} className="w-20 pb-2 text-center font-medium">
                        <button disabled={locked} onClick={() => rows.forEach((r) => { const cur = own[r.id] ?? ""; const on = colAll(a.id); if (on === cur.includes(a.id)) togglePerm(role.id, r.id, a.id); else if (!on && !cur.includes(a.id)) togglePerm(role.id, r.id, a.id); })} className="rounded px-1.5 py-0.5 hover:bg-secondary disabled:hover:bg-transparent" title={`Toggle ${a.label.toLowerCase()} for every area`}>{a.label}</button>
                      </th>
                    ))}
                    <th className="w-16 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <Fragment key={r.id}>
                      {idx === 0 || (r.custom && !rows[idx - 1].custom) ? (
                        <tr key={`h-${r.id}`}><td colSpan={actions.length + 2} className="pb-1 pt-4 text-xs font-medium text-muted-foreground">{r.custom ? "Your custom tables" : "Core areas"}</td></tr>
                      ) : null}
                      <tr key={r.id} className="border-t">
                        <td className="py-2.5 pr-3"><span className="font-medium">{r.label}</span>{r.custom && <Badge variant="brand" className="ml-2">Custom table</Badge>}</td>
                        {actions.map((a) => {
                          const ownOn = (own[r.id] ?? "").includes(a.id);
                          const inhOn = !ownOn && inh(r.id).includes(a.id);
                          const on = locked || ownOn;
                          return (
                            <td key={a.id} className="py-2 text-center">
                              <button disabled={locked || inhOn} onClick={() => togglePerm(role.id, r.id, a.id)} aria-label={`${r.label} ${a.label}`} aria-pressed={on || inhOn}
                                className={cn("mx-auto grid size-8 place-items-center rounded-lg border transition-all", on ? "border-brand bg-brand text-white shadow-sm" : inhOn ? "border-dashed border-brand/50 bg-brand/10 text-brand" : "bg-background text-transparent hover:border-foreground/30 hover:text-muted-foreground/40", (locked || inhOn) && "cursor-not-allowed")}>
                                <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-2 text-right">
                          {!locked && <button className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setPerm(role.id, r.id, (own[r.id] ?? "") === "vcedx" ? "" : "vcedx")}>{(own[r.id] ?? "") === "vcedx" ? "Clear" : "All"}</button>}
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Dashed cells come from an inherited role. Change them on that role instead.</p>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-brand" /> Special permissions and limits</div>
            <div className="mt-3 divide-y">
              {specialPerms.map((s) => {
                const on = locked || flags.includes(s.id);
                return (
                  <div key={s.id} className="py-3">
                    <label className="flex items-center justify-between gap-4"><span><span className="block text-sm">{s.label}</span><span className="block text-xs text-muted-foreground">{s.hint}</span></span><Switch checked={on} disabled={locked} onCheckedChange={(v) => setFlag(s.id, v)} aria-label={s.label} /></label>
                    {s.id === "refund" && on && !locked && (
                      <div className="mt-2.5 flex items-center gap-3"><span className="w-28 text-xs text-muted-foreground">Refund limit</span><input type="range" min={0} max={100000} step={500} value={role.refundLimit ?? 0} onChange={(e) => updateRole(role.id, { refundLimit: Number(e.target.value) })} className="h-1 flex-1 accent-[var(--brand)]" aria-label="Refund limit" /><span className="w-24 text-right text-sm tabular-nums">₹{(role.refundLimit ?? 0).toLocaleString("en-IN")}</span></div>
                    )}
                    {s.id === "discount" && on && !locked && (
                      <div className="mt-2.5 flex items-center gap-3"><span className="w-28 text-xs text-muted-foreground">Discount limit</span><input type="range" min={0} max={100} value={role.discountLimit ?? 0} onChange={(e) => updateRole(role.id, { discountLimit: Number(e.target.value) })} className="h-1 flex-1 accent-[var(--brand)]" aria-label="Discount limit" /><span className="w-24 text-right text-sm tabular-nums">{role.discountLimit ?? 0}% off</span></div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Eye className="size-4 text-brand" /> What {role.name.toLowerCase()} sees in the menu</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ label: "Dashboard", res: "orders" }, { label: "Products", res: "products" }, { label: "Inventory", res: "inventory" }, { label: "Orders", res: "orders" }, { label: "Website builder", res: "site" }, { label: "People", res: "users" }, { label: "Domains and billing", res: "settings" }, ...rows.filter((r) => r.custom).map((r) => ({ label: r.label, res: r.id }))].map((m, i) => {
                const show = effectivePerm(roles, matrix, role.id, m.res).includes("v");
                return <span key={i} className={cn("rounded-full border px-3 py-1.5 text-[13px] transition-all", show ? "bg-card" : "border-dashed text-muted-foreground/40 line-through")}>{m.label}</span>;
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Hidden items disappear from the manager and their APIs return “not allowed”.</p>
          </section>
        </div>
      </div>

      <Dialog open={del} onOpenChange={setDel}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {role.name}?</DialogTitle><DialogDescription>{members.length ? `${members.length} ${members.length === 1 ? "person has" : "people have"} this role. Choose who they become.` : "Nobody has this role right now."}</DialogDescription></DialogHeader>
          {members.length > 0 && (
            <div className="space-y-1.5"><Label>Move them to</Label>
              <Select value={reassign} onValueChange={setReassign}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.filter((r) => r.id !== role.id).map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setDel(false)}>Keep role</Button><Button variant="destructive" onClick={() => { removeRole(role.id, reassign); setSel(reassign); setDel(false); toast("Role deleted"); }}>Delete role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
