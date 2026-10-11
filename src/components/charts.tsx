"use client";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Sparkline({ data, color = "var(--brand)", className }: { data: number[]; color?: string; className?: string }) {
  const w = 100, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-8 w-full", className)}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AreaChart({ data, compare, labels, format = (n: number) => String(n), className }: { data: number[]; compare?: number[]; labels: string[]; format?: (n: number) => string; className?: string }) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const w = 640, h = 220, pad = { l: 8, r: 8, t: 16, b: 24 };
  const all = [...data, ...(compare ?? [])];
  const max = Math.max(...all) * 1.1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const line = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line(data)} L${x(data.length - 1)} ${h - pad.b} L${x(0)} ${h - pad.b} Z`;
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - r.left) / r.width) * w;
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((rel - pad.l) / (w - pad.l - pad.r)) * (data.length - 1)))));
        }}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={pad.l} x2={w - pad.r} y1={y(max * t * 0.9)} y2={y(max * t * 0.9)} stroke="var(--border)" strokeDasharray="3 5" />
        ))}
        {compare && <path d={line(compare)} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 4" />}
        <path d={area} fill={`url(#${id})`} />
        <path d={line(data)} fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {labels.map((l, i) =>
          i % 3 === 0 ? (
            <text key={i} x={x(i)} y={h - 6} textAnchor={i === 0 ? "start" : "middle"} fontSize="10" fill="var(--muted-foreground)">{l}</text>
          ) : null
        )}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={h - pad.b} stroke="var(--foreground)" strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(data[hover])} r="5" fill="var(--card)" stroke="var(--brand)" strokeWidth="2.4" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground shadow-lg"
          style={{ left: `${(x(hover) / w) * 100}%` }}
        >
          <div className="font-medium">{format(data[hover])}</div>
          <div className="opacity-70">{labels[hover]}</div>
        </div>
      )}
    </div>
  );
}
