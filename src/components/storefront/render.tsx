"use client";
import { createContext, createElement, useContext, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Copy, Eye, EyeOff, GripVertical, Pause, Play, ShoppingBag, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Suggest } from "@/components/suggest";
import { fontById, kindLabel, onColor, tokenHex, type Col, type Device, type El, type Section, type Theme } from "@/lib/builder";
import { inr } from "@/lib/format";
import { useSite, type Target, targetKey } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { DataListEl, FormEl } from "./data-els";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/lib/data";

export type Mode = "edit" | "live";
export const ModeCtx = createContext<Mode>("live");
export const NavCtx = createContext<(href: string) => void>(() => {});
export const useMode = () => useContext(ModeCtx);
export const useNav = () => useContext(NavCtx);

/* ---------- theme -> css ---------- */
export function themeVars(t: Theme): CSSProperties {
  const body = fontById(t.body);
  return {
    "--s-bg": t.bg, "--s-fg": t.fg, "--s-surface": t.surface, "--s-brand": t.brand, "--s-on-brand": onColor(t.brand),
    "--s-accent": t.accent, "--s-on-accent": onColor(t.accent), "--s-radius": `${t.radius}px`, "--stripe-a": t.brand, "--stripe-b": t.surface,
    "--s-focus": t.focus ?? t.brand,
    "--s-shadow": t.cardShadow === "soft" ? "0 2px 12px -2px rgb(20 26 58 / .14)" : t.cardShadow === "lifted" ? "0 18px 36px -14px rgb(20 26 58 / .38)" : "none",
    fontFamily: body.family, fontSize: t.base,
  } as CSSProperties;
}
export const cv = (token?: string, fallback?: string) => {
  if (!token) return fallback;
  if (["bg", "fg", "surface", "brand", "accent"].includes(token)) return `var(--s-${token})`;
  if (token === "on-brand") return "var(--s-on-brand)";
  return token;
};
export const btnRadius = (t: Theme, r?: number) => (r !== undefined ? r : t.btn === "pill" ? 999 : t.btn === "soft" ? t.radius : 2);

export function typeStyle(el: El, t: Theme, role: "head" | "body"): CSSProperties & Record<string, unknown> {
  const s = el.s;
  const fid = s.font === "head" ? t.head : s.font === "body" ? t.body : s.font || (role === "head" ? t.head : t.body);
  const f = fontById(fid);
  const isHead = fid === t.head && role === "head" || (s.font && s.font !== "body");
  const sizeBase = s.size ?? (role === "head" ? 44 : 16);
  const size = role === "head" ? sizeBase * t.headScale : sizeBase * (t.base / 16);
  const auto = size > 40 ? size * 0.58 : size > 22 ? size * 0.78 : size > 17 ? size * 0.92 : size;
  const mobile = s.sizeM ? s.sizeM : auto;
  return {
    fontFamily: f.family,
    fontWeight: s.weight ?? (isHead ? (fid === t.head && t.headWeight ? t.headWeight : f.weight) : 400),
    letterSpacing: `${s.ls ?? (isHead ? f.track : 0)}em`,
    lineHeight: s.lh ?? (isHead ? f.lh : 1.5),
    fontVariationSettings: isHead && f.wdth ? `"wdth" ${f.wdth}` : undefined,
    fontStyle: s.italic ? "italic" : undefined,
    textTransform: s.caps ? "uppercase" : undefined,
    textDecoration: s.underline ? "underline" : undefined,
    textAlign: s.align,
    color: cv(s.color),
    opacity: s.opacity !== undefined ? s.opacity / 100 : undefined,
    maxWidth: s.maxw ? s.maxw : undefined,
    ["--fd" as string]: `${size}px`,
    ["--fm" as string]: `${mobile}px`,
  };
}
export const FS = "[font-size:var(--fm)] @2xl:[font-size:var(--fd)]";

/* ---------- box styling shared by every element ---------- */
const shadows = {
  sm: "0 1px 3px rgb(0 0 0 / .14), 0 1px 2px rgb(0 0 0 / .08)",
  md: "0 12px 26px -10px rgb(0 0 0 / .28)",
  lg: "0 28px 50px -18px rgb(0 0 0 / .4)",
  glow: "0 0 0 4px color-mix(in oklab, var(--s-brand) 22%, transparent), 0 10px 34px color-mix(in oklab, var(--s-brand) 38%, transparent)",
} as const;
export const gradOf = (a?: string, b?: string, deg?: number) => (a && b ? `linear-gradient(${deg ?? 135}deg, ${cv(a)}, ${cv(b)})` : undefined);
const nonText = ["image", "divider", "spacer", "products", "collections", "entity", "form", "newsletter", "stats", "feedback"];
export function boxStyle(el: El, t: Theme): CSSProperties {
  const s = el.s;
  const out: CSSProperties = {};
  const back = tokenHex(t, s.ga && s.gb ? s.ga : s.fill);
  if (back && !s.color) out.color = onColor(back);
  if (s.pt) out.paddingTop = s.pt; if (s.pb) out.paddingBottom = s.pb; if (s.pl) out.paddingLeft = s.pl; if (s.pr) out.paddingRight = s.pr;
  const g = gradOf(s.ga, s.gb, s.gdeg);
  if (g) out.backgroundImage = g; else if (s.fill) out.background = cv(s.fill);
  if (s.bd) { out.border = `${s.bd}px ${s.bds ?? "solid"} ${cv(s.bdc, "currentColor")}`; }
  if (s.br !== undefined) out.borderRadius = s.br;
  if (s.shadow) out.boxShadow = shadows[s.shadow];
  if (s.rot) out.transform = `rotate(${s.rot}deg)`;
  if (s.opacity !== undefined && nonText.includes(el.kind)) out.opacity = s.opacity / 100;
  if (s.delay) (out as Record<string, unknown>)["--sf-d"] = `${s.delay}ms`;
  return out;
}
export const boxClass = (el: El, live: boolean) =>
  cn(
    "[overflow-wrap:anywhere]",
    el.s.hover && `sf-h sf-h-${el.s.hover}`,
    live && el.s.anim && `sf-anim sf-a-${el.s.anim}`,
  );
export const safeCss = (css?: string) => (css ?? "").replace(/<\/?style[^>]*>/gi, "").replace(/@import[^;]*;?/gi, "").replace(/expression\s*\(|javascript:/gi, "").trim();

const isExternal = (href: string) => /^(https?:|mailto:|tel:|sms:)/i.test(href);
/** A link that keeps visitors inside the site for pages, scrolls for #anchors and opens everything else normally. */
export function LinkA({ href, newTab, className, style, children, label }: { href: string; newTab?: boolean; className?: string; style?: CSSProperties; children: ReactNode; label?: string }) {
  const nav = useNav();
  return (
    <a
      href={href} className={className} style={style} aria-label={label}
      target={newTab || (isExternal(href) && /^https?:/i.test(href)) ? "_blank" : undefined} rel={newTab || isExternal(href) ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (isExternal(href)) return;
        e.preventDefault();
        if (href.startsWith("#")) { document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" }); return; }
        nav(href);
      }}
    >{children}</a>
  );
}

const hideCls = (hide?: Device[]) =>
  cn(hide?.includes("mobile") && "@max-2xl:hidden", hide?.includes("tablet") && "@2xl:@max-4xl:hidden", hide?.includes("desktop") && "@4xl:hidden");

/* ---------- inline text ---------- */
export function EditableText({ value, onCommit, tag = "span", className, style, single, edit = true, id }: {
  value: string; onCommit: (v: string) => void; tag?: string; className?: string; style?: CSSProperties; single?: boolean; edit?: boolean; id?: string;
}) {
  const mode = useMode();
  const ref = useRef<HTMLElement | null>(null);
  const editable = mode === "edit" && edit;
  useLayoutEffect(() => {
    const n = ref.current;
    if (editable && n && n.innerText !== value && document.activeElement !== n) n.innerText = value;
  }, [value, editable]);
  if (!editable) return createElement(tag, { className, style }, value);
  return createElement(tag, {
    ref, contentEditable: true, suppressContentEditableWarning: true, spellCheck: false, "data-edit": id,
    className: cn(className, "cursor-text whitespace-pre-wrap outline-none focus:outline-none"),
    style,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const t = e.currentTarget.innerText.replace(/\n+$/, "");
      if (t !== value) onCommit(t);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      e.stopPropagation();
      if (e.key === "Escape" || (single && e.key === "Enter")) { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
    },
    onPaste: (e: React.ClipboardEvent) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); },
  });
}

/* ---------- drag helpers ---------- */
function useDropEl(id: string, accepts: ("el" | "new-el" | "section" | "new-sec")[], kind: "el" | "section") {
  const drag = useSite((s) => s.drag);
  const setOver = useSite((s) => s.setOver);
  const drop = useSite((s) => s.drop);
  const live = drag && accepts.includes(drag.t);
  const pos = (e: React.DragEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); return e.clientY < r.top + r.height / 2 ? "before" : "after"; };
  return {
    live: !!live,
    props: live
      ? {
          onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setOver(targetKey({ kind, id, pos: pos(e) } as Target)); },
          onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); drop({ kind, id, pos: pos(e) } as Target); },
        }
      : {},
  };
}

function Grip({ label, onStart, kind }: { label: string; kind: "el" | "section"; onStart: (e: React.DragEvent) => void }) {
  return (
    <span
      draggable
      onDragStart={onStart}
      onDragEnd={() => useSite.getState().setDrag(null)}
      onClick={(e) => e.stopPropagation()}
      title={`Drag to move this ${kind === "el" ? "element" : "section"}`}
      className="grid size-6 cursor-grab place-items-center rounded-md hover:bg-white/20 active:cursor-grabbing"
      aria-label={label}
    >
      <GripVertical className="size-3.5" />
    </span>
  );
}
const Tb = ({ onClick, children, title }: { onClick: () => void; children: ReactNode; title: string }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={title} aria-label={title} className="grid size-6 place-items-center rounded-md hover:bg-white/20">{children}</button>
);

/* ---------- element frame ---------- */
function ElFrame({ el, children }: { el: El; children: ReactNode }) {
  const { sel, select, over, setDrag, dupEl, delEl, nudgeEl } = useSite();
  const on = sel?.type === "el" && sel.id === el.id;
  const { props } = useDropEl(el.id, ["el", "new-el"], "el");
  const ref = useRef<HTMLDivElement>(null);
  const isOver = (p: string) => over === `el:${el.id}:${p}`;
  return (
    <div
      ref={ref}
      data-el={el.id}
      data-on={on}
      tabIndex={0}
      role="group"
      aria-label={`${kindLabel(el.kind)} element${on ? ", selected" : ""}. Alt and arrow keys move it.`}
      {...props}
      onClick={(e) => { e.stopPropagation(); select({ type: "el", id: el.id }); }}
      onFocusCapture={() => !on && select({ type: "el", id: el.id })}
      className={cn("group/el relative focus-visible:outline-2 focus-visible:outline-[#3340ff]", el.s.inline ? "max-w-full shrink-0" : "w-full basis-full", "rounded-[3px] outline outline-1 -outline-offset-1 transition-[outline-color]", on ? "outline-2 outline-[#3340ff]" : "outline-transparent hover:outline-[#3340ff]/50 hover:[outline-style:dashed]")}
      style={{ marginTop: el.s.mt, marginBottom: el.s.mb }}
    >
      {isOver("before") && <i className="pointer-events-none absolute -top-[3px] left-0 right-0 z-30 h-[3px] rounded bg-[#3340ff] shadow-[0_0_0_2px_#3340ff33]" />}
      {isOver("after") && <i className="pointer-events-none absolute -bottom-[3px] left-0 right-0 z-30 h-[3px] rounded bg-[#3340ff] shadow-[0_0_0_2px_#3340ff33]" />}
      <div className={cn("pointer-events-none absolute -top-[26px] left-0 z-30 flex h-6 items-center gap-0.5 rounded-md bg-[#3340ff] pl-1 pr-1 font-sans text-[11px] font-medium text-white shadow transition-opacity", on ? "opacity-100" : "opacity-0 group-hover/el:opacity-100")}>
        <span className={cn("pointer-events-auto flex items-center gap-0.5", !on && "hidden")}>
          <Grip kind="el" label="Drag element" onStart={(e) => { e.dataTransfer.setData("text/plain", el.id); e.dataTransfer.effectAllowed = "move"; if (ref.current) e.dataTransfer.setDragImage(ref.current, 12, 12); setTimeout(() => setDrag({ t: "el", id: el.id }), 0); }} />
        </span>
        <span className="px-1.5">{kindLabel(el.kind)}</span>
        <span className={cn("pointer-events-auto flex items-center gap-0.5", !on && "hidden")}>
          <Tb title="Move up" onClick={() => nudgeEl(el.id, -1)}><ArrowUp className="size-3.5" /></Tb>
          <Tb title="Move down" onClick={() => nudgeEl(el.id, 1)}><ArrowDown className="size-3.5" /></Tb>
          <Tb title="Duplicate" onClick={() => dupEl(el.id)}><Copy className="size-3.5" /></Tb>
          <Tb title="Delete" onClick={() => delEl(el.id)}><Trash2 className="size-3.5" /></Tb>
        </span>
      </div>
      {children}
    </div>
  );
}

/* ---------- element bodies ---------- */
const sizes = { sm: "px-4 py-2 text-[13px]", md: "px-6 py-3 text-sm", lg: "px-7 py-3.5 text-[15px]" } as const;

function ButtonEl({ el, t }: { el: El; t: Theme }) {
  const mode = useMode();
  const set = useSite((s) => s.setP);
  const v = el.p.variant as string;
  const bg = cv(el.s.bg, "var(--s-brand)");
  const fg = cv(el.s.color) ?? (el.s.bg ? onColor(tokenHex(t, el.s.bg) ?? el.s.bg) : "var(--s-on-brand)");
  const style: CSSProperties =
    v === "solid" ? { background: bg, color: fg, borderRadius: btnRadius(t, el.s.radius) }
    : v === "outline" ? { border: `1.5px solid ${cv(el.s.color) ?? "currentColor"}`, color: cv(el.s.color), borderRadius: btnRadius(t, el.s.radius) }
    : v === "ghost" ? { background: "color-mix(in oklab, currentColor 10%, transparent)", color: cv(el.s.color), borderRadius: btnRadius(t, el.s.radius) }
    : { color: cv(el.s.color), borderBottom: `2px solid ${cv(el.s.bg, "var(--s-brand)")}`, borderRadius: 0, paddingInline: 0 };
  const ts = typeStyle({ ...el, s: { ...el.s, size: undefined, color: undefined, weight: el.s.weight ?? t.btnWeight } }, t, "body");
  const cls = cn("inline-flex cursor-pointer select-none items-center gap-2 font-medium transition-transform hover:-translate-y-0.5", el.p.full && "w-full justify-center", v === "link" ? "py-1 text-[15px]" : sizes[(el.p.size as keyof typeof sizes) ?? "md"]);
  const inner = (
    <>
      {el.p.icon === "bag" && <ShoppingBag className="size-4 shrink-0" />}
      <EditableText value={el.p.label} onCommit={(x) => set(el.id, "label", x)} single id={el.id} style={{ fontWeight: ts.fontWeight as number, letterSpacing: ts.letterSpacing as string, textTransform: ts.textTransform as CSSProperties["textTransform"] }} />
      {el.p.icon === "arrow" && <ArrowRight className="size-4 shrink-0" />}
    </>
  );
  if (mode === "edit") return <span role="button" className={cls} style={{ ...style, fontFamily: ts.fontFamily as string }}>{inner}</span>;
  return <LinkA href={el.p.href} newTab={el.p.newTab} className={cls} style={{ ...style, fontFamily: ts.fontFamily as string }}>{inner}</LinkA>;
}

function ArtOf({ productId, p, className, rounded }: { productId?: string; p: El["p"]; className?: string; rounded?: string }) {
  const products = useStudio((s) => s.products);
  const prod = products.find((x) => x.id === productId);
  const tone: [string, string] = prod ? prod.tone : [p.toneA ?? "#3340ff", p.toneB ?? "#ffb61e"];
  return <ProductArt pattern={prod?.pattern ?? p.pattern ?? "stripes"} tone={tone} className={className} rounded={rounded} />;
}

function ImageEl({ el }: { el: El }) {
  const products = useStudio((s) => s.products);
  const mode = useMode();
  const { p, s } = el;
  const width = s.w ? `${s.w}%` : "100%";
  const alt = p.decorative ? "" : String(p.alt ?? "");
  const a11y = p.decorative ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": alt || undefined };
  let out: ReactNode;
  if (p.variant === "collage") {
    const [a, b, c] = [products.find((x) => x.id === p.productId) ?? products[0], products[5] ?? products[0], products[2] ?? products[0]];
    out = (
      <div className="relative mx-auto aspect-[6/5] w-full max-w-[460px]" style={{ width }} {...a11y}>
        <ProductArt pattern={a.pattern} tone={a.tone} className="absolute left-0 top-[6%] !aspect-[3/4] !w-[52%] !rounded-b-[var(--s-radius)] !rounded-t-[999px]" />
        <ProductArt pattern={b.pattern} tone={b.tone} className="absolute right-0 top-0 !w-[40%] !rounded-full" />
        <ProductArt pattern={c.pattern} tone={c.tone} className="absolute bottom-0 right-[3%] !aspect-[4/3] !w-[46%]" rounded="rounded-[calc(var(--s-radius)*1.6)]" />
        <div className="absolute bottom-[10%] left-[3%] rounded-full bg-[var(--s-surface)] px-3.5 py-2 text-xs font-medium text-[var(--s-fg)] shadow-lg">{a.name.split(",")[0]}, {inr(a.price)}</div>
      </div>
    );
  } else {
    const shape = p.shape === "arch" ? "rounded-b-[var(--s-radius)] rounded-t-[999px]" : p.shape === "circle" ? "rounded-full" : p.shape === "sharp" ? "rounded-none" : "rounded-[calc(var(--s-radius)*1.6)]";
    out = (
      <div style={{ width, marginInline: s.align === "center" ? "auto" : undefined, marginLeft: s.align === "right" ? "auto" : undefined }}>
        <div style={{ aspectRatio: String(p.aspect ?? "4/5").replace("/", " / "), boxShadow: "var(--s-shadow)" }} className={cn("overflow-hidden", shape)} {...a11y}>
          {p.src
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.src} alt={alt} loading="lazy" className="size-full" style={{ objectFit: p.fit === "contain" ? "contain" : "cover", objectPosition: p.pos ?? "center" }} />
            : <ArtOf productId={p.productId} p={p} className="!aspect-auto h-full" rounded="rounded-none" />}
        </div>
        {p.caption && <div className="mt-2 text-sm opacity-70">{p.caption}</div>}
      </div>
    );
  }
  if (p.href && mode === "live") return <LinkA href={p.href} className="block">{out}</LinkA>;
  return <>{out}</>;
}

function Marquee({ el, t }: { el: El; t: Theme }) {
  const mode = useMode();
  const set = useSite((s) => s.setP);
  const [paused, setPaused] = useState(false);
  const ts = typeStyle(el, t, "body");
  const items = String(el.p.text).split("·").map((x) => x.trim()).filter(Boolean);
  if (mode === "edit")
    return <EditableText value={el.p.text} onCommit={(x) => set(el.id, "text", x)} single id={el.id} className={cn("block", FS)} style={{ ...ts, textAlign: "center" }} />;
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {items.map((x, i) => (
        <span key={i} className={cn("flex items-center gap-8 whitespace-nowrap", FS)} style={ts}>
          {x}
          <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden><path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" /></svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="group/mq relative overflow-hidden" role="marquee" aria-label={items.join(". ")}>
      <div className="flex w-max animate-marquee group-hover/mq:[animation-play-state:paused]" style={{ animationDuration: `${el.p.speed ?? 40}s`, animationPlayState: paused ? "paused" : undefined }}>{row()}{row(true)}{row(true)}{row(true)}</div>
      <button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Play moving text" : "Pause moving text"} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--s-bg)] text-[var(--s-fg)] opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover/mq:opacity-100">
        {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      </button>
    </div>
  );
}

export const sortProducts = (list: Product[], sort: string) => {
  const l = [...list];
  if (sort === "price-asc") l.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") l.sort((a, b) => b.price - a.price);
  else if (sort === "new") l.reverse();
  else l.sort((a, b) => b.sold - a.sold);
  return l;
};
export const descendants = (cats: Category[], id: string): string[] => [id, ...cats.filter((c) => c.parentId === id).flatMap((c) => descendants(cats, c.id))];

function ProductsEl({ el, t }: { el: El; t: Theme }) {
  const { products, categories } = useStudio();
  const p = el.p;
  const list = useMemo(() => {
    let l = products.filter((x) => x.status === "active");
    if (p.source === "category" && p.value) { const ids = descendants(categories, p.value); l = l.filter((x) => ids.includes(x.categoryId)); }
    if (p.source === "tag" && p.value) l = l.filter((x) => x.tags.includes(p.value));
    if (p.source === "featured") l = l.filter((x) => x.featured);
    return sortProducts(l, p.sort).slice(0, p.count);
  }, [products, categories, p.source, p.value, p.sort, p.count]);
  if (!list.length) return <div className="rounded-[var(--s-radius)] border-2 border-dashed p-8 text-center font-sans text-sm opacity-70">No active products match this filter yet.</div>;
  const cols = Math.max(1, Math.min(6, p.cols));
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 @3xl:[grid-template-columns:repeat(var(--pc),minmax(0,1fr))]" style={{ ["--pc" as string]: cols, gridTemplateColumns: cols === 1 ? "minmax(0,1fr)" : undefined }}>
      {list.map((x) => (
        <div key={x.id} className={cn("group", p.card === "boxed" && "overflow-hidden bg-[var(--s-surface)] pb-3 [box-shadow:var(--s-shadow)]", p.card === "overlay" && "relative overflow-hidden")} style={{ borderRadius: "var(--s-radius)" }}>
          <div className="relative overflow-hidden" style={{ borderRadius: p.card === "boxed" || p.card === "overlay" ? 0 : "var(--s-radius)" }}>
            <div style={{ aspectRatio: String(p.aspect ?? "4/5").replace("/", " / ") }}>
              <ProductArt pattern={x.pattern} tone={x.tone} rounded="rounded-none" className="!aspect-auto h-full transition-transform duration-500 group-hover:scale-105" />
            </div>
            {p.showBadge && x.stock <= x.reorder && x.stock > 0 && <span className="absolute left-2 top-2 rounded-full bg-[var(--s-accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--s-on-accent)]">Only {x.stock} left</span>}
            {p.showBadge && x.stock === 0 && <span className="absolute left-2 top-2 rounded-full bg-[var(--s-fg)] px-2 py-0.5 text-[11px] font-medium text-[var(--s-bg)]">Sold out</span>}
            {p.showAdd && p.card !== "overlay" && <span className="absolute inset-x-2 bottom-2 translate-y-2 bg-[var(--s-surface)] py-2 text-center text-xs font-medium text-[var(--s-fg)] opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100" style={{ borderRadius: "calc(var(--s-radius) * 0.7)" }}>Add to bag</span>}
            {p.card === "overlay" && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 text-white"><div className="text-sm font-medium leading-snug">{x.name}</div>{p.showPrice && <div className="text-sm opacity-90">{inr(x.price)}</div>}</div>}
          </div>
          {p.card !== "overlay" && (
            <div className={cn(p.card === "boxed" && "px-3")}>
              <div className="mt-2.5 text-sm font-medium leading-snug">{x.name}</div>
              {p.showPrice && <div className="mt-0.5 text-sm opacity-70">{inr(x.price)}{x.compare ? <s className="ml-2 opacity-60">{inr(x.compare)}</s> : null}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CollectionsEl({ el }: { el: El }) {
  const { categories, products } = useStudio();
  const p = el.p;
  const list = categories.filter((c) => c.visible && (c.parentId ?? "") === (p.parent ?? ""));
  if (!list.length) return <div className="rounded-[var(--s-radius)] border-2 border-dashed p-8 text-center font-sans text-sm opacity-70">This category has no visible sub-categories.</div>;
  const shape = (i: number) => p.shape === "round" ? "rounded-full" : p.shape === "rect" ? "rounded-[var(--s-radius)]" : i % 3 === 0 ? "rounded-b-[var(--s-radius)] rounded-t-[999px]" : "rounded-[var(--s-radius)]";
  return (
    <div className="grid grid-cols-2 gap-3 @3xl:[grid-template-columns:repeat(var(--cc),minmax(0,1fr))]" style={{ ["--cc" as string]: Math.max(2, p.cols) }}>
      {list.map((c, i) => (
        <div key={c.id} className="group">
          <ProductArt pattern={c.pattern} tone={c.tone} className="transition-transform duration-300 group-hover:-translate-y-1" rounded={shape(i)} />
          <div className="mt-2 flex items-baseline justify-between text-sm"><span className="font-medium">{c.name}</span>{p.showCount && <span className="opacity-55">{products.filter((x) => descendants(categories, c.id).includes(x.categoryId) && x.status === "active").length}</span>}</div>
        </div>
      ))}
    </div>
  );
}

function NewsletterEl({ el, t }: { el: El; t: Theme }) {
  const [done, setDone] = useState(false);
  const mode = useMode();
  const set = useSite((s) => s.setP);
  const r = btnRadius(t, el.s.radius);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex w-full gap-2" style={{ maxWidth: el.s.maxw || undefined }}>
      <Suggest options="shopperEmail" className="min-w-0 flex-1"><input required type="email" placeholder={el.p.placeholder} className="w-full bg-[var(--s-bg)] px-4 py-3 text-sm text-[var(--s-fg)] outline-none" style={{ borderRadius: r }} /></Suggest>
      <button type={mode === "edit" ? "button" : "submit"} className="whitespace-nowrap bg-[var(--s-accent)] px-5 py-3 text-sm font-medium text-[var(--s-on-accent)]" style={{ borderRadius: r }}>
        <EditableText value={done ? el.p.success : el.p.button} onCommit={(x) => set(el.id, "button", x)} single id={el.id} />
      </button>
    </form>
  );
}

function FeedbackEl({ el, t }: { el: El; t: Theme }) {
  const [n, setN] = useState<number | null>(null);
  const set = useSite((s) => s.setP);
  return (
    <div style={{ textAlign: el.s.align ?? "center" }}>
      <EditableText tag="p" value={el.p.question} onCommit={(x) => set(el.id, "question", x)} className="text-sm opacity-70" id={el.id} />
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: 11 }, (_, i) => (
          <button key={i} onClick={() => setN(i)} className={cn("size-9 text-sm transition", n === i ? "bg-[var(--s-brand)] text-[var(--s-on-brand)]" : "bg-[var(--s-surface)] text-[var(--s-fg)] hover:-translate-y-0.5")} style={{ borderRadius: "calc(var(--s-radius) * 0.7)" }}>{i}</button>
        ))}
      </div>
    </div>
  );
}

function ElBody({ el, t }: { el: El; t: Theme }) {
  const set = useSite((s) => s.setP);
  const mode = useMode();
  switch (el.kind) {
    case "heading": {
      const ts = typeStyle(el, t, "head");
      return <EditableText tag={el.p.tag ?? "h2"} value={el.p.text} onCommit={(x) => set(el.id, "text", x)} className={cn("text-balance", FS)} style={ts} id={el.id} />;
    }
    case "text": {
      const ts = typeStyle(el, t, "body");
      return <EditableText tag="p" value={el.p.text} onCommit={(x) => set(el.id, "text", x)} className={FS} style={ts} id={el.id} />;
    }
    case "button": return <ButtonEl el={el} t={t} />;
    case "badge": {
      const ts = typeStyle({ ...el, s: { ...el.s, size: el.s.size ?? 12, weight: el.s.weight ?? 600 } }, t, "body");
      const v = el.p.variant;
      const st: CSSProperties = v === "outline" ? { border: "1.5px solid currentColor" } : { background: cv(el.s.bg, v === "brand" ? "var(--s-brand)" : "var(--s-accent)"), color: cv(el.s.color) ?? (v === "brand" ? "var(--s-on-brand)" : "var(--s-on-accent)") };
      return <EditableText value={el.p.text} onCommit={(x) => set(el.id, "text", x)} single id={el.id} className={cn("inline-block px-3 py-1", FS)} style={{ ...ts, ...st, color: st.color ?? ts.color, borderRadius: el.s.radius ?? 999 }} />;
    }
    case "image": return <ImageEl el={el} />;
    case "divider":
      return el.p.variant === "awning" ? <div className="awning scallop h-[18px] w-full" /> : el.p.variant === "dots" ? <div className="text-center text-xl tracking-[0.6em] opacity-40">•••</div> : <hr className="w-full border-0 border-t-[1.5px] border-current opacity-20" />;
    case "spacer": return <div style={{ height: el.p.h }} className={mode === "edit" ? "rounded bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgba(51,64,255,.08)_6px_12px)]" : ""} />;
    case "linklist": {
      const ts = typeStyle(el, t, "body");
      const row = el.p.direction === "row";
      return (
        <div className={FS} style={ts}>
          {el.p.title && <EditableText value={el.p.title} onCommit={(x) => set(el.id, "title", x)} single id={el.id} className="mb-2 block font-medium" />}
          <ul className={cn(row ? "flex flex-wrap gap-x-6 gap-y-1" : "space-y-1.5", "opacity-80")}>
            {(el.p.items as { id: string; label: string; href: string }[]).map((it) => (
              <li key={it.id}>
                {mode === "edit" ? (
                  <EditableText value={it.label} onCommit={(x) => useSite.getState().edit((d) => { const l = findEl(d, el.id); const i = l?.p.items.find((y: { id: string }) => y.id === it.id); if (i) i.label = x; })} single />
                ) : (
                  <LinkA href={it.href} className="hover:underline">{it.label}</LinkA>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "stats": {
      const ts = typeStyle({ ...el, s: { ...el.s, size: 52, font: "head" } }, t, "head");
      return (
        <div className="flex flex-wrap gap-x-14 gap-y-6">
          {(el.p.items as { id: string; n: string; label: string }[]).map((it) => (
            <div key={it.id}>
              <EditableText value={it.n} single className={cn("block", FS)} style={ts} onCommit={(x) => useSite.getState().edit((d) => { const i = findEl(d, el.id)?.p.items.find((y: { id: string }) => y.id === it.id); if (i) i.n = x; })} />
              <EditableText value={it.label} single className="block text-sm opacity-65" onCommit={(x) => useSite.getState().edit((d) => { const i = findEl(d, el.id)?.p.items.find((y: { id: string }) => y.id === it.id); if (i) i.label = x; })} />
            </div>
          ))}
        </div>
      );
    }
    case "marquee": return <Marquee el={el} t={t} />;
    case "products": return <ProductsEl el={el} t={t} />;
    case "collections": return <CollectionsEl el={el} />;
    case "entity": return <DataListEl el={el} t={t} />;
    case "form": return <FormEl el={el} t={t} />;
    case "newsletter": return <NewsletterEl el={el} t={t} />;
    case "feedback": return <FeedbackEl el={el} t={t} />;
  }
}
const findEl = (d: import("@/lib/builder").Doc, id: string) => { for (const s of [...d.pages.flatMap((p) => p.sections), d.footer]) for (const c of s.cols) { const e = c.els.find((x) => x.id === id); if (e) return e; } return null; };

function ElView({ el, t }: { el: El; t: Theme }) {
  const mode = useMode();
  const align = el.s.align;
  const live = mode === "live";
  const body = <ElBody el={el} t={t} />;
  const box = (
    <div
      data-eid={el.id} id={el.s.aid || undefined} role={el.s.label ? "group" : undefined} aria-label={el.s.label || undefined}
      className={boxClass(el, live)} style={boxStyle(el, t)}
    >{body}</div>
  );
  const cls = cn(el.s.inline ? "max-w-full shrink-0" : "w-full basis-full", hideCls(el.hide));
  if (live) return <div className={cls} style={{ marginTop: el.s.mt, marginBottom: el.s.mb, textAlign: align }}>{box}</div>;
  return (
    <div className={cls} style={{ display: "contents" }}>
      <ElFrame el={el}><div style={{ textAlign: align }}>{box}</div></ElFrame>
    </div>
  );
}

/* ---------- columns & sections ---------- */
function ColView({ col, t }: { col: Col; t: Theme }) {
  const mode = useMode();
  const { drag, over, setOver, drop } = useSite();
  const accepts = drag && (drag.t === "el" || drag.t === "new-el");
  const justify = col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start";
  const edit = mode === "edit";
  return (
    <div
      className={cn("relative flex min-w-0 flex-wrap content-start items-start gap-x-3", justify, edit && "min-h-[56px]")}
      style={{ textAlign: col.align }}
      onDragOver={accepts ? (e) => { e.preventDefault(); setOver(`col:${col.id}`); } : undefined}
      onDrop={accepts ? (e) => { e.preventDefault(); drop({ kind: "col", id: col.id }); } : undefined}
    >
      {col.els.map((e) => <ElView key={e.id} el={e} t={t} />)}
      {edit && !col.els.length && (
        <div className={cn("grid min-h-[72px] w-full place-items-center rounded-lg border-2 border-dashed font-sans text-xs", over === `col:${col.id}` ? "border-[#3340ff] bg-[#3340ff]/10 text-[#3340ff]" : "border-current/25 opacity-60")}>
          Empty column. Drag an element here.
        </div>
      )}
      {edit && over === `col:${col.id}` && !!col.els.length && <i className="pointer-events-none absolute -bottom-1 left-0 right-0 z-30 h-[3px] rounded bg-[#3340ff]" />}
    </div>
  );
}

function bgLayers(st: Section["st"], decoImg?: string, decoSize?: string) {
  const img: string[] = [], size: string[] = [], pos: string[] = [], rep: string[] = [], att: string[] = [];
  const add = (i: string, sz: string, ps: string, r: string, a = "scroll") => { img.push(i); size.push(sz); pos.push(ps); rep.push(r); att.push(a); };
  if (decoImg) add(decoImg, decoSize ?? "auto", "0 0", "repeat");
  if (st.img && st.overlay) add(`linear-gradient(rgb(0 0 0 / ${st.overlay / 100}), rgb(0 0 0 / ${st.overlay / 100}))`, "auto", "0 0", "no-repeat");
  if (st.img) add(`url("${st.img.replace(/"/g, "%22")}")`, "cover", st.imgPos ?? "center", "no-repeat", st.fixed ? "fixed" : "scroll");
  const g = gradOf(st.ga, st.gb, st.gdeg);
  if (g) add(g, "auto", "0 0", "no-repeat");
  if (!img.length) return {};
  return { backgroundImage: img.join(", "), backgroundSize: size.join(", "), backgroundPosition: pos.join(", "), backgroundRepeat: rep.join(", "), backgroundAttachment: att.join(", ") } as CSSProperties;
}

export function SectionView({ sec, t, footer }: { sec: Section; t: Theme; footer?: boolean }) {
  const mode = useMode();
  const edit = mode === "edit";
  const { sel, select, over, setDrag, dupSection, delSection, nudgeSection, patchSection } = useSite();
  const { props } = useDropEl(sec.id, ["section", "new-sec"], "section");
  const ref = useRef<HTMLDivElement>(null);
  const on = sel?.type === "section" && sel.id === sec.id;
  const st = sec.st;
  const bgHex = tokenHex(t, st.bg) ?? (st.ga && !st.img ? tokenHex(t, st.ga) : undefined);
  const fg = st.fg ? cv(st.fg) : st.img ? (st.overlay && st.overlay >= 35 ? "#ffffff" : undefined) : bgHex ? onColor(bgHex) : undefined;
  const sp = t.space;
  const tpl = sec.cols.map((c) => `minmax(0,${c.fr}fr)`).join(" ");
  const tpl2 = sec.cols.length > 2 ? "repeat(2,minmax(0,1fr))" : tpl;
  const stack = sec.stack ?? "mobile";
  const gridCls = stack === "never" ? "[grid-template-columns:var(--tpl)]" : stack === "tablet" ? "grid-cols-1 @4xl:[grid-template-columns:var(--tpl)]" : "grid-cols-1 @2xl:[grid-template-columns:var(--tpl2)] @4xl:[grid-template-columns:var(--tpl)]";
  const decoImg = st.deco === "dots" ? "radial-gradient(color-mix(in oklab, currentColor 18%, transparent) 1.2px, transparent 1.4px)"
    : st.deco === "stripes" ? "repeating-linear-gradient(45deg, color-mix(in oklab, currentColor 7%, transparent) 0 10px, transparent 10px 20px)"
    : st.deco === "grid" ? "linear-gradient(color-mix(in oklab, currentColor 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, currentColor 8%, transparent) 1px, transparent 1px)" : undefined;
  const decoSize = st.deco === "dots" ? "18px 18px" : st.deco === "grid" ? "40px 40px" : undefined;
  const layers = bgLayers(st, decoImg, decoSize);
  const bgColor = cv(st.bg);
  const mobPad = (st.padMob ?? 100) / 100;
  const paint: CSSProperties = { background: undefined, backgroundColor: bgColor, color: fg, ...layers };
  const frameFx: CSSProperties = {
    boxShadow: st.shadow ? shadows[st.shadow] : undefined,
    borderTop: st.bt ? `${st.bt}px solid ${cv(st.bc, "currentColor")}` : undefined,
    borderBottom: st.bb ? `${st.bb}px solid ${cv(st.bc, "currentColor")}` : undefined,
  };
  const inner = (
    <div
      className={cn("mx-auto grid w-full [padding-bottom:var(--pb-m)] [padding-top:var(--pt-m)] @2xl:[padding-bottom:var(--pb)] @2xl:[padding-top:var(--pt)]", gridCls, st.inset && "overflow-hidden")}
      style={{
        ["--tpl" as string]: tpl, ["--tpl2" as string]: tpl2, columnGap: sec.gap, rowGap: Math.min(sec.gap, 32), alignItems: sec.valign === "start" ? "start" : sec.valign === "end" ? "end" : "center",
        maxWidth: sec.contained ? t.maxw : undefined,
        ["--pt" as string]: `${st.padT * sp}px`, ["--pb" as string]: `${st.padB * sp}px`, ["--pt-m" as string]: `${st.padT * sp * mobPad}px`, ["--pb-m" as string]: `${st.padB * sp * mobPad}px`,
        minHeight: st.minH || undefined,
        ...(st.inset ? { ...paint, ...frameFx, borderRadius: (st.radius ?? 24), paddingInline: 32 } : {}),
      }}
    >
      {sec.cols.map((c) => <ColView key={c.id} col={c} t={t} />)}
    </div>
  );
  const live = !edit;
  const shell = (
    <div
      data-sid={sec.id} id={sec.anchor || undefined} aria-label={sec.label || undefined}
      className={cn("relative @container px-6 @2xl:px-12", live && st.anim && `sf-anim sf-a-${st.anim}`)}
      style={{ ...(st.inset ? {} : { ...paint, ...frameFx }), ...(sec.contained || st.inset ? {} : { paddingInline: 0 }), ...(st.padX !== undefined && (sec.contained || st.inset) ? { paddingInline: st.padX } : {}) }}
    >
      {inner}
      {st.edge === "scallop" && <div className="awning scallop absolute inset-x-0 -bottom-[14px] z-10 h-[14px]" />}
    </div>
  );
  const hidden = hideCls(sec.hide);
  if (!edit) return sec.visible ? <section className={hidden} aria-label={sec.label || undefined}>{shell}</section> : null;
  const isOver = (p: string) => over === `sec:${sec.id}:${p}`;
  return (
    <section className={hidden} data-sec={sec.id}>
      <div
        ref={ref}
        {...props}
        data-on={on}
        tabIndex={0}
        aria-label={`${sec.name} section${on ? ", selected" : ""}. Alt and arrow keys move it.`}
        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select({ type: "section", id: sec.id }); } }}
        onClick={(e) => { e.stopPropagation(); select({ type: "section", id: sec.id }); }}
        className={cn("group/sec relative cursor-pointer outline outline-2 -outline-offset-2 transition-[outline-color] focus-visible:outline-[#3340ff]", on ? "outline-[#3340ff]" : "outline-transparent hover:outline-[#3340ff]/35")}
      >
        {isOver("before") && <i className="pointer-events-none absolute left-0 right-0 top-0 z-40 h-1 bg-[#ff3d81] shadow-[0_0_0_2px_#ff3d8133]" />}
        {isOver("after") && <i className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 h-1 bg-[#ff3d81] shadow-[0_0_0_2px_#ff3d8133]" />}
        <div className={cn("absolute right-3 top-2 z-30 flex h-7 items-center gap-0.5 rounded-lg bg-[#141a3a] px-1 font-sans text-[11px] font-medium text-white shadow-lg transition-opacity", on ? "opacity-100" : "pointer-events-none opacity-0 group-hover/sec:opacity-100")}>
          {!footer && <Grip kind="section" label="Drag section" onStart={(e) => { e.dataTransfer.setData("text/plain", sec.id); e.dataTransfer.effectAllowed = "move"; if (ref.current) e.dataTransfer.setDragImage(ref.current, 20, 20); setTimeout(() => setDrag({ t: "section", id: sec.id }), 0); }} />}
          <span className="px-1.5">{sec.name}</span>
          {!footer && (
            <>
              <Tb title="Move up" onClick={() => nudgeSection(sec.id, -1)}><ArrowUp className="size-3.5" /></Tb>
              <Tb title="Move down" onClick={() => nudgeSection(sec.id, 1)}><ArrowDown className="size-3.5" /></Tb>
              <Tb title={sec.visible ? "Hide from visitors" : "Show to visitors"} onClick={() => patchSection(sec.id, { visible: !sec.visible })}>{sec.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}</Tb>
              <Tb title="Duplicate" onClick={() => dupSection(sec.id)}><Copy className="size-3.5" /></Tb>
              <Tb title="Delete" onClick={() => delSection(sec.id)}><Trash2 className="size-3.5" /></Tb>
            </>
          )}
        </div>
        {sec.visible ? shell : <div className="border-y border-dashed bg-black/[0.04] py-4 text-center font-sans text-xs text-black/55">“{sec.name}” is hidden from visitors. Click the eye to show it.</div>}
      </div>
    </section>
  );
}
