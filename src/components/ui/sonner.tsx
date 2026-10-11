"use client";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-xl !border !bg-card !text-foreground !shadow-xl !font-sans",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
