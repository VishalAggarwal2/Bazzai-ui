"use client";
import { useContext, useMemo, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { fontById, onColor, tokenHex, type Doc, type NavItem } from "@/lib/builder";
import { ROOT_DOMAIN, tenants } from "@/lib/data";
import { initials } from "@/lib/format";
import { useSite } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";
import { cv, EditableText, LinkA, ModeCtx, NavCtx, SectionView, safeCss, themeVars, type Mode } from "./render";
import { SocialIcon } from "./social";

export { themeVars };

function Announce({ doc, mode }: { doc: Doc; mode: Mode }) {
  const { setHeader, select } = useSite();
  const a = doc.header.announce;
  const [closed, setClosed] = useState(false);
  if (!a?.on || (closed && mode === "live")) return null;
  const bg = tokenHex(doc.theme, a.bg) ?? doc.theme.fg;
  const fg = tokenHex(doc.theme, a.fg) ?? onColor(bg);
  const text = <EditableText value={a.text} single onCommit={(v) => setHeader({ announce: { ...a, text: v } })} />;
  return (
    <div className="relative px-10 py-2 text-center text-[13px]" style={{ background: bg, color: fg }} role={mode === "live" ? "region" : undefined} aria-label={mode === "live" ? "Announcement" : undefined} onClick={(e) => { if (mode === "edit") { e.stopPropagation(); select({ type: "header", id: "header" }); } }}>
      {mode === "live" && a.href ? <LinkA href={a.href} className="underline-offset-2 hover:underline">{a.text}</LinkA> : text}
      {a.dismiss && mode === "live" && <button onClick={() => setClosed(true)} aria-label="Dismiss announcement" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-white/15"><X className="size-4" /></button>}
    </div>
  );
}

function NavLinks({ items, live, edit, size, weight, gap, align, vertical }: { items: NavItem[]; live: boolean; edit: (id: string, label: string) => void; size?: number; weight?: number; gap?: number; align?: string; vertical?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className={cn("items-center", vertical ? "flex flex-col items-stretch gap-1" : "flex", align === "center" && "justify-center", align === "right" && "justify-end")} style={{ gap: vertical ? undefined : gap ?? 24, fontSize: size ?? 14, fontWeight: weight }}>
      {items.map((n) => {
        const kids = n.children ?? [];
        return (
          <li key={n.id} className="relative" onMouseEnter={() => live && !vertical && kids.length && setOpen(n.id)} onMouseLeave={() => setOpen(null)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null); }}>
            <span className="inline-flex items-center gap-1 opacity-85 hover:opacity-100">
              {live ? <LinkA href={n.href} newTab={n.newTab} className={vertical ? "block py-2" : undefined}>{n.label}</LinkA> : <EditableText value={n.label} single onCommit={(v) => edit(n.id, v)} />}
              {kids.length > 0 && (
                <button aria-label={`${n.label} submenu`} aria-expanded={open === n.id} aria-haspopup="true" onClick={(e) => { e.stopPropagation(); setOpen(open === n.id ? null : n.id); }} className="grid size-5 place-items-center rounded">
                  <ChevronDown className={cn("size-3.5 transition-transform", open === n.id && "rotate-180")} />
                </button>
              )}
            </span>
            {kids.length > 0 && open === n.id && (
              <ul className={cn("z-40 min-w-[190px] rounded-xl border bg-[var(--s-surface)] p-1.5 text-[var(--s-fg)] shadow-xl", vertical ? "mt-1" : "absolute left-0 top-full mt-2")} style={{ borderRadius: "calc(var(--s-radius) * 0.8)" }}>
                {kids.map((k) => <li key={k.id}><LinkA href={k.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5">{k.label}</LinkA></li>)}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Header({ doc, mode }: { doc: Doc; mode: Mode }) {
  const { sel, select, setHeader, edit } = useSite();
  const h = doc.header;
  const t = doc.theme;
  const on = sel?.type === "header";
  const head = fontById(t.head);
  const headStyle = { fontFamily: head.family, fontWeight: t.headWeight ?? head.weight, letterSpacing: `${head.track}em`, fontVariationSettings: head.wdth ? `"wdth" ${head.wdth}` : undefined } as const;
  const tenantId = useStudio((s) => s.tenantId);
  const tn = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const bgHex = tokenHex(t, h.bg);
  const fg = h.fg ? cv(h.fg) : bgHex ? onColor(bgHex) : undefined;
  const live = mode === "live";
  const [menu, setMenu] = useState(false);
  const renameNav = (id: string, label: string) => edit((d) => { const x = d.header.nav.find((y) => y.id === id); if (x) x.label = label; });
  const logo = (
    <div className="flex items-center gap-2.5">
      {h.logoImg
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={h.logoImg} alt={h.logoMode === "mark" ? h.logoText : ""} style={{ height: h.logoH ?? 36 }} className="w-auto max-w-[180px] object-contain" />
        : h.logoMode !== "name" && <span aria-hidden className="grid size-9 place-items-center text-xs font-bold text-[var(--s-on-brand)]" style={{ background: "var(--s-brand)", borderRadius: "calc(var(--s-radius) * 0.7)" }}>{initials(h.logoText || tn.name)}</span>}
      {h.logoMode !== "mark" && (
        <EditableText value={h.logoText} onCommit={(v) => setHeader({ logoText: v })} single className="text-xl" style={{ ...headStyle, fontSize: 21 }} />
      )}
    </div>
  );
  const logoLink = live ? <LinkA href="/" className="block" label={`${h.logoText}, home`}>{logo}</LinkA> : logo;
  const links = (
    <nav aria-label="Main" className={cn("hidden @2xl:block", h.layout === "split" && (h.navAlign === "right" ? "ml-auto" : h.navAlign === "left" ? "mr-auto" : "mx-auto"))}>
      <NavLinks items={h.nav} live={live} edit={renameNav} size={h.navSize} weight={h.navWeight} gap={h.navGap} />
    </nav>
  );
  const socials = (h.socialInHeader && h.social?.length) ? (
    <div className="hidden items-center gap-3 @2xl:flex">
      {h.social.map((s) => live ? <LinkA key={s.id} href={s.href} newTab label={s.kind} className="opacity-80 hover:opacity-100"><SocialIcon kind={s.kind} /></LinkA> : <span key={s.id} className="opacity-80"><SocialIcon kind={s.kind} /></span>)}
    </div>
  ) : null;
  const cta = h.cta?.on ? (
    <span className="hidden @2xl:block">
      {(() => {
        const inner = h.cta!.variant === "outline" ? { border: "1.5px solid currentColor" } : { background: "var(--s-brand)", color: "var(--s-on-brand)" };
        const cls = "inline-block whitespace-nowrap px-4 py-2 text-[13px] font-medium";
        const st = { ...inner, borderRadius: t.btn === "pill" ? 999 : t.btn === "soft" ? t.radius : 2 };
        return live ? <LinkA href={h.cta!.href} className={cls} style={st}>{h.cta!.label}</LinkA> : <span className={cls} style={st}><EditableText value={h.cta!.label} single onCommit={(v) => setHeader({ cta: { ...h.cta!, label: v } })} /></span>;
      })()}
    </span>
  ) : null;
  const icons = (
    <div className="flex items-center gap-3">
      {socials}
      {cta}
      {h.search && <button aria-label="Search" className="grid size-8 place-items-center rounded-full hover:bg-black/5"><Search className="size-[18px]" /></button>}
      {h.cart && <button aria-label="Shopping bag" className="grid size-8 place-items-center rounded-full hover:bg-black/5"><ShoppingBag className="size-[18px]" /></button>}
      <button aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-menu" onClick={(e) => { e.stopPropagation(); if (live) setMenu(!menu); }} className="grid size-8 place-items-center rounded-full hover:bg-black/5 @2xl:hidden">{menu ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}</button>
    </div>
  );
  return (
    <>
      <Announce doc={doc} mode={mode} />
      <header
        onClick={(e) => { if (mode === "edit") { e.stopPropagation(); select({ type: "header", id: "header" }); } }}
        className={cn("relative z-30 px-6 @2xl:px-12", h.sticky && live && "sticky top-0", h.border && "border-b border-current/15", mode === "edit" && "cursor-pointer outline outline-2 -outline-offset-2 transition-[outline-color]", mode === "edit" && (on ? "outline-[#3340ff]" : "outline-transparent hover:outline-[#3340ff]/35"))}
        style={{ background: bgHex ?? "var(--s-bg)", color: fg, paddingBlock: h.padY }}
      >
        {mode === "edit" && <span className={cn("pointer-events-none absolute right-3 top-1 z-20 rounded-md bg-[#141a3a] px-2 py-0.5 font-sans text-[11px] font-medium text-white transition-opacity", on ? "opacity-100" : "opacity-0")}>Header</span>}
        {h.layout === "center" ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex">{links}</div>
            <div className="justify-self-center">{logoLink}</div>
            <div className="justify-self-end">{icons}</div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">{logoLink}{links}{icons}</div>
        )}
        {live && menu && (
          <nav id="mobile-menu" aria-label="Mobile" className="mt-3 border-t border-current/15 pt-3 @2xl:hidden">
            <NavLinks items={h.nav} live edit={renameNav} size={16} vertical />
            {h.social?.length ? <div className="mt-3 flex gap-4">{h.social.map((s) => <LinkA key={s.id} href={s.href} newTab label={s.kind}><SocialIcon kind={s.kind} /></LinkA>)}</div> : null}
          </nav>
        )}
      </header>
      {h.awning && <div aria-hidden className={cn("awning scallop h-[22px] origin-top", live && "awning-roll")} />}
    </>
  );
}

export function StorefrontView({ mode = "live", source = "published", onNavigate }: { mode?: Mode; source?: "draft" | "published"; onNavigate?: (path: string) => void }) {
  const { doc: draft, published, pageId, setPageId, select } = useSite();
  const doc = mode === "edit" || source === "draft" ? draft : published;
  const tenantId = useStudio((x) => x.tenantId);
  const t = tenants.find((x) => x.id === tenantId) ?? tenants[0];
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  const vars = useMemo(() => themeVars(doc.theme), [doc.theme]);
  const go = (href: string) => {
    const p = doc.pages.find((x) => x.path === href);
    if (p) { setPageId(p.id); onNavigate?.(p.path); if (typeof window !== "undefined") document.querySelector("[data-store-root]")?.scrollIntoView?.(); }
  };
  const drag = useSite((s) => s.drag);
  const over = useSite((s) => s.over);
  const setOver = useSite((s) => s.setOver);
  const dropFn = useSite((s) => s.drop);
  const live = mode === "live";
  const css = useMemo(() => {
    const parts: string[] = [];
    if (doc.theme.css) parts.push(`[data-store-root]{${safeCss(doc.theme.css)}}`);
    for (const s of [...page.sections, doc.footer]) {
      if (s.css) parts.push(`[data-sid="${s.id}"]{${safeCss(s.css)}}`);
      for (const c of s.cols) for (const e of c.els) if (e.s.css) parts.push(`[data-eid="${e.id}"]{${safeCss(e.s.css)}}`);
    }
    return parts.join("\n");
  }, [doc.theme.css, page.sections, doc.footer]);
  const first = page.sections[0];
  const hasAnn = first?.name === "Announcement";
  const pageBg = page.bg ? cv(page.bg) : undefined;
  const sections = page.sections.filter((s, i) => !(i === 0 && hasAnn));

  return (
    <ModeCtx.Provider value={mode}>
      <NavCtx.Provider value={go}>
        <div
          data-store-root data-motion={doc.theme.motion === "reduced" ? "reduced" : undefined} data-ul={doc.theme.linkUnderline ? "true" : undefined}
          className="@container min-h-full bg-[var(--s-bg)] text-[var(--s-fg)]" style={{ ...vars, background: pageBg }} onClick={() => mode === "edit" && select(null)}
        >
          {css && <style>{css}</style>}
          {live && <a href="#main" className="sr-only z-50 rounded-md bg-[var(--s-fg)] px-4 py-2 text-[var(--s-bg)] focus:not-sr-only focus:absolute focus:left-3 focus:top-3">Skip to content</a>}
          {hasAnn && !page.hideHeader && <SectionView sec={first} t={doc.theme} />}
          {!page.hideHeader && <Header doc={doc} mode={mode} />}
          <main id="main">
            {(page.hideHeader && hasAnn ? page.sections : sections).map((s) => <SectionView key={s.id} sec={s} t={doc.theme} />)}
          </main>
          {mode === "edit" && (drag?.t === "new-sec" || drag?.t === "section") && (
            <div
              onDragOver={(e) => { e.preventDefault(); setOver("page-end"); }}
              onDrop={(e) => { e.preventDefault(); dropFn({ kind: "page-end" }); }}
              className={cn("mx-6 my-4 grid h-20 place-items-center rounded-xl border-2 border-dashed font-sans text-sm", over === "page-end" ? "border-[#ff3d81] bg-[#ff3d81]/10 text-[#ff3d81]" : "border-current/25 opacity-60")}
            >
              Drop here to add at the end of the page
            </div>
          )}
          {(!page.hideFooter || !live) && (
            <footer className={cn(page.hideFooter && "opacity-40")}>
              <div className="mt-8"><SectionView sec={doc.footer} t={doc.theme} footer /></div>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--s-fg)] px-6 pb-6 text-xs text-[var(--s-bg)] @2xl:px-12">
                <span className="opacity-70">© 2026 {doc.header.logoText || t.name}</span>
                {doc.header.social?.length ? <span className="flex gap-3 opacity-80">{doc.header.social.map((s) => live ? <LinkA key={s.id} href={s.href} newTab label={s.kind}><SocialIcon kind={s.kind} className="size-4" /></LinkA> : <SocialIcon key={s.id} kind={s.kind} className="size-4" />)}</span> : null}
                <span className="font-mono opacity-70">{t.domain ?? `${t.slug}.${ROOT_DOMAIN}`}, powered by Bazzar</span>
              </div>
            </footer>
          )}
        </div>
      </NavCtx.Provider>
    </ModeCtx.Provider>
  );
}
void useContext;
