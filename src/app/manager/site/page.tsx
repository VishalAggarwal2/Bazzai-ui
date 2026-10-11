"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Eye, History, Keyboard, Monitor, Pencil, Redo2, Rocket, Scan, Search, Smartphone, Tablet, Undo2, Undo, X } from "lucide-react";
import { Inspector } from "@/components/builder/inspector";
import { LeftPanel } from "@/components/builder/left-panel";
import { BuilderPalette } from "@/components/builder/builder-palette";
import { ShortcutsDialog } from "@/components/builder/shortcuts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { useSite } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const widths = { desktop: 1200, tablet: 820, mobile: 390 } as const;

function Ruler({ width, zoom }: { width: number; zoom: number }) {
  const marks = Array.from({ length: Math.floor(width / 100) + 1 }, (_, i) => i * 100);
  return (
    <div className="relative mb-2 h-5 select-none text-[10px] text-muted-foreground" style={{ width: width * zoom }}>
      <div className="absolute inset-x-0 bottom-0 h-1.5 border-b" style={{ backgroundImage: "linear-gradient(to right, var(--border) 1px, transparent 1px)", backgroundSize: `${10 * zoom}px 100%`, opacity: 0.7 }} />
      {marks.map((m) => <span key={m} className="absolute bottom-1.5 border-l pl-1 leading-none" style={{ left: m * zoom, height: 10 }}>{m}</span>)}
      <span className="absolute -top-0.5 right-0 rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">{width}px</span>
    </div>
  );
}

export default function SiteBuilder() {
  const s = useSite();
  const { doc, device, setDevice, zoom, setZoom, pageId, setPageId, undo, redo, past, future, dirty, publish, discard, select, preview, setUi, outlines, hintsOpen, say, versions, restore } = s;
  const setPreview = (v: boolean) => setUi({ preview: v });
  const tenantId = useStudio((x) => x.tenantId);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const host = t.domain ?? `${t.slug}.${ROOT_DOMAIN}`;
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  const wrap = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(900);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const W = widths[device];
  const fit = Math.min(1, (cw - 56) / W);
  const z = zoom === 0 ? fit : zoom / 100;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !!el.closest("[role=dialog]");
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      const st = useSite.getState();
      if (mod && k === "z" && !typing) { e.preventDefault(); e.shiftKey ? st.redo() : st.undo(); }
      else if (mod && k === "y" && !typing) { e.preventDefault(); st.redo(); }
      else if (typing) return;
      else if (mod && e.altKey && k === "c" && st.sel?.type === "el") { e.preventDefault(); st.copyStyle(st.sel.id); }
      else if (mod && e.altKey && k === "v" && st.sel?.type === "el") { e.preventDefault(); st.pasteStyle(st.sel.id); }
      else if (mod && k === "c" && st.sel && window.getSelection()?.isCollapsed !== false) { e.preventDefault(); st.copySel(); }
      else if (mod && k === "x" && st.sel) { e.preventDefault(); st.copySel(true); }
      else if (mod && k === "v" && st.clip) { e.preventDefault(); st.pasteClip(); }
      else if (mod && k === "p") { e.preventDefault(); st.setUi({ preview: !st.preview }); st.select(null); }
      else if (mod && k === "'") { e.preventDefault(); st.setUi({ outlines: !st.outlines }); }
      else if (mod && k === "d" && st.sel) { e.preventDefault(); if (st.sel.type === "el") st.dupEl(st.sel.id); else if (st.sel.type === "section" && st.sel.id !== "footer") st.dupSection(st.sel.id); }
      else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && st.sel) { e.preventDefault(); st.moveSel(e.key === "ArrowUp" ? -1 : 1); }
      else if (st.sel && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); if (st.sel.type === "el") st.delEl(st.sel.id); else if (st.sel.type === "section" && st.sel.id !== "footer") st.delSection(st.sel.id); }
      else if (e.key === "Escape") st.selectParent();
      else if (e.key === "/" && !mod) { e.preventDefault(); st.setUi({ helpOpen: true }); }
      else if (!mod && !e.altKey && ["1", "2", "3"].includes(e.key)) st.setDevice((["desktop", "tablet", "mobile"] as const)[Number(e.key) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] min-h-[560px] flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={page.id} onValueChange={setPageId}>
          <SelectTrigger className="h-9 w-44" aria-label="Page"><SelectValue /></SelectTrigger>
          <SelectContent>{doc.pages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        <span className="hidden truncate rounded-lg border bg-card px-2.5 py-1.5 font-mono text-xs text-muted-foreground md:inline">{host}{page.path}</span>

        <div className="mx-auto flex items-center gap-2">
          <div className="flex rounded-xl border bg-card p-0.5" role="group" aria-label="Preview size">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([k, I]) => (
              <Tooltip key={k}><TooltipTrigger asChild><Button variant={device === k ? "secondary" : "ghost"} size="icon-sm" onClick={() => setDevice(k)} aria-label={k} aria-pressed={device === k}><I /></Button></TooltipTrigger><TooltipContent className="capitalize">{k} · {widths[k]}px</TooltipContent></Tooltip>
            ))}
          </div>
          <Select value={String(zoom)} onValueChange={(v) => setZoom(Number(v))}>
            <SelectTrigger className="h-9 w-[104px]" aria-label="Zoom"><SelectValue>{zoom === 0 ? `Fit ${Math.round(fit * 100)}%` : `${zoom}%`}</SelectValue></SelectTrigger>
            <SelectContent>{[["0", "Fit to screen"], ["50", "50%"], ["75", "75%"], ["100", "100%"], ["125", "125%"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-sm" onClick={undo} disabled={!past.length} aria-label="Undo"><Undo2 /></Button></TooltipTrigger><TooltipContent>Undo (⌘Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-sm" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 /></Button></TooltipTrigger><TooltipContent>Redo (⇧⌘Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-sm" onClick={() => setUi({ paletteOpen: true })} aria-label="Search commands"><Search /></Button></TooltipTrigger><TooltipContent>Find anything (⌘K)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant={outlines ? "secondary" : "outline"} size="icon-sm" onClick={() => setUi({ outlines: !outlines })} aria-pressed={outlines} aria-label="Show outlines"><Scan /></Button></TooltipTrigger><TooltipContent>Outline every block (⌘')</TooltipContent></Tooltip>
          <Popover>
            <Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><Button variant="outline" size="icon-sm" aria-label="Version history"><History /></Button></PopoverTrigger></TooltipTrigger><TooltipContent>Version history</TooltipContent></Tooltip>
            <PopoverContent align="end" className="w-72 p-2">
              <div className="px-2 pb-1.5 pt-1 text-[13px] font-semibold">Version history</div>
              <ul className="max-h-72 space-y-0.5 overflow-auto">
                {versions.map((v, i) => (
                  <li key={v.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary">
                    <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{v.at === 0 ? "Starting design" : v.label}</span><span className="block text-[11px] text-muted-foreground">{v.at === 0 ? "Where you began" : new Date(v.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}{i === 0 && !dirty ? " · live now" : ""}</span></span>
                    <Button variant="ghost" size="xs" onClick={() => { restore(v.id); toast("Version restored", { description: "Publish when you are happy with it." }); }}>Restore</Button>
                  </li>
                ))}
              </ul>
              <p className="px-2 pt-2 text-[11px] text-muted-foreground">A version is saved every time you publish.</p>
            </PopoverContent>
          </Popover>
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-sm" onClick={() => setUi({ helpOpen: true })} aria-label="Keyboard shortcuts"><Keyboard /></Button></TooltipTrigger><TooltipContent>Shortcuts (/)</TooltipContent></Tooltip>
          <Button variant={preview ? "secondary" : "outline"} size="sm" onClick={() => { setPreview(!preview); select(null); }}>{preview ? <><Pencil /> Edit</> : <><Eye /> Preview</>}</Button>
          <Button variant="outline" size="icon-sm" asChild><Link href="/store" target="_blank" aria-label="Open published store"><ExternalLink /></Link></Button>
          {dirty && <Button variant="ghost" size="sm" onClick={() => { discard(); toast("Back to the published version"); }}><Undo /> Discard</Button>}
          <Badge variant={dirty ? "warn" : "success"} className="hidden xl:inline-flex">{dirty ? "Unpublished" : "Live"}</Badge>
          <Button variant="brand" size="sm" disabled={!dirty} onClick={() => { publish(); toast.success("Published", { description: `${host} now shows your latest changes.` }); }}><Rocket /> Publish</Button>
        </div>
      </div>

      <div className={cn("grid min-h-0 flex-1 gap-2.5", preview ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_320px]")}>
        {!preview && <div className="hidden min-h-0 lg:block"><LeftPanel /></div>}
        <div ref={wrap} data-outlines={outlines && !preview ? "true" : undefined} className="dot-grid relative min-h-0 overflow-auto rounded-2xl border bg-secondary/50" onClick={() => select(null)}>
          {!preview && hintsOpen && (
            <div className="sticky top-2 z-20 mx-auto mt-2 flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl border bg-card/95 px-3.5 py-2 text-xs shadow-lg backdrop-blur" onClick={(e) => e.stopPropagation()} role="note">
              <span className="text-muted-foreground"><b className="font-medium text-foreground">Click any text to edit it.</b> Drag the grip to move things. Press <kbd className="rounded border bg-secondary px-1 font-mono text-[10px]">⌘K</kbd> to find anything, or open Checks to catch accessibility problems.</span>
              <button onClick={() => setUi({ helpOpen: true })} className="shrink-0 font-medium text-brand hover:underline">Shortcuts</button>
              <button onClick={() => setUi({ hintsOpen: false })} aria-label="Dismiss tips" className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-secondary"><X className="size-3.5" /></button>
            </div>
          )}
          <div className="mx-auto flex w-max min-w-full flex-col items-center px-6 pb-16 pt-5">
            {!preview && <Ruler width={W} zoom={z} />}
            <div className="overflow-hidden rounded-xl border bg-card shadow-[0_30px_60px_-30px_rgb(20_26_58/0.45)]" style={{ width: W * z }}>
              <div className="flex items-center gap-2 border-b bg-card px-3 py-2" style={{ zoom: z < 0.6 ? 1 / z * 0.6 : 1 }}>
                <span className="flex gap-1.5"><i className="size-2.5 rounded-full bg-chili/70" /><i className="size-2.5 rounded-full bg-saffron" /><i className="size-2.5 rounded-full bg-mint/80" /></span>
                <span className="mx-auto truncate rounded-md bg-secondary px-3 py-0.5 font-mono text-[11px] text-muted-foreground">https://{host}{page.path}</span>
              </div>
              <div style={{ zoom: z, width: W }}>
                <StorefrontView mode={preview ? "live" : "edit"} source="draft" />
              </div>
            </div>
          </div>
        </div>
        {!preview && <div className="hidden min-h-0 xl:block"><Inspector /></div>}
      </div>
      {!preview && <p className="text-center text-xs text-muted-foreground xl:hidden">Open the builder on a wider screen to see the inspector.</p>}
      <div aria-live="polite" role="status" className="sr-only">{say}</div>
      <BuilderPalette />
      <ShortcutsDialog />
    </div>
  );
}
