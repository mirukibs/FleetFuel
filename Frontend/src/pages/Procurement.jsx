import { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { StatusPill } from "@/componets/ui-kit/StatusPill";
import { Button } from "@/componets/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorageState } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";

const seedRequests = [
  { id: "PR-2026-001", fleet: "Fleet Alpha", vehicle: "Isuzu FVR – KAZ 421B",  supplier: "Total Energies",  litres: 300, estimatedCost: "$444.00", status: "approved",  date: "2026-05-20", approvedBy: "Amelia Cole" },
  { id: "PR-2026-002", fleet: "Fleet Beta",  vehicle: "Toyota HiAce – DAR 087C", supplier: "Shell Tanzania", litres: 120, estimatedCost: "$182.40", status: "pending",   date: "2026-05-23", approvedBy: null },
  { id: "PR-2026-003", fleet: "Fleet Gamma", vehicle: "Toyota LC – MOR 155F",   supplier: "Oryx Energy",     litres: 80,  estimatedCost: "$115.20", status: "fulfilled", date: "2026-05-18", approvedBy: "Amelia Cole" },
  { id: "PR-2026-004", fleet: "Fleet Alpha", vehicle: "Scania P360 – TZN 330A", supplier: "Total Energies",  litres: 500, estimatedCost: "$740.00", status: "pending",   date: "2026-05-24", approvedBy: null },
  { id: "PR-2026-005", fleet: "Fleet Beta",  vehicle: "Mercedes Sprinter – KAZ 812D", supplier: "BP Tanzania", litres: 90, estimatedCost: "$139.50", status: "rejected", date: "2026-05-19", approvedBy: "Amelia Cole" },
  { id: "PR-2026-006", fleet: "Fleet Gamma", vehicle: "Nissan Patrol – ARU 204G", supplier: "Oryx Energy",   litres: 150, estimatedCost: "$216.00", status: "approved",  date: "2026-05-22", approvedBy: "Amelia Cole" },
];

const steps = ["Request Submitted", "Under Review", "Approved", "Fuelling Scheduled", "Fulfilled"];

const statusStep = { pending: 1, approved: 2, fulfilled: 4, rejected: -1 };

export default function Procurement() {
  const [requests, setRequests] = useLocalStorageState("fleetfuel.procurement.requests", seedRequests);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [form, setForm] = useState({
    fleet: "Fleet Alpha",
    vehicle: "Isuzu FVR – KAZ 421B",
    supplier: "Total Energies",
    litres: "",
  });

  const filtered = useMemo(
    () => (filter === "all" ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  useEffect(() => {
    if (!selected?.id) return;
    setSelected(requests.find((r) => r.id === selected.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const counts = useMemo(() => {
    const by = { all: requests.length, pending: 0, approved: 0, fulfilled: 0, rejected: 0 };
    for (const r of requests) by[r.status] = (by[r.status] ?? 0) + 1;
    return by;
  }, [requests]);

  const makeId = () => {
    const seq = String(requests.length + 1).padStart(3, "0");
    return `PR-${new Date().getFullYear()}-${seq}`;
  };

  const estimateCost = (litres) => {
    const price = 1.48; // demo blended price
    const cost = Number(litres || 0) * price;
    return `$${cost.toFixed(2)}`;
  };

  const handleSubmitRequest = () => {
    const litres = Number(form.litres);
    if (!form.fleet || !form.vehicle || !form.supplier || !litres || litres <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    const created = {
      id: makeId(),
      fleet: form.fleet,
      vehicle: form.vehicle,
      supplier: form.supplier,
      litres,
      estimatedCost: estimateCost(litres),
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
      approvedBy: null,
    };
    setRequests((prev) => [created, ...prev]);
    toast.success(`Request ${created.id} submitted`);
    setShowForm(false);
    setForm((f) => ({ ...f, litres: "" }));
  };

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "approved", approvedBy: "Amelia Cole" } : r
      )
    );
    toast.success(`Approved ${id}`);
  };

  const handleReject = (id) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    toast.message(`Rejected ${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement"
        subtitle="Manage fuel procurement requests and approval workflows"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4" /> New Request
          </Button>
        }
      />

      {/* New request form */}
      {showForm && (
        <Card>
          <CardHeader title="New Procurement Request" subtitle="Submit a fuel request for approval" />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fleet</label>
              <select
                value={form.fleet}
                onChange={(e) => setForm((f) => ({ ...f, fleet: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              >
                <option>Fleet Alpha</option><option>Fleet Beta</option><option>Fleet Gamma</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vehicle</label>
              <select
                value={form.vehicle}
                onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              >
                <option>Isuzu FVR – KAZ 421B</option><option>Toyota HiAce – DAR 087C</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Supplier</label>
              <select
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              >
                <option>Total Energies</option><option>Shell Tanzania</option><option>Oryx Energy</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Litres Requested</label>
              <input
                type="number"
                value={form.litres}
                onChange={(e) => setForm((f) => ({ ...f, litres: e.target.value }))}
                placeholder="e.g. 200"
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSubmitRequest}>Submit Request</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 w-fit">
        {["all","pending","approved","fulfilled","rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
              filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f} {`(${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <div
            key={r.id}
            onClick={() => setSelected(selected?.id === r.id ? null : r)}
            className={cn(
              "rounded-2xl border bg-card shadow-card cursor-pointer hover:shadow-elevated transition-all",
              selected?.id === r.id ? "border-primary" : "border-border"
            )}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="font-mono text-xs text-muted-foreground w-28 shrink-0">{r.id}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{r.vehicle}</div>
                <div className="text-xs text-muted-foreground">{r.fleet} · {r.supplier}</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-sm">{r.estimatedCost}</div>
                <div className="text-xs text-muted-foreground">{r.litres} L</div>
              </div>
              <StatusPill status={r.status} />
              <ChevronRight className={cn("size-4 text-muted-foreground transition-transform shrink-0", selected?.id===r.id && "rotate-90")} />
            </div>

            {selected?.id === r.id && r.status !== "rejected" && (
              <div className="px-5 pb-5 animate-slide-up">
                {/* Progress steps */}
                <div className="flex items-center gap-0">
                  {steps.map((step, i) => {
                    const active = i <= (statusStep[r.status] ?? 0);
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className={cn(
                          "size-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition-all",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                        )}>{i+1}</div>
                        {i < steps.length - 1 && (
                          <div className={cn("flex-1 h-0.5 mx-1", active && i < (statusStep[r.status]??0) ? "bg-primary" : "bg-border")} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {steps.map(s => <div key={s} className="text-[9px] text-muted-foreground text-center flex-1 last:flex-none">{s.split(" ")[0]}</div>)}
                </div>
                <div className="flex gap-2 mt-4">
                  {r.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(r.id);
                        }}
                      >
                        <CheckCircle className="size-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(r.id);
                        }}
                      >
                        <XCircle className="size-3" /> Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(r);
                      setDetailsOpen(true);
                    }}
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Procurement Request Details</DialogTitle>
            <DialogDescription>Full details for {selected?.id}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fleet</div>
                  <div className="font-medium">{selected.fleet}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Supplier</div>
                  <div className="font-medium">{selected.supplier}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vehicle</div>
                  <div className="font-medium">{selected.vehicle}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Litres</div>
                  <div className="font-medium">{selected.litres} L</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Cost</div>
                  <div className="font-medium">{selected.estimatedCost}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</div>
                  <StatusPill status={selected.status} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Approved By</div>
                  <div className="font-medium">{selected.approvedBy || "—"}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
