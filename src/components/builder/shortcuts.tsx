"use client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useSite } from "@/lib/site-store";

const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
const groups: { title: string; rows: [string, string][] }[] = [
  { title: "Find and add", rows: [[`${mod} K`, "Open the command palette"], ["/", "Show this list"], ["Tab", "Move between blocks on the page"], ["Enter", "Select the focused section"]] },
  { title: "Edit", rows: [[`${mod} Z`, "Undo"], [`${mod} ⇧ Z`, "Redo"], [`${mod} C / X / V`, "Copy, cut, paste an element or section"], [`${mod} D`, "Duplicate"], ["⌫", "Delete the selection"], [`${mod} ⌥ C / V`, "Copy / paste style"]] },
  { title: "Move and select", rows: [["⌥ ↑ / ⌥ ↓", "Move the selection up or down"], ["Esc", "Select the parent, then clear"], ["Double-click text", "Edit it in place"], ["Drag the grip", "Move by mouse"]] },
  { title: "View", rows: [[`${mod} P`, "Preview or return to editing"], [`${mod} '`, "Show or hide outlines"], ["1 / 2 / 3", "Desktop, tablet, mobile"]] },
];

export function ShortcutsDialog() {
  const open = useSite((s) => s.helpOpen);
  const setUi = useSite((s) => s.setUi);
  return (
    <Dialog open={open} onOpenChange={(v) => setUi({ helpOpen: v })}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Everything in the builder works without a mouse.</DialogDescription>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {groups.map((g) => (
            <section key={g.title}>
              <h3 className="mb-2 text-sm font-semibold">{g.title}</h3>
              <dl className="space-y-1.5">
                {g.rows.map(([k, d]) => (
                  <div key={k} className="flex items-center justify-between gap-3 text-[13px]"><dt className="text-muted-foreground">{d}</dt><dd><kbd className="rounded border bg-secondary px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd></dd></div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
