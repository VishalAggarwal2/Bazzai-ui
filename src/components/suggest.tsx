"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { mock, type Opt } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export type SuggestSource = string | (string | Opt)[];

const normalise = (s: SuggestSource): Opt[] =>
  typeof s === "string" ? mock[s] ?? [] : s.map((x) => (typeof x === "string" ? { value: x } : x));

/** Fills a React-controlled or uncontrolled input from outside, so onChange handlers still fire. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Wrap any input. When it is focused, a small panel offers sample values that fill the field on click.
 * The panel respects the global "Sample data" switch in the header.
 */
export function Suggest({ options, children, className, onPick }: { options: SuggestSource; children: React.ReactNode; className?: string; onPick?: (v: string) => void }) {
  const helpers = useStudio((s) => s.helpers);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const all = normalise(options);
  const matches = q ? all.filter((o) => o.value.toLowerCase().includes(q.toLowerCase()) && o.value.toLowerCase() !== q.toLowerCase()) : all;
  const list = matches.length ? matches : all;

  const field = () => root.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:not([type=checkbox]):not([type=range]):not([type=color]), textarea");
  const pick = useCallback((v: string) => {
    const el = field();
    if (el) { setNativeValue(el, v); el.focus(); }
    onPick?.(v);
    setOpen(false);
  }, [onPick]);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  if (!helpers || all.length === 0) return <div className={cn("relative", className)}>{children}</div>;
  return (
    <div
      ref={root}
      className={cn("relative", className)}
      onFocusCapture={(e) => { if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) { setQ((e.target as HTMLInputElement).value); setOpen(true); } }}
      onClickCapture={(e) => { if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) setOpen(true); }}
      onInputCapture={(e) => setQ((e.target as HTMLInputElement).value)}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); } }}
    >
      {children}
      {open && (
        <div
          role="listbox"
          aria-label="Sample data"
          className="absolute left-0 top-full z-[70] mt-1.5 w-full min-w-[260px] max-w-[440px] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-brand">
            <Sparkles className="size-3" /> Sample data. Click one to fill this field.
          </div>
          {list.slice(0, 5).map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o.value)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
            >
              <span className="min-w-0 flex-1 truncate">{o.value}</span>
              {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
