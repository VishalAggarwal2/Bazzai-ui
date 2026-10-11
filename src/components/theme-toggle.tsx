"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bazzar-theme");
      const isDark = saved === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      setDark(isDark);
    } catch {}
  }, []);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label="Toggle dark mode"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try { localStorage.setItem("bazzar-theme", next ? "dark" : "light"); } catch {}
      }}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
