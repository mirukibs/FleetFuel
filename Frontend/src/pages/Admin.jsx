import { Building2, Plus, Edit2, Eye } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
// Status removed: UI no longer tracks user status from backend
import { Button } from "@/componets/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";
import { FleetFuelApi } from "@/lib/client";
import { splitFullName } from "@/lib/fleetModule";

export default function Admin() {
  const [managers, setManagers] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [createFleetOpen, setCreateFleetOpen] = useState(false);

  const [renameFleetOpen, setRenameFleetOpen] = useState(false);
  const [renameFleetId, setRenameFleetId] = useState(null);
  const [renameFleetName, setRenameFleetName] = useState("");

  const [managerDetailsOpen, setManagerDetailsOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerData, setManagerData] = useState(null);

  const [fleetDetailsOpen, setFleetDetailsOpen] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetData, setFleetData] = useState(null);
  const [fleetVehicles, setFleetVehicles] = useState([]);

  const [managerForm, setManagerForm] = useState({
    name: "",
    email: "",
  });

  const [fleetForm, setFleetForm] = useState({
    name: "",
    manager: "",
  });

  const fleetOptions = useMemo(
    () => ["All Fleets", ...fleets.map((f) => f.name)],
    [fleets]
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [mgrs, flts] = await Promise.all([
          FleetFuelApi.managers.list(),
          FleetFuelApi.fleets.list(),
        ]);
        setManagers(mgrs ? mgrs.map(m => ({
          ...m,
          name: m.fullName || `${m.firstName} ${m.lastName}`.trim() || m.name || "Unknown Manager"
        })) : []);
        setFleets(flts ? flts.map(f => ({
          ...f,
          manager: mgrs?.find(m => m.id === f.fleetManagerId)?.fullName || "Unassigned"
        })) : []);
      } catch (err) {
        toast.error("Failed to load admin data");
      }
    }
    loadData();
  }, []);

  const createManagerId = () => `MGR-${Math.floor(Math.random() * 10000)}`;
  const createFleetId = () => `FL-${Math.floor(Math.random() * 10000)}`;

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
          id: created?.id || managerForm.name,
          name: created?.fullName || `${created?.firstName} ${created?.lastName}`.trim() || managerForm.name.trim(),
          email: created?.email || managerForm.email.trim(),
        },
        ...prev,
      ]);
      toast.success(`Manager "${created.fullName ?? managerForm.name.trim()}" added`);
      setAddManagerOpen(false);
      setManagerForm({ name: "", email: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add manager");
    }
  };

  const handleCreateFleet = async () => {
    if (!fleetForm.name.trim() || !fleetForm.manager.trim()) {
      toast.error("Please fill fleet name and manager");
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
          id: created?.id || fleetForm.name,
          name: created?.name || fleetForm.name.trim(),
          vehicles: 0,
          manager: managerRecord ? managerRecord.name : "Unassigned",
          fleetManagerId: created?.fleetManagerId || managerRecord?.id || null,
        },
        ...prev,
      ]);
      toast.success(`Fleet "${created.name ?? fleetForm.name.trim()}" created`);
      setCreateFleetOpen(false);
      setFleetForm({ name: "", manager: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create fleet");
    }
  };

  const handleOpenManagerDetails = async (m) => {
    setSelectedManager(m);
    setManagerDetailsOpen(true);
    setManagerData(null);
    try {
      const data = await FleetFuelApi.managers.get(m.id);
      setManagerData(data);
    } catch (error) {
      toast.error("Failed to load manager details");
    }
  };

  const handleOpenFleetDetails = async (f) => {
    setSelectedFleet(f);
    setFleetDetailsOpen(true);
    setFleetData(null);
    setFleetVehicles([]);
    try {
      const [data, vehicles] = await Promise.all([
        FleetFuelApi.fleets.get(f.id),
        FleetFuelApi.fleets.listVehicles(f.id)
      ]);
      setFleetData(data);
      setFleetVehicles(vehicles || []);
    } catch (error) {
      toast.error("Failed to load fleet details");
    }
  };

  const handleOpenRenameFleet = (f) => {
    setRenameFleetId(f.id);
    setRenameFleetName(f.name);
    setRenameFleetOpen(true);
  };

  const handleRenameFleet = async () => {
    if (!renameFleetName.trim()) return;
    try {
      await FleetFuelApi.fleets.updateName(renameFleetId, renameFleetName.trim());
      setFleets(prev => prev.map(f => f.id === renameFleetId ? { ...f, name: renameFleetName.trim() } : f));
      toast.success("Fleet renamed");
      setRenameFleetOpen(false);
    } catch (error) {
      toast.error("Failed to rename fleet");
    }
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
                  {m.name && typeof m.name === 'string' ? m.name.split(" ").map(n=>n[0]).join("") : "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                </div>
                <button
                  onClick={() => handleOpenManagerDetails(m)}
                  className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                  aria-label={`View ${m.name}`}
                >
                  <Eye className="size-3.5" />
                </button>
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
                  <div className="text-xs text-muted-foreground">{f.vehicles} vehicles</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{f.manager}</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenFleetDetails(f)}
                    className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenRenameFleet(f)}
                    className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>



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
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Manager</label>
                <input
                  list="managers-list"
                  value={fleetForm.manager}
                  onChange={(e) => setFleetForm((f) => ({ ...f, manager: e.target.value }))}
                  placeholder="e.g. Joel Mwamba"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none"
                />
                <datalist id="managers-list">
                  {managers.map(m => <option key={m.id} value={m.name} />)}
                </datalist>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFleetOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFleet}>Create Fleet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Fleet Dialog */}
      <Dialog open={renameFleetOpen} onOpenChange={setRenameFleetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Fleet</DialogTitle>
            <DialogDescription>Update the name for this fleet group.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New Fleet Name</label>
            <input
              value={renameFleetName}
              onChange={(e) => setRenameFleetName(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-lg bg-muted/60 border border-border focus:border-ring outline-none mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFleetOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameFleet}>Save Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Details Dialog */}
      <Dialog open={managerDetailsOpen} onOpenChange={setManagerDetailsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Manager Details</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {managerData ? (
              <div className="space-y-3 text-sm">
                <div><span className="font-medium text-muted-foreground">ID:</span> {managerData.id}</div>
                <div><span className="font-medium text-muted-foreground">First Name:</span> {managerData.firstName}</div>
                <div><span className="font-medium text-muted-foreground">Last Name:</span> {managerData.lastName}</div>
                <div><span className="font-medium text-muted-foreground">Email:</span> {managerData.email}</div>
                <div><span className="font-medium text-muted-foreground">Created At:</span> {new Date(managerData.createdAt).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading details...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fleet Details Dialog */}
      <Dialog open={fleetDetailsOpen} onOpenChange={setFleetDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Fleet Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {fleetData ? (
              <div className="space-y-3 text-sm">
                <div><span className="font-medium text-muted-foreground">ID:</span> {fleetData.id}</div>
                <div><span className="font-medium text-muted-foreground">Name:</span> {fleetData.name}</div>
                <div><span className="font-medium text-muted-foreground">Manager ID:</span> {fleetData.fleetManagerId || "Unassigned"}</div>
                <div><span className="font-medium text-muted-foreground">Created At:</span> {new Date(fleetData.createdAt).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading fleet details...</div>
            )}
            <div>
              <h4 className="font-medium text-sm mb-2 border-b border-border pb-1">Assigned Vehicles</h4>
              {fleetVehicles && fleetVehicles.length > 0 ? (
                <ul className="text-sm space-y-1.5 mt-3">
                  {fleetVehicles.map(v => (
                    <li key={v.id} className="flex justify-between items-center p-2 rounded bg-muted/40 border border-border">
                      <span className="font-medium">{v.licensePlate} <span className="font-normal text-muted-foreground ml-1">({v.make} {v.model})</span></span>
                      <span className="text-xs text-muted-foreground uppercase">{v.type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground italic">No vehicles assigned.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
