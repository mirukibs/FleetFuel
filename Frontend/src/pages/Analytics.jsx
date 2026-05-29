import { BarChart3, TrendingUp, TrendingDown, Fuel, DollarSign } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { cn } from "@/lib/utils";

const monthlyData = [
  { month: "Dec", litres: 9800,  cost: 14798 },
  { month: "Jan", litres: 10200, cost: 15504 },
  { month: "Feb", litres: 9400,  cost: 14288 },
  { month: "Mar", litres: 11300, cost: 17176 },
  { month: "Apr", litres: 10800, cost: 16416 },
  { month: "May", litres: 12840, cost: 19501 },
];

const byFleet = [
  { fleet: "Fleet Alpha", litres: 5200, pct: 40, color: "bg-primary" },
  { fleet: "Fleet Beta",  litres: 4420, pct: 34, color: "bg-accent" },
  { fleet: "Fleet Gamma", litres: 3220, pct: 25, color: "bg-success" },
  { fleet: "Unassigned",  litres: 0,    pct: 1,  color: "bg-muted-foreground" },
];

const bySupplier = [
  { name: "Total Energies", txns: 47, litres: 6100, spend: "$9,028" },
  { name: "Shell Tanzania",  txns: 31, litres: 3900, spend: "$5,928" },
  { name: "Oryx Energy",     txns: 22, litres: 2840, spend: "$4,090" },
];

const maxLitres = Math.max(...monthlyData.map(d => d.litres));

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Fuel consumption trends, cost analysis, and fleet efficiency dashboard"
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Total Litres (6mo)", value: "64,340 L", icon: Fuel, trend: +8.2 },
          { label: "Total Spend (6mo)",  value: "$97,683",  icon: DollarSign, trend: +6.1 },
          { label: "Avg $/Litre",        value: "$1.52",    icon: TrendingUp, trend: -1.3 },
          { label: "MoM Growth",         value: "+18.9%",   icon: BarChart3, trend: +18.9 },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</span>
              <k.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="font-display text-2xl font-semibold font-numeric">{k.value}</div>
            <div className={cn("text-xs mt-1 font-medium font-numeric", k.trend > 0 ? "text-success" : "text-destructive")}>
              {k.trend > 0 ? "↑" : "↓"} {Math.abs(k.trend)}% vs prev period
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart – monthly litres */}
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Fuel Consumption" subtitle="Litres dispensed across all fleets" />
          <div className="p-5">
            <div className="flex items-end gap-3 h-40">
              {monthlyData.map(d => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{(d.litres/1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-all"
                    style={{ height: `${(d.litres / maxLitres) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Donut – by fleet */}
        <Card>
          <CardHeader title="Consumption by Fleet" subtitle="May 2026 share" />
          <div className="p-5 space-y-3">
            {byFleet.map(f => (
              <div key={f.fleet}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{f.fleet}</span>
                  <span className="text-muted-foreground text-xs">{f.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", f.color)} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              Total: 12,840 L dispensed in May
            </div>
          </div>
        </Card>
      </div>

      {/* Supplier breakdown */}
      <Card>
        <CardHeader title="Top Suppliers by Volume" subtitle="Ranked by litres procured this month" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Supplier</th>
                <th className="text-right px-5 py-3 font-medium">Transactions</th>
                <th className="text-right px-5 py-3 font-medium">Litres</th>
                <th className="text-right px-5 py-3 font-medium">Total Spend</th>
                <th className="text-left px-5 py-3 font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bySupplier.map(s => (
                <tr key={s.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{s.txns}</td>
                  <td className="px-5 py-3.5 text-right">{s.litres.toLocaleString()} L</td>
                  <td className="px-5 py-3.5 text-right font-medium">{s.spend}</td>
                  <td className="px-5 py-3.5 w-36">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(s.litres/12840)*100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
