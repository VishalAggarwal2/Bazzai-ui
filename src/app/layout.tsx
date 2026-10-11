import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/syne";
import "@fontsource-variable/caveat";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/dm-serif-display";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Bazzar: run your store, your way",
  description: "Multi-tenant commerce platform mockup: inventory, roles, custom data and a website builder for every store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
