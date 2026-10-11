import type { CSSProperties } from "react";
import type { Pattern } from "@/lib/data";
import { cn } from "@/lib/utils";

export function patternStyle(pattern: Pattern, [a, b]: [string, string]): CSSProperties {
  switch (pattern) {
    case "stripes":
      return { background: `repeating-linear-gradient(45deg, ${a} 0 11px, ${b} 11px 22px)` };
    case "dots":
      return { background: `radial-gradient(${b} 24%, transparent 26%) 0 0 / 18px 18px, radial-gradient(${b} 24%, transparent 26%) 9px 9px / 18px 18px, ${a}` };
    case "checks":
      return { background: `conic-gradient(${a} 25%, ${b} 0 50%, ${a} 0 75%, ${b} 0) 0 0 / 30px 30px` };
    case "waves":
      return { background: `repeating-radial-gradient(circle at 0 100%, ${a} 0 9px, ${b} 9px 18px)` };
    case "diamond":
      return { background: `linear-gradient(135deg, ${b} 25%, transparent 25%) -11px 0 / 22px 22px, linear-gradient(225deg, ${b} 25%, transparent 25%) -11px 0 / 22px 22px, linear-gradient(315deg, ${b} 25%, transparent 25%) 0 0 / 22px 22px, linear-gradient(45deg, ${b} 25%, transparent 25%) 0 0 / 22px 22px, ${a}` };
  }
}

export function ProductArt({ pattern, tone, className, rounded = "rounded-xl" }: { pattern: Pattern; tone: [string, string]; className?: string; rounded?: string }) {
  return <div className={cn("aspect-square w-full shrink-0", rounded, className)} style={patternStyle(pattern, tone)} />;
}
