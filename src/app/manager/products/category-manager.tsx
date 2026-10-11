"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, FolderPlus, GripVertical, Plus, Trash2 } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, Pattern } from "@/lib/data";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

const patterns: Pattern[] = ["stripes", "dots", "checks", "waves", "diamond"];
const swatches: [string, string][] = [["#1b2a8f", "#f6b21d"], ["#a3122a", "#ffd166"], ["#0f6b5c", "#e6f4ea"], ["#d8386b", "#ffd6e2"], ["#2b1b5e", "#d6542f"], ["#244a63", "#f4efe1"], ["#3340ff", "#dfe3ff"], ["#e08a00", "#fff1cf"]];

type Row = { c: Category; depth: number };
const flatten = (cats: Category[], parent: string | null = null, depth = 0): Row[] =>
  cats.filter((c) => c.parentId === parent).flatMap((c) => [{ c, depth }, ...flatten(cats, c.id, depth + 1)]);
export const descendantIds = (cats: Category[], id: string): string[] => [id, ...cats.filter((c) => c.parentId === id).flatMap((c) => descendantIds(cats, c.id))];

export function CategoryManager({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { categories, products, addCategory, updateCategory, removeCategory, moveCategory } = useStudio();
  const [selId, setSelId] = useState<string>(categories[0]?.id ?? "");
  const [name, setName] = useState("");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string; zone: "before" | "inside" | "after" } | null>(null);
  const rows = useMemo(() => flatten(categories), [categories]);
  const sel = categories.find((c) => c.id === selId);
  const count = (id: string) => products.filter((p) => descendantIds(categories, id).includes(p.categoryId)).length;
  const zone = (e: React.DragEvent): "before" | "inside" | "after" => { const r = e.currentTarget.getBoundingClientRect(); const y = (e.clientY - r.top) / r.height; return y < 0.28 ? "before" : y > 0.72 ? "after" : "inside"; };
  const doDrop = (target: Category, z: "before" | "inside" | "after") => {
    if (!drag || drag === target.id) return;
    if (z === "inside") moveCategory(drag, target.id);
    else {
      const sibs = categories.filter((c) => c.parentId === target.parentId && c.id !== drag);
      const i = sibs.findIndex((c) => c.id === target.id);
      moveCategory(drag, target.parentId, z === "before" ? i : i + 1);
    }
    setDrag(null); setOver(null);
  };
  const add = (n: string, parent: string | null) => {
    if (!n.trim()) return;
    const id = addCategory(n.trim(), parent);
    setSelId(id); setName("");
    toast.success("Category added", { description: parent ? "Added as a sub-category." : "Shows in your storefront menu once it has products." });
  };
  const blocked = sel ? descendantIds(categories, sel.id) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="font-display text-2xl">Categories</DialogTitle>
          <DialogDescription>Drag to reorder. Drop onto a category to nest it. The same tree powers your website menu and category tiles.</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[1.1fr_1fr]">
          <div className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3" onDragLeave={() => setOver(null)}>
              {rows.map(({ c, depth }) => {
                const isOver = over?.id === c.id;
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", c.id); setDrag(c.id); }}
                    onDragEnd={() => { setDrag(null); setOver(null); }}
                    onDragOver={(e) => { if (!drag || drag === c.id) return; e.preventDefault(); setOver({ id: c.id, zone: zone(e) }); }}
                    onDrop={(e) => { e.preventDefault(); doDrop(c, zone(e)); }}
                    onClick={() => setSelId(c.id)}
                    className={cn("relative flex cursor-pointer items-center gap-2 rounded-xl border border-transparent py-1.5 pr-2 transition", selId === c.id ? "border-brand/40 bg-brand/5" : "hover:bg-secondary", drag === c.id && "opacity-40", isOver && over?.zone === "inside" && "border-brand bg-brand/10", !c.visible && "opacity-60")}
                    style={{ paddingLeft: 8 + depth * 22 }}
                  >
                    {isOver && over?.zone === "before" && <i className="absolute inset-x-2 -top-px h-0.5 rounded bg-brand" />}
                    {isOver && over?.zone === "after" && <i className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-brand" />}
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/60" />
                    <ProductArt pattern={c.pattern} tone={c.tone} className="!w-7" rounded="rounded-md" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{count(c.id)}</span>
                    <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); updateCategory(c.id, { visible: !c.visible }); }} aria-label={c.visible ? "Hide from website" : "Show on website"}>{c.visible ? <Eye /> : <EyeOff />}</Button>
                  </div>
                );
              })}
              {!rows.length && <p className="py-10 text-center text-sm text-muted-foreground">No categories yet. Add your first below.</p>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); add(name, null); }} className="flex gap-2 border-t p-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New top-level category" suggest={["Menswear", "Gift sets", "Festive edit", "Accessories"]} aria-label="New category name" />
              <Button type="submit" variant="brand"><Plus /> Add</Button>
            </form>
          </div>

          <div className="min-h-0 overflow-y-auto p-5">
            {sel ? (
              <div className="space-y-4">
                <ProductArt pattern={sel.pattern} tone={sel.tone} className="!aspect-[16/6]" rounded="rounded-2xl" />
                <div className="space-y-1.5"><Label>Name</Label><Input value={sel.name} onChange={(e) => updateCategory(sel.id, { name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Shown under the tile</Label><Textarea rows={2} value={sel.description} onChange={(e) => updateCategory(sel.id, { description: e.target.value })} placeholder="Six yards, woven to order." /></div>
                <div className="space-y-1.5">
                  <Label>Parent category</Label>
                  <Select value={sel.parentId ?? "root"} onValueChange={(v) => moveCategory(sel.id, v === "root" ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">None, top level</SelectItem>
                      {rows.filter(({ c }) => !blocked.includes(c.id)).map(({ c, depth }) => <SelectItem key={c.id} value={c.id}>{"– ".repeat(depth)}{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tile artwork</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {swatches.map((t) => <button key={t[0]} onClick={() => updateCategory(sel.id, { tone: t })} aria-label={`Colours ${t[0]}`} className={cn("size-7 rounded-full border-2", sel.tone[0] === t[0] ? "border-brand" : "border-transparent")} style={{ background: `linear-gradient(135deg, ${t[0]} 50%, ${t[1]} 50%)` }} />)}
                  </div>
                  <div className="flex gap-1.5">{patterns.map((p) => <button key={p} onClick={() => updateCategory(sel.id, { pattern: p })} className={cn("w-12 overflow-hidden rounded-md border-2", sel.pattern === p ? "border-brand" : "border-transparent")} aria-label={p}><ProductArt pattern={p} tone={sel.tone} rounded="rounded-none" /></button>)}</div>
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => add("New sub-category", sel.id)}><FolderPlus /> Add sub-category</Button>
                  <Button variant="ghost" size="sm" className="text-chili hover:text-chili" onClick={() => { const next = categories.find((c) => c.id !== sel.id); removeCategory(sel.id); setSelId(next?.id ?? ""); toast("Category deleted", { description: `${count(sel.id)} product${count(sel.id) === 1 ? " was" : "s were"} moved up a level.` }); }}><Trash2 /> Delete</Button>
                </div>
              </div>
            ) : <p className="py-16 text-center text-sm text-muted-foreground">Select a category to edit it.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
