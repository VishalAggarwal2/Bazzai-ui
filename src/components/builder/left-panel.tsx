"use client";
import { useMemo, useState } from "react";
import { BookmarkCheck, Search, ShieldCheck, X } from "lucide-react";
import { ChecksTab, useIssues } from "./checks-panel";
import {
  AppWindow, Boxes, ChevronRight, Eye, EyeOff, FileText, GripVertical, Heading1, Home, Image as ImageIcon, LayoutGrid, Link2, ListOrdered, Mail, Minus, MousePointerClick, MoveVertical,
  Package, Plus, Rows3, Sparkles, Star, Tag, Type, GalleryHorizontal, MessageSquareHeart, PanelTop, PanelBottom, TextCursorInput,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { elementLibrary, kindLabel, sectionPresets, withStableIds, type ElKind, type Section } from "@/lib/builder";
import { useSite, targetKey, type Target } from "@/lib/site-store";
import { cn } from "@/lib/utils";

const icons: Record<ElKind, React.ComponentType<{ className?: string }>> = {
  heading: Heading1, text: Type, button: MousePointerClick, badge: Tag, image: ImageIcon, linklist: Link2, stats: ListOrdered, marquee: GalleryHorizontal,
  products: Package, collections: LayoutGrid, entity: Boxes, form: TextCursorInput, newsletter: Mail, feedback: MessageSquareHeart, divider: Minus, spacer: MoveVertical,
};

function Thumb({ s }: { s: Section }) {
  return (
    <div className="flex gap-1 rounded-md bg-secondary/70 p-1.5" style={{ background: s.st.bg === "fg" ? "#2a3150" : s.st.bg === "accent" ? "#ffd780" : s.st.bg === "surface" ? "#fff" : undefined }}>
      {s.cols.map((c) => (
        <div key={c.id} className="flex min-w-0 flex-col justify-center gap-[3px]" style={{ flex: c.fr }}>
          {c.els.length === 0 && <span className="h-5 rounded-sm border border-dashed border-foreground/25" />}
          {c.els.slice(0, 5).map((e) => {
            const dark = s.st.bg === "fg";
            const col = dark ? "bg-white/55" : "bg-foreground/35";
            if (e.kind === "heading") return <span key={e.id} className={cn("h-[7px] w-4/5 rounded-sm", dark ? "bg-white/90" : "bg-foreground/80")} />;
            if (e.kind === "button") return <span key={e.id} className="h-[6px] w-1/3 rounded-full bg-brand" />;
            if (e.kind === "image") return <span key={e.id} className="aspect-[4/3] w-full rounded-sm bg-brand/50" />;
            if (e.kind === "products" || e.kind === "collections") return <span key={e.id} className="grid grid-cols-4 gap-[2px]">{[0, 1, 2, 3].map((i) => <i key={i} className="aspect-square rounded-[2px] bg-brand/45" />)}</span>;
            if (e.kind === "entity") return <span key={e.id} className="grid grid-cols-2 gap-[2px]">{[0, 1].map((i) => <i key={i} className="h-3 rounded-[2px] bg-foreground/25" />)}</span>;
            if (e.kind === "form") return <span key={e.id} className="flex flex-col gap-[3px]"><i className="h-[5px] rounded-[2px] bg-foreground/25" /><i className="h-[5px] rounded-[2px] bg-foreground/25" /><i className="h-[6px] w-1/3 rounded-full bg-brand" /></span>;
            if (e.kind === "marquee") return <span key={e.id} className="h-[6px] w-full rounded-full bg-foreground/50" />;
            return <span key={e.id} className={cn("h-[4px] w-full rounded-sm", col)} />;
          })}
        </div>
      ))}
    </div>
  );
}

function AddTab() {
  const { setDrag, addEl, addSection, saved, delSaved } = useSite();
  const thumbs = useMemo(() => sectionPresets.map((p) => ({ p, s: withStableIds(() => p.make()) })), []);
  const groups = ["Basics", "Store", "Layout"] as const;
  const [q, setQ] = useState("");
  const m = (...t: string[]) => !q.trim() || t.join(" ").toLowerCase().includes(q.trim().toLowerCase());
  const shownThumbs = thumbs.filter(({ p }) => m(p.label, p.hint, p.id));
  const shownSaved = saved.filter((x) => m(x.name, "mine saved"));
  const anyEl = elementLibrary.some((e) => m(e.label, e.hint, e.kind));
  return (
    <div className="space-y-5 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blocks" aria-label="Search sections and elements" className="h-9 pl-8 pr-8" suggest={["form", "reviews", "hero", "faq", "image"]} />
        {q && <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-2 grid size-5 place-items-center rounded text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>}
      </div>
      {!shownThumbs.length && !shownSaved.length && !anyEl && <p className="py-6 text-center text-sm text-muted-foreground">Nothing matches “{q}”.</p>}
      {shownSaved.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold"><BookmarkCheck className="size-3.5 text-brand" /> My sections</h3>
          <div className="space-y-1.5">
            {shownSaved.map((x) => (
              <div key={x.id} className="group flex items-center gap-2 rounded-xl border bg-card p-1.5 hover:border-brand">
                <button draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", x.id); e.dataTransfer.effectAllowed = "copy"; setTimeout(() => setDrag({ t: "new-sec", preset: `saved:${x.id}` }), 0); }} onDragEnd={() => setDrag(null)} onClick={() => addSection(`saved:${x.id}`)} aria-label={`Add ${x.name}`} className="min-w-0 flex-1 text-left">
                  <Thumb s={x.sec} />
                  <div className="mt-1 truncate px-0.5 text-[12px] font-medium">{x.name}</div>
                </button>
                <button onClick={() => delSaved(x.id)} aria-label={`Remove ${x.name} from My sections`} className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-secondary hover:text-chili focus-visible:opacity-100 group-hover:opacity-100"><X className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </section>
      )}
      {shownThumbs.length > 0 && <section>
        <h3 className="mb-2 text-[13px] font-semibold">Sections</h3>
        <p className="mb-2 text-xs text-muted-foreground">Drag onto the page, or click to add after the selected section.</p>
        <div className="grid grid-cols-2 gap-2">
          {shownThumbs.map(({ p, s }) => (
            <button key={p.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", p.id); e.dataTransfer.effectAllowed = "copy"; setTimeout(() => setDrag({ t: "new-sec", preset: p.id }), 0); }} onDragEnd={() => setDrag(null)} onClick={() => addSection(p.id)}
              className="group rounded-xl border bg-card p-1.5 text-left transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md" aria-label={`Add ${p.label}`}>
              <Thumb s={s} />
              <div className="mt-1.5 px-0.5 text-[12px] font-medium leading-tight">{p.label}</div>
              <div className="px-0.5 text-[11px] leading-tight text-muted-foreground">{p.hint}</div>
            </button>
          ))}
        </div>
      </section>}
      {groups.map((g) => elementLibrary.some((e) => e.group === g && m(e.label, e.hint, e.kind)) && (
        <section key={g}>
          <h3 className="mb-2 text-[13px] font-semibold">{g === "Basics" ? "Basic elements" : g === "Store" ? "Store elements" : "Layout helpers"}</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {elementLibrary.filter((e) => e.group === g && m(e.label, e.hint, e.kind)).map((e) => {
              const I = icons[e.kind];
              return (
                <button key={e.kind} draggable onDragStart={(ev) => { ev.dataTransfer.setData("text/plain", e.kind); ev.dataTransfer.effectAllowed = "copy"; setTimeout(() => setDrag({ t: "new-el", kind: e.kind }), 0); }} onDragEnd={() => setDrag(null)} onClick={() => addEl(e.kind)} title={e.hint}
                  className="flex flex-col items-center gap-1.5 rounded-xl border bg-card px-1 py-2.5 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md" aria-label={`Add ${e.label}`}>
                  <I className="size-[18px] text-brand" />
                  <span className="text-[11px] font-medium leading-tight">{e.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function LayerRow({ depth, label, icon: I, selected, hidden, onClick, onToggle, drag, dropTarget, open, onOpen }: {
  depth: number; label: string; icon?: React.ComponentType<{ className?: string }>; selected?: boolean; hidden?: boolean; onClick: () => void; onToggle?: () => void;
  drag?: { start: () => void }; dropTarget?: { kind: "el" | "section"; id: string }; open?: boolean; onOpen?: () => void;
}) {
  const { over, setOver, drop, drag: d, setDrag } = useSite();
  const accepts = dropTarget && d && (dropTarget.kind === "el" ? d.t === "el" || d.t === "new-el" : d.t === "section" || d.t === "new-sec");
  const pos = (e: React.DragEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return e.clientY < r.top + r.height / 2 ? "before" : "after"; };
  const key = (p: "before" | "after") => dropTarget && targetKey({ kind: dropTarget.kind, id: dropTarget.id, pos: p } as Target);
  return (
    <div
      draggable={!!drag}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", label); e.dataTransfer.effectAllowed = "move"; setTimeout(() => drag?.start(), 0); }}
      onDragEnd={() => setDrag(null)}
      onDragOver={accepts ? (e) => { e.preventDefault(); setOver(key(pos(e))!); } : undefined}
      onDrop={accepts ? (e) => { e.preventDefault(); drop({ kind: dropTarget!.kind, id: dropTarget!.id, pos: pos(e) } as Target); } : undefined}
      className={cn("group relative flex items-center gap-1 rounded-lg py-1 pr-1 text-[13px]", selected ? "bg-brand/10 text-brand" : "hover:bg-secondary", hidden && "opacity-50")}
      style={{ paddingLeft: 4 + depth * 14 }}
    >
      {over === key("before") && <i className="absolute inset-x-1 top-0 h-0.5 rounded bg-[#ff3d81]" />}
      {over === key("after") && <i className="absolute inset-x-1 bottom-0 h-0.5 rounded bg-[#ff3d81]" />}
      {onOpen ? <button onClick={onOpen} aria-label="Expand" className="grid size-5 place-items-center"><ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} /></button> : <span className="size-5" />}
      {drag && <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/60" />}
      {I && <I className="size-3.5 shrink-0" />}
      <button onClick={onClick} className="min-w-0 flex-1 truncate text-left">{label}</button>
      {onToggle && <button onClick={onToggle} aria-label={hidden ? "Show" : "Hide"} className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 hover:bg-card group-hover:opacity-100">{hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>}
    </div>
  );
}

function LayersTab() {
  const { doc, pageId, sel, select, setDrag, patchSection } = useSite();
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const row = (s: Section, footer?: boolean) => {
    const open = !closed[s.id];
    return (
      <div key={s.id}>
        <LayerRow depth={0} icon={footer ? PanelBottom : Rows3} label={s.name} selected={sel?.type === "section" && sel.id === s.id} hidden={!s.visible}
          onClick={() => select({ type: "section", id: s.id })} onToggle={footer ? undefined : () => patchSection(s.id, { visible: !s.visible })}
          drag={footer ? undefined : { start: () => setDrag({ t: "section", id: s.id }) }} dropTarget={footer ? undefined : { kind: "section", id: s.id }} open={open} onOpen={() => setClosed({ ...closed, [s.id]: open })} />
        {open && s.cols.map((c, ci) => (
          <div key={c.id}>
            {s.cols.length > 1 && <div className="py-0.5 text-[11px] text-muted-foreground" style={{ paddingLeft: 40 }}>Column {ci + 1}</div>}
            {c.els.map((e) => (
              <LayerRow key={e.id} depth={s.cols.length > 1 ? 3 : 2} icon={icons[e.kind]} label={e.kind === "heading" || e.kind === "text" || e.kind === "badge" ? String(e.p.text).slice(0, 28) : e.kind === "button" ? String(e.p.label) : kindLabel(e.kind)}
                selected={sel?.type === "el" && sel.id === e.id} onClick={() => select({ type: "el", id: e.id })} drag={{ start: () => setDrag({ t: "el", id: e.id }) }} dropTarget={{ kind: "el", id: e.id }} />
            ))}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="p-2">
      <LayerRow depth={0} icon={PanelTop} label="Header" selected={sel?.type === "header"} onClick={() => select({ type: "header", id: "header" })} />
      {page.sections.map((s) => row(s))}
      {row(doc.footer, true)}
    </div>
  );
}

function PagesTab() {
  const { doc, pageId, setPageId, addPage } = useSite();
  const [name, setName] = useState("");
  return (
    <div className="space-y-3 p-3">
      <div className="space-y-1.5">
        {doc.pages.map((p) => (
          <button key={p.id} onClick={() => setPageId(p.id)} className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition", p.id === pageId ? "border-brand bg-brand/5" : "hover:bg-secondary")}>
            {p.path === "/" ? <Home className="size-4 text-brand" /> : <FileText className="size-4 text-muted-foreground" />}
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{p.name}</span><span className="block font-mono text-[11px] text-muted-foreground">{p.path}</span></span>
            {p.showInNav && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">In menu</span>}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addPage(name.trim()); setName(""); } }} className="flex gap-1.5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New page name" suggest={["Wholesale", "Size guide", "Lookbook", "Shipping and returns"]} className="h-9" aria-label="New page name" />
        <Button type="submit" variant="brand" size="sm"><Plus /> Add</Button>
      </form>
      <p className="text-xs text-muted-foreground">Rename, set the address or make a page your home page from Site settings → Page.</p>
    </div>
  );
}

export function LeftPanel() {
  const { leftTab, setLeftTab } = useSite();
  const issues = useIssues();
  const bad = issues.filter((i) => i.level !== "tip").length;
  const tabs = [["add", "Add", Sparkles], ["layers", "Layers", Rows3], ["pages", "Pages", AppWindow], ["checks", "Checks", ShieldCheck]] as const;
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex gap-0.5 border-b p-2" role="tablist" aria-label="Builder panels">
        {tabs.map(([k, label, I]) => (
          <button key={k} role="tab" aria-selected={leftTab === k} onClick={() => setLeftTab(k)} className={cn("relative flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[12px] font-medium transition focus-visible:ring-2 focus-visible:ring-ring/40", leftTab === k ? "bg-secondary" : "text-muted-foreground hover:text-foreground")}>
            <I className="size-3.5" /> {label}
            {k === "checks" && bad > 0 && <span className="grid min-w-4 place-items-center rounded-full bg-chili px-1 text-[10px] font-semibold leading-4 text-white" aria-label={`${bad} issues`}>{bad}</span>}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{leftTab === "add" ? <AddTab /> : leftTab === "layers" ? <LayersTab /> : leftTab === "pages" ? <PagesTab /> : <ChecksTab />}</div>
    </aside>
  );
}
void Star;
