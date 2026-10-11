import { contrast, mixHex, onColor, tokenHex, type Doc, type El, type Page, type Section, type Theme } from "./builder";
import type { Sel } from "./site-store";

export type Issue = {
  id: string;
  level: "error" | "warn" | "tip";
  title: string;
  detail: string;
  pageId?: string;
  sel?: Sel;
  /** Name of the one-click fix, if there is one. */
  fix?: { label: string; patch: { el?: Record<string, unknown>; s?: Record<string, unknown>; sec?: Record<string, unknown>; page?: Record<string, unknown> } };
};

const textKinds = ["heading", "text", "badge", "button", "linklist", "stats", "marquee"];
const vague = /^(click here|here|read more|more|learn more|link|this)$/i;

/** The colour behind an element: its section's background, or the page. */
function sectionBg(sec: Section, t: Theme): string | null {
  if (sec.st.img) return null; // photo behind the text; can't be measured
  const hex = tokenHex(t, sec.st.bg) ?? (sec.st.ga ? sec.st.ga : undefined);
  return hex ?? t.bg;
}

function textColor(el: El, sec: Section, t: Theme, bg: string): string {
  const own = tokenHex(t, el.s.color);
  const secFg = sec.st.fg ? tokenHex(t, sec.st.fg) : undefined;
  const base = own ?? secFg ?? (tokenHex(t, sec.st.bg) ? onColor(bg) : t.fg);
  const op = (el.s.opacity ?? (el.kind === "text" ? 100 : 100)) / 100;
  return op < 1 ? mixHex(base, bg, op) : base;
}

const need = (el: El) => {
  const size = (el.s.size ?? (el.kind === "heading" ? 44 : 16));
  const bold = (el.s.weight ?? 400) >= 700;
  return size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
};

export function auditPage(page: Page, doc: Doc): Issue[] {
  const t = doc.theme;
  const out: Issue[] = [];
  const secs = [...page.sections, doc.footer];
  const headings: { el: El; level: number; sec: Section }[] = [];

  for (const sec of secs) {
    if (!sec.visible) continue;
    const bg = sectionBg(sec, t);
    for (const col of sec.cols) for (const el of col.els) {
      const sel: Sel = { type: "el", id: el.id };
      const base = { pageId: sec.id === "footer" ? undefined : page.id, sel };
      const where = `in “${sec.name}”`;
      if (el.kind === "heading") headings.push({ el, level: Number(String(el.p.tag ?? "h2")[1]), sec });

      if (el.kind === "image" && !el.p.decorative && !String(el.p.alt ?? "").trim() && el.p.variant !== "collage") {
        out.push({ id: `alt-${el.id}`, level: "error", title: "Image has no description", detail: `Screen readers can't tell what this shows ${where}. Describe it in a few words, or mark it as decorative.`, ...base, fix: { label: "Mark decorative", patch: { el: { decorative: true } } } });
      }
      if (el.kind === "button" && !String(el.p.label ?? "").trim()) out.push({ id: `btn-${el.id}`, level: "error", title: "Button has no label", detail: `Visitors using a screen reader will hear “button” and nothing else ${where}.`, ...base });
      if (el.kind === "button" && vague.test(String(el.p.label ?? "").trim())) out.push({ id: `vague-${el.id}`, level: "warn", title: `“${el.p.label}” doesn't say where it goes`, detail: `Link text is read out of context. Say what happens, like “Shop sarees” ${where}.`, ...base });
      if (el.kind === "heading" && !String(el.p.text ?? "").trim()) out.push({ id: `eh-${el.id}`, level: "warn", title: "Empty heading", detail: `An empty heading still shows up in the outline ${where}.`, ...base });

      if (textKinds.includes(el.kind) && bg && el.kind !== "marquee") {
        let fg = textColor(el, sec, t, bg);
        let back = bg;
        if (el.kind === "button" && el.p.variant === "solid") { back = tokenHex(t, el.s.bg) ?? t.brand; fg = tokenHex(t, el.s.color) ?? onColor(back); }
        if (el.kind === "badge" && el.p.variant !== "outline") { back = tokenHex(t, el.s.bg) ?? (el.p.variant === "brand" ? t.brand : t.accent); fg = tokenHex(t, el.s.color) ?? onColor(back); }
        if (el.s.fill && tokenHex(t, el.s.fill)) { back = tokenHex(t, el.s.fill)!; if (!el.s.color) fg = onColor(back); }
        const r = contrast(fg, back);
        const min = need(el);
        if (r !== null && r < min) {
          const label = el.kind === "heading" || el.kind === "text" ? String(el.p.text ?? "").slice(0, 32) : el.kind === "button" ? String(el.p.label) : el.kind;
          out.push({
            id: `ct-${el.id}`, level: r < 3 ? "error" : "warn", title: `Hard to read: “${label}”`,
            detail: `Contrast is ${r.toFixed(1)}:1; this text needs ${min}:1 ${where}. Try darker text, a lighter background, or more opacity.`, ...base,
            fix: { label: "Use readable colour", patch: { s: { color: onColor(back), opacity: undefined } } },
          });
        }
      }
      if ((el.kind === "text" || el.kind === "heading") && (el.s.size ?? 16) < 12) out.push({ id: `sz-${el.id}`, level: "warn", title: "Very small text", detail: `${el.s.size}px is hard to read on a phone ${where}. 14px or more is comfortable.`, ...base, fix: { label: "Set to 14px", patch: { s: { size: 14 } } } });
      if (el.kind === "image" && el.p.link && !String(el.p.alt ?? "").trim() && !el.p.decorative) out.push({ id: `imglink-${el.id}`, level: "error", title: "Linked image needs a description", detail: `The description is the link's name for screen readers ${where}.`, ...base });
    }
  }

  const h1 = headings.filter((h) => h.level === 1);
  if (!h1.length && page.sections.length) out.push({ id: `h1-none-${page.id}`, level: "warn", title: "No main heading on this page", detail: "Each page should have one H1. It tells search engines and screen readers what the page is about.", pageId: page.id });
  if (h1.length > 1) h1.slice(1).forEach((h) => out.push({ id: `h1-${h.el.id}`, level: "warn", title: "More than one main heading", detail: `“${String(h.el.p.text).slice(0, 30)}” could be an H2. Use one H1 per page.`, pageId: page.id, sel: { type: "el", id: h.el.id }, fix: { label: "Change to H2", patch: { el: { tag: "h2" } } } }));
  let prev = 0;
  for (const h of headings) {
    if (prev && h.level > prev + 1) out.push({ id: `hs-${h.el.id}`, level: "warn", title: "Heading level skipped", detail: `H${prev} jumps to H${h.level} in “${h.sec.name}”. Skipping levels makes the outline confusing.`, pageId: page.id, sel: { type: "el", id: h.el.id }, fix: { label: `Change to H${prev + 1}`, patch: { el: { tag: `h${prev + 1}` } } } });
    prev = h.level;
  }

  if (!page.title.trim()) out.push({ id: `pt-${page.id}`, level: "warn", title: "Page has no title", detail: "The title appears in browser tabs and search results.", pageId: page.id });
  else if (page.title.length > 60) out.push({ id: `ptl-${page.id}`, level: "tip", title: "Page title is long", detail: `${page.title.length} characters. Search engines cut titles around 60.`, pageId: page.id });
  if (page.desc.trim().length < 50) out.push({ id: `pd-${page.id}`, level: "tip", title: "Description is short", detail: "Write a sentence or two so the page reads well in search results.", pageId: page.id });
  return out;
}

export function auditDoc(doc: Doc, pageId: string): Issue[] {
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  const out = auditPage(page, doc);
  const t = doc.theme;
  if (t.base < 15) out.push({ id: "base", level: "tip", title: "Body text is small", detail: `${t.base}px is the base size for the whole site. 16px is the usual comfortable minimum.` });
  const brand = contrast(t.brand, t.bg);
  if (brand !== null && brand < 3) out.push({ id: "brand", level: "warn", title: "Brand colour is faint on the page colour", detail: `Contrast is ${brand.toFixed(1)}:1. Links and outlines in the brand colour need at least 3:1.` });
  return out;
}
