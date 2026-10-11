"use client";
import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auditDoc, type Issue } from "@/lib/a11y";
import { useSite, locateEl } from "@/lib/site-store";
import { cn } from "@/lib/utils";

export function useIssues() {
  const doc = useSite((s) => s.doc);
  const pageId = useSite((s) => s.pageId);
  return useMemo(() => auditDoc(doc, pageId), [doc, pageId]);
}

const levelMeta = {
  error: { icon: XCircle, cls: "text-red-600", label: "Fix" },
  warn: { icon: AlertTriangle, cls: "text-amber-600", label: "Review" },
  tip: { icon: Info, cls: "text-sky-600", label: "Tip" },
} as const;

export function ChecksTab() {
  const issues = useIssues();
  const { setPageId, select, edit, announce, pageId } = useSite();
  const go = (i: Issue) => {
    if (i.pageId && i.pageId !== pageId) setPageId(i.pageId);
    if (i.sel) setTimeout(() => {
      select(i.sel!);
      const q = i.sel!.type === "el" ? `[data-el="${i.sel!.id}"]` : `[data-sec="${i.sel!.id}"]`;
      document.querySelector(q)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 30);
  };
  const apply = (i: Issue) => {
    if (!i.fix || !i.sel) return;
    const patch = i.fix.patch;
    edit((d) => {
      const l = locateEl(d, i.sel!.id);
      if (!l) return;
      if (patch.el) Object.assign(l.el.p, patch.el);
      if (patch.s) for (const [k, v] of Object.entries(patch.s)) { if (v === undefined) delete (l.el.s as Record<string, unknown>)[k]; else (l.el.s as Record<string, unknown>)[k] = v; }
    });
    announce(`${i.fix.label}: done`);
  };
  const counts = { error: issues.filter((i) => i.level === "error").length, warn: issues.filter((i) => i.level === "warn").length, tip: issues.filter((i) => i.level === "tip").length };
  const order = { error: 0, warn: 1, tip: 2 } as const;
  const sorted = [...issues].sort((a, b) => order[a.level] - order[b.level]);
  return (
    <div className="p-3">
      <div className="mb-3 rounded-xl border p-3">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-700"><CheckCircle2 className="size-4" /> No problems found on this page</div>
        ) : (
          <>
            <div className="text-[13px] font-semibold">{counts.error ? `${counts.error} to fix` : "Nothing blocking"}{counts.warn ? `, ${counts.warn} to review` : ""}{counts.tip ? `, ${counts.tip} tip${counts.tip > 1 ? "s" : ""}` : ""}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Checks this page, the header and the footer against common accessibility guidelines. Updates as you edit.</p>
          </>
        )}
      </div>
      <ul className="space-y-2" aria-live="polite">
        {sorted.map((i) => {
          const m = levelMeta[i.level];
          const I = m.icon;
          return (
            <li key={i.id} className="rounded-xl border bg-card p-3">
              <div className="flex gap-2.5">
                <I className={cn("mt-0.5 size-4 shrink-0", m.cls)} aria-label={m.label} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium leading-snug">{i.title}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>
                  <div className="mt-2 flex gap-1.5">
                    {(i.sel || i.pageId) && <Button variant="outline" size="xs" onClick={() => go(i)}>Show me</Button>}
                    {i.fix && <Button variant="brand" size="xs" onClick={() => apply(i)}>{i.fix.label}</Button>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
