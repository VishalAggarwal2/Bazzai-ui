import { MessageCircle } from "lucide-react";
import type { Social } from "@/lib/builder";

export const socialKinds: { v: Social["kind"]; label: string }[] = [
  { v: "instagram", label: "Instagram" }, { v: "facebook", label: "Facebook" }, { v: "youtube", label: "YouTube" },
  { v: "x", label: "X" }, { v: "whatsapp", label: "WhatsApp" }, { v: "pinterest", label: "Pinterest" },
];

/** Small hand-drawn marks; the icon set has no brand logos. */
export function SocialIcon({ kind, className = "size-[18px]" }: { kind: Social["kind"]; className?: string }) {
  const p = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true };
  switch (kind) {
    case "instagram": return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>;
    case "facebook": return <svg {...p}><path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.4L17 11h-3V8.9c0-.2.1-.4.4-.4z" /></svg>;
    case "youtube": return <svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></svg>;
    case "x": return <svg {...p}><path d="M4.5 4.5l15 15M19.5 4.5l-15 15" /></svg>;
    case "pinterest": return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M11 16.5L12.6 9.5M10.4 12.5c0-1.6 1-2.5 2.2-2.5s1.9.8 1.9 1.8c0 1.3-.8 2.4-1.9 2.4" /></svg>;
    case "whatsapp": return <MessageCircle className={className} strokeWidth={1.8} aria-hidden />;
  }
}
