"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowUpFromLine, BookmarkCheck, ClipboardPaste, Copy, Eye, FileText, Keyboard, Layers, Monitor, Plus, Rocket, Scan, Smartphone, Tablet, Trash2, Undo2, ShieldCheck, Pencil,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { elementLibrary, kindLabel, sectionPresets } from "@/lib/builder";
import { useSite } from "@/lib/site-store";

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function BuilderPalette() {
  const s = useSite();
  const { paletteOpen: open, setUi, doc, pageId, sel, saved, clip, preview, dirty } = s;
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); e.stopPropagation();
        useSite.getState().setUi({ paletteOpen: !useSite.getState().paletteOpen });
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);
  const run = (fn: () => void) => () => { setUi({ paletteOpen: false }); setTimeout(fn, 0); };
  const elems = page.sections.flatMap((sec) => sec.cols.flatMap((c) => c.els.map((e) => ({ e, sec }))));
  return (
    <Dialog open={open} onOpenChange={(v) => setUi({ paletteOpen: v })}>
      <DialogContent className="top-[18%] translate-y-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Builder commands</DialogTitle>
        <DialogDescription className="sr-only">Search for anything you can add, jump to or do in the website builder.</DialogDescription>
        <Command>
          <CommandInput placeholder="Add a section, jump to a layer, change a setting…" />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>Nothing matches. Try “hero”, “form”, “mobile” or “publish”.</CommandEmpty>
            {sel && (
              <CommandGroup heading={sel.type === "el" ? "Selected element" : "Selected"}>
                <CommandItem onSelect={run(() => s.copySel())}><Copy /> Copy <Kbd k="C" /></CommandItem>
                <CommandItem onSelect={run(() => s.copySel(true))}><Copy /> Cut <Kbd k="X" /></CommandItem>
                {sel.type === "el" && <CommandItem onSelect={run(() => s.dupEl(sel.id))}><Copy /> Duplicate <Kbd k="D" /></CommandItem>}
                {sel.type === "section" && sel.id !== "footer" && <CommandItem onSelect={run(() => s.dupSection(sel.id))}><Copy /> Duplicate section <Kbd k="D" /></CommandItem>}
                {sel.type === "section" && sel.id !== "footer" && <CommandItem onSelect={run(() => s.saveSection(sel.id, ""))}><BookmarkCheck /> Save section to My sections</CommandItem>}
                <CommandItem onSelect={run(() => s.selectParent())}><ArrowUpFromLine /> Select the parent <Kbd k="Esc" bare /></CommandItem>
                {sel.type !== "header" && sel.id !== "footer" && <CommandItem onSelect={run(() => (sel.type === "el" ? s.delEl(sel.id) : s.delSection(sel.id)))}><Trash2 /> Delete <Kbd k="⌫" bare /></CommandItem>}
              </CommandGroup>
            )}
            {clip && <CommandGroup heading="Clipboard"><CommandItem onSelect={run(() => s.pasteClip())}><ClipboardPaste /> Paste {clip.t === "el" ? "element" : "section"} <Kbd k="V" /></CommandItem></CommandGroup>}
            <CommandGroup heading="Add a section">
              {saved.map((sv) => <CommandItem key={sv.id} value={`my section ${sv.name}`} onSelect={run(() => s.addSection(`saved:${sv.id}`))}><BookmarkCheck /> {sv.name}<span className="ml-auto text-xs text-muted-foreground">Mine</span></CommandItem>)}
              {sectionPresets.map((p) => <CommandItem key={p.id} value={`section ${p.label} ${p.hint}`} onSelect={run(() => s.addSection(p.id))}><Plus /> {p.label}<span className="ml-auto text-xs text-muted-foreground">{p.hint}</span></CommandItem>)}
            </CommandGroup>
            <CommandGroup heading="Add an element">
              {elementLibrary.map((e) => <CommandItem key={e.kind} value={`element ${e.label} ${e.hint}`} onSelect={run(() => s.addEl(e.kind))}><Plus /> {e.label}<span className="ml-auto text-xs text-muted-foreground">{e.hint}</span></CommandItem>)}
            </CommandGroup>
            <CommandGroup heading="Jump to">
              {doc.pages.map((p) => <CommandItem key={p.id} value={`page ${p.name} ${p.path}`} onSelect={run(() => s.setPageId(p.id))}><FileText /> {p.name}<span className="ml-auto font-mono text-xs text-muted-foreground">{p.path}</span></CommandItem>)}
              <CommandItem value="header menu logo" onSelect={run(() => s.select({ type: "header", id: "header" }))}><Layers /> Header</CommandItem>
              {[...page.sections, doc.footer].map((sec) => <CommandItem key={sec.id} value={`section ${sec.name}`} onSelect={run(() => { s.select({ type: "section", id: sec.id }); document.querySelector(`[data-sec="${sec.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }); })}><Layers /> {sec.name}<span className="ml-auto text-xs text-muted-foreground">Section</span></CommandItem>)}
              {elems.slice(0, 60).map(({ e, sec }) => {
                const label = e.kind === "heading" || e.kind === "text" || e.kind === "badge" ? String(e.p.text).slice(0, 40) : e.kind === "button" ? String(e.p.label) : kindLabel(e.kind);
                return <CommandItem key={e.id} value={`element ${kindLabel(e.kind)} ${label} ${sec.name}`} onSelect={run(() => { s.select({ type: "el", id: e.id }); document.querySelector(`[data-el="${e.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }); })}><Scan /> {label}<span className="ml-auto text-xs text-muted-foreground">{kindLabel(e.kind)} · {sec.name}</span></CommandItem>;
              })}
            </CommandGroup>
            <CommandGroup heading="View">
              <CommandItem value="desktop view" onSelect={run(() => s.setDevice("desktop"))}><Monitor /> Desktop view</CommandItem>
              <CommandItem value="tablet view" onSelect={run(() => s.setDevice("tablet"))}><Tablet /> Tablet view</CommandItem>
              <CommandItem value="mobile phone view" onSelect={run(() => s.setDevice("mobile"))}><Smartphone /> Mobile view</CommandItem>
              <CommandItem value="preview edit toggle" onSelect={run(() => { s.setUi({ preview: !preview }); s.select(null); })}>{preview ? <Pencil /> : <Eye />} {preview ? "Back to editing" : "Preview the site"}<Kbd k="P" /></CommandItem>
              <CommandItem value="outlines show boundaries" onSelect={run(() => s.setUi({ outlines: !s.outlines }))}><Scan /> {s.outlines ? "Hide outlines" : "Show outlines around everything"}<Kbd k="'" /></CommandItem>
              <CommandItem value="checks accessibility" onSelect={run(() => s.setLeftTab("checks"))}><ShieldCheck /> Run accessibility checks</CommandItem>
              <CommandItem value="keyboard shortcuts help" onSelect={run(() => s.setUi({ helpOpen: true }))}><Keyboard /> Keyboard shortcuts<Kbd k="/" /></CommandItem>
            </CommandGroup>
            <CommandGroup heading="Site">
              <CommandItem value="undo" onSelect={run(() => s.undo())}><Undo2 /> Undo <Kbd k="Z" /></CommandItem>
              <CommandItem value="publish go live" onSelect={run(() => { if (dirty) { s.publish(); toast.success("Published"); } else toast("Nothing new to publish"); })}><Rocket /> Publish changes</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ k, bare }: { k: string; bare?: boolean }) {
  return <kbd className="ml-auto rounded border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{bare ? k : `${isMac() ? "⌘" : "Ctrl+"}${k}`}</kbd>;
}
