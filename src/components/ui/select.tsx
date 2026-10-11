"use client";
import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn("flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border bg-card px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 data-[placeholder]:text-muted-foreground", className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={6}
        className={cn("z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
        {...props}
      >
        <SelectPrimitive.Viewport className="w-full min-w-[var(--radix-select-trigger-width)]">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn("relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent", className)}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
