/* Website builder model: Page → Section → Column → Element. Everything the visitor sees is one of these. */

export type Device = "desktop" | "tablet" | "mobile";
export type ElKind =
  | "heading" | "text" | "button" | "badge" | "image" | "divider" | "spacer" | "linklist" | "stats"
  | "marquee" | "products" | "collections" | "entity" | "form" | "newsletter" | "feedback";

export type FormField = { key: string; label?: string; placeholder?: string; help?: string; required?: boolean; half?: boolean; as?: "scale" | "chips" | "default" };

export type ElStyle = {
  size?: number; weight?: number; italic?: boolean; align?: "left" | "center" | "right"; color?: string; font?: string;
  ls?: number; lh?: number; caps?: boolean; opacity?: number; mt?: number; mb?: number; maxw?: number; radius?: number;
  bg?: string; inline?: boolean; w?: number; underline?: boolean;
  /* box: the frame around any element */
  fill?: string; ga?: string; gb?: string; gdeg?: number; br?: number;
  pt?: number; pr?: number; pb?: number; pl?: number;
  bd?: number; bdc?: string; bds?: "solid" | "dashed" | "dotted"; shadow?: "sm" | "md" | "lg" | "glow";
  /* effects */
  hover?: "lift" | "zoom" | "glow" | "fade"; anim?: "fade" | "up" | "zoom" | "left" | "right"; delay?: number; rot?: number;
  /* responsive + advanced */
  sizeM?: number; css?: string; aid?: string; label?: string;
};
export type El = { id: string; kind: ElKind; p: Record<string, any>; s: ElStyle; hide?: Device[] };
export type Col = { id: string; fr: number; align?: "left" | "center" | "right"; els: El[] };
export type SecStyle = {
  bg?: string; fg?: string; padT: number; padB: number; padX?: number; deco?: "none" | "dots" | "stripes" | "grid"; edge?: "none" | "scallop"; radius?: number; inset?: boolean; minH?: number; border?: boolean;
  ga?: string; gb?: string; gdeg?: number; img?: string; imgPos?: "center" | "top" | "bottom"; overlay?: number; fixed?: boolean;
  bt?: number; bb?: number; bc?: string; shadow?: "sm" | "md" | "lg"; padMob?: number; anim?: "fade" | "up";
};
export type Section = {
  id: string; name: string; visible: boolean; hide?: Device[];
  gap: number; valign: "start" | "center" | "end"; contained: boolean; stack?: "never" | "tablet" | "mobile"; st: SecStyle; cols: Col[];
  anchor?: string; css?: string; label?: string;
};
export type Page = { id: string; name: string; path: string; title: string; desc: string; sections: Section[]; showInNav?: boolean; og?: string; noindex?: boolean; hideHeader?: boolean; hideFooter?: boolean; bg?: string };
export type NavItem = { id: string; label: string; href: string; newTab?: boolean; children?: { id: string; label: string; href: string }[] };
export type Social = { id: string; kind: "instagram" | "facebook" | "youtube" | "x" | "whatsapp" | "pinterest"; href: string };
export type Header = {
  logoMode: "mark+name" | "name" | "mark"; logoText: string; nav: NavItem[];
  search: boolean; cart: boolean; sticky: boolean; awning: boolean; layout: "split" | "center"; bg?: string; border: boolean; padY: number;
  fg?: string; logoImg?: string; logoH?: number; navSize?: number; navWeight?: number; navGap?: number; navAlign?: "left" | "center" | "right";
  cta?: { on: boolean; label: string; href: string; variant: "solid" | "outline" };
  social?: Social[]; socialInHeader?: boolean;
  announce?: { on: boolean; text: string; href: string; bg?: string; fg?: string; dismiss: boolean };
};
export type Theme = {
  bg: string; fg: string; surface: string; brand: string; accent: string;
  head: string; body: string; radius: number; btn: "pill" | "soft" | "sharp"; base: number; headScale: number; space: number; maxw: number;
  presetId?: string;
  swatches?: string[]; headWeight?: number; css?: string; motion?: "full" | "reduced"; focus?: string; linkUnderline?: boolean; btnWeight?: number; cardShadow?: "none" | "soft" | "lifted";
};
export type Doc = { pages: Page[]; header: Header; footer: Section; theme: Theme };
export type Version = { id: string; at: number; label: string; doc: Doc };

let seq = -1; // deterministic ids while building the seed doc, so server and client markup match
export const withStableIds = <T,>(fn: () => T): T => { const prev = seq; seq = 0; try { return fn(); } finally { seq = prev; } };
export const uid = () => (seq >= 0 ? `i${(seq++).toString(36)}` : Math.random().toString(36).slice(2, 8));

/* ---------- fonts ---------- */
export type FontDef = { id: string; name: string; family: string; kind: "Sans" | "Serif" | "Display" | "Script" | "Mono"; weight: number; track: number; lh: number; wdth?: number; sample: string };
export const fonts: FontDef[] = [
  { id: "bricolage", name: "Bricolage Grotesque", family: '"Bricolage Grotesque Variable", sans-serif', kind: "Display", weight: 700, track: -0.035, lh: 0.98, wdth: 88, sample: "Woven slowly" },
  { id: "fraunces", name: "Fraunces", family: '"Fraunces Variable", serif', kind: "Serif", weight: 600, track: -0.02, lh: 1.02, sample: "Woven slowly" },
  { id: "playfair", name: "Playfair Display", family: '"Playfair Display Variable", serif', kind: "Serif", weight: 600, track: -0.015, lh: 1.05, sample: "Woven slowly" },
  { id: "dmserif", name: "DM Serif Display", family: '"DM Serif Display", serif', kind: "Serif", weight: 400, track: -0.01, lh: 1.05, sample: "Woven slowly" },
  { id: "space", name: "Space Grotesk", family: '"Space Grotesk Variable", sans-serif', kind: "Sans", weight: 600, track: -0.03, lh: 1.02, sample: "Woven slowly" },
  { id: "syne", name: "Syne", family: '"Syne Variable", sans-serif', kind: "Display", weight: 700, track: -0.025, lh: 1, sample: "Woven slowly" },
  { id: "caveat", name: "Caveat", family: '"Caveat Variable", cursive', kind: "Script", weight: 600, track: 0, lh: 1, sample: "Woven slowly" },
  { id: "geist", name: "Geist", family: "var(--font-geist-sans), sans-serif", kind: "Sans", weight: 600, track: -0.03, lh: 1.05, sample: "Woven slowly" },
  { id: "mono", name: "JetBrains Mono", family: '"JetBrains Mono Variable", monospace', kind: "Mono", weight: 500, track: -0.02, lh: 1.15, sample: "Woven slowly" },
  { id: "georgia", name: "Georgia", family: "Georgia, 'Times New Roman', serif", kind: "Serif", weight: 500, track: -0.015, lh: 1.05, sample: "Woven slowly" },
];
export const fontById = (id: string) => fonts.find((f) => f.id === id) ?? fonts[0];

/* ---------- theme presets ---------- */
export type ThemePreset = { id: string; name: string; bg: string; fg: string; surface: string; brand: string; accent: string; head: string; body: string };
export const themePresets: ThemePreset[] = [
  { id: "indigo", name: "Indigo hour", bg: "#f6f4ee", fg: "#141a3a", surface: "#ffffff", brand: "#2a3bff", accent: "#ffb61e", head: "bricolage", body: "geist" },
  { id: "madder", name: "Madder", bg: "#fbf1e6", fg: "#3a1410", surface: "#fffaf3", brand: "#c8321f", accent: "#1e6b5c", head: "fraunces", body: "geist" },
  { id: "pistachio", name: "Pistachio", bg: "#eef3e4", fg: "#14251a", surface: "#f9fcf3", brand: "#1f7a4d", accent: "#ff7a45", head: "space", body: "geist" },
  { id: "ink", name: "After dark", bg: "#0f1226", fg: "#f4f2ea", surface: "#171b38", brand: "#ffb61e", accent: "#7f8cff", head: "syne", body: "geist" },
  { id: "rosewater", name: "Rosewater", bg: "#fdf0f2", fg: "#2c1320", surface: "#ffffff", brand: "#d8386b", accent: "#2d7d6e", head: "playfair", body: "geist" },
  { id: "mono", name: "Mono studio", bg: "#ececec", fg: "#111111", surface: "#ffffff", brand: "#111111", accent: "#ff4d1c", head: "mono", body: "mono" },
];
export const presetTheme = (id: string): Theme => {
  const p = themePresets.find((x) => x.id === id) ?? themePresets[0];
  return { bg: p.bg, fg: p.fg, surface: p.surface, brand: p.brand, accent: p.accent, head: p.head, body: p.body, radius: 14, btn: "pill", base: 16, headScale: 1, space: 1, maxw: 1200, presetId: p.id };
};

/* ---------- element + section factories ---------- */
const base = (kind: ElKind): { p: Record<string, any>; s: ElStyle } => {
  switch (kind) {
    case "heading": return { p: { text: "A headline worth reading", tag: "h2" }, s: { size: 44, mb: 14 } };
    case "text": return { p: { text: "Write a few lines here. Click to edit, drag to move." }, s: { size: 16, opacity: 75, mb: 20, maxw: 520, lh: 1.6 } };
    case "button": return { p: { label: "Shop now", href: "/", variant: "solid", icon: "none", size: "md", newTab: false, full: false }, s: { mb: 8, inline: true } };
    case "badge": return { p: { text: "New", variant: "accent" }, s: { mb: 14 } };
    case "image": return { p: { variant: "single", productId: "p1", shape: "rect", aspect: "4/5", alt: "", decorative: false, src: "", fit: "cover", href: "" }, s: { mb: 0 } };
    case "divider": return { p: { variant: "line" }, s: { mt: 8, mb: 8 } };
    case "spacer": return { p: { h: 32 }, s: {} };
    case "linklist": return { p: { title: "Shop", direction: "col", items: [{ id: uid(), label: "Sarees", href: "/" }, { id: uid(), label: "Dupattas", href: "/" }, { id: uid(), label: "Stoles", href: "/" }] }, s: { size: 14, mb: 0 } };
    case "stats": return { p: { items: [{ id: uid(), n: "140", label: "weavers" }, { id: uid(), n: "30 yrs", label: "on the loom" }, { id: uid(), n: "48 h", label: "to ship" }] }, s: { mb: 0 } };
    case "marquee": return { p: { text: "Handwoven · Naturally dyed · Ships in 48 hours · Easy 15-day returns", speed: 40 }, s: { size: 18, weight: 500 } };
    case "products": return { p: { source: "all", value: "", count: 4, cols: 4, card: "plain", showPrice: true, showBadge: true, showAdd: true, sort: "best", aspect: "4/5" }, s: { mb: 0 } };
    case "collections": return { p: { parent: "", cols: 6, shape: "arch", showCount: true }, s: { mb: 0 } };
    case "entity": return { p: { slug: "reviews", view: "cards", count: 4, cols: 2, fields: [], titleKey: "", bodyKey: "", ratingKey: "", sort: "newest", sortKey: "", search: false, filterKey: "", where: { key: "", value: "" }, more: false, empty: "Nothing here yet." }, s: { mb: 0 } };
    case "form": return { p: { slug: "enquiries", title: "Write to us", desc: "We reply within a working day.", fields: [], submit: "Send message", successTitle: "Thank you", success: "We got it and will reply soon.", after: "message", page: "", look: "card", fieldStyle: "filled", btn: "brand", showTitle: true }, s: { mb: 0, maxw: 560 } };
    case "newsletter": return { p: { placeholder: "you@email.com", button: "Join", variant: "inline", success: "You're in" }, s: { mb: 0, maxw: 460 } };
    case "feedback": return { p: { question: "How likely are you to recommend us to a friend?" }, s: { mb: 0 } };
  }
};
export const makeEl = (kind: ElKind, p: Record<string, any> = {}, s: ElStyle = {}): El => {
  const b = base(kind);
  return { id: `e-${uid()}`, kind, p: { ...structuredClone(b.p), ...p }, s: { ...b.s, ...s } };
};
const col = (els: El[], fr = 1, align?: Col["align"]): Col => ({ id: `c-${uid()}`, fr, els, align });
export const makeSection = (name: string, cols: Col[], extra: Partial<Section> = {}, st: Partial<SecStyle> = {}): Section => ({
  id: `s-${uid()}`, name, visible: true, gap: 40, valign: "center", contained: true, st: { padT: 56, padB: 56, ...st }, cols, ...extra,
});

export type ElDef = { kind: ElKind; label: string; hint: string; group: "Basics" | "Store" | "Layout" };
export const elementLibrary: ElDef[] = [
  { kind: "heading", label: "Heading", hint: "Big title text", group: "Basics" },
  { kind: "text", label: "Text", hint: "Paragraph", group: "Basics" },
  { kind: "button", label: "Button", hint: "Link or action", group: "Basics" },
  { kind: "badge", label: "Badge", hint: "Small label", group: "Basics" },
  { kind: "image", label: "Image", hint: "Photo or pattern art", group: "Basics" },
  { kind: "linklist", label: "Link list", hint: "Menu or footer links", group: "Basics" },
  { kind: "stats", label: "Numbers", hint: "Proof points", group: "Basics" },
  { kind: "marquee", label: "Ticker", hint: "Scrolling promises", group: "Basics" },
  { kind: "products", label: "Products", hint: "Live from your catalogue", group: "Store" },
  { kind: "collections", label: "Categories", hint: "From your category tree", group: "Store" },
  { kind: "entity", label: "Data list", hint: "Show records from a table", group: "Store" },
  { kind: "form", label: "Form", hint: "Collect into a table", group: "Store" },
  { kind: "newsletter", label: "Email signup", hint: "Collect addresses", group: "Store" },
  { kind: "divider", label: "Divider", hint: "Line, dots or awning", group: "Layout" },
  { kind: "spacer", label: "Spacer", hint: "Empty space", group: "Layout" },
];
export const kindLabel = (k: ElKind) => elementLibrary.find((e) => e.kind === k)?.label ?? k;

export type SecPreset = { id: string; label: string; hint: string; make: () => Section };
export const sectionPresets: SecPreset[] = [
  {
    id: "announce", label: "Announcement bar", hint: "One line, full width",
    make: () => makeSection("Announcement", [col([makeEl("text", { text: "Free shipping across India on orders over ₹2,000" }, { size: 13, mb: 0, opacity: 100, align: "center", maxw: 0 })])], { contained: false }, { bg: "fg", padT: 9, padB: 9 }),
  },
  {
    id: "hero", label: "Hero, split", hint: "Headline left, art right",
    make: () => makeSection("Hero", [
      col([
        makeEl("badge", { text: "Diwali edit 2026", variant: "accent" }),
        makeEl("heading", { text: "Woven slowly, worn for years.", tag: "h1" }, { size: 72, mb: 20 }),
        makeEl("text", { text: "Handloom sarees and block-printed everyday wear, made by 140 weavers across Karnataka and Gujarat." }, { size: 17, mb: 28 }),
        makeEl("button", { label: "Shop the Diwali edit", icon: "arrow", size: "lg" }),
        makeEl("button", { label: "Our story", variant: "link", href: "/about", size: "lg" }),
      ], 1.05),
      col([makeEl("image", { variant: "collage", productId: "p1" })], 1),
    ], {}, { padT: 56, padB: 64 }),
  },
  {
    id: "hero-center", label: "Hero, centred", hint: "Stacked and symmetrical",
    make: () => makeSection("Hero", [col([
      makeEl("badge", { text: "New season" }),
      makeEl("heading", { text: "Colour that remembers the loom.", tag: "h1" }, { size: 84, mb: 20, align: "center", maxw: 900 }),
      makeEl("text", { text: "Naturally dyed, hand woven, shipped in 48 hours." }, { size: 18, align: "center", mb: 28 }),
      makeEl("button", { label: "Browse sarees", icon: "arrow", size: "lg" }, { inline: true }),
      makeEl("button", { label: "See lookbook", variant: "outline", size: "lg" }, { inline: true }),
    ], 1, "center")], { valign: "center" }, { padT: 88, padB: 88 }),
  },
  {
    id: "ticker", label: "Ticker", hint: "Scrolling promises",
    make: () => makeSection("Ticker", [col([makeEl("marquee")])], { contained: false }, { bg: "accent", padT: 14, padB: 14 }),
  },
  {
    id: "collections", label: "Categories", hint: "Tiles from your tree",
    make: () => makeSection("Categories", [col([makeEl("heading", { text: "Shop by category" }, { size: 48, mb: 24 }), makeEl("collections")])], {}, { padT: 48, padB: 48 }),
  },
  {
    id: "products", label: "Product grid", hint: "Best sellers or a set",
    make: () => makeSection("Products", [col([
      makeEl("heading", { text: "Fresh off the loom" }, { size: 48, mb: 8 }),
      makeEl("text", { text: "Pulled live from your catalogue." }, { mb: 24, size: 15 }),
      makeEl("products"),
    ])], {}, { padT: 48, padB: 48 }),
  },
  {
    id: "story", label: "Image + story", hint: "Two columns",
    make: () => makeSection("Story", [
      col([makeEl("image", { productId: "p9", aspect: "5/4", shape: "rect" })], 1),
      col([
        makeEl("heading", { text: "Forty looms. One family workshop." }, { size: 48 }),
        makeEl("text", { text: "We started with two looms in Ilkal in 1994. Today every piece still passes through the same hands that dyed the thread." }, { size: 16 }),
        makeEl("button", { label: "Meet the weavers", variant: "link", href: "/about" }),
      ], 1),
    ], { gap: 56 }, { bg: "surface", padT: 64, padB: 64 }),
  },
  {
    id: "stats", label: "Numbers strip", hint: "Three proof points",
    make: () => makeSection("Numbers", [col([makeEl("stats")])], {}, { padT: 40, padB: 40 }),
  },
  {
    id: "reviews", label: "Reviews", hint: "From the Reviews table",
    make: () => makeSection("Reviews", [col([makeEl("heading", { text: "What customers say" }, { size: 48, mb: 24 }), makeEl("entity", { slug: "reviews", view: "cards", count: 4, cols: 2 })])], {}, { padT: 48, padB: 48 }),
  },
  {
    id: "faq", label: "FAQ", hint: "From the FAQs table",
    make: () => makeSection("FAQ", [col([makeEl("heading", { text: "Questions, answered" }, { size: 44, mb: 24 }), makeEl("entity", { slug: "faq", view: "accordion", count: 6, cols: 1, search: true, filterKey: "topic", more: true }, { maxw: 760 })])], {}, { padT: 48, padB: 48 }),
  },
  {
    id: "feedback", label: "Feedback form", hint: "Saves to Store feedback",
    make: () => makeSection("Feedback", [col([makeEl("heading", { text: "How are we doing?" }, { size: 40, mb: 8, align: "center" }), makeEl("form", { slug: "feedback", title: "", showTitle: false, desc: "", submit: "Send feedback", successTitle: "Thanks for telling us", success: "Every response is read by the team.", fields: [{ key: "score", as: "scale", label: "How likely are you to recommend us to a friend?" }, { key: "channel" }, { key: "comment", label: "Anything we should know?" }] }, { maxw: 640, align: "center" })], 1, "center")], {}, { padT: 48, padB: 48 }),
  },
  {
    id: "enquiry", label: "Enquiry form", hint: "Text left, form right",
    make: () => makeSection("Enquiry", [
      col([
        makeEl("heading", { text: "Questions about a piece?", tag: "h2" }, { size: 52, mb: 14 }),
        makeEl("text", { text: "Ask about colours, custom borders or trade orders. A real person on the team writes back within a working day." }, { size: 17, maxw: 420 }),
      ]),
      col([makeEl("form", { slug: "enquiries" }, { maxw: 0 })]),
    ], { valign: "start", gap: 56 }, { padT: 64, padB: 72 }),
  },
  {
    id: "weavers", label: "Weavers, linked", hint: "Shows linked products",
    make: () => makeSection("Weavers", [col([makeEl("heading", { text: "The people on the loom" }, { size: 44, mb: 24 }), makeEl("entity", { slug: "weavers", view: "cards", count: 6, cols: 3, coverKey: "products", fields: ["village", "years", "products"] })])], {}, { padT: 40, padB: 56 }),
  },
  {
    id: "newsletter", label: "Email signup", hint: "Dark card",
    make: () => makeSection("Signup", [
      col([makeEl("heading", { text: "Be first to the loom", tag: "h2" }, { size: 40, mb: 8 }), makeEl("text", { text: "New drops, once a fortnight. Nothing else." }, { mb: 0, size: 15 })]),
      col([makeEl("newsletter")]),
    ], { gap: 32 }, { bg: "fg", padT: 48, padB: 48, radius: 28, inset: true }),
  },
  { id: "cols1", label: "Blank, 1 column", hint: "Start from scratch", make: () => makeSection("Section", [col([])]) },
  { id: "cols2", label: "Blank, 2 columns", hint: "Side by side", make: () => makeSection("Section", [col([]), col([])]) },
  { id: "cols3", label: "Blank, 3 columns", hint: "Feature trio", make: () => makeSection("Section", [col([makeEl("heading", { text: "Feature one", tag: "h3" }, { size: 24, mb: 8 }), makeEl("text", { text: "Say what makes it different." }, { size: 15 })]), col([makeEl("heading", { text: "Feature two", tag: "h3" }, { size: 24, mb: 8 }), makeEl("text", { text: "Keep it short and specific." }, { size: 15 })]), col([makeEl("heading", { text: "Feature three", tag: "h3" }, { size: 24, mb: 8 }), makeEl("text", { text: "One idea per column." }, { size: 15 })])], { valign: "start" }) },
];

export const colPresets: { id: string; label: string; fr: number[] }[] = [
  { id: "1", label: "1", fr: [1] },
  { id: "1-1", label: "1 : 1", fr: [1, 1] },
  { id: "2-1", label: "2 : 1", fr: [2, 1] },
  { id: "1-2", label: "1 : 2", fr: [1, 2] },
  { id: "1-1-1", label: "1 : 1 : 1", fr: [1, 1, 1] },
  { id: "1-1-1-1", label: "4 equal", fr: [1, 1, 1, 1] },
];

/* ---------- default document ---------- */
export const initialDoc = (): Doc => {
  seq = 0;
  const nav = [{ id: uid(), label: "Sarees", href: "/shop" }, { id: uid(), label: "Dupattas", href: "/shop" }, { id: uid(), label: "Our story", href: "/about" }, { id: uid(), label: "Contact", href: "/contact" }];
  const sec = (id: string) => sectionPresets.find((p) => p.id === id)!.make();
  const home: Page = {
    id: "pg-home", name: "Home", path: "/", title: "Kaveri Textiles: handloom sarees and everyday wear", desc: "Handwoven sarees, dupattas and home textiles from Karnataka.", showInNav: false,
    sections: [sec("announce"), sec("hero"), sec("ticker"), sec("collections"), sec("products"), sec("story"), sec("reviews"), sec("newsletter")],
  };
  const about: Page = {
    id: "pg-about", name: "Our story", path: "/about", title: "Our story", desc: "Meet the weavers behind Kaveri Textiles.", showInNav: true,
    sections: [
      makeSection("Intro", [col([
        makeEl("badge", { text: "Since 1994" }),
        makeEl("heading", { text: "Made by hands you can name.", tag: "h1" }, { size: 72, mb: 20, maxw: 820 }),
        makeEl("text", { text: "Two looms in Ilkal became forty. We still dye small batches, still pay weavers by the piece and the hour, and still put each weaver's name on the label." }, { size: 19, maxw: 640 }),
      ])], {}, { padT: 88, padB: 40 }),
      sec("stats"),
      makeSection("Weavers", [col([makeEl("heading", { text: "The people on the loom" }, { size: 44, mb: 24 }), makeEl("entity", { slug: "weavers", view: "cards", count: 6, cols: 3, coverKey: "products", fields: ["village", "years", "products"] })])], {}, { padT: 40, padB: 56 }),
      sec("newsletter"),
    ],
  };
  const contact: Page = {
    id: "pg-contact", name: "Contact", path: "/contact", title: "Contact", desc: "Visit or write to us.", showInNav: true,
    sections: [
      makeSection("Contact", [
        col([
          makeEl("heading", { text: "Say hello.", tag: "h1" }, { size: 72, mb: 16 }),
          makeEl("text", { text: "Drop by the Indiranagar store or write to us. We reply within a working day." }, { size: 17 }),
          makeEl("button", { label: "hello@kaveritextiles.in", variant: "outline", icon: "none" }),
        ]),
        col([makeEl("form", { slug: "enquiries" }, { maxw: 0 })]),
      ], { valign: "start", gap: 56 }, { padT: 88, padB: 72 }),
      sec("faq"),
    ],
  };
  const footer = makeSection("Footer", [
    col([
      makeEl("heading", { text: "Kaveri Textiles", tag: "h3" }, { size: 30, mb: 8, color: "bg" }),
      makeEl("text", { text: "Handloom textiles from Karnataka and Gujarat. Made slowly, shipped in 48 hours." }, { size: 14, mb: 0, maxw: 320, opacity: 65 }),
    ], 1.4),
    col([makeEl("linklist", { title: "Shop" }, { size: 14 })]),
    col([makeEl("linklist", { title: "Help", items: [{ id: uid(), label: "Shipping", href: "/" }, { id: uid(), label: "Returns", href: "/" }, { id: uid(), label: "Size guide", href: "/" }, { id: uid(), label: "Contact", href: "/contact" }] }, { size: 14 })]),
    col([makeEl("linklist", { title: "Visit", items: [{ id: uid(), label: "Indiranagar", href: "/" }, { id: uid(), label: "Jaipur", href: "/" }, { id: uid(), label: "Whitefield", href: "/" }] }, { size: 14 })]),
  ], { valign: "start", gap: 32, id: "footer" }, { bg: "fg", padT: 56, padB: 40 });
  seq = -1;
  return {
    pages: [home, about, contact],
    header: {
      logoMode: "mark+name", logoText: "Kaveri Textiles", nav, search: true, cart: true, sticky: false, awning: true, layout: "split", border: false, padY: 16,
      cta: { on: false, label: "Visit the store", href: "/contact", variant: "solid" },
      social: [{ id: "so1", kind: "instagram", href: "https://instagram.com/kaveritextiles" }, { id: "so2", kind: "whatsapp", href: "https://wa.me/919845012345" }],
      socialInHeader: false,
      announce: { on: false, text: "Free shipping across India on orders over ₹2,000", href: "/shop", dismiss: true },
    },
    footer,
    theme: presetTheme("indigo"),
  };
};

/* ---------- colour helpers ---------- */
const lum = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const rgb = (hex?: string): [number, number, number] | null => {
  const m = hex && /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
/** Blend `fg` over `bg` at the given opacity (0–1). */
export const mixHex = (fg: string, bg: string, a: number) => {
  const f = rgb(fg), b = rgb(bg);
  return f && b ? toHex(f.map((v, i) => v * a + b[i] * (1 - a))) : fg;
};
/** WCAG contrast ratio, or null when a colour can't be read. */
export const contrast = (a?: string, b?: string): number | null => {
  if (!rgb(a) || !rgb(b)) return null;
  const x = lum(a!), y = lum(b!);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
export const onColor = (hex: string) => (lum(hex) > 0.4 ? "#141a3a" : "#ffffff");
export const tokenHex = (t: Theme, token?: string) => {
  switch (token) {
    case "bg": return t.bg; case "fg": return t.fg; case "surface": return t.surface; case "brand": return t.brand; case "accent": return t.accent;
    default: return token && token.startsWith("#") ? token : undefined;
  }
};
export const tokens = ["bg", "surface", "fg", "brand", "accent"] as const;
