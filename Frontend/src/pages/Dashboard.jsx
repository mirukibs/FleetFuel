import { useState, useEffect } from "react";
import { Fuel, Truck, AlertTriangle, TrendingDown, Activity, Zap } from "lucide-react";
import { KpiCard } from "@/componets/ui-kit/KpiCard";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { StatusPill } from "@/componets/ui-kit/StatusPill";
import { Button } from "@/componets/ui/button";
import { cn } from "@/lib/utils";

const recentTransactions = [
  { id: "TXN-001", vehicle: "Truck 04 – KAZ 421B",    supplier: "Total Energies",  liters: 120, cost: "$186.00", status: "completed" },
  { id: "TXN-002", vehicle: "Van 11 – DAR 087C",      supplier: "Shell Tanzania",   liters: 80,  cost: "$124.00", status: "pending" },
  { id: "TXN-003", vehicle: "Bus 02 – TZN 330A",      supplier: "Oryx Energy",      liters: 200, cost: "$310.00", status: "fulfilled" },
  { id: "TXN-004", vehicle: "Pickup 07 – MOR 155F",   supplier: "Total Energies",   liters: 60,  cost: "$93.00",  status: "completed" },
  { id: "TXN-005", vehicle: "Truck 09 – KAZ 812D",    supplier: "BP Tanzania",      liters: 150, cost: "$232.50", status: "failed" },
];

// Simulated telemetry readings (mimics FuelSensorReading domain entity)
const telemetryVehicles = [
  { id: "VH-001", plate: "KAZ 421B", base: 78 },
  { id: "VH-003", plate: "TZN 330A", base: 92 },
  { id: "VH-007", plate: "ARU 204G", base: 66 },
  { id: "VH-008", plate: "MWA 448H", base: 41 },
];

export default function Dashboard() {
  const [readings, setReadings] = useState(
    telemetryVehicles.map(v => ({ ...v, level: v.base, alert: false }))
  );
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setReadings(prev => prev.map(v => {
        const delta = (Math.random() - 0.55) * 3;
        const newLevel = Math.max(0, Math.min(100, v.level + delta));
        const alert = newLevel < v.level - 10; // sudden drop = theft alert
        return { ...v, level: Math.round(newLevel * 10) / 10, alert };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [simulating]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Fleet fuel procurement overview · May 2026"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Fuel Used"    value="12,840 L" delta={-3.2}  icon={Fuel}         accent="primary" hint="This month" />
        <KpiCard label="Active Vehicles"    value="47"       delta={2.1}   icon={Truck}         accent="success" hint="Fleet size: 52" />
        <KpiCard label="Avg Cost / Litre"   value="$1.55"    delta={1.8}   icon={TrendingDown}  accent="warning" hint="USD, blended" />
        <KpiCard label="Pending Alerts"     value="3"        delta={-50}   icon={AlertTriangle} accent="accent"  hint="Requires action" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Transactions */}
        <Card className="xl:col-span-2">
          <CardHeader title="Recent Transactions" subtitle="Last 5 fuelling events across the fleet" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Supplier</th>
                  <th className="text-right px-5 py-3 font-medium">Litres</th>
                  <th className="text-right px-5 py-3 font-medium">Cost</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{tx.id}</td>
                    <td className="px-5 py-3.5 font-medium">{tx.vehicle}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{tx.supplier}</td>
                    <td className="px-5 py-3.5 text-right">{tx.liters} L</td>
                    <td className="px-5 py-3.5 text-right font-medium">{tx.cost}</td>
                    <td className="px-5 py-3.5"><StatusPill status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Real-time Telemetry Simulation (from use-case diagram) */}
        <Card>
          <CardHeader
            title="Telemetry Simulation"
            subtitle="Live fuel sensor readings"
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
            {readings.map(v => (
              <div key={v.id} className={cn(
                "rounded-xl p-3 border transition-all",
                v.alert ? "border-destructive bg-destructive/5" : "border-border bg-muted/30"
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium font-mono">{v.plate}</span>
                  <div className="flex items-center gap-1">
                    {v.alert && <Zap className="size-3 text-destructive" />}
                    <span className={cn("text-xs font-semibold", v.alert ? "text-destructive" : "text-foreground")}>
                      {v.level}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      v.alert ? "bg-destructive" : v.level > 60 ? "bg-success" : v.level > 25 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${v.level}%` }}
                  />
                </div>
                {v.alert && (
                  <div className="text-[10px] text-destructive mt-1 font-medium">⚠ Sudden drop — theft alert triggered</div>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {simulating ? "Simulating live sensor data…" : "Click Simulate to start sensor feed"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
