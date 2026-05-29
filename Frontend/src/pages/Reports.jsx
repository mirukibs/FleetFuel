import { FileText, Download, Calendar, Filter } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocalStorageState } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";

const seedReports = [
  { id: "RPT-001", title: "Monthly Fuel Consumption Summary",  period: "May 2026",    generated: "2026-05-25", type: "Consumption", size: "142 KB", status: "ready" },
  { id: "RPT-002", title: "Fleet Cost Reconciliation Report",   period: "May 2026",    generated: "2026-05-25", type: "Financial",   size: "98 KB",  status: "ready" },
  { id: "RPT-003", title: "Supplier Performance Analysis",      period: "Q2 2026",     generated: "2026-05-20", type: "Supplier",    size: "213 KB", status: "ready" },
  { id: "RPT-004", title: "Fuel Theft & Anomaly Detection Log", period: "May 2026",    generated: "2026-05-24", type: "Security",    size: "67 KB",  status: "ready" },
  { id: "RPT-005", title: "Vehicle Efficiency Benchmarks",      period: "Apr 2026",    generated: "2026-05-01", type: "Efficiency",  size: "188 KB", status: "ready" },
  { id: "RPT-006", title: "Procurement Pipeline Export",        period: "YTD 2026",    generated: "2026-05-24", type: "Procurement", size: "305 KB", status: "ready" },
  { id: "RPT-007", title: "June 2026 Consumption Projection",   period: "Jun 2026",    generated: "—",           type: "Forecast",    size: "—",      status: "scheduled" },
];

const typeColors = {
  Consumption: "bg-primary/10 text-primary",
  Financial:   "bg-success/10 text-success",
  Supplier:    "bg-accent/10 text-accent-foreground",
  Security:    "bg-destructive/10 text-destructive",
  Efficiency:  "bg-warning/10 text-warning-foreground",
  Procurement: "bg-info/10 text-info",
  Forecast:    "bg-muted text-muted-foreground",
};

export default function Reports() {
  const [reports, setReports] = useLocalStorageState("fleetfuel.reports", seedReports);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [scheduleForm, setScheduleForm] = useState({ title: "", period: "", type: "Consumption" });

  const visible = useMemo(() => {
    if (typeFilter === "all") return reports;
    return reports.filter((r) => r.type === typeFilter);
  }, [reports, typeFilter]);

  const handleExport = (r) => {
    if (r.status !== "ready") return;
    const rows = [
      ["Report ID", r.id],
      ["Title", r.title],
      ["Period", r.period],
      ["Generated", r.generated],
      ["Type", r.type],
      ["Size", r.size],
      ["Status", r.status],
    ];
    const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${r.id} (CSV)`);
  };

  const handleSchedule = () => {
    if (!scheduleForm.title.trim() || !scheduleForm.period.trim()) {
      toast.error("Please fill in title and period");
      return;
    }
    const id = `RPT-${String(reports.length + 1).padStart(3, "0")}`;
    const created = {
      id,
      title: scheduleForm.title.trim(),
      period: scheduleForm.period.trim(),
      generated: "—",
      type: scheduleForm.type,
      size: "—",
      status: "scheduled",
    };
    setReports((prev) => [created, ...prev]);
    toast.success("Report scheduled");
    setScheduleOpen(false);
    setScheduleForm({ title: "", period: "", type: "Consumption" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Access, export, and schedule fuel transaction and procurement reports"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setScheduleOpen(true)}>
            <Calendar className="size-4" /> Schedule Report
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Available Reports"
          subtitle={`${visible.length} reports — exportable as CSV or PDF`}
          action={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setFilterOpen(true)}>
                <Filter className="size-3" /> Filter
              </Button>
            </div>
          }
        />
        <div className="divide-y divide-border">
          {visible.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="size-9 rounded-lg bg-muted grid place-items-center shrink-0">
                <FileText className="size-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{r.title}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground">{r.period}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">Generated {r.generated}</span>
                  {r.size !== "—" && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{r.size}</span>
                    </>
                  )}
                </div>
              </div>

              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeColors[r.type]}`}>
                {r.type}
              </span>

              {r.status === "ready" ? (
                <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => handleExport(r)}>
                  <Download className="size-3" /> Export
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic shrink-0">Scheduled</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>Create a scheduled report job (MVP simulation).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
              <input
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Monthly Fuel Consumption Summary"
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Period</label>
                <input
                  value={scheduleForm.period}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, period: e.target.value }))}
                  placeholder="e.g. Jun 2026"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                >
                  {Object.keys(typeColors).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Filter Reports</DialogTitle>
            <DialogDescription>Filter by report type (does not change design).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
            >
              <option value="all">All</option>
              {Object.keys(typeColors).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
