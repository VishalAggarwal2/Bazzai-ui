"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Boxes, MapPin, Plus, Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductArt } from "@/components/product-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudio } from "@/lib/store";
import { locations, movements, stockByLocation } from "@/lib/data";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const tint = (n: number, reorder: number) =>
  n === 0 ? "bg-chili/15 text-chili" : n <= reorder / 3 ? "bg-saffron/25 text-amber-800 dark:text-amber-300" : "text-foreground";

export default function InventoryPage() {
  const [transfer, setTransfer] = useState(false);
  const products = useStudio((s) => s.products);
  const active = products.filter((p) => p.status !== "archived");
  const totals = locations.map((_, i) => active.reduce((s, p) => s + stockByLocation[p.id][i], 0));
  const value = locations.map((_, i) => active.reduce((s, p) => s + stockByLocation[p.id][i] * p.price * 0.55, 0));

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Every unit, in every location. Sales, returns and transfers update this in real time, so the website never oversells."
        actions={
          <>
            <Dialog open={transfer} onOpenChange={setTransfer}>
              <DialogTrigger asChild><Button variant="outline"><Truck /> Transfer stock</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Move stock between locations</DialogTitle>
                  <DialogDescription>Both locations update when the receiving side confirms.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Product</Label>
                    <Select defaultValue="p1"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{active.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <div className="space-y-1.5"><Label>From</Label><Select defaultValue="l1"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                    <ArrowRight className="mb-2.5 size-4 text-muted-foreground" />
                    <div className="space-y-1.5"><Label>To</Label><Select defaultValue="l3"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="space-y-1.5"><Label>Quantity</Label><Input suggest="qty" type="number" defaultValue={8} /></div>
                </div>
                <DialogFooter>
                  <Button variant="brand" onClick={() => { setTransfer(false); toast.success("Transfer created", { description: "8 units are now in transit to Jaipur flagship." }); }}>Create transfer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="brand"><Plus /> Receive stock</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {locations.map((l, i) => (
          <div key={l.id} className={cn("relative overflow-hidden border bg-card p-5", ["rounded-3xl", "rounded-2xl", "rounded-[28px_10px_28px_10px]"][i])}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {l.kind === "Warehouse" ? <Boxes className="size-4" /> : <MapPin className="size-4" />} {l.kind} in {l.city}
            </div>
            <div className="mt-2 font-medium">{l.name}</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[40px]">{totals[i].toLocaleString("en-IN")}</span>
              <span className="text-sm text-muted-foreground">units, worth {inr(Math.round(value[i] / 1000) * 1000)} at cost</span>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="levels">
        <TabsList>
          <TabsTrigger value="levels">Stock levels</TabsTrigger>
          <TabsTrigger value="moves">Movements</TabsTrigger>
        </TabsList>
        <TabsContent value="levels">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  {locations.map((l) => <TableHead key={l.id} className="text-center">{l.name.split(" ")[0]}</TableHead>)}
                  <TableHead className="text-center">Total</TableHead><TableHead>Health</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((p) => {
                  const q = stockByLocation[p.id];
                  const total = q.reduce((a, b) => a + b, 0);
                  const state = total === 0 ? "out" : total <= p.reorder ? "low" : "ok";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProductArt pattern={p.pattern} tone={p.tone} className="!w-8" rounded="rounded-md" />
                          <div><div className="font-medium">{p.name}</div><div className="font-mono text-xs text-muted-foreground">{p.sku}</div></div>
                        </div>
                      </TableCell>
                      {q.map((n, i) => (
                        <TableCell key={i} className="text-center"><span className={cn("inline-block min-w-10 rounded-md px-2 py-1 tabular-nums", tint(n, p.reorder))}>{n}</span></TableCell>
                      ))}
                      <TableCell className="text-center font-semibold tabular-nums">{total}</TableCell>
                      <TableCell>
                        <Badge variant={state === "ok" ? "success" : state === "low" ? "warn" : "danger"}>
                          {state === "ok" ? "Healthy" : state === "low" ? `Low, reorder at ${p.reorder}` : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {state !== "ok" && <Button size="xs" variant="outline" onClick={() => toast("Purchase order drafted", { description: `${p.name} · suggested ${p.reorder * 3} units` })}>Reorder</Button>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="moves">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader><TableRow className="hover:bg-transparent"><TableHead>When</TableHead><TableHead>Type</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>Where</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground">{m.when}</TableCell>
                    <TableCell><Badge variant="outline">{m.type}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{m.sku}</TableCell>
                    <TableCell className={cn("text-right font-medium tabular-nums", m.qty < 0 ? "text-chili" : "text-emerald-600")}>{m.qty > 0 ? "+" : ""}{m.qty}</TableCell>
                    <TableCell>{m.where}</TableCell>
                    <TableCell className="text-muted-foreground">{m.by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
