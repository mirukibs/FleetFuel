import { cn } from "@/lib/utils";

const styles = {
  active: "bg-success/10 text-success",
  idle: "bg-muted text-muted-foreground",
  maintenance: "bg-warning/15 text-warning-foreground",
  offline: "bg-destructive/10 text-destructive",
  pending: "bg-warning/15 text-warning-foreground",
  approved: "bg-info/10 text-info",
  fulfilled: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
};

export function StatusPill({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}