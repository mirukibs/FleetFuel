import { Building2, Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
// Status removed: UI no longer tracks user status from backend
import { Button } from "@/componets/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";
import { FleetFuelApi } from "@/lib/client";
import { bootstrapFleetModule, seedFleets, seedManagers, splitFullName } from "@/lib/fleetModule";

export default function Admin() {
  const [managers, setManagers] = useState(seedManagers);
  const [fleets, setFleets] = useState(seedFleets);
  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [createFleetOpen, setCreateFleetOpen] = useState(false);

  const [managerForm, setManagerForm] = useState({
    name: "",
    email: "",
    role: "Manager",
    fleet: "All Fleets",
  });

  const [fleetForm, setFleetForm] = useState({
    name: "",
    region: "",
    manager: "",
  });

  const fleetOptions = useMemo(
    () => ["All Fleets", ...fleets.map((f) => f.name)],
    [fleets]
  );

  useEffect(() => {
    void bootstrapFleetModule().catch(() => null);
  }, []);

  const createManagerId = () => `MGR-${String(managers.length + 1).padStart(3, "0")}`;
  const createFleetId = () => `FL-${String(fleets.length + 1).padStart(3, "0")}`;

  const handleAddManager = async () => {
    if (!managerForm.name.trim() || !managerForm.email.trim()) {
      toast.error("Please provide name and email");
      return;
    }
    try {
      const { firstName, lastName } = splitFullName(managerForm.name.trim());
      const created = await FleetFuelApi.managers.create({
        id: createManagerId(),
        firstName,
        lastName,
        email: managerForm.email.trim(),
      });

      setManagers((prev) => [
        {
          id: created.id,
          name: created.fullName ?? managerForm.name.trim(),
          email: created.email ?? managerForm.email.trim(),
          role: managerForm.role,
          fleet: managerForm.fleet,
        },
        ...prev,
      ]);
      toast.success(`Manager "${created.fullName ?? managerForm.name.trim()}" added`);
      setAddManagerOpen(false);
      setManagerForm({ name: "", email: "", role: "Manager", fleet: "All Fleets" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add manager");
    }
  };

  const handleCreateFleet = async () => {
    if (!fleetForm.name.trim() || !fleetForm.region.trim() || !fleetForm.manager.trim()) {
      toast.error("Please fill fleet name, region, and manager");
      return;
    }
    try {
      const managerRecord = managers.find((manager) => manager.name === fleetForm.manager.trim());
      const created = await FleetFuelApi.fleets.create({
        id: createFleetId(),
        name: fleetForm.name.trim(),
        fleetManagerId: managerRecord?.id ?? null,
      });

      setFleets((prev) => [
        {
          id: created.id,
          name: created.name ?? fleetForm.name.trim(),
          vehicles: 0,
          manager: fleetForm.manager.trim(),
          region: fleetForm.region.trim(),
          fleetManagerId: created.fleetManagerId ?? managerRecord?.id ?? null,
        },
        ...prev,
      ]);
      toast.success(`Fleet "${created.name ?? fleetForm.name.trim()}" created`);
      setCreateFleetOpen(false);
      setFleetForm({ name: "", region: "", manager: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create fleet");
    }
  };

  const handleDeleteFleet = (id) => {
    const target = fleets.find((f) => f.id === id);
    setFleets((prev) => prev.filter((f) => f.id !== id));
    toast.message(`Fleet "${target?.name ?? id}" removed`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Panel"
        subtitle="Manage fleet managers, fleet groups, and access control"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fleet Managers */}
        <Card>
          <CardHeader
            title="Fleet Managers"
            subtitle="User accounts with system access"
            action={
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setAddManagerOpen(true)}>
                <Plus className="size-3" /> Add Manager
              </Button>
            }
          />
          <div className="divide-y divide-border">
            {managers.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="size-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                  {m.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email} · {m.fleet}</div>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Fleet Groups */}
        <Card>
          <CardHeader
            title="Fleet Groups"
            subtitle="Logical fleet groupings for management"
            action={
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setCreateFleetOpen(true)}>
                <Plus className="size-3" /> Create Fleet
              </Button>
            }
          />
          <div className="divide-y divide-border">
            {fleets.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="size-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                  <Building2 className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.vehicles} vehicles · {f.region}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{f.manager}</div>
                <button
                  onClick={() => handleDeleteFleet(f.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Access & Plan */}
      <Card>
        <CardHeader title="Plan & Access Control" subtitle="Current subscription and feature gates" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Plan",            value: "Enterprise",   note: "Unlimited vehicles" },
            { label: "Registered Vehicles", value: "8 / ∞",    note: "No unit cap on Enterprise" },
            { label: "Reporting Access",value: "Full",         note: "Historical + export enabled" },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-muted/40 border border-border p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{item.label}</div>
              <div className="font-semibold text-base font-display font-numeric">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Manager dialog */}
      <Dialog open={addManagerOpen} onOpenChange={setAddManagerOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Manager</DialogTitle>
            <DialogDescription>Create a user account with system access (MVP local simulation).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                <input
                  value={managerForm.name}
                  onChange={(e) => setManagerForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                <input
                  value={managerForm.email}
                  onChange={(e) => setManagerForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. jane@fleetfuel.co"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
                <select
                  value={managerForm.role}
                  onChange={(e) => setManagerForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fleet</label>
                <select
                  value={managerForm.fleet}
                  onChange={(e) => setManagerForm((f) => ({ ...f, fleet: e.target.value }))}
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                >
                  {fleetOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {/* Status removed */}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddManagerOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManager}>Add Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fleet dialog */}
      <Dialog open={createFleetOpen} onOpenChange={setCreateFleetOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create Fleet</DialogTitle>
            <DialogDescription>Create a logical fleet group for management (MVP local simulation).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fleet Name</label>
              <input
                value={fleetForm.name}
                onChange={(e) => setFleetForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Fleet Delta"
                className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Region</label>
                <input
                  value={fleetForm.region}
                  onChange={(e) => setFleetForm((f) => ({ ...f, region: e.target.value }))}
                  placeholder="e.g. Dodoma"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Manager</label>
                <input
                  value={fleetForm.manager}
                  onChange={(e) => setFleetForm((f) => ({ ...f, manager: e.target.value }))}
                  placeholder="e.g. Joel Mwamba"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFleetOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFleet}>Create Fleet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
