import { useEffect, useMemo, useState } from "react";
import { Truck, Plus, Search, Fuel, Wrench, WifiOff, AlertTriangle, AlertCircle } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/componets/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/componets/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { FleetFuelApi } from "@/lib/client";
import {
  bootstrapFleetModule,
  fleetOptions,
  seedFleets,
  seedVehicles,
  toFrontendVehicle,
  vehicleTypeOptions,
} from "@/lib/fleetModule";

const fuelColor = (level) => {
  if (level > 60) return "bg-success";
  if (level > 25) return "bg-warning";
  return "bg-destructive";
};

export default function Fleet() {
  const [vehicles, setVehicles] = useState(seedVehicles);
  const [search, setSearch] = useState("");
  const [fleet,  setFleet]  = useState("All Fleets");
  const [type,   setType]   = useState("All Types");
  const [selectedId, setSelectedId] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  
  // Modal states
  const [registerVehicleOpen, setRegisterVehicleOpen] = useState(false);
  const [updateDetailsOpen, setUpdateDetailsOpen] = useState(false);
  const [assignSensorOpen, setAssignSensorOpen] = useState(false);
  const [removeVehicleOpen, setRemoveVehicleOpen] = useState(false);
  
  // Form states
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    make: "",
    model: "",
    year: "",
    type: "",
    fleet: "",
  });
  
  const [updateForm, setUpdateForm] = useState({
    fleet: "",
    type: "",
  });
  
  const [sensorForm, setSensorForm] = useState({
    sensorId: "",
  });

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        await bootstrapFleetModule();
      } catch {
        if (active) {
          toast.message("Backend bootstrap skipped; using local demo state");
        }
      } finally {
        if (active) {
          setBootstrapping(false);
        }
      }
    };

    void sync();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter((v) => {
      const matchSearch =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q);
      const matchFleet = fleet === "All Fleets" || v.fleet === fleet;
      const matchType = type === "All Types" || v.type === type;
      return matchSearch && matchFleet && matchType;
    });
  }, [vehicles, search, fleet, type]);

  const selected = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedId) ?? null,
    [vehicles, selectedId]
  );

  // Handler functions
  const handleRegisterVehicle = async () => {
    if (!newVehicle.plate || !newVehicle.make || !newVehicle.model || !newVehicle.year) {
      toast.error("Please fill in all required fields");
      return;
    }
    const fleetEntry = seedFleets.find((item) => item.name === (newVehicle.fleet || "Fleet Alpha"));
    const apiType = ({
      TRUCK: "Truck",
      SUV: "SUV",
      SEDAN: "Sedan",
      MOTORCYCLE: "Motorcycle",
    })[newVehicle.type || "TRUCK"] ?? "Truck";

    try {
      const created = await FleetFuelApi.vehicles.register({
        id: `VH-${String(vehicles.length + 1).padStart(3, "0")}`,
        fleetId: fleetEntry?.id ?? null,
        make: newVehicle.make.trim(),
        model: newVehicle.model.trim(),
        year: Number(newVehicle.year),
        type: apiType,
        licensePlate: newVehicle.plate.trim().toUpperCase(),
      });

      await FleetFuelApi.telemetry.submitReading({
        vehicleId: created.id,
        fuelLevel: 50,
        timestamp: new Date().toISOString(),
      });

      const frontendVehicle = toFrontendVehicle({
        ...created,
        fleetId: fleetEntry?.id ?? created.fleetId,
        readings: [{ fuelLevel: 50 }],
      });

      setVehicles((prev) => [
        { ...frontendVehicle, fleet: fleetEntry?.name ?? frontendVehicle.fleet },
        ...prev,
      ]);
      toast.success(`Vehicle ${frontendVehicle.plate} registered`);
      setNewVehicle({ plate: "", make: "", model: "", year: "", type: "", fleet: "" });
      setRegisterVehicleOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register vehicle");
    }
  };

  const handleUpdateDetails = async () => {
    if (!updateForm.fleet) {
      toast.error("Please select a fleet");
      return;
    }
    if (!selected?.id) return;

    const fleetEntry = seedFleets.find((item) => item.name === updateForm.fleet);
    const currentVehicle = vehicles.find((vehicle) => vehicle.id === selected.id);
    const apiType = ({
      TRUCK: "Truck",
      SUV: "SUV",
      SEDAN: "Sedan",
      MOTORCYCLE: "Motorcycle",
    })[updateForm.type || currentVehicle?.type || "TRUCK"] ?? "Truck";

    try {
      await FleetFuelApi.vehicles.assignToFleet(selected.id, fleetEntry?.id ?? null);

      if (currentVehicle && updateForm.type && updateForm.type !== currentVehicle.type) {
        await FleetFuelApi.vehicles.update(selected.id, {
          make: currentVehicle.make,
          model: currentVehicle.model,
          year: currentVehicle.year,
          type: apiType,
          licensePlate: currentVehicle.plate,
        });
      }

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selected.id
            ? {
                ...vehicle,
                fleet: updateForm.fleet,
                fleetId: fleetEntry?.id ?? vehicle.fleetId,
                type: updateForm.type || vehicle.type,
              }
            : vehicle
        )
      );
      toast.success(`Assigned ${selected.plate} to ${updateForm.fleet}`);
      setUpdateDetailsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update vehicle");
    }
  };

  const handleAssignSensor = async () => {
    if (!sensorForm.sensorId) {
      toast.error("Please enter a sensor ID");
      return;
    }
    if (!selected?.id) return;
    const sensorId = sensorForm.sensorId.trim().toUpperCase();

    try {
      await FleetFuelApi.vehicles.assignFuelSensor(selected.id, {
        sensorId,
        serialNo: sensorId,
      });

      setVehicles((prev) => prev.map((vehicle) => (vehicle.id === selected.id ? { ...vehicle, sensor: sensorId } : vehicle)));
      toast.success(`Sensor ${sensorId} assigned to ${selected.plate}`);
      setSensorForm({ sensorId: "" });
      setAssignSensorOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign sensor");
    }
  };

  const handleRemoveVehicle = async () => {
    if (!selected?.id) return;

    try {
      await FleetFuelApi.vehicles.delete(selected.id);
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== selected.id));
      toast.success(`Removed ${selected.plate} from fleet`);
      setRemoveVehicleOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove vehicle");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management"
        subtitle="Register, assign, and monitor all vehicles and fuel sensors"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setRegisterVehicleOpen(true)} disabled={bootstrapping}>
            <Plus className="size-4" /> Register Vehicle
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
            { label: "Total Vehicles", value: vehicles.length, icon: Truck, color: "text-primary" },
            { label: "With Sensor", value: vehicles.filter(v=>!!v.sensor).length, icon: Fuel, color: "text-success" },
            { label: "Without Sensor", value: vehicles.filter(v=>!v.sensor).length, icon: Wrench, color: "text-warning" },
            { label: "Low Fuel", value: vehicles.filter(v=>v.fuelLevel < 20).length, icon: WifiOff, color: "text-destructive" },
          ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <s.icon className={cn("size-5", s.color)} />
            <div>
              <div className="text-xl font-semibold font-display font-numeric">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Vehicle Registry"
          subtitle={`${filtered.length} vehicles`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="h-8 pl-8 pr-3 text-xs rounded-lg bg-muted/60 border border-transparent focus:border-ring outline-none w-40"
                />
              </div>
              <select value={fleet} onChange={(e) => setFleet(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-muted/60 border border-transparent focus:border-ring outline-none">
                {fleetOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-muted/60 border border-transparent focus:border-ring outline-none">
                {vehicleTypeOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Fleet</th>
                <th className="text-left px-5 py-3 font-medium">Fuel Level</th>
                <th className="text-left px-5 py-3 font-medium">Sensor</th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{v.make} {v.model}</div>
                    <div className="text-xs text-muted-foreground font-mono">{v.plate} · {v.year}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium text-muted-foreground">{v.type}</td>
                  <td className="px-5 py-3.5 text-sm">{v.fleet}</td>
                  <td className="px-5 py-3.5 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", fuelColor(v.fuelLevel))}
                          style={{ width: `${v.fuelLevel}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right font-numeric">{v.fuelLevel}%</span>
                    </div>
                    {v.fuelLevel < 20 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-destructive">
                        <AlertTriangle className="size-3" /> Low fuel
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">
                    {v.sensor ? (
                      <span className="text-success">{v.sensor}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="border-t border-border bg-muted/30 px-5 py-4 animate-slide-up">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{selected.make} {selected.model} <span className="font-mono text-sm text-muted-foreground">{selected.plate}</span></h4>
                <p className="text-xs text-muted-foreground mt-0.5">Vehicle ID: {selected.id} · Year: {selected.year} · Type: {selected.type}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground mb-0.5">Fleet</div>{selected.fleet}</div>
              <div><div className="text-xs text-muted-foreground mb-0.5">Fuel Level</div>{selected.fuelLevel}%</div>
              <div><div className="text-xs text-muted-foreground mb-0.5">Fuel Sensor</div>{selected.sensor || "Not assigned"}</div>
              
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => {
                  setUpdateForm({ fleet: selected.fleet, type: selected.type });
                  setUpdateDetailsOpen(true);
                }}
              >
                Assign Vehicle to Fleet
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => setAssignSensorOpen(true)}
              >
                Assign Sensor
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs text-destructive hover:text-destructive"
                onClick={() => setRemoveVehicleOpen(true)}
              >
                Remove from Fleet
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Register Vehicle Dialog */}
      <Dialog open={registerVehicleOpen} onOpenChange={setRegisterVehicleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to the fleet management system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">License Plate *</label>
              <input
                value={newVehicle.plate}
                onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                placeholder="e.g., KAZ 421B"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Make *</label>
                <input
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                  placeholder="e.g., Toyota"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Model *</label>
                <input
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  placeholder="e.g., HiAce"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Year *</label>
                <input
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                  placeholder="2023"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select type</option>
                  <option value="TRUCK">Truck</option>
                  <option value="SUV">SUV</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Assign to Fleet</label>
              <select
                value={newVehicle.fleet}
                onChange={(e) => setNewVehicle({...newVehicle, fleet: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select fleet</option>
                {fleetOptions.filter((item) => item !== "All Fleets").map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterVehicleOpen(false)}>Cancel</Button>
            <Button onClick={handleRegisterVehicle}>Register Vehicle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Details Dialog */}
      <Dialog open={updateDetailsOpen} onOpenChange={setUpdateDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Vehicle Details</DialogTitle>
            <DialogDescription>
              Update {selected?.plate} - {selected?.make} {selected?.model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm font-medium">{selected?.plate}</div>
              <div className="text-xs text-muted-foreground">{selected?.make} {selected?.model} ({selected?.year})</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fleet Assignment *</label>
              <select
                value={updateForm.fleet}
                onChange={(e) => setUpdateForm({...updateForm, fleet: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select fleet</option>
                {fleetOptions.filter((item) => item !== "All Fleets").map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
              <select
                value={updateForm.type}
                onChange={(e) => setUpdateForm({...updateForm, type: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="TRUCK">Truck</option>
                <option value="SUV">SUV</option>
                <option value="SEDAN">Sedan</option>
                <option value="MOTORCYCLE">Motorcycle</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDetailsOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateDetails}>Assign Vehicle to Fleet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Sensor Dialog */}
      <Dialog open={assignSensorOpen} onOpenChange={setAssignSensorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Fuel Sensor</DialogTitle>
            <DialogDescription>
              Assign a fuel sensor to {selected?.plate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm font-medium">{selected?.plate}</div>
              <div className="text-xs text-muted-foreground">{selected?.make} {selected?.model}</div>
              {selected?.sensor && (
                <div className="text-xs text-success mt-1">Current sensor: {selected.sensor}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sensor ID *</label>
              <input
                value={sensorForm.sensorId}
                onChange={(e) => setSensorForm({...sensorForm, sensorId: e.target.value})}
                placeholder="e.g., FS-AA1"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-2">Sensor IDs follow the format: FS-XXX (where X is alphanumeric)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignSensorOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignSensor}>Assign Sensor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Vehicle Alert Dialog */}
      <AlertDialog open={removeVehicleOpen} onOpenChange={setRemoveVehicleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Remove Vehicle from Fleet?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selected?.plate}</strong> ({selected?.make} {selected?.model}) from <strong>{selected?.fleet}</strong>?
              <br />
              <br />
              This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove the vehicle from active tracking</li>
                <li>Deassign the fuel sensor if present</li>
                <li>Archive the vehicle's fuel records</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveVehicle}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
