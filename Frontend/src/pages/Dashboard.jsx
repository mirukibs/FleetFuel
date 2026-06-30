import { useCallback, useEffect, useMemo, useState } from "react";
import { Fuel, Truck, AlertTriangle, TrendingDown, Activity, Zap } from "lucide-react";
import { KpiCard } from "@/componets/ui-kit/KpiCard";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { cn } from "@/lib/utils";
import { FleetFuelApi } from "@/lib/client";

export default function Dashboard() {
  const [fleets, setFleets] = useState([]);
  const [fleetId, setFleetId] = useState("");
  const [dashboard, setDashboard] = useState({
    fleetId: "",
    fleetName: "",
    vehicles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const fetchedFleets = await FleetFuelApi.fleets.list() || [];
        if (active) setFleets(fetchedFleets);
        
        const currentFleetId = fleetId || (fetchedFleets.length > 0 ? fetchedFleets[0].id : "");
        if (active && currentFleetId && !fleetId) setFleetId(currentFleetId);

        if (currentFleetId) {
          const data = await FleetFuelApi.fleets.getDashboard(currentFleetId);
          if (active) {
            setDashboard(data);
            setError("");
          }
        } else if (active) {
          setLoading(false);
          setDashboard({ fleetId: "", fleetName: "", vehicles: [] });
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();

    return () => { active = false; };
  }, [fleetId]);

  const fleetVehicles = useMemo(() => dashboard.vehicles ?? [], [dashboard.vehicles]);

  const metrics = useMemo(() => {
    const totalVehicles = fleetVehicles.length;
    const fuelLevels = fleetVehicles.map((vehicle) => Number(vehicle.currentFuelLevel ?? 0));
    const averageFuel = totalVehicles ? fuelLevels.reduce((sum, level) => sum + level, 0) / totalVehicles : 0;
    const lowFuelCount = fleetVehicles.filter((vehicle) => Number(vehicle.currentFuelLevel ?? 0) < 20).length;
    const sensorCount = fleetVehicles.filter((vehicle) => Boolean(vehicle.sensor)).length;
    const alertCount = fleetVehicles.filter((vehicle) => vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20).length;

    return { totalVehicles, averageFuel, lowFuelCount, sensorCount, alertCount };
  }, [fleetVehicles]);

  const refreshDashboard = useCallback(async () => {
    const data = await FleetFuelApi.fleets.getDashboard(fleetId);
    setDashboard(data);
    return data;
  }, [fleetId]);

  const handleSimulateReading = useCallback(async () => {
    const sourceVehicle = fleetVehicles.find((vehicle) => vehicle.currentFuelLevel != null) ?? fleetVehicles[0];
    if (!sourceVehicle) {
      setError("No vehicles are available for simulation in this fleet.");
      return;
    }

    const currentLevel = Number(sourceVehicle.currentFuelLevel ?? 0);
    const delta = (Math.random() - 0.55) * 8;
    const nextLevel = Math.max(0, Math.min(100, Math.round((currentLevel + delta) * 10) / 10));

    try {
      await FleetFuelApi.telemetry.submitReading({
        vehicleId: sourceVehicle.vehicleId,
        fuelLevel: nextLevel,
        timestamp: new Date().toISOString(),
      });
      await refreshDashboard();
      setSimulating(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit reading");
    }
  }, [fleetVehicles, refreshDashboard]);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      void handleSimulateReading();
    }, 1500);

    return () => clearInterval(interval);
    // The simulation intentionally runs against the latest dashboard snapshot.
  }, [simulating, handleSimulateReading]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Fleet telemetry overview · ${dashboard.fleetName || "Select a Fleet"}`}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={fleetId}
              onChange={(e) => setFleetId(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg bg-muted/60 border border-transparent focus:border-ring outline-none"
            >
              {fleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id}>
                  {fleet.name}
                </option>
              ))}
            </select>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => void handleSimulateReading()}>
              <Activity className="size-3" /> Simulate Reading
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Vehicles" value={loading ? "..." : metrics.totalVehicles} delta={0} icon={Truck} accent="success" hint="Telemetries in selected fleet" />
        <KpiCard label="Avg Fuel Level" value={loading ? "..." : `${metrics.averageFuel.toFixed(1)}%`} delta={metrics.averageFuel >= 50 ? 4.2 : -4.2} icon={Fuel} accent="primary" hint="Latest sensor readings" />
        <KpiCard label="Alerted Vehicles" value={loading ? "..." : metrics.alertCount} delta={metrics.lowFuelCount ? -metrics.lowFuelCount : 0} icon={AlertTriangle} accent="warning" hint={`${metrics.lowFuelCount} below threshold`} />
        <KpiCard label="Sensors Online" value={loading ? "..." : metrics.sensorCount} delta={0} icon={TrendingDown} accent="accent" hint="Vehicles with sensors" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Live Fleet Telemetry" subtitle="Latest readings returned by the backend dashboard endpoint" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-5 py-3 font-medium">Sensor</th>
                  <th className="text-left px-5 py-3 font-medium">Last Updated</th>
                  <th className="text-right px-5 py-3 font-medium">Fuel Level</th>
                  <th className="text-left px-5 py-3 font-medium">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fleetVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{vehicle.licensePlate}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {vehicle.sensor?.id ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {vehicle.lastUpdated ? new Date(vehicle.lastUpdated).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium">{vehicle.currentFuelLevel ?? 0}%</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20
                            ? "bg-destructive/10 text-destructive"
                            : "bg-success/10 text-success"
                        )}
                      >
                        {vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20 ? "Alert" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!fleetVehicles.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No telemetry available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Live Simulation"
            subtitle="Push a new reading to the selected fleet"
            action={
              <button
                onClick={() => setSimulating(s => !s)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all",
                  simulating
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                )}
              >
                <Activity className={cn("size-3", simulating && "animate-pulse")} />
                {simulating ? "Stop" : "Simulate"}
              </button>
            }
          />
          <div className="p-4 space-y-3">
            {fleetVehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className={cn(
                "rounded-xl p-3 border transition-all",
                vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20 ? "border-destructive bg-destructive/5" : "border-border bg-muted/30"
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium font-mono">{vehicle.licensePlate}</span>
                  <div className="flex items-center gap-1">
                    {(vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20) && <Zap className="size-3 text-destructive" />}
                    <span className={cn("text-xs font-semibold", vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20 ? "text-destructive" : "text-foreground")}>
                      {vehicle.currentFuelLevel ?? 0}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20
                        ? "bg-destructive"
                        : Number(vehicle.currentFuelLevel ?? 0) > 60
                          ? "bg-success"
                          : Number(vehicle.currentFuelLevel ?? 0) > 25
                            ? "bg-warning"
                            : "bg-destructive"
                    )}
                    style={{ width: `${vehicle.currentFuelLevel ?? 0}%` }}
                  />
                </div>
                {(vehicle.alertTriggered || Number(vehicle.currentFuelLevel ?? 0) < 20) && (
                  <div className="text-[10px] text-destructive mt-1 font-medium">⚠ Low fuel or sudden drop detected</div>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {simulating ? "Simulating live sensor data…" : "Click Simulate to push a backend reading"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
