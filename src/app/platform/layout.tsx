import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HostBar } from "@/components/shell/host-bar";
import { Badge } from "@/components/ui/badge";
import { HelperToggle } from "@/components/helper-toggle";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <Link href="/"><Wordmark dark className="text-white" /></Link>
          <Badge variant="saffron">Platform admin</Badge>
          <HostBar platform className="ml-2 hidden max-w-[300px] border-sidebar-border bg-sidebar-accent text-sidebar-foreground md:flex" />
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link href="/manager" className="rounded-lg px-3 py-1.5 text-sidebar-foreground/75 hover:bg-white/10 hover:text-white">Open a store manager</Link>
            <HelperToggle className="text-sidebar-foreground hover:bg-white/10 hover:text-white" />
            <ThemeToggle className="text-sidebar-foreground hover:bg-white/10 hover:text-white" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
