"use client";
import { useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, BookmarkPlus, ClipboardPaste, Copy, Eraser, Italic, Palette, Trash2, Underline, CaseUpper, Plus } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { builderSuggest } from "@/lib/mock";
import { colPresets, fontById, kindLabel, themePresets, tokenHex, uid, type El, type NavItem, type Section, type Social } from "@/lib/builder";
import { useSite, findSection, locateEl, locateSection } from "@/lib/site-store";
import { useStudio } from "@/lib/store";
import { ProductArt } from "@/components/product-art";
import { socialKinds } from "@/components/storefront/social";
import { cn } from "@/lib/utils";
import { DataListPanel, FormPanel } from "./data-panels";
import { CodeField, ColorField, DeviceVis, Field, FontPicker, GradientField, Group, Hint, ImageField, ListEditor, MiniInput, Num, RawColor, Seg, Sides, Tabs3, Toggle } from "./controls";

type LI = { id: string; label: string; href: string };
type SI = { id: string; n: string; label: string };
const sug = (kind: string, key: string) => builderSuggest(kind, key);
const align3 = [
  { v: "left" as const, label: <AlignLeft className="size-3.5" />, title: "Left" },
  { v: "center" as const, label: <AlignCenter className="size-3.5" />, title: "Centre" },
  { v: "right" as const, label: <AlignRight className="size-3.5" />, title: "Right" },
];
const shadowOpts = [{ v: "none", label: "None" }, { v: "sm", label: "Soft" }, { v: "md", label: "Lifted" }, { v: "lg", label: "Deep" }, { v: "glow", label: "Glow" }];

function LinkField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pages = useSite((s) => s.doc.pages);
  return (
    <>
      <MiniInput list="page-links" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/about, #anchor or https://…" aria-label="Link address" />
      <datalist id="page-links">{pages.map((p) => <option key={p.id} value={p.path}>{p.name}</option>)}</datalist>
    </>
  );
}

/* ---------- Site: theme / page ---------- */
function ThemePanel() {
  const { doc, setTheme, applyPreset } = useSite();
  const t = doc.theme;
  return (
    <>
      <Group title="Presets">
        <div className="grid grid-cols-3 gap-2">
          {themePresets.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p.id)} aria-pressed={t.presetId === p.id} className={cn("overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5", t.presetId === p.id && "ring-2 ring-brand ring-offset-1 ring-offset-card")}>
              <div className="flex h-10" style={{ background: p.bg }}>
                <span className="m-1.5 flex-1 rounded-md" style={{ background: p.surface }} />
                <span className="my-1.5 w-4 rounded-md" style={{ background: p.brand }} />
                <span className="m-1.5 w-4 rounded-md" style={{ background: p.accent }} />
              </div>
              <div className="truncate px-2 py-1 text-[11px] font-medium">{p.name}</div>
            </button>
          ))}
        </div>
      </Group>
      <Group title="Colours">
        <div className="grid grid-cols-2 gap-2">
          <RawColor label="Page" value={t.bg} onChange={(v) => setTheme({ bg: v })} />
          <RawColor label="Cards" value={t.surface} onChange={(v) => setTheme({ surface: v })} />
          <RawColor label="Text" value={t.fg} onChange={(v) => setTheme({ fg: v })} />
          <RawColor label="Brand" value={t.brand} onChange={(v) => setTheme({ brand: v })} />
          <RawColor label="Accent" value={t.accent} onChange={(v) => setTheme({ accent: v })} />
          <RawColor label="Focus ring" value={t.focus ?? t.brand} onChange={(v) => setTheme({ focus: v })} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground"><span>Saved colours</span><span>{(t.swatches ?? []).length}/10</span></div>
          <div className="flex flex-wrap gap-1.5">
            {(t.swatches ?? []).map((c) => (
              <span key={c} className="group relative">
                <span className="block size-7 rounded-full border" style={{ background: c }} title={c} />
                <button onClick={() => setTheme({ swatches: (t.swatches ?? []).filter((x) => x !== c) })} aria-label={`Remove ${c}`} className="absolute -right-1 -top-1 hidden size-4 place-items-center rounded-full bg-foreground text-[10px] leading-none text-background group-hover:grid focus-visible:grid">×</button>
              </span>
            ))}
            <label className="relative grid size-7 cursor-pointer place-items-center rounded-full border border-dashed text-muted-foreground hover:border-brand hover:text-brand focus-within:ring-2 focus-within:ring-ring">
              <Plus className="size-3.5" />
              <input type="color" className="absolute inset-0 cursor-pointer opacity-0" aria-label="Save a new colour" onChange={(e) => !(t.swatches ?? []).includes(e.target.value) && setTheme({ swatches: [...(t.swatches ?? []), e.target.value].slice(-10) })} />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Saved colours show up in every colour picker.</p>
        </div>
      </Group>
      <Group title="Fonts">
        <Field label="Headings"><FontPicker value={t.head} onChange={(v) => v && setTheme({ head: v })} /></Field>
        <Field label="Body text"><FontPicker value={t.body} onChange={(v) => v && setTheme({ body: v })} /></Field>
        <div className="rounded-xl border bg-card p-3" style={{ background: t.surface, color: t.fg }}>
          <div className="text-[26px] leading-none" style={{ fontFamily: fontById(t.head).family, fontWeight: t.headWeight ?? fontById(t.head).weight, letterSpacing: `${fontById(t.head).track}em` }}>Woven slowly</div>
          <div className="mt-1.5 text-xs opacity-70" style={{ fontFamily: fontById(t.body).family }}>Handloom sarees, shipped in 48 hours.</div>
        </div>
        <Num label="Body size" value={t.base} min={14} max={20} unit="px" onChange={(v) => setTheme({ base: v ?? 16 })} />
        <Num label="Headings" value={Math.round(t.headScale * 100)} min={70} max={130} unit="%" onChange={(v) => setTheme({ headScale: (v ?? 100) / 100 })} />
        <Field label="Heading weight"><Seg value={String(t.headWeight ?? 0)} onChange={(v) => setTheme({ headWeight: Number(v) || undefined })} options={[{ v: "0", label: "Font" }, { v: "400", label: "Regular" }, { v: "600", label: "Semi" }, { v: "800", label: "Black" }]} /></Field>
      </Group>
      <Group title="Shape and spacing">
        <Num label="Corners" value={t.radius} min={0} max={32} unit="px" onChange={(v) => setTheme({ radius: v ?? 0 })} />
        <Field label="Buttons"><Seg value={t.btn} onChange={(v) => setTheme({ btn: v })} options={[{ v: "pill", label: "Pill" }, { v: "soft", label: "Soft" }, { v: "sharp", label: "Sharp" }]} /></Field>
        <Field label="Button weight"><Seg value={String(t.btnWeight ?? 500)} onChange={(v) => setTheme({ btnWeight: Number(v) })} options={[{ v: "400", label: "Regular" }, { v: "500", label: "Medium" }, { v: "700", label: "Bold" }]} /></Field>
        <Field label="Card shadow"><Seg value={t.cardShadow ?? "none"} onChange={(v) => setTheme({ cardShadow: v })} options={[{ v: "none", label: "None" }, { v: "soft", label: "Soft" }, { v: "lifted", label: "Lifted" }]} /></Field>
        <Field label="Content width">
          <Seg value={t.maxw} onChange={(v) => setTheme({ maxw: v })} options={[{ v: 960, label: "Narrow" }, { v: 1200, label: "Normal" }, { v: 1400, label: "Wide" }, { v: 2400, label: "Full" }]} />
        </Field>
        <Num label="Spacing" value={Math.round(t.space * 100)} min={50} max={160} unit="%" onChange={(v) => setTheme({ space: (v ?? 100) / 100 })} />
      </Group>
      <Group title="Accessibility" defaultOpen={false}>
        <Toggle label="Underline links" checked={!!t.linkUnderline} onChange={(v) => setTheme({ linkUnderline: v || undefined })} hint="Links never rely on colour alone." />
        <Toggle label="Reduce motion" checked={t.motion === "reduced"} onChange={(v) => setTheme({ motion: v ? "reduced" : "full" })} hint="Turns off entrance effects, hover movement and the ticker for everyone. Visitors who set “reduce motion” on their device always get this." />
        <Hint>Keyboard focus rings use the Focus ring colour above. Use the Checks tab on the left to find low contrast, missing image descriptions and heading problems.</Hint>
      </Group>
      <Group title="Custom CSS" defaultOpen={false}>
        <CodeField label="Custom CSS for the whole site" value={t.css} onChange={(v) => setTheme({ css: v || undefined })} placeholder={"h1 { text-wrap: balance; }\na { color: var(--s-brand); }"} />
        <Hint>Applies to the whole storefront. Use variables like var(--s-brand), var(--s-bg) and var(--s-radius).</Hint>
      </Group>
    </>
  );
}

function PagePanel() {
  const { doc, pageId, patchPage, makeHome, delPage, dupPage } = useSite();
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  return (
    <>
      <Group title="This page">
        <Field label="Name"><MiniInput value={page.name} onChange={(e) => patchPage(page.id, { name: e.target.value })} /></Field>
        <Field label="Web address">
          <div className="flex items-center rounded-lg border bg-card text-[13px]"><span className="pl-2.5 text-muted-foreground">/</span><input value={page.path.replace(/^\//, "")} disabled={page.path === "/"} onChange={(e) => patchPage(page.id, { path: "/" + e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() })} className="h-8 flex-1 bg-transparent px-1 outline-none disabled:opacity-60" aria-label="Page path" /></div>
        </Field>
        <Toggle label="Show in the menu" checked={!!page.showInNav} onChange={(v) => patchPage(page.id, { showInNav: v })} hint="Adds a link to the header menu." />
        <div className="flex gap-2">
          {page.path !== "/" && <Button variant="outline" size="sm" onClick={() => makeHome(page.id)}>Make home page</Button>}
          <Button variant="outline" size="sm" onClick={() => dupPage(page.id)}><Copy /> Duplicate</Button>
          {doc.pages.length > 1 && <Button variant="ghost" size="sm" className="text-chili" onClick={() => delPage(page.id)}><Trash2 /> Delete</Button>}
        </div>
      </Group>
      <Group title="Page layout">
        <Field label="Page background"><ColorField value={page.bg} onChange={(v) => patchPage(page.id, { bg: v })} theme={doc.theme} /></Field>
        <Toggle label="Hide header" checked={!!page.hideHeader} onChange={(v) => patchPage(page.id, { hideHeader: v || undefined })} hint="For landing pages that should stand alone." />
        <Toggle label="Hide footer" checked={!!page.hideFooter} onChange={(v) => patchPage(page.id, { hideFooter: v || undefined })} />
      </Group>
      <Group title="Search engines and sharing">
        <Field label="Page title"><MiniInput value={page.title} onChange={(e) => patchPage(page.id, { title: e.target.value })} /></Field>
        <Field label="Description"><Textarea rows={3} value={page.desc} onChange={(e) => patchPage(page.id, { desc: e.target.value })} className="min-h-0 text-[13px]" /></Field>
        <div className="rounded-lg border bg-card p-3">
          <div className="truncate text-[15px] text-[#1a0dab]">{page.title || page.name}</div>
          <div className="truncate font-mono text-[11px] text-[#188038]">kaveri.bazzar.app{page.path}</div>
          <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{page.desc || "Add a description so this page reads well in search results."}</div>
        </div>
        <Field label="Share image"><ImageField label="Share image" value={page.og} onChange={(v) => patchPage(page.id, { og: v })} /></Field>
        <Toggle label="Hide from search engines" checked={!!page.noindex} onChange={(v) => patchPage(page.id, { noindex: v || undefined })} hint="Adds a no-index tag. The page still works for people with the link." />
      </Group>
    </>
  );
}

function HeaderPanel() {
  const { doc, setHeader } = useSite();
  const h = doc.header;
  const pages = doc.pages;
  const setNav = (nav: NavItem[]) => setHeader({ nav });
  const a = h.announce ?? { on: false, text: "", href: "", dismiss: true };
  const cta = h.cta ?? { on: false, label: "Visit the store", href: "/", variant: "solid" as const };
  return (
    <>
      <Group title="Announcement bar" aside={<Switch checked={a.on} onCheckedChange={(v) => setHeader({ announce: { ...a, on: v } })} aria-label="Show announcement bar" />}>
        {a.on ? (<>
          <Field label="Message"><MiniInput value={a.text} onChange={(e) => setHeader({ announce: { ...a, text: e.target.value } })} /></Field>
          <Field label="Links to"><LinkField value={a.href} onChange={(v) => setHeader({ announce: { ...a, href: v } })} /></Field>
          <Field label="Background"><ColorField value={a.bg} onChange={(v) => setHeader({ announce: { ...a, bg: v } })} theme={doc.theme} /></Field>
          <Field label="Text colour"><ColorField value={a.fg} onChange={(v) => setHeader({ announce: { ...a, fg: v } })} theme={doc.theme} /></Field>
          <Toggle label="Visitors can close it" checked={a.dismiss} onChange={(v) => setHeader({ announce: { ...a, dismiss: v } })} />
        </>) : <Hint>A thin message above the header for offers or delivery notes. Switch it on to edit.</Hint>}
      </Group>
      <Group title="Logo">
        <Seg value={h.logoMode} onChange={(v) => setHeader({ logoMode: v })} options={[{ v: "mark+name", label: "Mark + name" }, { v: "name", label: "Name" }, { v: "mark", label: "Mark" }]} />
        <Field label="Store name"><MiniInput value={h.logoText} onChange={(e) => setHeader({ logoText: e.target.value })} /></Field>
        <Field label="Logo image (replaces the mark)"><ImageField label="Logo" value={h.logoImg} onChange={(v) => setHeader({ logoImg: v })} /></Field>
        {h.logoImg && <Num label="Height" value={h.logoH} fallback={36} min={16} max={96} unit="px" onChange={(v) => setHeader({ logoH: v })} />}
        <Field label="Layout"><Seg value={h.layout} onChange={(v) => setHeader({ layout: v })} options={[{ v: "split", label: "Logo left" }, { v: "center", label: "Logo centred" }]} /></Field>
      </Group>
      <Group title="Menu">
        <ListEditor<NavItem>
          items={h.nav}
          onChange={setNav}
          make={() => ({ id: uid(), label: "New link", href: "/" })}
          addLabel="Add link"
          render={(it, patch) => (
            <>
              <MiniInput value={it.label} onChange={(e) => patch({ label: e.target.value })} aria-label="Link label" />
              <LinkField value={it.href} onChange={(v) => patch({ href: v })} />
              <Toggle label="Open in a new tab" checked={!!it.newTab} onChange={(v) => patch({ newTab: v || undefined })} />
              <div className="space-y-1 rounded-md bg-secondary/50 p-1.5">
                <div className="text-[11px] text-muted-foreground">Dropdown links</div>
                {(it.children ?? []).map((k, i) => (
                  <div key={k.id} className="flex gap-1">
                    <MiniInput value={k.label} onChange={(e) => patch({ children: it.children!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} aria-label="Dropdown label" />
                    <MiniInput value={k.href} list="page-links" onChange={(e) => patch({ children: it.children!.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })} aria-label="Dropdown address" />
                    <button onClick={() => patch({ children: it.children!.filter((_, j) => j !== i) || undefined })} aria-label="Remove dropdown link" className="px-1 text-muted-foreground hover:text-chili">×</button>
                  </div>
                ))}
                <button onClick={() => patch({ children: [...(it.children ?? []), { id: uid(), label: "Sub link", href: pages[0]?.path ?? "/" }] })} className="text-xs text-brand hover:underline">+ Add dropdown link</button>
              </div>
            </>
          )}
        />
        <Num label="Size" value={h.navSize} fallback={14} min={12} max={20} unit="px" onChange={(v) => setHeader({ navSize: v })} />
        <Num label="Gap" value={h.navGap} fallback={24} min={8} max={64} unit="px" onChange={(v) => setHeader({ navGap: v })} />
        <Field label="Weight"><Seg value={String(h.navWeight ?? 400)} onChange={(v) => setHeader({ navWeight: Number(v) })} options={[{ v: "400", label: "Regular" }, { v: "500", label: "Medium" }, { v: "700", label: "Bold" }]} /></Field>
        {h.layout === "split" && <Field label="Position"><Seg value={h.navAlign ?? "center"} onChange={(v) => setHeader({ navAlign: v })} options={[{ v: "left", label: "Next to logo" }, { v: "center", label: "Centre" }, { v: "right", label: "Right" }]} /></Field>}
      </Group>
      <Group title="Call to action" aside={<Switch checked={cta.on} onCheckedChange={(v) => setHeader({ cta: { ...cta, on: v } })} aria-label="Show call to action" />} defaultOpen={false}>
        {cta.on ? (<>
          <Field label="Label"><MiniInput value={cta.label} onChange={(e) => setHeader({ cta: { ...cta, label: e.target.value } })} /></Field>
          <Field label="Goes to"><LinkField value={cta.href} onChange={(v) => setHeader({ cta: { ...cta, href: v } })} /></Field>
          <Field label="Style"><Seg value={cta.variant} onChange={(v) => setHeader({ cta: { ...cta, variant: v } })} options={[{ v: "solid", label: "Solid" }, { v: "outline", label: "Outline" }]} /></Field>
        </>) : <Hint>A button at the right of the header, like “Book a visit”.</Hint>}
      </Group>
      <Group title="Social links" defaultOpen={false}>
        <ListEditor<Social> items={h.social ?? []} onChange={(social) => setHeader({ social })} make={() => ({ id: uid(), kind: "instagram", href: "https://" })} addLabel="Add social link"
          render={(it, patch) => (<>
            <Select value={it.kind} onValueChange={(v) => patch({ kind: v as Social["kind"] })}>
              <SelectTrigger className="h-8 text-[13px]" aria-label="Network"><SelectValue /></SelectTrigger>
              <SelectContent>{socialKinds.map((k) => <SelectItem key={k.v} value={k.v}>{k.label}</SelectItem>)}</SelectContent>
            </Select>
            <MiniInput value={it.href} onChange={(e) => patch({ href: e.target.value })} aria-label="Profile address" />
          </>)} />
        <Toggle label="Also show in the header" checked={!!h.socialInHeader} onChange={(v) => setHeader({ socialInHeader: v })} hint="They always show in the footer bar." />
      </Group>
      <Group title="Look" defaultOpen={false}>
        <Field label="Background"><ColorField value={h.bg} onChange={(v) => setHeader({ bg: v })} theme={doc.theme} /></Field>
        <Field label="Text colour"><ColorField value={h.fg} onChange={(v) => setHeader({ fg: v })} theme={doc.theme} against={tokenHex(doc.theme, h.bg) ?? doc.theme.bg} /></Field>
        <Num label="Height" value={h.padY} min={6} max={40} unit="px" onChange={(v) => setHeader({ padY: v ?? 16 })} />
        <Toggle label="Awning edge" checked={h.awning} onChange={(v) => setHeader({ awning: v })} hint="The striped scallop under the header." />
        <Toggle label="Bottom line" checked={h.border} onChange={(v) => setHeader({ border: v })} />
        <Toggle label="Stick to top" checked={h.sticky} onChange={(v) => setHeader({ sticky: v })} />
        <Toggle label="Search icon" checked={h.search} onChange={(v) => setHeader({ search: v })} />
        <Toggle label="Bag icon" checked={h.cart} onChange={(v) => setHeader({ cart: v })} />
      </Group>
    </>
  );
}

/* ---------- Section ---------- */
function SectionPanel({ sec }: { sec: Section }) {
  const { doc, patchSection, setSt, setColumns, patchCol, dupSection, delSection, nudgeSection, saveSection } = useSite();
  const [tab, setTab] = useState<"layout" | "style" | "advanced">("layout");
  const isFooter = sec.id === "footer";
  const preset = colPresets.find((p) => p.fr.length === sec.cols.length && p.fr.every((f, i) => f === sec.cols[i].fr))?.id;
  const st = sec.st;
  const bgHex = tokenHex(doc.theme, st.bg) ?? doc.theme.bg;
  return (
    <>
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        <div className="mr-auto min-w-0"><div className="truncate text-[13px] font-semibold">{sec.name}</div><div className="text-xs text-muted-foreground">Section</div></div>
        {!isFooter && (<>
          <Button variant="ghost" size="icon-sm" onClick={() => nudgeSection(sec.id, -1)} aria-label="Move section up"><ArrowUp /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => nudgeSection(sec.id, 1)} aria-label="Move section down"><ArrowDown /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => dupSection(sec.id)} aria-label="Duplicate section"><Copy /></Button>
          <Button variant="ghost" size="icon-sm" className="text-chili" onClick={() => delSection(sec.id)} aria-label="Delete section"><Trash2 /></Button>
        </>)}
      </div>
      <Tabs3 label="Section settings" value={tab} onChange={setTab} tabs={[{ v: "layout", label: "Layout" }, { v: "style", label: "Style" }, { v: "advanced", label: "Advanced" }]} />

      {tab === "layout" && (<>
        <Group title="Columns">
          <div className="grid grid-cols-3 gap-1.5">
            {colPresets.map((p) => (
              <button key={p.id} onClick={() => setColumns(sec.id, p.fr)} aria-label={`${p.label} columns`} aria-pressed={preset === p.id} className={cn("rounded-lg border p-1.5 transition", preset === p.id ? "border-brand bg-brand/5" : "hover:border-foreground/30")}>
                <div className="flex h-6 gap-0.5">{p.fr.map((f, i) => <span key={i} className="rounded-[3px] bg-foreground/20" style={{ flex: f }} />)}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{p.label}</div>
              </button>
            ))}
          </div>
          {sec.cols.length > 1 && sec.cols.map((c, i) => (
            <div key={c.id} className="space-y-1.5 rounded-lg border bg-card p-2">
              <div className="flex items-center justify-between text-xs"><span className="font-medium">Column {i + 1}</span><Seg className="w-24" value={c.align ?? "left"} onChange={(v) => patchCol(c.id, { align: v })} options={align3} /></div>
              <Num label="Width" value={c.fr} min={0.5} max={4} step={0.25} unit="fr" onChange={(v) => patchCol(c.id, { fr: v ?? 1 })} />
            </div>
          ))}
          {sec.cols.length === 1 && <Field label="Align content" inline><Seg className="w-28" value={sec.cols[0].align ?? "left"} onChange={(v) => patchCol(sec.cols[0].id, { align: v })} options={align3} /></Field>}
          <Num label="Gap" value={sec.gap} min={0} max={120} unit="px" onChange={(v) => patchSection(sec.id, { gap: v ?? 0 })} />
          <Field label="Vertical align"><Seg value={sec.valign} onChange={(v) => patchSection(sec.id, { valign: v })} options={[{ v: "start", label: "Top" }, { v: "center", label: "Middle" }, { v: "end", label: "Bottom" }]} /></Field>
          {sec.cols.length > 1 && <Field label="Stack columns on"><Seg value={sec.stack ?? "mobile"} onChange={(v) => patchSection(sec.id, { stack: v })} options={[{ v: "mobile", label: "Phones" }, { v: "tablet", label: "Tablets" }, { v: "never", label: "Never" }]} /></Field>}
        </Group>
        <Group title="Spacing">
          <Num label="Top" value={st.padT} min={0} max={240} unit="px" onChange={(v) => setSt(sec.id, "padT", v ?? 0)} />
          <Num label="Bottom" value={st.padB} min={0} max={240} unit="px" onChange={(v) => setSt(sec.id, "padB", v ?? 0)} />
          <Num label="Sides" value={st.padX} fallback={48} min={0} max={200} unit="px" onChange={(v) => setSt(sec.id, "padX", v)} />
          <Num label="Min height" value={st.minH} fallback={0} min={0} max={900} unit="px" onChange={(v) => setSt(sec.id, "minH", v || undefined)} />
          <Num label="On phones" value={st.padMob} fallback={100} min={30} max={100} unit="%" onChange={(v) => setSt(sec.id, "padMob", v === 100 ? undefined : v)} />
          <Toggle label="Contain width" checked={sec.contained} onChange={(v) => patchSection(sec.id, { contained: v })} hint="Off lets the background run edge to edge with content." />
        </Group>
        {!isFooter && (
          <Group title="Visibility" defaultOpen={false}>
            <Toggle label="Visible to visitors" checked={sec.visible} onChange={(v) => patchSection(sec.id, { visible: v })} />
            <Field label="Show on (tap to hide)"><DeviceVis hide={sec.hide} onChange={(h) => patchSection(sec.id, { hide: h })} /></Field>
          </Group>
        )}
      </>)}

      {tab === "style" && (<>
        <Group title="Background">
          <Field label="Colour"><ColorField value={st.bg} onChange={(v) => setSt(sec.id, "bg", v)} theme={doc.theme} /></Field>
          <Field label="Gradient (replaces colour)"><GradientField a={st.ga} b={st.gb} deg={st.gdeg} theme={doc.theme} onChange={(p) => { setSt(sec.id, "ga", p.ga); setSt(sec.id, "gb", p.gb); setSt(sec.id, "gdeg", p.gdeg); }} /></Field>
          <Field label="Photo"><ImageField label="Background photo" value={st.img} onChange={(v) => setSt(sec.id, "img", v)} /></Field>
          {st.img && (<>
            <Num label="Darken" value={st.overlay} fallback={0} min={0} max={90} unit="%" onChange={(v) => setSt(sec.id, "overlay", v || undefined)} />
            <Field label="Focus"><Seg value={st.imgPos ?? "center"} onChange={(v) => setSt(sec.id, "imgPos", v)} options={[{ v: "top", label: "Top" }, { v: "center", label: "Middle" }, { v: "bottom", label: "Bottom" }]} /></Field>
            <Toggle label="Fixed while scrolling" checked={!!st.fixed} onChange={(v) => setSt(sec.id, "fixed", v || undefined)} hint="A gentle parallax effect." />
          </>)}
          <Field label="Texture"><Seg value={st.deco ?? "none"} onChange={(v) => setSt(sec.id, "deco", v === "none" ? undefined : v)} options={[{ v: "none", label: "None" }, { v: "dots", label: "Dots" }, { v: "stripes", label: "Stripes" }, { v: "grid", label: "Grid" }]} /></Field>
        </Group>
        <Group title="Text">
          <Field label="Text colour (optional)"><ColorField value={st.fg} onChange={(v) => setSt(sec.id, "fg", v)} theme={doc.theme} against={bgHex} /></Field>
          <Hint>Leave empty and the text picks a readable colour for the background.</Hint>
        </Group>
        <Group title="Shape and edges">
          <Toggle label="Rounded card" checked={!!st.inset} onChange={(v) => setSt(sec.id, "inset", v || undefined)} hint="Floats the background as an inset card." />
          {st.inset && <Num label="Radius" value={st.radius} fallback={24} min={0} max={64} unit="px" onChange={(v) => setSt(sec.id, "radius", v)} />}
          <Toggle label="Awning edge" checked={st.edge === "scallop"} onChange={(v) => setSt(sec.id, "edge", v ? "scallop" : undefined)} />
          <Num label="Top line" value={st.bt} fallback={0} min={0} max={12} unit="px" onChange={(v) => setSt(sec.id, "bt", v || undefined)} />
          <Num label="Bottom line" value={st.bb} fallback={0} min={0} max={12} unit="px" onChange={(v) => setSt(sec.id, "bb", v || undefined)} />
          {(st.bt || st.bb) ? <Field label="Line colour"><ColorField value={st.bc} onChange={(v) => setSt(sec.id, "bc", v)} theme={doc.theme} /></Field> : null}
          <Field label="Shadow"><Seg value={st.shadow ?? "none"} onChange={(v) => setSt(sec.id, "shadow", v === "none" ? undefined : v)} options={shadowOpts.filter((o) => o.v !== "glow") as { v: "none" | "sm" | "md" | "lg"; label: string }[]} /></Field>
        </Group>
        <Group title="Entrance" defaultOpen={false}>
          <Field label="When it scrolls into view"><Seg value={st.anim ?? "none"} onChange={(v) => setSt(sec.id, "anim", v === "none" ? undefined : v)} options={[{ v: "none", label: "Still" }, { v: "fade", label: "Fade" }, { v: "up", label: "Rise" }]} /></Field>
        </Group>
      </>)}

      {tab === "advanced" && (<>
        <Group title="Identity">
          <Field label="Section name"><MiniInput value={sec.name} onChange={(e) => patchSection(sec.id, { name: e.target.value })} /></Field>
          <Field label="Anchor (for #links)"><MiniInput value={sec.anchor ?? ""} placeholder="e.g. story" onChange={(e) => patchSection(sec.id, { anchor: e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || undefined })} /></Field>
          {sec.anchor && <Hint>Link to it from any button or menu with <code className="font-mono">#{sec.anchor}</code>.</Hint>}
          <Field label="Screen reader label"><MiniInput value={sec.label ?? ""} placeholder="Optional, e.g. Customer reviews" onChange={(e) => patchSection(sec.id, { label: e.target.value || undefined })} /></Field>
        </Group>
        <Group title="Custom CSS">
          <CodeField label="Custom CSS for this section" value={sec.css} onChange={(v) => patchSection(sec.id, { css: v || undefined })} placeholder={"/* applies to this section only */\n& h2 { letter-spacing: .04em; }"} />
          <Hint>Write plain CSS. Use <code className="font-mono">&amp;</code> to target things inside this section.</Hint>
        </Group>
        {!isFooter && (
          <Group title="Reuse">
            <Button variant="outline" size="sm" onClick={() => saveSection(sec.id, sec.name)}><BookmarkPlus /> Save to My sections</Button>
            <Hint>Saved sections appear at the top of the Add panel so you can drop them on any page.</Hint>
          </Group>
        )}
      </>)}
    </>
  );
}

/* ---------- Element ---------- */
function ProductPicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const products = useStudio((s) => s.products);
  return (
    <div className="grid max-h-40 grid-cols-6 gap-1.5 overflow-auto rounded-lg border bg-card p-1.5">
      {products.map((p) => (
        <button key={p.id} onClick={() => onChange(p.id)} title={p.name} aria-label={p.name} className={cn("overflow-hidden rounded-md", value === p.id && "ring-2 ring-brand ring-offset-1 ring-offset-card")}>
          <ProductArt pattern={p.pattern} tone={p.tone} rounded="rounded-md" />
        </button>
      ))}
    </div>
  );
}

function ContentPanel({ el }: { el: El }) {
  const { setP } = useSite();
  const { categories, products, entities } = useStudio();
  const p = el.p;
  const P = (k: string) => (v: unknown) => setP(el.id, k, v);
  const tags = Array.from(new Set(products.flatMap((x) => x.tags)));
  const cat = (id: string) => { const path: string[] = []; let c = categories.find((x) => x.id === id); while (c) { path.unshift(c.name); c = categories.find((x) => x.id === c!.parentId); } return path.join(" › "); };
  switch (el.kind) {
    case "heading":
      return (<>
        <Field label="Text"><Textarea rows={2} value={p.text} onChange={(e) => P("text")(e.target.value)} suggest={sug("hero", "headline")} className="min-h-0 text-[13px]" /></Field>
        <Field label="Semantic level"><Seg value={p.tag} onChange={P("tag")} options={[{ v: "h1", label: "H1" }, { v: "h2", label: "H2" }, { v: "h3", label: "H3" }]} /></Field>
      </>);
    case "text":
      return <Field label="Text"><Textarea rows={4} value={p.text} onChange={(e) => P("text")(e.target.value)} suggest={sug("hero", "sub")} className="text-[13px]" /></Field>;
    case "button":
      return (<>
        <Field label="Label"><MiniInput value={p.label} onChange={(e) => P("label")(e.target.value)} suggest={sug("hero", "cta")} /></Field>
        <Field label="Goes to"><LinkField value={p.href} onChange={P("href")} /></Field>
        <Field label="Style"><Seg value={p.variant} onChange={P("variant")} options={[{ v: "solid", label: "Solid" }, { v: "outline", label: "Outline" }, { v: "ghost", label: "Soft" }, { v: "link", label: "Link" }]} /></Field>
        <Field label="Size"><Seg value={p.size} onChange={P("size")} options={[{ v: "sm", label: "Small" }, { v: "md", label: "Medium" }, { v: "lg", label: "Large" }]} /></Field>
        <Field label="Icon"><Seg value={p.icon} onChange={P("icon")} options={[{ v: "none", label: "None" }, { v: "arrow", label: "Arrow" }, { v: "bag", label: "Bag" }]} /></Field>
        <Toggle label="Open in a new tab" checked={!!p.newTab} onChange={P("newTab")} />
        <Toggle label="Full width" checked={!!p.full} onChange={P("full")} hint="Stretches across its column." />
      </>);
    case "badge":
      return (<>
        <Field label="Text"><MiniInput value={p.text} onChange={(e) => P("text")(e.target.value)} /></Field>
        <Field label="Style"><Seg value={p.variant} onChange={P("variant")} options={[{ v: "accent", label: "Accent" }, { v: "brand", label: "Brand" }, { v: "outline", label: "Outline" }]} /></Field>
      </>);
    case "image":
      return (<>
        <Field label="Layout"><Seg value={p.variant} onChange={P("variant")} options={[{ v: "single", label: "Single" }, { v: "collage", label: "Collage" }]} /></Field>
        {p.variant === "single" && <Field label="Your own photo"><ImageField label="Photo" value={p.src || undefined} onChange={(v) => P("src")(v ?? "")} /></Field>}
        {!(p.variant === "single" && p.src) && <Field label="Artwork from product"><ProductPicker value={p.productId} onChange={P("productId")} /></Field>}
        <Field label="Description for screen readers">
          <MiniInput value={p.alt ?? ""} disabled={!!p.decorative} onChange={(e) => P("alt")(e.target.value)} placeholder="e.g. Madder-red handloom saree on a loom" aria-label="Image description" />
        </Field>
        <Toggle label="Decorative image" checked={!!p.decorative} onChange={P("decorative")} hint="Screen readers skip it. Use for pure decoration." />
        {p.variant === "single" && (<>
          <Field label="Shape"><Seg value={p.shape} onChange={P("shape")} options={[{ v: "rect", label: "Soft" }, { v: "arch", label: "Arch" }, { v: "circle", label: "Circle" }, { v: "sharp", label: "Sharp" }]} /></Field>
          <Field label="Ratio"><Seg value={p.aspect} onChange={P("aspect")} options={[{ v: "1/1", label: "1:1" }, { v: "4/5", label: "4:5" }, { v: "5/4", label: "5:4" }, { v: "16/9", label: "16:9" }, { v: "3/1", label: "3:1" }]} /></Field>
          <Field label="Caption"><MiniInput value={p.caption ?? ""} onChange={(e) => P("caption")(e.target.value)} placeholder="Optional" /></Field>
          {p.src && <Field label="Fit"><Seg value={p.fit ?? "cover"} onChange={P("fit")} options={[{ v: "cover", label: "Fill" }, { v: "contain", label: "Whole image" }]} /></Field>}
          <Field label="Clicking goes to"><LinkField value={p.href ?? ""} onChange={P("href")} /></Field>
        </>)}
      </>);
    case "divider":
      return <Field label="Style"><Seg value={p.variant} onChange={P("variant")} options={[{ v: "line", label: "Line" }, { v: "dots", label: "Dots" }, { v: "awning", label: "Awning" }]} /></Field>;
    case "spacer":
      return <Num label="Height" value={p.h} min={4} max={240} unit="px" onChange={(v) => P("h")(v ?? 32)} />;
    case "linklist":
      return (<>
        <Field label="Title"><MiniInput value={p.title} onChange={(e) => P("title")(e.target.value)} /></Field>
        <Field label="Direction"><Seg value={p.direction} onChange={P("direction")} options={[{ v: "col", label: "Stacked" }, { v: "row", label: "In a row" }]} /></Field>
        <ListEditor<LI> items={p.items} onChange={P("items")} make={() => ({ id: uid(), label: "New link", href: "/" })} addLabel="Add link"
          render={(it, patch) => (<><MiniInput value={it.label} onChange={(e) => patch({ label: e.target.value })} /><LinkField value={it.href} onChange={(v) => patch({ href: v })} /></>)} />
      </>);
    case "stats":
      return <ListEditor<SI> items={p.items} onChange={P("items")} make={() => ({ id: uid(), n: "100", label: "label" })} addLabel="Add number"
        render={(it, patch) => (<div className="flex gap-1"><MiniInput className="w-20" value={it.n} onChange={(e) => patch({ n: e.target.value })} /><MiniInput value={it.label} onChange={(e) => patch({ label: e.target.value })} /></div>)} />;
    case "marquee":
      return (<>
        <Field label="Phrases (separate with ·)"><Textarea rows={3} value={p.text} onChange={(e) => P("text")(e.target.value)} suggest={sug("marquee", "text")} className="text-[13px]" /></Field>
        <Num label="Speed" value={80 - p.speed} min={0} max={70} unit="" onChange={(v) => P("speed")(80 - (v ?? 40))} />
      </>);
    case "products":
      return (<>
        <Field label="Show"><Seg value={p.source} onChange={(v) => { P("source")(v); P("value")(""); }} options={[{ v: "all", label: "All" }, { v: "category", label: "Category" }, { v: "tag", label: "Tag" }, { v: "featured", label: "Featured" }]} /></Field>
        {p.source === "category" && (
          <Select value={p.value || undefined} onValueChange={P("value")}>
            <SelectTrigger aria-label="Category"><SelectValue placeholder="Choose a category" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{cat(c.id)}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {p.source === "tag" && (
          <Select value={p.value || undefined} onValueChange={P("value")}>
            <SelectTrigger aria-label="Tag"><SelectValue placeholder="Choose a tag" /></SelectTrigger>
            <SelectContent>{tags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Field label="Sort by"><Seg value={p.sort} onChange={P("sort")} options={[{ v: "best", label: "Best" }, { v: "new", label: "Newest" }, { v: "price-asc", label: "₹ low" }, { v: "price-desc", label: "₹ high" }]} /></Field>
        <Num label="How many" value={p.count} min={1} max={12} onChange={(v) => P("count")(v ?? 4)} />
        <Num label="Columns" value={p.cols} min={1} max={6} onChange={(v) => P("cols")(v ?? 4)} />
        <Field label="Card"><Seg value={p.card} onChange={P("card")} options={[{ v: "plain", label: "Plain" }, { v: "boxed", label: "Boxed" }, { v: "overlay", label: "Overlay" }]} /></Field>
        <Field label="Photo ratio"><Seg value={p.aspect} onChange={P("aspect")} options={[{ v: "1/1", label: "1:1" }, { v: "4/5", label: "4:5" }, { v: "3/4", label: "3:4" }, { v: "5/4", label: "5:4" }]} /></Field>
        <Toggle label="Show price" checked={p.showPrice} onChange={P("showPrice")} />
        <Toggle label="Low-stock badge" checked={p.showBadge} onChange={P("showBadge")} />
        <Toggle label="Add to bag button" checked={p.showAdd} onChange={P("showAdd")} />
      </>);
    case "collections":
      return (<>
        <Field label="Show categories under">
          <Select value={p.parent || "root"} onValueChange={(v) => P("parent")(v === "root" ? "" : v)}>
            <SelectTrigger aria-label="Parent category"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="root">Top level</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{cat(c.id)}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Num label="Columns" value={p.cols} min={2} max={6} onChange={(v) => P("cols")(v ?? 6)} />
        <Field label="Tile shape"><Seg value={p.shape} onChange={P("shape")} options={[{ v: "arch", label: "Arch mix" }, { v: "round", label: "Round" }, { v: "rect", label: "Soft" }]} /></Field>
        <Toggle label="Show product counts" checked={p.showCount} onChange={P("showCount")} />
      </>);
    case "entity": return <DataListPanel el={el} />;
    case "form": return <FormPanel el={el} />;
    case "newsletter":
      return (<>
        <Field label="Input hint"><MiniInput value={p.placeholder} onChange={(e) => P("placeholder")(e.target.value)} /></Field>
        <Field label="Button"><MiniInput value={p.button} onChange={(e) => P("button")(e.target.value)} /></Field>
        <Field label="After signing up"><MiniInput value={p.success} onChange={(e) => P("success")(e.target.value)} /></Field>
      </>);
    case "feedback":
      return <Field label="Question"><Textarea rows={2} value={p.question} onChange={(e) => P("question")(e.target.value)} className="min-h-0 text-[13px]" /></Field>;
  }
}


const textKinds = ["heading", "text", "badge", "button", "linklist", "marquee"];

function ElementPanel({ el }: { el: El }) {
  const { doc, setS, patchEl, dupEl, delEl, nudgeEl, select, copyStyle, pasteStyle, resetStyle, styleClip, copySel } = useSite();
  const [tab, setTab] = useState<"content" | "style" | "advanced">("content");
  const t = doc.theme;
  const S = (k: Parameters<typeof setS>[1]) => (v: unknown) => setS(el.id, k, v);
  const s = el.s;
  const isText = textKinds.includes(el.kind);
  const loc = locateEl(doc, el.id);
  const f = fontById(s.font === "head" ? t.head : s.font === "body" ? t.body : s.font || (el.kind === "heading" ? t.head : t.body));
  const secBg = loc ? (tokenHex(t, loc.sec.st.bg) ?? t.bg) : t.bg;
  const boxBg = tokenHex(t, s.fill) ?? secBg;
  return (
    <>
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        <div className="mr-auto min-w-0"><div className="text-[13px] font-semibold">{kindLabel(el.kind)}</div><button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => loc && select({ type: "section", id: loc.sec.id })}>in {loc?.sec.name} ↑</button></div>
        <Button variant="ghost" size="icon-sm" onClick={() => nudgeEl(el.id, -1)} aria-label="Move up"><ArrowUp /></Button>
        <Button variant="ghost" size="icon-sm" onClick={() => nudgeEl(el.id, 1)} aria-label="Move down"><ArrowDown /></Button>
        <Button variant="ghost" size="icon-sm" onClick={() => dupEl(el.id)} aria-label="Duplicate"><Copy /></Button>
        <Button variant="ghost" size="icon-sm" className="text-chili" onClick={() => delEl(el.id)} aria-label="Delete"><Trash2 /></Button>
      </div>
      <Tabs3 label="Element settings" value={tab} onChange={setTab} tabs={[{ v: "content", label: "Content" }, { v: "style", label: "Style" }, { v: "advanced", label: "Advanced" }]} />

      {tab === "content" && <Group title="Content"><ContentPanel el={el} /></Group>}

      {tab === "style" && (<>
        {isText && el.kind !== "linklist" && (
          <Group title="Typography">
            {el.kind !== "marquee" && el.kind !== "button" && <Field label="Font"><FontPicker value={s.font && s.font !== "head" && s.font !== "body" ? s.font : undefined} onChange={S("font")} inherit={el.kind === "heading" ? `Heading font (${fontById(t.head).name})` : `Body font (${fontById(t.body).name})`} /></Field>}
            {el.kind !== "button" && <Num label="Size" value={s.size} fallback={el.kind === "heading" ? 44 : 16} min={10} max={200} unit="px" onChange={S("size")} />}
            {el.kind !== "button" && <Num label="On phones" value={s.sizeM} fallback={Math.round((s.size ?? (el.kind === "heading" ? 44 : 16)) * ((s.size ?? 16) > 40 ? 0.58 : (s.size ?? 16) > 22 ? 0.78 : (s.size ?? 16) > 17 ? 0.92 : 1))} min={10} max={120} unit="px" onChange={S("sizeM")} />}
            <Seg value={String(s.weight ?? f.weight)} onChange={(v) => S("weight")(Number(v))} options={[{ v: "300", label: "Light" }, { v: "400", label: "Regular" }, { v: "500", label: "Medium" }, { v: "700", label: "Bold" }, { v: "800", label: "Black" }]} />
            <div className="flex gap-1.5">
              <Seg className="w-[94px]" value={s.align ?? "left"} onChange={(v) => S("align")(v)} options={align3} />
              <button onClick={() => S("italic")(!s.italic || undefined)} aria-label="Italic" aria-pressed={!!s.italic} className={cn("grid size-8 place-items-center rounded-lg border", s.italic && "border-brand bg-brand/10 text-brand")}><Italic className="size-3.5" /></button>
              <button onClick={() => S("underline")(!s.underline || undefined)} aria-label="Underline" aria-pressed={!!s.underline} className={cn("grid size-8 place-items-center rounded-lg border", s.underline && "border-brand bg-brand/10 text-brand")}><Underline className="size-3.5" /></button>
              <button onClick={() => S("caps")(!s.caps || undefined)} aria-label="Uppercase" aria-pressed={!!s.caps} className={cn("grid size-8 place-items-center rounded-lg border", s.caps && "border-brand bg-brand/10 text-brand")}><CaseUpper className="size-4" /></button>
              <button onClick={() => S("weight")(s.weight === 700 ? undefined : 700)} aria-label="Bold" aria-pressed={s.weight === 700} className={cn("grid size-8 place-items-center rounded-lg border", s.weight === 700 && "border-brand bg-brand/10 text-brand")}><Bold className="size-3.5" /></button>
            </div>
            <Field label="Colour"><ColorField value={s.color} onChange={S("color")} theme={t} against={boxBg} opacity={s.opacity} /></Field>
            <Num label="Tracking" value={Math.round((s.ls ?? f.track) * 100)} fallback={0} min={-8} max={30} unit="%" onChange={(v) => S("ls")(v === undefined ? undefined : v / 100)} />
            <Num label="Leading" value={Math.round((s.lh ?? (el.kind === "heading" ? f.lh : 1.5)) * 100)} min={80} max={220} unit="%" onChange={(v) => S("lh")(v === undefined ? undefined : v / 100)} />
            <Num label="Opacity" value={s.opacity} fallback={100} min={10} max={100} unit="%" onChange={(v) => S("opacity")(v === 100 ? undefined : v)} />
          </Group>
        )}
        {(el.kind === "button" || el.kind === "badge") && (
          <Group title={el.kind === "button" ? "Button look" : "Badge look"}>
            <Field label={el.kind === "button" ? "Button colour" : "Background"}><ColorField value={s.bg} onChange={S("bg")} theme={t} tokenSet={["brand", "accent", "fg", "surface", "bg"]} /></Field>
            <Field label="Text colour"><ColorField value={s.color} onChange={S("color")} theme={t} against={tokenHex(t, s.bg) ?? (el.kind === "button" ? t.brand : t.accent)} /></Field>
            <Num label="Corners" value={s.radius} fallback={t.btn === "pill" ? 40 : 8} min={0} max={40} unit="px" onChange={S("radius")} />
            {el.kind === "button" && <Num label="Weight" value={s.weight} fallback={500} min={300} max={800} step={100} onChange={S("weight")} />}
          </Group>
        )}
        {el.kind === "image" && (
          <Group title="Size">
            <Num label="Width" value={s.w} fallback={100} min={20} max={100} unit="%" onChange={(v) => S("w")(v === 100 ? undefined : v)} />
            <Field label="Position"><Seg value={s.align ?? "left"} onChange={S("align")} options={align3} /></Field>
          </Group>
        )}
        <Group title="Box" defaultOpen={el.kind !== "heading" && el.kind !== "text"}>
          <Field label="Fill"><ColorField value={s.fill} onChange={S("fill")} theme={t} /></Field>
          <Field label="Gradient (replaces fill)"><GradientField a={s.ga} b={s.gb} deg={s.gdeg} theme={t} onChange={(p) => { S("ga")(p.ga); S("gb")(p.gb); S("gdeg")(p.gdeg); }} /></Field>
          <Sides label="Padding inside" v={[s.pt, s.pr, s.pb, s.pl]} onChange={(i, n) => S((["pt", "pr", "pb", "pl"] as const)[i])(n || undefined)} />
          <Num label="Border" value={s.bd} fallback={0} min={0} max={12} unit="px" onChange={(v) => S("bd")(v || undefined)} />
          {!!s.bd && (<>
            <Field label="Border colour"><ColorField value={s.bdc} onChange={S("bdc")} theme={t} /></Field>
            <Seg value={s.bds ?? "solid"} onChange={(v) => S("bds")(v === "solid" ? undefined : v)} options={[{ v: "solid", label: "Solid" }, { v: "dashed", label: "Dashed" }, { v: "dotted", label: "Dotted" }]} />
          </>)}
          {el.kind !== "button" && el.kind !== "badge" && <Num label="Corners" value={s.br} fallback={0} min={0} max={80} unit="px" onChange={(v) => S("br")(v || undefined)} />}
          {el.kind !== "button" && el.kind !== "badge" && <Field label="Shadow"><Seg value={s.shadow ?? "none"} onChange={(v) => S("shadow")(v === "none" ? undefined : v)} options={shadowOpts as { v: "none" | "sm" | "md" | "lg" | "glow"; label: string }[]} /></Field>}
          {(el.kind === "button" || el.kind === "badge") && <Field label="Shadow"><Seg value={s.shadow ?? "none"} onChange={(v) => S("shadow")(v === "none" ? undefined : v)} options={shadowOpts as { v: "none" | "sm" | "md" | "lg" | "glow"; label: string }[]} /></Field>}
        </Group>
        <Group title="Effects" defaultOpen={false}>
          <Field label="Entrance (when it scrolls in)"><Seg value={s.anim ?? "none"} onChange={(v) => S("anim")(v === "none" ? undefined : v)} options={[{ v: "none", label: "Still" }, { v: "fade", label: "Fade" }, { v: "up", label: "Rise" }, { v: "zoom", label: "Zoom" }]} /></Field>
          {s.anim && <Num label="Delay" value={s.delay} fallback={0} min={0} max={1500} step={50} unit="ms" onChange={(v) => S("delay")(v || undefined)} />}
          <Field label="On hover"><Seg value={s.hover ?? "none"} onChange={(v) => S("hover")(v === "none" ? undefined : v)} options={[{ v: "none", label: "None" }, { v: "lift", label: "Lift" }, { v: "zoom", label: "Grow" }, { v: "glow", label: "Glow" }, { v: "fade", label: "Fade" }]} /></Field>
          <Num label="Tilt" value={s.rot} fallback={0} min={-15} max={15} unit="°" onChange={(v) => S("rot")(v || undefined)} />
          <Hint>Effects are off in the editor so you can work calmly. Use Preview to see them. They stop for visitors who prefer reduced motion.</Hint>
        </Group>
        <Group title="Spacing and layout" defaultOpen={false}>
          <Num label="Above" value={s.mt} fallback={0} min={0} max={200} unit="px" onChange={(v) => S("mt")(v || undefined)} />
          <Num label="Below" value={s.mb} fallback={0} min={0} max={200} unit="px" onChange={(v) => S("mb")(v || undefined)} />
          {["heading", "text", "newsletter", "form", "entity", "products"].includes(el.kind) && <Num label="Max width" value={s.maxw} fallback={0} min={0} max={1200} step={10} unit="px" onChange={(v) => S("maxw")(v || undefined)} />}
          <Toggle label="Sit beside neighbours" checked={!!s.inline} onChange={(v) => S("inline")(v || undefined)} hint="Lets buttons and badges share a row." />
          {el.kind !== "heading" && el.kind !== "text" && <Field label="Align"><Seg value={s.align ?? "left"} onChange={S("align")} options={align3} /></Field>}
        </Group>
        <Group title="Visibility" defaultOpen={false}>
          <Field label="Show on (tap to hide)"><DeviceVis hide={el.hide} onChange={(h) => patchEl(el.id, { hide: h })} /></Field>
        </Group>
      </>)}

      {tab === "advanced" && (<>
        <Group title="Identity and access">
          <Field label="Anchor (for #links)"><MiniInput value={s.aid ?? ""} placeholder="e.g. size-guide" onChange={(e) => S("aid")(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || undefined)} /></Field>
          <Field label="Screen reader label"><MiniInput value={s.label ?? ""} placeholder="Optional description of this block" onChange={(e) => S("label")(e.target.value || undefined)} /></Field>
        </Group>
        <Group title="Custom CSS">
          <CodeField label="Custom CSS for this element" value={s.css} onChange={(v) => S("css")(v || undefined)} placeholder={"/* applies to this element only */\nletter-spacing: .02em;\n& a { text-decoration: underline; }"} />
          <Hint>Plain declarations apply to the element itself. Nest rules with <code className="font-mono">&amp;</code> for what is inside.</Hint>
        </Group>
        <Group title="Copy and reset">
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" onClick={() => copyStyle(el.id)}><Palette /> Copy style</Button>
            <Button variant="outline" size="sm" disabled={!styleClip} onClick={() => pasteStyle(el.id)}><ClipboardPaste /> Paste style</Button>
            <Button variant="outline" size="sm" onClick={() => copySel()}><Copy /> Copy element</Button>
            <Button variant="outline" size="sm" onClick={() => resetStyle(el.id)}><Eraser /> Reset style</Button>
          </div>
          <Hint>Paste style keeps this element's spacing and copies everything else, colours, fonts, borders and effects.</Hint>
        </Group>
      </>)}
    </>
  );
}

/* ---------- entry ---------- */
export function Inspector() {
  const { doc, sel, select } = useSite();
  const [tab, setTab] = useState<"theme" | "page">("theme");
  const el = sel?.type === "el" ? locateEl(doc, sel.id)?.el : null;
  const sec = sel?.type === "section" ? findSection(doc, sel.id) : null;
  let body: React.ReactNode;
  let title = "Site settings";
  if (el) { body = <ElementPanel key={el.id} el={el} />; title = "Element"; }
  else if (sec) { body = <SectionPanel key={sec.id} sec={sec} />; title = "Section"; }
  else if (sel?.type === "header") { body = <HeaderPanel />; title = "Header"; }
  else body = (
    <>
      <Tabs3 label="Site settings" value={tab} onChange={setTab} tabs={[{ v: "theme", label: "Theme" }, { v: "page", label: "Page" }]} />
      {tab === "theme" ? <ThemePanel /> : <PagePanel />}
    </>
  );
  void locateSection;
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card" aria-label={title}>
      {(el || sec || sel?.type === "header") && (
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <nav aria-label="Selection path" className="flex items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => select(null)} className="hover:text-foreground">Site</button>
            {el && <><span aria-hidden>›</span><button onClick={() => { const l = locateEl(doc, el.id); if (l) select({ type: "section", id: l.sec.id }); }} className="max-w-[90px] truncate hover:text-foreground">{locateEl(doc, el.id)?.sec.name}</button></>}
            {(el || sec || sel?.type === "header") && <><span aria-hidden>›</span><span className="font-medium text-foreground">{title}</span></>}
          </nav>
          <button onClick={() => select(null)} className="text-xs text-muted-foreground hover:text-foreground">Site settings</button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
    </aside>
  );
}
