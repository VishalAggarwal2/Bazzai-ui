import * as React from "react";
import { Suggest, type SuggestSource } from "@/components/suggest";
import { cn } from "@/lib/utils";

type WithSuggest = { suggest?: SuggestSource; suggestClassName?: string };

function Input({ className, type, suggest, suggestClassName, ...props }: React.ComponentProps<"input"> & WithSuggest) {
  const el = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border bg-card px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
  return suggest ? <Suggest options={suggest} className={suggestClassName}>{el}</Suggest> : el;
}
function Textarea({ className, suggest, suggestClassName, ...props }: React.ComponentProps<"textarea"> & WithSuggest) {
  const el = (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border bg-card px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
        className
      )}
      {...props}
    />
  );
  return suggest ? <Suggest options={suggest} className={suggestClassName}>{el}</Suggest> : el;
}
export { Input, Textarea };
