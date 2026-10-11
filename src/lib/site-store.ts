"use client";
import { create } from "zustand";
import {
  colPresets, initialDoc, makeEl, makeSection, presetTheme, sectionPresets, uid,
  type Col, type Device, type Doc, type El, type ElKind, type ElStyle, type Header, type Page, type Section, type Theme, type Version,
} from "./builder";

export type Sel = { type: "el" | "section" | "header"; id: string } | null;
export type Drag = { t: "el"; id: string } | { t: "section"; id: string } | { t: "new-el"; kind: ElKind } | { t: "new-sec"; preset: string } | null;
export type Target =
  | { kind: "el"; id: string; pos: "before" | "after" }
  | { kind: "col"; id: string }
  | { kind: "section"; id: string; pos: "before" | "after" }
  | { kind: "page-end" };
export const targetKey = (t: Target) => (t.kind === "el" ? `el:${t.id}:${t.pos}` : t.kind === "col" ? `col:${t.id}` : t.kind === "section" ? `sec:${t.id}:${t.pos}` : "page-end");

/* ---------- lookups ---------- */
export const allSections = (d: Doc) => [...d.pages.flatMap((p) => p.sections), d.footer];
export function locateEl(d: Doc, id: string) {
  for (const sec of allSections(d)) for (const col of sec.cols) {
    const i = col.els.findIndex((e) => e.id === id);
    if (i > -1) return { sec, col, i, el: col.els[i] };
  }
  return null;
}
export const findSection = (d: Doc, id: string) => allSections(d).find((s) => s.id === id) ?? null;
export function locateSection(d: Doc, id: string) {
  for (const p of d.pages) { const i = p.sections.findIndex((s) => s.id === id); if (i > -1) return { page: p, i, sec: p.sections[i] }; }
  return null;
}
const cloneEl = (e: El): El => ({ ...structuredClone(e), id: `e-${uid()}` });
const cloneSection = (s: Section): Section => ({
  ...structuredClone(s), id: `s-${uid()}`, name: s.name,
  cols: s.cols.map((c) => ({ ...c, id: `c-${uid()}`, els: c.els.map(cloneEl) })),
});

export type Saved = { id: string; name: string; sec: Section };
export type Clip = { t: "el"; el: El } | { t: "section"; sec: Section } | null;

type State = {
  doc: Doc;
  published: Doc;
  past: Doc[];
  future: Doc[];
  lastKey: string | null;
  lastAt: number;
  dirty: boolean;
  pageId: string;
  sel: Sel;
  device: Device;
  zoom: number; // 0 = fit
  drag: Drag;
  over: string | null;
  guides: boolean;
  leftTab: "add" | "layers" | "pages" | "checks";
  setLeftTab: (t: "add" | "layers" | "pages" | "checks") => void;
  saved: Saved[];
  clip: Clip;
  styleClip: ElStyle | null;
  versions: Version[];
  say: string;
  outlines: boolean;
  paletteOpen: boolean;
  helpOpen: boolean;
  hintsOpen: boolean;
  preview: boolean;
  setUi: (p: Partial<Pick<State, "outlines" | "paletteOpen" | "helpOpen" | "hintsOpen" | "preview">>) => void;
  announce: (msg: string) => void;
  copySel: (cut?: boolean) => void;
  pasteClip: () => void;
  copyStyle: (id: string) => void;
  pasteStyle: (id: string) => void;
  resetStyle: (id: string) => void;
  saveSection: (id: string, name: string) => void;
  delSaved: (id: string) => void;
  restore: (vid: string) => void;
  selectParent: () => void;
  moveSel: (dir: -1 | 1) => void;
  addPaletteColor: (hex: string) => void;

  edit: (fn: (d: Doc) => void, key?: string) => void;
  undo: () => void;
  redo: () => void;
  select: (s: Sel) => void;
  setDevice: (d: Device) => void;
  setZoom: (z: number) => void;
  setGuides: (v: boolean) => void;
  setPageId: (id: string) => void;
  setDrag: (d: Drag) => void;
  setOver: (k: string | null) => void;

  setP: (id: string, key: string, val: unknown) => void;
  setS: (id: string, key: keyof ElStyle, val: unknown) => void;
  patchEl: (id: string, patch: Partial<El>) => void;
  addEl: (kind: ElKind, at?: Target) => string | null;
  dupEl: (id: string) => void;
  delEl: (id: string) => void;
  nudgeEl: (id: string, dir: -1 | 1) => void;

  patchSection: (id: string, patch: Partial<Section>) => void;
  setSt: (id: string, key: string, val: unknown) => void;
  setColumns: (secId: string, fr: number[]) => void;
  patchCol: (colId: string, patch: Partial<Col>) => void;
  addSection: (preset: string, at?: Target) => string | null;
  dupSection: (id: string) => void;
  delSection: (id: string) => void;
  nudgeSection: (id: string, dir: -1 | 1) => void;
  drop: (t: Target) => void;

  setTheme: (patch: Partial<Theme>) => void;
  applyPreset: (id: string) => void;
  setHeader: (patch: Partial<Header>) => void;

  addPage: (name: string) => string;
  patchPage: (id: string, patch: Partial<Page>) => void;
  dupPage: (id: string) => string;
  delPage: (id: string) => void;
  makeHome: (id: string) => void;

  publish: () => void;
  discard: () => void;
};

const MAX_HISTORY = 80;

export const useSite = create<State>((set, get) => {
  const doc0 = initialDoc();
  return {
    doc: doc0,
    published: structuredClone(doc0),
    past: [],
    future: [],
    lastKey: null,
    lastAt: 0,
    dirty: false,
    pageId: "pg-home",
    sel: null,
    device: "desktop",
    zoom: 0,
    drag: null,
    over: null,
    guides: true,
    leftTab: "add",
    setLeftTab: (leftTab) => set({ leftTab }),
    saved: [],
    clip: null,
    styleClip: null,
    versions: [{ id: "v0", at: 0, label: "Starting design", doc: structuredClone(doc0) }],
    say: "",
    outlines: false,
    paletteOpen: false,
    helpOpen: false,
    hintsOpen: true,
    preview: false,
    setUi: (p) => set(p),
    announce: (say) => set({ say: say + (get().say === say ? "\u200b" : "") }),
    copySel: (cut) => {
      const st = get();
      if (st.sel?.type === "el") { const l = locateEl(st.doc, st.sel.id); if (l) { set({ clip: { t: "el", el: structuredClone(l.el) } }); st.announce(cut ? "Cut element" : "Copied element"); if (cut) st.delEl(l.el.id); } }
      else if (st.sel?.type === "section" && st.sel.id !== "footer") { const sec = findSection(st.doc, st.sel.id); if (sec) { set({ clip: { t: "section", sec: structuredClone(sec) } }); st.announce(cut ? "Cut section" : "Copied section"); if (cut) st.delSection(sec.id); } }
    },
    pasteClip: () => {
      const st = get();
      const c = st.clip;
      if (!c) return;
      if (c.t === "el") {
        const el = cloneEl(c.el);
        let target: Target | null = null;
        if (st.sel?.type === "el") target = { kind: "el", id: st.sel.id, pos: "after" };
        else if (st.sel?.type === "section") { const sec = findSection(st.doc, st.sel.id); if (sec) target = { kind: "col", id: sec.cols[0].id }; }
        else { const pg = st.doc.pages.find((p) => p.id === st.pageId); const last = pg?.sections[pg.sections.length - 1]; if (last) target = { kind: "col", id: last.cols[0].id }; }
        if (!target) return;
        st.edit((d) => insertEl(d, el, target!));
        set({ sel: { type: "el", id: el.id } });
        st.announce("Pasted element");
      } else {
        const sec = cloneSection(c.sec);
        let target: Target = { kind: "page-end" };
        const anchor = st.sel?.type === "el" ? locateEl(st.doc, st.sel.id)?.sec.id : st.sel?.type === "section" ? st.sel.id : undefined;
        if (anchor && anchor !== "footer") target = { kind: "section", id: anchor, pos: "after" };
        st.edit((d) => insertSection(d, sec, target, st.pageId));
        set({ sel: { type: "section", id: sec.id } });
        st.announce("Pasted section");
      }
    },
    copyStyle: (id) => { const l = locateEl(get().doc, id); if (l) { set({ styleClip: structuredClone(l.el.s) }); get().announce("Style copied"); } },
    pasteStyle: (id) => {
      const sc = get().styleClip;
      if (!sc) return;
      get().edit((d) => { const l = locateEl(d, id); if (l) l.el.s = { ...structuredClone(sc), mt: l.el.s.mt, mb: l.el.s.mb, inline: l.el.s.inline }; });
      get().announce("Style pasted");
    },
    resetStyle: (id) => {
      get().edit((d) => { const l = locateEl(d, id); if (l) l.el.s = makeEl(l.el.kind).s; });
      get().announce("Style reset to the default");
    },
    saveSection: (id, name) => {
      const sec = findSection(get().doc, id);
      if (!sec) return;
      set((s) => ({ saved: [...s.saved, { id: `sv-${uid()}`, name: name || sec.name, sec: structuredClone({ ...sec, id: "x" }) }] }));
      get().announce(`Saved “${name || sec.name}” to My sections`);
    },
    delSaved: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
    restore: (vid) => {
      const v = get().versions.find((x) => x.id === vid);
      if (!v) return;
      set((s) => ({ doc: structuredClone(v.doc), past: [...s.past, s.doc], future: [], dirty: true, sel: null, pageId: v.doc.pages.some((p) => p.id === s.pageId) ? s.pageId : v.doc.pages[0].id }));
      get().announce(`Restored “${v.label}”. Publish to make it live.`);
    },
    selectParent: () => {
      const st = get();
      if (st.sel?.type === "el") { const l = locateEl(st.doc, st.sel.id); if (l) set({ sel: { type: "section", id: l.sec.id } }); }
      else if (st.sel) set({ sel: null });
    },
    moveSel: (dir) => {
      const st = get();
      if (st.sel?.type === "el") { st.nudgeEl(st.sel.id, dir); st.announce(dir < 0 ? "Moved up" : "Moved down"); }
      else if (st.sel?.type === "section" && st.sel.id !== "footer") { st.nudgeSection(st.sel.id, dir); st.announce(dir < 0 ? "Section moved up" : "Section moved down"); }
    },
    addPaletteColor: (hex) => get().edit((d) => { const sw = d.theme.swatches ?? []; if (!sw.includes(hex)) d.theme.swatches = [...sw, hex].slice(-10); }),

    edit: (fn, key) =>
      set((s) => {
        const next = structuredClone(s.doc);
        fn(next);
        const now = Date.now();
        const coalesce = key && key === s.lastKey && now - s.lastAt < 900;
        return {
          doc: next,
          past: coalesce ? s.past : [...s.past, s.doc].slice(-MAX_HISTORY),
          future: [],
          lastKey: key ?? null,
          lastAt: now,
          dirty: true,
        };
      }),
    undo: () =>
      set((s) => {
        if (!s.past.length) return s;
        const prev = s.past[s.past.length - 1];
        const sel = s.sel && s.sel.type !== "header" && !(locateEl(prev, s.sel.id) || findSection(prev, s.sel.id)) ? null : s.sel;
        const pageId = prev.pages.some((p) => p.id === s.pageId) ? s.pageId : prev.pages[0].id;
        return { doc: prev, past: s.past.slice(0, -1), future: [s.doc, ...s.future], lastKey: null, sel, pageId, dirty: true };
      }),
    redo: () =>
      set((s) => {
        if (!s.future.length) return s;
        const [next, ...rest] = s.future;
        const pageId = next.pages.some((p) => p.id === s.pageId) ? s.pageId : next.pages[0].id;
        return { doc: next, future: rest, past: [...s.past, s.doc], lastKey: null, pageId, dirty: true };
      }),
    select: (sel) => set({ sel }),
    setDevice: (device) => set({ device }),
    setZoom: (zoom) => set({ zoom }),
    setGuides: (guides) => set({ guides }),
    setPageId: (pageId) => set({ pageId, sel: null }),
    setDrag: (drag) => set({ drag, over: drag ? get().over : null }),
    setOver: (over) => set((s) => (s.over === over ? s : { over })),

    setP: (id, key, val) =>
      get().edit((d) => { const l = locateEl(d, id); if (l) l.el.p[key] = val; }, `p:${id}:${key}`),
    setS: (id, key, val) =>
      get().edit((d) => {
        const l = locateEl(d, id);
        if (!l) return;
        if (val === undefined || val === "" || val === null) delete (l.el.s as Record<string, unknown>)[key];
        else (l.el.s as Record<string, unknown>)[key] = val;
      }, `s:${id}:${key}`),
    patchEl: (id, patch) => get().edit((d) => { const l = locateEl(d, id); if (l) Object.assign(l.el, patch); }),
    addEl: (kind, at) => {
      const el = makeEl(kind);
      const st = get();
      let target: Target | null = at ?? null;
      if (!target) {
        const sel = st.sel;
        if (sel?.type === "el") target = { kind: "el", id: sel.id, pos: "after" };
        else if (sel?.type === "section") {
          const sec = findSection(st.doc, sel.id);
          if (sec) target = { kind: "col", id: sec.cols[0].id };
        } else {
          const page = st.doc.pages.find((p) => p.id === st.pageId);
          const last = page?.sections[page.sections.length - 1];
          if (last) target = { kind: "col", id: last.cols[0].id };
        }
      }
      if (!target) return null;
      st.edit((d) => insertEl(d, el, target!));
      set({ sel: { type: "el", id: el.id } });
      return el.id;
    },
    dupEl: (id) =>
      get().edit((d) => {
        const l = locateEl(d, id);
        if (!l) return;
        const c = cloneEl(l.el);
        l.col.els.splice(l.i + 1, 0, c);
        setTimeout(() => set({ sel: { type: "el", id: c.id } }), 0);
      }),
    delEl: (id) => {
      get().edit((d) => { const l = locateEl(d, id); if (l) l.col.els.splice(l.i, 1); });
      set((s) => (s.sel?.id === id ? { sel: null } : s));
    },
    nudgeEl: (id, dir) =>
      get().edit((d) => {
        const l = locateEl(d, id);
        if (!l) return;
        const j = l.i + dir;
        if (j < 0 || j >= l.col.els.length) return;
        [l.col.els[l.i], l.col.els[j]] = [l.col.els[j], l.col.els[l.i]];
      }),

    patchSection: (id, patch) => get().edit((d) => { const s = findSection(d, id); if (s) Object.assign(s, patch); }, `sec:${id}:${Object.keys(patch).join(",")}`),
    setSt: (id, key, val) =>
      get().edit((d) => {
        const s = findSection(d, id);
        if (!s) return;
        if (val === undefined || val === "" || val === null) delete (s.st as Record<string, unknown>)[key];
        else (s.st as Record<string, unknown>)[key] = val;
      }, `st:${id}:${key}`),
    setColumns: (secId, fr) =>
      get().edit((d) => {
        const s = findSection(d, secId);
        if (!s) return;
        const cols = s.cols;
        if (fr.length < cols.length) {
          // merge the overflow into the last kept column
          const keep = cols.slice(0, fr.length);
          for (const extra of cols.slice(fr.length)) keep[keep.length - 1].els.push(...extra.els);
          s.cols = keep;
        } else {
          while (cols.length < fr.length) cols.push({ id: `c-${uid()}`, fr: 1, els: [] });
        }
        s.cols.forEach((c, i) => (c.fr = fr[i]));
      }),
    patchCol: (colId, patch) =>
      get().edit((d) => { for (const s of allSections(d)) { const c = s.cols.find((x) => x.id === colId); if (c) Object.assign(c, patch); } }, `col:${colId}`),
    addSection: (preset, at) => {
      const sec = makeFromPreset(preset, get().saved);
      if (!sec) return null;
      const st = get();
      let target: Target = at ?? { kind: "page-end" };
      if (!at && st.sel) {
        const anchor = st.sel.type === "el" ? locateEl(st.doc, st.sel.id)?.sec.id : st.sel.type === "section" ? st.sel.id : undefined;
        if (anchor && anchor !== "footer") target = { kind: "section", id: anchor, pos: "after" };
      }
      st.edit((d) => insertSection(d, sec, target, st.pageId));
      set({ sel: { type: "section", id: sec.id } });
      return sec.id;
    },
    dupSection: (id) =>
      get().edit((d) => {
        const l = locateSection(d, id);
        if (!l) return;
        const c = cloneSection(l.sec);
        l.page.sections.splice(l.i + 1, 0, c);
        setTimeout(() => set({ sel: { type: "section", id: c.id } }), 0);
      }),
    delSection: (id) => {
      get().edit((d) => { const l = locateSection(d, id); if (l) l.page.sections.splice(l.i, 1); });
      set((s) => ({ sel: s.sel && (s.sel.id === id || !(locateEl(s.doc, s.sel.id) || findSection(s.doc, s.sel.id) || s.sel.type === "header")) ? null : s.sel }));
    },
    nudgeSection: (id, dir) =>
      get().edit((d) => {
        const l = locateSection(d, id);
        if (!l) return;
        const j = l.i + dir;
        if (j < 0 || j >= l.page.sections.length) return;
        [l.page.sections[l.i], l.page.sections[j]] = [l.page.sections[j], l.page.sections[l.i]];
      }),
    drop: (t) => {
      const st = get();
      const drag = st.drag;
      set({ drag: null, over: null });
      if (!drag) return;
      if (drag.t === "el") {
        if (t.kind === "el" && t.id === drag.id) return;
        st.edit((d) => {
          const l = locateEl(d, drag.id);
          if (!l) return;
          const [el] = l.col.els.splice(l.i, 1);
          insertEl(d, el, t);
        });
        set({ sel: { type: "el", id: drag.id } });
      } else if (drag.t === "new-el") {
        const el = makeEl(drag.kind);
        st.edit((d) => insertEl(d, el, t));
        set({ sel: { type: "el", id: el.id } });
      } else if (drag.t === "section") {
        if (t.kind === "section" && t.id === drag.id) return;
        st.edit((d) => {
          const l = locateSection(d, drag.id);
          if (!l) return;
          const [sec] = l.page.sections.splice(l.i, 1);
          insertSection(d, sec, t, l.page.id);
        });
      } else if (drag.t === "new-sec") {
        const sec = makeFromPreset(drag.preset, st.saved);
        if (!sec) return;
        st.edit((d) => insertSection(d, sec, t, st.pageId));
        set({ sel: { type: "section", id: sec.id } });
      }
    },

    setTheme: (patch) => get().edit((d) => { Object.assign(d.theme, patch); if (!("presetId" in patch)) d.theme.presetId = undefined; }, `theme:${Object.keys(patch).join(",")}`),
    applyPreset: (id) => get().edit((d) => { const keep = { radius: d.theme.radius, btn: d.theme.btn, base: d.theme.base, headScale: d.theme.headScale, space: d.theme.space, maxw: d.theme.maxw }; d.theme = { ...presetTheme(id), ...keep, presetId: id }; }),
    setHeader: (patch) => get().edit((d) => { Object.assign(d.header, patch); }, `hdr:${Object.keys(patch).join(",")}`),

    addPage: (name) => {
      const id = `pg-${uid()}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id;
      get().edit((d) => {
        d.pages.push({
          id, name, path: `/${slug}`, title: name, desc: "", showInNav: true,
          sections: [makeSection("Intro", [{ id: `c-${uid()}`, fr: 1, els: [makeEl("heading", { text: name, tag: "h1" }, { size: 72, mb: 16 }), makeEl("text", { text: "Start writing, or drag blocks in from the left." }, { size: 18 })] }], {}, { padT: 88, padB: 56 })],
        });
      });
      set({ pageId: id, sel: null });
      return id;
    },
    patchPage: (id, patch) => get().edit((d) => { const p = d.pages.find((x) => x.id === id); if (p) Object.assign(p, patch); }, `page:${id}:${Object.keys(patch).join(",")}`),
    dupPage: (id) => {
      const nid = `pg-${uid()}`;
      get().edit((d) => {
        const p = d.pages.find((x) => x.id === id);
        if (!p) return;
        d.pages.push({ ...structuredClone(p), id: nid, name: `${p.name} copy`, path: `${p.path === "/" ? "/home" : p.path}-copy`, sections: p.sections.map(cloneSection), showInNav: false });
      });
      set({ pageId: nid, sel: null });
      return nid;
    },
    delPage: (id) => {
      const st = get();
      if (st.doc.pages.length < 2) return;
      st.edit((d) => { d.pages = d.pages.filter((p) => p.id !== id); if (!d.pages.some((p) => p.path === "/")) d.pages[0].path = "/"; });
      set((s) => (s.pageId === id ? { pageId: s.doc.pages[0].id, sel: null } : s));
    },
    makeHome: (id) =>
      get().edit((d) => {
        const old = d.pages.find((p) => p.path === "/");
        const p = d.pages.find((x) => x.id === id);
        if (!p) return;
        if (old && old.id !== p.id) old.path = `/${old.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        p.path = "/";
      }),

    publish: () => set((s) => ({ published: structuredClone(s.doc), dirty: false, versions: [{ id: `v-${uid()}`, at: Date.now(), label: `Published ${s.versions.length}`, doc: structuredClone(s.doc) }, ...s.versions].slice(0, 20) })),
    discard: () => set((s) => ({ doc: structuredClone(s.published), past: [...s.past, s.doc], future: [], dirty: false, sel: null, pageId: s.published.pages.some((p) => p.id === s.pageId) ? s.pageId : s.published.pages[0].id })),
  };
});

function makeFromPreset(preset: string, saved: Saved[]): Section | null {
  if (preset.startsWith("saved:")) {
    const sv = saved.find((x) => x.id === preset.slice(6));
    return sv ? cloneSection(sv.sec) : null;
  }
  return sectionPresets.find((p) => p.id === preset)?.make() ?? null;
}

function insertEl(d: Doc, el: El, t: Target) {
  if (t.kind === "el") {
    const l = locateEl(d, t.id);
    if (l) l.col.els.splice(l.i + (t.pos === "after" ? 1 : 0), 0, el);
  } else if (t.kind === "col") {
    for (const s of allSections(d)) { const c = s.cols.find((x) => x.id === t.id); if (c) { c.els.push(el); return; } }
  } else if (t.kind === "section") {
    const s = findSection(d, t.id);
    if (s) s.cols[0].els.push(el);
  }
}
function insertSection(d: Doc, sec: Section, t: Target, pageId: string) {
  const page = d.pages.find((p) => p.id === pageId) ?? d.pages[0];
  if (t.kind === "section") {
    const l = locateSection(d, t.id);
    if (l) { l.page.sections.splice(l.i + (t.pos === "after" ? 1 : 0), 0, sec); return; }
  }
  page.sections.push(sec);
}

export { colPresets };
