import { cn } from "@/lib/utils";

export function LogoMark({ className, a = "var(--brand)", b = "#fff" }: { className?: string; a?: string; b?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <clipPath id="bz-awn">
          <path d="M5 5h22l3 9a3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0z" />
        </clipPath>
      </defs>
      <g clipPath="url(#bz-awn)">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={2 + i * 3.5} y={4} width={3.5} height={16} fill={i % 2 ? b : a} />
        ))}
      </g>
      <rect x="6" y="21.5" width="20" height="3" rx="1.5" fill={a} />
      <rect x="8" y="25" width="2.2" height="4" rx="1" fill={a} />
      <rect x="21.8" y="25" width="2.2" height="4" rx="1" fill={a} />
    </svg>
  );
}

export function Wordmark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark a={dark ? "#ffb61e" : "var(--brand)"} b={dark ? "#f4f5fa" : "#fff"} />
      <span className="font-display text-[22px] leading-none">Bazzar</span>
    </span>
  );
}
