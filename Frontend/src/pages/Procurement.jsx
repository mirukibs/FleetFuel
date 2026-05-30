import { useEffect, useMemo, useState } from "react";
import { FileStack, Plus, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocalStorageState } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";

const seedProcuments = [
  { id: "PR-2026-004", fleet: "Fleet Alpha", vehicle: "Scania P360 – TZN 330A", supplier: "Total Energies",  litres: 500, estimatedCost: "$740.00", date: "2026-05-24", approvedBy: null },
  { id: "PR-2026-006", fleet: "Fleet Gamma", vehicle: "Nissan Patrol – ARU 204G", supplier: "Oryx Energy",   litres: 150, estimatedCost: "$216.00", date: "2026-05-22", approvedBy: "Amelia Cole" },
];

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

  const filtered = useMemo(() => requests, [requests]);

  useEffect(() => {
    if (!selected?.id) return;
    setSelected(requests.find((r) => r.id === selected.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests]);

  const counts = useMemo(() => ({ all: requests.length }), [requests]);

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
      date: new Date().toISOString().slice(0, 10),
      approvedBy: null,
    };
    setRequests((prev) => [created, ...prev]);
    toast.success(`Request ${created.id} submitted`);
    setShowForm(false);
    setForm((f) => ({ ...f, litres: "" }));
  };

  const handleApprove = (id) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, approvedBy: "Amelia Cole" } : r)));
    toast.success(`Approved ${id}`);
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

      {/* Status tabs removed; showing all requests */}

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
              <div className="text-xs text-muted-foreground">{r.approvedBy ? 'Approved' : 'Pending'}</div>
              <ChevronRight className={cn("size-4 text-muted-foreground transition-transform shrink-0", selected?.id===r.id && "rotate-90")} />
            </div>

            {selected?.id === r.id && (
              <div className="px-5 pb-5 animate-slide-up">
                <div className="flex gap-2 mt-4">
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
