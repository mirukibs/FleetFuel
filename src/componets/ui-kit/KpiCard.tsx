import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, delta, icon: Icon, accent = "primary", hint,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "success" | "warning";
  hint?: string;
}) {
  const up = (delta ?? 0) >= 0;
  const accents: Record<string, string> = {
    primary: "from-primary/15 to-primary/0 text-primary",
    accent: "from-accent/20 to-accent/0 text-accent-foreground",
    success: "from-success/15 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning-foreground",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-all">
      <div className={cn("absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br opacity-80", accents[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className="size-10 rounded-xl bg-card border border-border grid place-items-center text-foreground/80 group-hover:scale-105 transition">
          <Icon className="size-5" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="relative mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
            up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
