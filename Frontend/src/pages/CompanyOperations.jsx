import { Building2, Plus, Edit2, Eye, Users } from "lucide-react";
import { Button } from "@/componets/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";
import { FleetFuelApi } from "@/lib/client";
import { splitFullName } from "@/lib/fleetModule";

export default function CompanyOperations({ open, onOpenChange, company }) {
  const [managers, setManagers] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [addManagerOpen, setAddManagerOpen] = useState(false);
  const [createFleetOpen, setCreateFleetOpen] = useState(false);

  const [renameFleetOpen, setRenameFleetOpen] = useState(false);
  const [renameFleetId, setRenameFleetId] = useState(null);
  const [renameFleetName, setRenameFleetName] = useState("");

  const [managerDetailsOpen, setManagerDetailsOpen] = useState(false);
  const [managerData, setManagerData] = useState(null);

  const [fleetDetailsOpen, setFleetDetailsOpen] = useState(false);
  const [fleetData, setFleetData] = useState(null);
  const [fleetVehicles, setFleetVehicles] = useState([]);

  const [managerForm, setManagerForm] = useState({ name: "", email: "" });
  const [fleetForm, setFleetForm] = useState({ name: "", managerId: "" });

  useEffect(() => {
    if (open && company) {
      loadData();
    }
  }, [open, company]);

  const loadData = async () => {
    try {
      const [mgrs, flts] = await Promise.all([
        FleetFuelApi.managers.listByCompany(company.id),
        FleetFuelApi.fleets.listByCompany(company.id),
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
      toast.error("Failed to load operations data");
    }
  };

  const handleAddManager = async () => {
    if (!managerForm.name.trim() || !managerForm.email.trim()) {
      toast.error("Please provide name and email");
      return;
    }
    try {
      const { firstName, lastName } = splitFullName(managerForm.name.trim());
      const created = await FleetFuelApi.managers.create({
        firstName,
        lastName,
        email: managerForm.email.trim(),
        fleetCompanyId: company.id
      });
      toast.success(`Manager added`);
      setAddManagerOpen(false);
      setManagerForm({ name: "", email: "" });
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add manager");
    }
  };

  const handleCreateFleet = async () => {
    if (!fleetForm.name.trim() || !fleetForm.managerId.trim()) {
      toast.error("Please fill fleet name and select a manager");
      return;
    }
    try {
      const created = await FleetFuelApi.fleets.create({
        name: fleetForm.name.trim(),
        fleetManagerId: fleetForm.managerId,
        fleetCompanyId: company.id
      });
      toast.success(`Fleet created`);
      setCreateFleetOpen(false);
      setFleetForm({ name: "", managerId: "" });
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create fleet");
    }
  };

  const handleOpenManagerDetails = async (m) => {
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
      toast.success("Fleet renamed");
      setRenameFleetOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to rename fleet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{company?.companyName} - Operations</DialogTitle>
          <DialogDescription>Manage fleets and fleet managers assigned to this company.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Fleet Managers */}
            <div className="bg-card border border-border rounded-xl flex flex-col h-full">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Fleet Managers</h3>
                  <p className="text-xs text-muted-foreground">User accounts</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setAddManagerOpen(true)}>
                  <Plus className="size-3" /> Add
                </Button>
              </div>
              <div className="divide-y divide-border overflow-y-auto max-h-[300px]">
                {managers.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="size-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                      {m.name && typeof m.name === 'string' ? m.name.split(" ").map(n=>n[0]).join("") : "M"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                    </div>
                    <button
                      onClick={() => handleOpenManagerDetails(m)}
                      aria-label={`View details for ${m.name}`}
                      className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                    >
                      <Eye className="size-3.5" />
                    </button>
                  </div>
                ))}
                {managers.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground italic">No managers found.</div>
                )}
              </div>
            </div>

            {/* Fleet Groups */}
            <div className="bg-card border border-border rounded-xl flex flex-col h-full">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Fleet Groups</h3>
                  <p className="text-xs text-muted-foreground">Logical fleet groupings</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setCreateFleetOpen(true)}>
                  <Plus className="size-3" /> Create
                </Button>
              </div>
              <div className="divide-y divide-border overflow-y-auto max-h-[300px]">
                {fleets.map(f => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="size-8 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                      <Building2 className="size-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.manager}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenFleetDetails(f)}
                        aria-label={`View details for ${f.name}`}
                        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenRenameFleet(f)}
                        aria-label={`Rename ${f.name}`}
                        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {fleets.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground italic">No fleets found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Add Manager */}
      <Dialog open={addManagerOpen} onOpenChange={setAddManagerOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Manager</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <input
                value={managerForm.name}
                onChange={(e) => setManagerForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                value={managerForm.email}
                onChange={(e) => setManagerForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="e.g. jane@fleetfuel.co"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddManagerOpen(false)}>Cancel</Button>
            <Button onClick={handleAddManager}>Add Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fleet */}
      <Dialog open={createFleetOpen} onOpenChange={setCreateFleetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Fleet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Fleet Name</label>
              <input
                value={fleetForm.name}
                onChange={(e) => setFleetForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Fleet Delta"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Manager</label>
              <select
                value={fleetForm.managerId}
                onChange={(e) => setFleetForm((f) => ({ ...f, managerId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
              >
                <option value="">Select a manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFleetOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFleet}>Create Fleet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Fleet */}
      <Dialog open={renameFleetOpen} onOpenChange={setRenameFleetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Fleet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block">New Fleet Name</label>
            <input
              value={renameFleetName}
              onChange={(e) => setRenameFleetName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFleetOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameFleet}>Save Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manager Details */}
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
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading details...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fleet Details */}
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
    </Dialog>
  );
}
