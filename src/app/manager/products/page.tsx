"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowUpDown, Columns3, Copy, FolderTree, LayoutGrid, List, Plus, Search, Sparkles, Star, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useResolver } from "@/lib/relations";
import { ProductArt } from "@/components/product-art";
import { CellValue, DynamicField } from "@/components/dynamic-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category, Pattern, Product } from "@/lib/data";
import { inr } from "@/lib/format";
import { catPath, useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CategoryManager, descendantIds } from "./category-manager";

const statusBadge = { active: "success", draft: "warn", archived: "secondary" } as const;
const patterns: Pattern[] = ["stripes", "dots", "checks", "waves", "diamond"];
const swatches: [string, string][] = [["#1b2a8f", "#f6b21d"], ["#a3122a", "#ffd166"], ["#0f6b5c", "#e6f4ea"], ["#d8386b", "#ffd6e2"], ["#2b1b5e", "#d6542f"], ["#244a63", "#f4efe1"], ["#3340ff", "#dfe3ff"], ["#e08a00", "#fff1cf"]];

function StockCell({ p }: { p: Product }) {
  const low = p.stock > 0 && p.stock <= p.reorder;
  const out = p.stock === 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", out ? "bg-chili" : low ? "bg-saffron" : "bg-emerald-500")} style={{ width: `${Math.min(100, (p.stock / Math.max(1, p.reorder * 3)) * 100)}%` }} />
      </div>
      <span className={cn("tabular-nums", out && "text-chili", low && "text-amber-600")}>{out ? "Out" : p.stock}</span>
    </div>
  );
}

const baseCols = [
  { id: "sku", label: "SKU" }, { id: "category", label: "Category" }, { id: "price", label: "Price" }, { id: "stock", label: "Stock" }, { id: "status", label: "Status" }, { id: "tags", label: "Tags" }, { id: "sold", label: "Units sold" },
];

/* ------- editor sheet ------- */
function TagInput({ value, onChange, all }: { value: string[]; onChange: (v: string[]) => void; all: string[] }) {
  const [t, setT] = useState("");
  const add = (x: string) => { const v = x.trim().toLowerCase(); if (v && !value.includes(v)) onChange([...value, v]); setT(""); };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((x) => <span key={x} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">{x}<button onClick={() => onChange(value.filter((y) => y !== x))} aria-label={`Remove ${x}`}><X className="size-3" /></button></span>)}
      </div>
      <Input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(t); } }} placeholder="Type a tag and press Enter" suggest={all.filter((x) => !value.includes(x)).length ? all.filter((x) => !value.includes(x)) : ["festive", "new", "gift"]} onBlur={() => t && add(t)} />
    </div>
  );
}

function ProductEditor({ initial, onClose }: { initial: Product | "new"; onClose: () => void }) {
  const { products, categories, entities, addProduct, updateProduct, duplicateProduct, removeProducts } = useStudio();
  const existing = initial === "new" ? null : initial;
  const rel = useResolver();
  const linked = existing ? rel.inbound("@products", existing.id) : [];
  const [d, setD] = useState<Product>(() => existing ?? ({ id: "", name: "", sku: "", price: 0, stock: 0, reorder: 10, status: "draft", tone: swatches[6], pattern: "stripes", sold: 0, categoryId: categories[0]?.id ?? "", description: "", tags: [], options: [], custom: {} } as Product));
  const customFields = entities.find((e) => e.slug === "products")?.fields.filter((f) => !f.locked) ?? [];
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setD((s) => ({ ...s, [k]: v }));
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));
  const rows = (function flat(parent: string | null, depth: number): { c: Category; depth: number }[] { return categories.filter((c) => c.parentId === parent).flatMap((c) => [{ c, depth }, ...flat(c.id, depth + 1)]); })(null, 0);
  const save = () => {
    if (!d.name.trim()) { toast.error("Give the product a name first"); return; }
    if (existing) { updateProduct(existing.id, d); toast.success("Product updated", { description: d.status === "active" ? "Live on your storefront." : "Saved as " + d.status + "." }); }
    else { addProduct({ ...d, id: undefined as unknown as string }); toast.success("Product added", { description: d.status === "active" ? "Visible on your storefront within seconds." : "Saved as a draft." }); }
    onClose();
  };
  return (
    <SheetContent className="sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>{existing ? d.name || "Untitled product" : "New product"}</SheetTitle>
        <SheetDescription>{existing ? `${catPath(categories, d.categoryId) || "No category"} · SKU ${d.sku}` : "Fill the essentials now, refine later."}</SheetDescription>
      </SheetHeader>
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-4">
        <div className="flex items-start gap-4">
          <ProductArt pattern={d.pattern} tone={d.tone} className="!w-28" rounded="rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Label>Artwork</Label>
            <div className="flex flex-wrap gap-1.5">{swatches.map((t) => <button key={t[0]} onClick={() => set("tone", t)} aria-label={`Colours ${t[0]}`} className={cn("size-6 rounded-full border-2", d.tone[0] === t[0] ? "border-brand" : "border-transparent")} style={{ background: `linear-gradient(135deg, ${t[0]} 50%, ${t[1]} 50%)` }} />)}</div>
            <div className="flex gap-1.5">{patterns.map((p) => <button key={p} onClick={() => set("pattern", p)} aria-label={p} className={cn("w-9 overflow-hidden rounded-md border-2", d.pattern === p ? "border-brand" : "border-transparent")}><ProductArt pattern={p} tone={d.tone} rounded="rounded-none" /></button>)}</div>
          </div>
        </div>
        <div className="space-y-1.5"><Label>Name</Label><Input suggest="productName" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Handloom saree, indigo" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes it special, who made it, how it feels." suggest={["Handmade in small batches by our partner weavers. Colour may vary slightly from screen.", "Naturally dyed with madder root and indigo. Dry clean first wash."]} /></div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Pricing and stock</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Price (₹)</Label><Input suggest="price" type="number" value={d.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Compare-at price</Label><Input suggest="comparePrice" type="number" value={d.compare ?? ""} onChange={(e) => set("compare", e.target.value ? Number(e.target.value) : undefined)} /></div>
            <div className="space-y-1.5"><Label>SKU</Label><Input suggest="sku" value={d.sku} onChange={(e) => set("sku", e.target.value)} className="font-mono" /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={d.status} onValueChange={(v) => set("status", v as Product["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active, on the website</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>In stock</Label><Input suggest="qty" type="number" value={d.stock} onChange={(e) => set("stock", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Reorder when below</Label><Input type="number" value={d.reorder} onChange={(e) => set("reorder", Number(e.target.value))} /></div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Organise</h3>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={d.categoryId || undefined} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>{rows.map(({ c, depth }) => <SelectItem key={c.id} value={c.id}>{"– ".repeat(depth)}{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Tags</Label><TagInput value={d.tags} onChange={(v) => set("tags", v)} all={allTags} /></div>
          <label className="flex items-center justify-between rounded-xl border bg-card px-3 py-2.5 text-sm"><span className="flex items-center gap-2"><Star className="size-4 text-saffron" /> Feature on the website<span className="text-xs text-muted-foreground">for “Featured” product grids</span></span><Switch checked={!!d.featured} onCheckedChange={(v) => set("featured", v)} /></label>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Options</h3><Button variant="ghost" size="xs" onClick={() => set("options", [...d.options, { name: "", values: [] }])}><Plus /> Add option</Button></div>
          {d.options.length === 0 && <p className="text-xs text-muted-foreground">Sizes, colours or anything a shopper picks. Each combination gets its own stock count.</p>}
          {d.options.map((o, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_auto] items-start gap-2">
              <Input value={o.name} placeholder="Size" suggest={["Size", "Colour", "Length"]} onChange={(e) => set("options", d.options.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Option name" />
              <Input value={o.values.join(", ")} placeholder="S, M, L, XL" suggest="fieldChoices" onChange={(e) => set("options", d.options.map((x, j) => (j === i ? { ...x, values: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : x)))} aria-label="Option values" />
              <Button variant="ghost" size="icon-sm" onClick={() => set("options", d.options.filter((_, j) => j !== i))} aria-label="Remove option"><X /></Button>
            </div>
          ))}
          {d.options.length > 0 && d.options.every((o) => o.values.length) && <p className="text-xs text-muted-foreground">{d.options.reduce((n, o) => n * Math.max(1, o.values.length), 1)} variants will be created.</p>}
        </section>

        <div className="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-brand" /> Custom fields for this store</div>
          <div className="space-y-4">
            {customFields.map((f) => <DynamicField key={f.id} field={f} value={d.custom[f.key]} onChange={(v) => set("custom", { ...d.custom, [f.key]: v as never })} />)}
            {!customFields.length && <p className="text-sm text-muted-foreground">No custom fields yet.</p>}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Add, rename or remove these under Custom data → Product. They show up here and in the product table columns.</p>
        </div>
        {existing && linked.length > 0 && (
          <section className="rounded-2xl border p-4">
            <div className="mb-3 text-sm font-medium">Linked from your custom data</div>
            <div className="space-y-3">
              {linked.map((g) => (
                <div key={g.entity.id + g.field.id}>
                  <div className="mb-1.5 text-xs text-muted-foreground">{g.title} · {g.records.length}</div>
                  <div className="flex flex-wrap gap-1.5">{g.records.map((x) => <span key={x.id} className="rounded-full border bg-card px-2.5 py-1 text-xs">{x.label}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <SheetFooter>
        {existing && (
          <>
            <Button variant="ghost" size="icon" onClick={() => { duplicateProduct(existing.id); toast("Duplicated as a draft"); onClose(); }} aria-label="Duplicate"><Copy /></Button>
            <Button variant="ghost" size="icon" className="text-chili" onClick={() => { removeProducts([existing.id]); toast("Product deleted"); onClose(); }} aria-label="Delete"><Trash2 /></Button>
          </>
        )}
        <Button variant="ghost" className="ml-auto" onClick={onClose}>Cancel</Button>
        <Button variant="brand" onClick={save}>{existing ? "Save changes" : "Add product"}</Button>
      </SheetFooter>
    </SheetContent>
  );
}

/* ------- page ------- */
export default function ProductsPage() {
  const { products, categories, entities, bulkUpdateProducts, removeProducts } = useStudio();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState<"list" | "grid">("list");
  const [open, setOpen] = useState<Product | "new" | null>(null);
  const [catsOpen, setCatsOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const customFields = entities.find((e) => e.slug === "products")?.fields.filter((f) => !f.locked) ?? [];
  const [cols, setCols] = useState<string[]>(["sku", "category", "price", "stock", "status"]);
  const allCols = [...baseCols, ...customFields.map((f) => ({ id: `c:${f.key}`, label: f.label + " (custom)" }))];
  const shown = allCols.filter((c) => cols.includes(c.id));
  const tree = useMemo(() => (function flat(parent: string | null, depth: number): { c: Category; depth: number }[] { return categories.filter((c) => c.parentId === parent).flatMap((c) => [{ c, depth }, ...flat(c.id, depth + 1)]); })(null, 0), [categories]);

  const rows = useMemo(() => {
    const ids = cat === "all" ? null : descendantIds(categories, cat);
    const l = products.filter((p) => (tab === "all" || p.status === tab) && (!ids || ids.includes(p.categoryId)) && (p.name + p.sku + p.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
    return [...l].sort((a, b) => (sort === "price" ? b.price - a.price : sort === "stock" ? a.stock - b.stock : sort === "sold" ? b.sold - a.sold : a.name.localeCompare(b.name)));
  }, [products, categories, tab, cat, q, sort]);
  const allPicked = rows.length > 0 && rows.every((r) => picked.includes(r.id));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const counts = { all: products.length, active: products.filter((p) => p.status === "active").length, draft: products.filter((p) => p.status === "draft").length, archived: products.filter((p) => p.status === "archived").length };
  const cell = (p: Product, id: string) => {
    if (id === "sku") return <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>;
    if (id === "category") return <span className="text-muted-foreground">{catPath(categories, p.categoryId) || "–"}</span>;
    if (id === "price") return <span className="tabular-nums">{p.compare && <span className="mr-2 text-xs text-muted-foreground line-through">{inr(p.compare)}</span>}{inr(p.price)}</span>;
    if (id === "stock") return <StockCell p={p} />;
    if (id === "status") return <Badge variant={statusBadge[p.status]} className="capitalize">{p.status}</Badge>;
    if (id === "tags") return <span className="flex flex-wrap gap-1">{p.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{t}</span>)}</span>;
    if (id === "sold") return <span className="tabular-nums text-muted-foreground">{p.sold}</span>;
    const f = customFields.find((x) => `c:${x.key}` === id);
    return f ? <CellValue field={f} value={p.custom[f.key]} /> : null;
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="One catalogue, shared by your website and every till. Categories, columns and custom fields are all yours to shape."
        actions={<><Button variant="outline" onClick={() => setCatsOpen(true)}><FolderTree /> Categories <span className="rounded-full bg-secondary px-1.5 text-xs">{categories.length}</span></Button><Button variant="brand" onClick={() => setOpen("new")}><Plus /> Add product</Button></>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {(["all", "active", "draft", "archived"] as const).map((k) => <TabsTrigger key={k} value={k} className="capitalize">{k} <span className="ml-1 text-xs opacity-60">{counts[k]}</span></TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-9 w-48" aria-label="Filter by category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{tree.map(({ c, depth }) => <SelectItem key={c.id} value={c.id}>{"– ".repeat(depth)}{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input suggest="search" className="pl-9" placeholder="Search name, SKU or tag" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-9 w-40" aria-label="Sort"><ArrowUpDown className="size-4 opacity-60" /><SelectValue /></SelectTrigger>
          <SelectContent>{[["name", "Name A–Z"], ["price", "Price, high first"], ["stock", "Lowest stock"], ["sold", "Best selling"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" size="sm"><Columns3 /> Columns</Button></PopoverTrigger>
          <PopoverContent align="end" className="w-60 p-2">
            <div className="px-2 pb-1.5 pt-1 text-xs text-muted-foreground">Choose what the table shows</div>
            {allCols.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary">
                <Checkbox checked={cols.includes(c.id)} onCheckedChange={(v) => setCols((s) => (v ? [...s, c.id] : s.filter((x) => x !== c.id)))} /> {c.label}
              </label>
            ))}
          </PopoverContent>
        </Popover>
        <div className="flex rounded-lg border bg-card p-0.5">
          {([["list", List], ["grid", LayoutGrid]] as const).map(([k, I]) => (
            <Button key={k} variant={view === k ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView(k)} aria-label={`${k} view`}><I /></Button>
          ))}
        </div>
      </div>

      {picked.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-white" role="toolbar" aria-label="Bulk actions">
          <span className="mr-2 font-medium">{picked.length} selected</span>
          <Select onValueChange={(v) => { bulkUpdateProducts(picked, { status: v as Product["status"] }); toast.success(`Set ${picked.length} to ${v}`); }}>
            <SelectTrigger className="h-8 w-36 border-white/20 bg-white/10 text-white" aria-label="Set status"><SelectValue placeholder="Set status…" /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select>
          <Select onValueChange={(v) => { bulkUpdateProducts(picked, { categoryId: v }); toast.success(`Moved ${picked.length} to ${catPath(categories, v)}`); }}>
            <SelectTrigger className="h-8 w-44 border-white/20 bg-white/10 text-white" aria-label="Move to category"><SelectValue placeholder="Move to category…" /></SelectTrigger>
            <SelectContent>{tree.map(({ c, depth }) => <SelectItem key={c.id} value={c.id}>{"– ".repeat(depth)}{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="xs" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => { bulkUpdateProducts(picked, { featured: true }); toast.success("Featured on the website"); }}><Star /> Feature</Button>
          <Button size="xs" variant="ghost" className="text-rose-300 hover:bg-white/10 hover:text-rose-200" onClick={() => { removeProducts(picked); toast(`${picked.length} products deleted`); setPicked([]); }}><Trash2 /> Delete</Button>
          <Button size="xs" variant="ghost" className="ml-auto text-white hover:bg-white/10 hover:text-white" onClick={() => setPicked([])}>Clear</Button>
        </div>
      )}

      {view === "list" ? (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"><Checkbox checked={allPicked} onCheckedChange={(v) => setPicked(v ? rows.map((r) => r.id) : [])} aria-label="Select all" /></TableHead>
                <TableHead>Product</TableHead>
                {shown.map((c) => <TableHead key={c.id} className={c.id === "price" ? "text-right" : ""}>{c.label.replace(" (custom)", "")}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" data-state={picked.includes(p.id) ? "selected" : undefined} onClick={() => setOpen(p)}>
                  <TableCell onClick={(e) => e.stopPropagation()}><Checkbox checked={picked.includes(p.id)} onCheckedChange={() => toggle(p.id)} aria-label={`Select ${p.name}`} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductArt pattern={p.pattern} tone={p.tone} className="!w-10" rounded="rounded-lg" />
                      <div>
                        <div className="flex items-center gap-1.5 font-medium">{p.name}{p.featured && <Star className="size-3.5 fill-saffron text-saffron" />}</div>
                        {p.options.length > 0 && <div className="text-xs text-muted-foreground">{p.options.map((o) => o.name).join(", ")} options</div>}
                      </div>
                    </div>
                  </TableCell>
                  {shown.map((c) => <TableCell key={c.id} className={c.id === "price" ? "text-right" : ""}>{cell(p, c.id)}</TableCell>)}
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={shown.length + 2} className="py-16 text-center text-muted-foreground">No products match. Clear the filters or add a new product.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {rows.map((p, i) => (
            <button key={p.id} onClick={() => setOpen(p)} className="group text-left">
              <ProductArt pattern={p.pattern} tone={p.tone} className={cn("transition-transform duration-300 group-hover:-translate-y-1", i % 5 === 0 ? "rounded-[28px]" : i % 3 === 0 ? "rounded-t-[80px] rounded-b-xl" : "rounded-xl")} />
              <div className="mt-2.5 flex items-start justify-between gap-2">
                <div><div className="text-sm font-medium leading-tight">{p.name}</div><div className="mt-0.5 text-xs text-muted-foreground">{catPath(categories, p.categoryId)}</div></div>
                <div className="text-sm tabular-nums">{inr(p.price)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        {open && <ProductEditor key={open === "new" ? "new" : open.id} initial={open} onClose={() => setOpen(null)} />}
      </Sheet>
      <CategoryManager open={catsOpen} onOpenChange={setCatsOpen} />
    </>
  );
}
