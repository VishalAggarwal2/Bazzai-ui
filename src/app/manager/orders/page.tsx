"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Download, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { orders, type Order } from "@/lib/data";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const flow = ["paid", "packed", "shipped", "delivered"] as const;
const variant = { paid: "brand", packed: "warn", shipped: "secondary", delivered: "success", refunded: "danger" } as const;

export default function OrdersPage() {
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState<Order | null>(null);
  const rows = orders.filter((o) => tab === "all" || o.status === tab);
  const step = open ? flow.indexOf(open.status as (typeof flow)[number]) : -1;
  return (
    <>
      <PageHeader title="Orders" description="Website, till and WhatsApp orders in one queue." actions={<Button variant="outline"><Download /> Export</Button>} />
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="max-w-full overflow-x-auto">
          {["all", "paid", "packed", "shipped", "delivered", "refunded"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead><TableHead>Placed</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpen(o)}>
                <TableCell className="font-mono text-[13px] font-medium">{o.id}</TableCell>
                <TableCell><div>{o.customer}</div><div className="text-xs text-muted-foreground">{o.city}</div></TableCell>
                <TableCell className="text-muted-foreground">{o.channel}</TableCell>
                <TableCell><Badge variant={variant[o.status]} className="capitalize">{o.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{o.when}</TableCell>
                <TableCell className="text-right tabular-nums">{inr(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent>
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>Order {open.id}</SheetTitle>
                <SheetDescription>{open.customer} from {open.city}, {open.items} item{open.items > 1 ? "s" : ""}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-6 px-6">
                <div className="text-4xl font-display">{inr(open.total)}</div>
                {open.status === "refunded" ? (
                  <Badge variant="danger">Refunded to original payment method</Badge>
                ) : (
                  <ol className="space-y-0">
                    {flow.map((f, i) => (
                      <li key={f} className="relative flex gap-3 pb-6 last:pb-0">
                        {i < flow.length - 1 && <span className={cn("absolute left-[11px] top-6 h-full w-px", i < step ? "bg-brand" : "bg-border")} />}
                        <span className={cn("z-10 grid size-6 place-items-center rounded-full border-2 text-white", i <= step ? "border-brand bg-brand" : "border-border bg-card")}>
                          {i <= step && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <div>
                          <div className={cn("text-sm font-medium capitalize", i > step && "text-muted-foreground")}>{f}</div>
                          <div className="text-xs text-muted-foreground">{i <= step ? "Done" : "Not yet"}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <SheetFooter>
                <Button variant="brand" className="w-full" disabled={open.status === "delivered" || open.status === "refunded"} onClick={() => { toast.success(`${open.id} moved to ${flow[step + 1]}`); setOpen(null); }}>
                  <PackageCheck /> Mark as {flow[step + 1] ?? "done"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
