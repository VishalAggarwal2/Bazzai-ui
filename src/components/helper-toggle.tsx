"use client";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HelperToggle({ className }: { className?: string }) {
  const { helpers, setHelpers } = useStudio();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="sm" aria-pressed={helpers} onClick={() => setHelpers(!helpers)} className={cn("gap-1.5", helpers && "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand", className)}>
          <Sparkles /> <span className="hidden sm:inline">Sample data {helpers ? "on" : "off"}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{helpers ? "Inputs offer sample values when you click them. Click to turn off." : "Turn on sample values for inputs."}</TooltipContent>
    </Tooltip>
  );
}
