import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, className }: { title: string; description?: string; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div className="max-w-2xl">
        <h1 className="font-display text-[34px] sm:text-[40px]">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground text-balance">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
