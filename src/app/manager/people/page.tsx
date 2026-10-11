"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Mail, Network, Plus, Search, ShieldCheck, Sparkles, Table2, Trash2, UserRoundX, UserRoundCheck, Users, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { actions, type Person, type Team } from "@/lib/data";
import { initials } from "@/lib/format";
import { effectivePerm, resourceRows } from "@/lib/perm";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const personName = (p: Person) => (p.status === "invited" ? "Pending invite" : p.name);

/* ---------- org chart ---------- */
function Node({ p, all, selected, onSelect, roleName, tone, teams, drag, setDrag, over, setOver, onDrop, collapsed, toggle }: {
  p: Person; all: Person[]; selected: string; onSelect: (id: string) => void; roleName: (id: string) => string; tone: (id: string) => string; teams: Team[];
  drag: string | null; setDrag: (id: string | null) => void; over: string | null; setOver: (id: string | null) => void; onDrop: (target: string) => void; collapsed: Set<string>; toggle: (id: string) => void;
}) {
  const kids = all.filter((x) => x.parentId === p.id);
  const shut = collapsed.has(p.id);
  const mine = teams.filter((t) => p.teamIds?.includes(t.id));
  return (
    <li>
      <div className="relative">
        <button
          draggable={p.parentId !== null}
          onDragStart={(e) => { e.dataTransfer.setData("text/plain", p.id); e.dataTransfer.effectAllowed = "move"; setDrag(p.id); }}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          onDragOver={(e) => { if (drag && drag !== p.id) { e.preventDefault(); setOver(p.id); } }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => { e.preventDefault(); onDrop(p.id); }}
          onClick={() => onSelect(p.id)}
          className={cn("w-[184px] rounded-2xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", selected === p.id && "border-brand ring-4 ring-brand/15", p.status === "suspended" && "opacity-55", p.status === "invited" && "border-dashed", drag === p.id && "opacity-40", over === p.id && "border-brand bg-brand/10 ring-4 ring-brand/20", p.parentId !== null && "cursor-grab active:cursor-grabbing")}
        >
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9"><AvatarFallback className="text-white" style={{ background: p.color }}>{initials(p.name)}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-medium">{p.status === "invited" ? "Invited" : p.name}</div>
              <div className="truncate text-xs text-muted-foreground">{p.title || p.scope}</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: tone(p.roleId) + "1f", color: tone(p.roleId) }}>
              <span className="size-1.5 rounded-full" style={{ background: tone(p.roleId) }} /> {roleName(p.roleId)}
            </span>
            <span className="flex -space-x-1">{mine.map((t) => <i key={t.id} title={t.name} className="size-2.5 rounded-full border border-card" style={{ background: t.color }} />)}</span>
          </div>
        </button>
        {kids.length > 0 && (
          <button onClick={() => toggle(p.id)} aria-label={shut ? "Show reports" : "Hide reports"} className="absolute -bottom-2.5 left-1/2 z-10 grid h-5 min-w-5 -translate-x-1/2 place-items-center rounded-full border bg-card px-1 text-[10px] font-medium shadow-sm hover:border-brand">
            {shut ? `+${kids.length}` : <ChevronDown className="size-3" />}
          </button>
        )}
      </div>
      {kids.length > 0 && !shut && (
        <ul>{kids.map((k) => <Node key={k.id} p={k} all={all} selected={selected} onSelect={onSelect} roleName={roleName} tone={tone} teams={teams} drag={drag} setDrag={setDrag} over={over} setOver={setOver} onDrop={onDrop} collapsed={collapsed} toggle={toggle} />)}</ul>
      )}
    </li>
  );
}

/* ---------- profile drawer ---------- */
function Profile({ id, onClose }: { id: string; onClose: () => void }) {
  const { people, roles, matrix, teams, entities, updatePerson, setOverride, removePeople, setParent } = useStudio();
  const p = people.find((x) => x.id === id);
  const [tab, setTab] = useState("profile");
  if (!p) return null;
  const rows = resourceRows(entities);
  const roleName = roles.find((r) => r.id === p.roleId)?.name ?? p.roleId;
  const below = (pid: string): string[] => people.filter((x) => x.parentId === pid).flatMap((x) => [x.id, ...below(x.id)]);
  const blocked = [p.id, ...below(p.id)];
  const set = (patch: Partial<Person>) => updatePerson(p.id, patch);
  const owner = p.roleId === "owner";
  return (
    <SheetContent className="sm:max-w-lg">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-12"><AvatarFallback className="text-base text-white" style={{ background: p.color }}>{initials(p.name)}</AvatarFallback></Avatar>
          <div className="min-w-0"><SheetTitle className="truncate">{personName(p)}</SheetTitle><SheetDescription className="truncate">{p.email} · {roleName}</SheetDescription></div>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="mt-3"><TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="access">Access</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList></Tabs>
      </SheetHeader>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
        {tab === "profile" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label>Full name</Label><Input value={p.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Job title</Label><Input value={p.title ?? ""} onChange={(e) => set({ title: e.target.value })} placeholder="Store lead" suggest={["Store lead", "Visual merchandiser", "Warehouse supervisor"]} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={p.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} placeholder="+91 98450 12345" suggest={["+91 98450 12345", "+91 99001 54321"]} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Works at</Label><Input value={p.scope} onChange={(e) => set({ scope: e.target.value })} suggest={["Indiranagar store", "Whitefield warehouse", "Jaipur flagship", "All branches"]} /></div>
              <div className="space-y-1.5"><Label>Role</Label>
                <Select value={p.roleId} disabled={owner} onValueChange={(v) => { set({ roleId: v }); toast.success(`Role changed to ${roles.find((r) => r.id === v)?.name}`, { description: "Takes effect on their next page load." }); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>Reports to</Label>
                <Select value={p.parentId ?? "none"} disabled={owner} onValueChange={(v) => { if (!setParent(p.id, v)) toast.error("That would create a loop"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{people.filter((x) => !blocked.includes(x.id)).map((x) => <SelectItem key={x.id} value={x.id}>{personName(x)}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Teams</Label>
              <div className="flex flex-wrap gap-1.5">
                {teams.map((t) => { const on = p.teamIds?.includes(t.id); return <button key={t.id} onClick={() => set({ teamIds: on ? p.teamIds?.filter((x) => x !== t.id) : [...(p.teamIds ?? []), t.id] })} aria-pressed={!!on} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition", on ? "border-transparent text-white" : "text-muted-foreground hover:border-foreground/30")} style={on ? { background: t.color } : undefined}><i className="size-2 rounded-full" style={{ background: on ? "#fff" : t.color }} />{t.name}</button>; })}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Private notes</Label><Textarea rows={3} value={p.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Only owners and their manager see this." /></div>
          </>
        )}
        {tab === "access" && (
          <>
            <p className="text-sm text-muted-foreground">{owner ? "Owners always have full access." : <>Starts from <b className="text-foreground">{roleName}</b>. Tick extra actions below to give just this person more, without creating a new role.</>}</p>
            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary/50 text-left text-xs text-muted-foreground"><th className="px-3 py-2 font-medium">Area</th>{actions.map((a) => <th key={a.id} className="w-12 py-2 text-center font-medium">{a.label[0]}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const base = effectivePerm(roles, matrix, p.roleId, r.id);
                    const extra = p.overrides?.[r.id] ?? "";
                    return (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2">{r.label}{extra && <span className="ml-1.5 rounded bg-saffron/30 px-1 text-[10px]">+extra</span>}</td>
                        {actions.map((a) => {
                          const fromRole = base.includes(a.id) && !extra.includes(a.id);
                          const on = fromRole || extra.includes(a.id);
                          return (
                            <td key={a.id} className="py-1.5 text-center">
                              <button disabled={owner || fromRole} onClick={() => { const next = extra.includes(a.id) ? extra.replace(a.id, "") : extra + a.id; setOverride(p.id, r.id, next ? next : null); }} aria-label={`${r.label} ${a.label}`} aria-pressed={on}
                                className={cn("mx-auto grid size-6 place-items-center rounded-md border text-[10px] font-semibold uppercase", fromRole ? "border-dashed border-brand/50 bg-brand/10 text-brand" : on ? "border-saffron bg-saffron text-ink" : "text-transparent hover:border-foreground/30 hover:text-muted-foreground/40")}>{a.id}</button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">Dashed = from their role. Yellow = extra, only for {p.name.split(" ")[0]}.</p>
          </>
        )}
        {tab === "activity" && (
          <ul className="space-y-3 text-sm">
            {[["Signed in", p.last], ["Edited a product", "Yesterday, 4:12 pm"], ["Changed a stock count", "Mon, 11:40 am"], ["Signed in from a new phone", "Sat, 9:02 am"]].map(([a, w]) => (
              <li key={a} className="flex items-start gap-3"><span className="mt-1.5 size-2 rounded-full bg-brand" /><div><div>{a}</div><div className="text-xs text-muted-foreground">{w}</div></div></li>
            ))}
          </ul>
        )}
      </div>
      {!owner && (
        <SheetFooter>
          <Button variant="ghost" size="sm" className="text-chili hover:text-chili" onClick={() => { removePeople([p.id]); toast("Person removed", { description: "Their reports now report to their manager." }); onClose(); }}><Trash2 /> Remove</Button>
          {p.status === "suspended"
            ? <Button variant="outline" size="sm" className="ml-auto" onClick={() => { set({ status: "active" }); toast.success("Access restored"); }}><UserRoundCheck /> Restore access</Button>
            : <Button variant="outline" size="sm" className="ml-auto" onClick={() => { set({ status: "suspended" }); toast("Access suspended", { description: `${p.name} is signed out everywhere.` }); }}><UserRoundX /> Suspend access</Button>}
        </SheetFooter>
      )}
    </SheetContent>
  );
}

/* ---------- dialogs ---------- */
function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { people, roles, teams, addPeople } = useStudio();
  const [raw, setRaw] = useState("");
  const [roleId, setRoleId] = useState("manager");
  const [parentId, setParentId] = useState("u2");
  const [scope, setScope] = useState("");
  const [tids, setTids] = useState<string[]>([]);
  const emails = Array.from(new Set(raw.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter((s) => /^\S+@\S+\.\S+$/.test(s))));
  const dupes = emails.filter((e) => people.some((p) => p.email === e));
  const fresh = emails.filter((e) => !dupes.includes(e));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite teammates</DialogTitle><DialogDescription>Paste one or many emails. Everyone gets a link and joins Kaveri Textiles with exactly the access of the role you pick.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Work emails</Label><Textarea rows={3} suggest={["farah@kaveritextiles.in, imran@kaveritextiles.in, priya@kaveritextiles.in", "neha@kaveritextiles.in"]} placeholder="name@kaveritextiles.in, another@kaveritextiles.in" value={raw} onChange={(e) => setRaw(e.target.value)} />
            {emails.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{emails.map((e) => <span key={e} className={cn("rounded-full px-2.5 py-0.5 text-xs", dupes.includes(e) ? "bg-chili/15 text-chili line-through" : "bg-secondary")}>{e}</span>)}</div>}
            {dupes.length > 0 && <p className="text-xs text-chili">{dupes.length} already on your team, skipped.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Role</Label><Select value={roleId} onValueChange={setRoleId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.filter((r) => r.id !== "owner").map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Reports to</Label><Select value={parentId} onValueChange={setParentId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{people.filter((p) => p.status !== "invited").map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="col-span-2 space-y-1.5"><Label>Works at</Label><Input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Indiranagar store" suggest={["Indiranagar store", "Whitefield warehouse", "Jaipur flagship"]} /></div>
          </div>
          <div className="space-y-1.5"><Label>Add to teams</Label><div className="flex flex-wrap gap-1.5">{teams.map((t) => { const on = tids.includes(t.id); return <button key={t.id} onClick={() => setTids(on ? tids.filter((x) => x !== t.id) : [...tids, t.id])} aria-pressed={on} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs", on ? "border-transparent text-white" : "text-muted-foreground")} style={on ? { background: t.color } : undefined}><i className="size-2 rounded-full" style={{ background: on ? "#fff" : t.color }} />{t.name}</button>; })}</div></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" className="sm:mr-auto" onClick={() => { setRaw("farah@kaveritextiles.in, imran@kaveritextiles.in, priya@kaveritextiles.in"); setRoleId("cashier"); setParentId("u4"); setScope("Indiranagar store"); setTids(["tm1"]); }}><Sparkles /> Fill sample</Button>
          <Button variant="brand" disabled={!fresh.length} onClick={() => { addPeople(fresh, { roleId, parentId, scope, teamIds: tids }); toast.success(`${fresh.length} invite${fresh.length > 1 ? "s" : ""} sent`, { description: "They appear in the tree once they accept." }); setRaw(""); onOpenChange(false); }}><Mail /> Send {fresh.length > 1 ? `${fresh.length} invites` : "invite"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { teams, people, addTeam, updateTeam, removeTeam } = useStudio();
  const [name, setName] = useState("");
  const colors = ["#3340ff", "#1f7a4d", "#e08a00", "#d8386b", "#7a3cff", "#0f6b5c", "#a3122a", "#244a63"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Teams</DialogTitle><DialogDescription>Teams cut across the reporting line. Use them to group, filter and invite people together.</DialogDescription></DialogHeader>
        <div className="max-h-[50dvh] space-y-2 overflow-y-auto">
          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-xl border p-2">
              <Popover><PopoverTrigger asChild><button className="size-6 shrink-0 rounded-full" style={{ background: t.color }} aria-label={`Colour for ${t.name}`} /></PopoverTrigger><PopoverContent className="w-auto p-2"><div className="grid grid-cols-4 gap-1.5">{colors.map((c) => <button key={c} onClick={() => updateTeam(t.id, { color: c })} className="size-6 rounded-full" style={{ background: c }} aria-label={c} />)}</div></PopoverContent></Popover>
              <div className="min-w-0 flex-1"><Input className="h-8" value={t.name} onChange={(e) => updateTeam(t.id, { name: e.target.value })} aria-label="Team name" /></div>
              <span className="w-16 text-right text-xs text-muted-foreground">{people.filter((p) => p.teamIds?.includes(t.id)).length} people</span>
              <Button variant="ghost" size="icon-xs" onClick={() => { removeTeam(t.id); toast("Team removed"); }} aria-label={`Delete ${t.name}`}><X /></Button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addTeam(name.trim()); setName(""); } }} className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New team" suggest={["Visual merchandising", "Festive sales", "Customer care"]} aria-label="New team name" /><Button type="submit" variant="brand"><Plus /> Add</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- page ---------- */
export default function PeoplePage() {
  const { people, roles, teams, setParent, bulkUpdatePeople, removePeople, updatePerson } = useStudio();
  const [view, setView] = useState("tree");
  const [q, setQ] = useState("");
  const [fRole, setFRole] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fTeam, setFTeam] = useState("all");
  const [group, setGroup] = useState("none");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [invite, setInvite] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [sel, setSel] = useState("u2");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fit, setFit] = useState(true);
  useEffect(() => {
    if (view !== "tree") return;
    const measure = () => {
      const box = scroller.current, tree = inner.current;
      if (!box || !tree) return;
      const natural = tree.firstElementChild ? (tree.firstElementChild as HTMLElement).scrollWidth : tree.scrollWidth;
      setScale(fit ? Math.min(1, (box.clientWidth - 32) / natural) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (scroller.current) ro.observe(scroller.current);
    return () => ro.disconnect();
  }, [view, fit, people.length, collapsed]);

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const tone = (id: string) => roles.find((r) => r.id === id)?.tone ?? "#888";
  const root = people.find((p) => p.parentId === null)!;
  const person = people.find((p) => p.id === sel) ?? root;
  const filtering = q || fRole !== "all" || fStatus !== "all" || fTeam !== "all";
  const filtered = useMemo(() => people.filter((p) =>
    (!q || (p.name + p.email + p.scope + (p.title ?? "")).toLowerCase().includes(q.toLowerCase())) &&
    (fRole === "all" || p.roleId === fRole) && (fStatus === "all" || p.status === fStatus) && (fTeam === "all" || p.teamIds?.includes(fTeam))), [people, q, fRole, fStatus, fTeam]);
  const groups = useMemo(() => {
    if (group === "none") return [{ key: "all", label: "", items: filtered }];
    const map = new Map<string, { label: string; items: Person[] }>();
    filtered.forEach((p) => {
      const keys = group === "role" ? [p.roleId] : group === "team" ? (p.teamIds?.length ? p.teamIds : ["_"]) : [p.parentId ?? "_"];
      keys.forEach((k) => {
        const label = group === "role" ? roleName(p.roleId) : group === "team" ? teams.find((t) => t.id === k)?.name ?? "No team" : k === "_" ? "Top of the tree" : `Reports to ${people.find((x) => x.id === k)?.name}`;
        if (!map.has(k)) map.set(k, { label, items: [] });
        map.get(k)!.items.push(p);
      });
    });
    return Array.from(map, ([key, v]) => ({ key, ...v }));
  }, [filtered, group, people, teams, roles]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleCollapse = (id: string) => setCollapsed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const reparent = (target: string) => {
    if (!drag) return;
    const who = people.find((p) => p.id === drag), to = people.find((p) => p.id === target);
    setDrag(null); setOver(null);
    if (!who || !to || who.parentId === target) return;
    if (setParent(drag, target)) toast.success(`${who.name} now reports to ${to.name}`, { description: "Their own reports move with them." });
    else toast.error("That would put someone above themselves", { description: "Drop onto a person who is not below them." });
  };
  const allPicked = filtered.length > 0 && filtered.every((p) => picked.includes(p.id));
  const counts = { active: people.filter((p) => p.status === "active").length, invited: people.filter((p) => p.status === "invited").length };

  const row = (p: Person) => (
    <TableRow key={p.id} className="cursor-pointer" onClick={() => setOpen(p.id)} data-state={picked.includes(p.id) ? "selected" : undefined}>
      <TableCell onClick={(e) => e.stopPropagation()}><Checkbox checked={picked.includes(p.id)} onCheckedChange={(v) => setPicked((s) => (v ? [...s, p.id] : s.filter((x) => x !== p.id)))} aria-label={`Select ${p.name}`} /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8"><AvatarFallback className="text-white" style={{ background: p.color }}>{initials(p.name)}</AvatarFallback></Avatar>
          <div><div className="font-medium">{personName(p)}</div><div className="text-xs text-muted-foreground">{p.title || p.email}</div></div>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select value={p.roleId} disabled={p.roleId === "owner"} onValueChange={(v) => { updatePerson(p.id, { roleId: v }); toast.success(`${p.name.split(" ")[0]} is now ${roleName(v)}`); }}>
          <SelectTrigger className="h-8 w-40 border-transparent bg-transparent shadow-none hover:border-border" aria-label={`Role for ${p.name}`}><span className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: tone(p.roleId) }} /><SelectValue /></span></SelectTrigger>
          <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
      </TableCell>
      <TableCell><span className="flex flex-wrap gap-1">{teams.filter((t) => p.teamIds?.includes(t.id)).map((t) => <span key={t.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"><i className="size-1.5 rounded-full" style={{ background: t.color }} />{t.name}</span>)}</span></TableCell>
      <TableCell className="text-muted-foreground">{people.find((x) => x.id === p.parentId)?.name ?? "None"}</TableCell>
      <TableCell className="text-muted-foreground">{p.scope}</TableCell>
      <TableCell><Badge variant={p.status === "active" ? "success" : p.status === "invited" ? "warn" : "secondary"} className="capitalize">{p.status}</Badge></TableCell>
    </TableRow>
  );

  return (
    <>
      <PageHeader
        title="People"
        description="Your team as it actually reports. Drag someone onto their new manager, group by team or role, and give anyone a one-off extra permission."
        actions={<><Button variant="outline" onClick={() => setTeamsOpen(true)}><Users /> Teams <span className="rounded-full bg-secondary px-1.5 text-xs">{teams.length}</span></Button><Button variant="brand" onClick={() => setInvite(true)}><Plus /> Invite teammates</Button></>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="tree"><Network /> Org chart</TabsTrigger><TabsTrigger value="list"><Table2 /> List</TabsTrigger></TabsList></Tabs>
        <span className="hidden text-xs text-muted-foreground md:inline">{counts.active} active · {counts.invited} invited</span>
        <div className="relative ml-auto w-full sm:w-56"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search name, email, store" value={q} onChange={(e) => setQ(e.target.value)} suggest={["Sana", "Indiranagar", "invited"]} /></div>
        <Select value={fRole} onValueChange={setFRole}><SelectTrigger className="h-9 w-36" aria-label="Filter by role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
        <Select value={fTeam} onValueChange={setFTeam}><SelectTrigger className="h-9 w-32" aria-label="Filter by team"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All teams</SelectItem>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
        <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="h-9 w-32" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="invited">Invited</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
        {view === "list" && <Select value={group} onValueChange={setGroup}><SelectTrigger className="h-9 w-40" aria-label="Group by"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No grouping</SelectItem><SelectItem value="role">Group by role</SelectItem><SelectItem value="team">Group by team</SelectItem><SelectItem value="manager">Group by manager</SelectItem></SelectContent></Select>}
      </div>

      {picked.length > 0 && view === "list" && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-white" role="toolbar" aria-label="Bulk actions">
          <span className="mr-2 font-medium">{picked.length} selected</span>
          <Select onValueChange={(v) => { bulkUpdatePeople(picked, { roleId: v }); toast.success(`${picked.length} people are now ${roleName(v)}`); }}><SelectTrigger className="h-8 w-36 border-white/20 bg-white/10 text-white" aria-label="Change role"><SelectValue placeholder="Change role…" /></SelectTrigger><SelectContent>{roles.filter((r) => r.id !== "owner").map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
          <Select onValueChange={(v) => { picked.forEach((id) => { const p = people.find((x) => x.id === id); if (p && !p.teamIds?.includes(v)) updatePerson(id, { teamIds: [...(p.teamIds ?? []), v] }); }); toast.success(`Added ${picked.length} to ${teams.find((t) => t.id === v)?.name}`); }}><SelectTrigger className="h-8 w-36 border-white/20 bg-white/10 text-white" aria-label="Add to team"><SelectValue placeholder="Add to team…" /></SelectTrigger><SelectContent>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
          <Button size="xs" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => { bulkUpdatePeople(picked.filter((i) => i !== root.id), { status: "suspended" }); toast("Access suspended"); }}><UserRoundX /> Suspend</Button>
          <Button size="xs" variant="ghost" className="text-rose-300 hover:bg-white/10 hover:text-rose-200" onClick={() => { removePeople(picked.filter((i) => i !== root.id)); toast("People removed"); setPicked([]); }}><Trash2 /> Remove</Button>
          <Button size="xs" variant="ghost" className="ml-auto text-white hover:bg-white/10 hover:text-white" onClick={() => setPicked([])}>Clear</Button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {view === "tree" ? (
            <div ref={scroller} className="dot-grid relative overflow-x-auto rounded-3xl border bg-card/50 px-4 pb-8 pt-12">
              <div className="absolute left-4 top-3 text-xs text-muted-foreground">Drag a person onto a manager to change who they report to.</div>
              <Button variant="outline" size="xs" className="absolute right-3 top-3 z-10" onClick={() => setFit((f) => !f)}>{fit ? "Actual size" : "Fit to screen"}</Button>
              <div ref={inner} className="org-tree mx-auto w-max min-w-full" style={{ zoom: scale }}>
                <ul><Node p={root} all={filtering ? people.filter((p) => filtered.some((f) => f.id === p.id) || people.some((c) => filtered.some((f) => f.id === c.id) && isAncestor(people, p.id, c.id))) : people} selected={sel} onSelect={setSel} roleName={roleName} tone={tone} teams={teams} drag={drag} setDrag={setDrag} over={over} setOver={setOver} onDrop={reparent} collapsed={collapsed} toggle={toggleCollapse} /></ul>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <Table>
                <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="w-10"><Checkbox checked={allPicked} onCheckedChange={(v) => setPicked(v ? filtered.map((p) => p.id) : [])} aria-label="Select all" /></TableHead><TableHead>Person</TableHead><TableHead>Role</TableHead><TableHead>Teams</TableHead><TableHead>Reports to</TableHead><TableHead>Works at</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <Fragment key={g.key}>
                      {g.label && <TableRow key={`g-${g.key}`} className="bg-secondary/40 hover:bg-secondary/40"><TableCell colSpan={7} className="py-1.5 text-xs font-medium text-muted-foreground">{g.label} · {g.items.length}</TableCell></TableRow>}
                      {g.items.map(row)}
                    </Fragment>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-14 text-center text-muted-foreground">No one matches these filters.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border bg-card p-5 xl:sticky xl:top-20">
          <div className="flex items-center gap-3">
            <Avatar className="size-12"><AvatarFallback className="text-base text-white" style={{ background: person.color }}>{initials(person.name)}</AvatarFallback></Avatar>
            <div className="min-w-0"><div className="truncate font-display text-2xl">{personName(person)}</div><div className="truncate text-xs text-muted-foreground">{person.title || person.email}</div></div>
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Role</dt><dd className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: tone(person.roleId) }} />{roleName(person.roleId)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Reports to</dt><dd>{people.find((x) => x.id === person.parentId)?.name ?? "Nobody (owner)"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Works at</dt><dd className="text-right">{person.scope}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Last seen</dt><dd>{person.last}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Teams</dt><dd className="flex flex-wrap justify-end gap-1">{teams.filter((t) => person.teamIds?.includes(t.id)).map((t) => <span key={t.id} className="inline-flex items-center gap-1 text-xs"><i className="size-1.5 rounded-full" style={{ background: t.color }} />{t.name}</span>) }{!person.teamIds?.length && <span className="text-muted-foreground">None</span>}</dd></div>
          </dl>
          <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => setOpen(person.id)}><ShieldCheck /> Open profile and access</Button>
        </aside>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>{open && <Profile key={open} id={open} onClose={() => setOpen(null)} />}</Sheet>
      <InviteDialog open={invite} onOpenChange={setInvite} />
      <TeamsDialog open={teamsOpen} onOpenChange={setTeamsOpen} />
    </>
  );
}

function isAncestor(all: Person[], anc: string, of: string): boolean {
  let cur = all.find((p) => p.id === of)?.parentId;
  while (cur) { if (cur === anc) return true; cur = all.find((p) => p.id === cur)?.parentId; }
  return false;
}
