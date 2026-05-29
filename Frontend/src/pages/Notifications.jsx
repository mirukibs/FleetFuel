import { Bell, AlertTriangle, CheckCircle, Info, Fuel, Truck, ShieldAlert } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { cn } from "@/lib/utils";

const notifications = [
  { id: 1, type: "alert",   icon: ShieldAlert,    title: "Fuel Theft Alert – KAZ 812D",            body: "Fuel level dropped 28% in 4 minutes without a logged transaction. Possible theft or sensor error.", time: "2 min ago",  unread: true },
  { id: 2, type: "warning", icon: AlertTriangle,  title: "Low Fuel Level – DAR 087C",               body: "Van 11 fuel level is at 12%. Schedule a fuel procurement request to avoid operational disruption.", time: "18 min ago", unread: true },
  { id: 3, type: "info",    icon: CheckCircle,    title: "Procurement PR-2026-003 Fulfilled",        body: "Oryx Energy has completed the 80L fuelling for Toyota LC – MOR 155F at Dodoma station.",           time: "1 hr ago",   unread: true },
  { id: 4, type: "info",    icon: Info,           title: "New Supplier Listed: Petrol Plus Logistics", body: "A new supplier in Dodoma has been added to the marketplace with competitive pricing at $1.38/L.", time: "3 hrs ago",  unread: false },
  { id: 5, type: "warning", icon: Truck,          title: "Vehicle DSM 901E Offline",                body: "Mitsubishi Canter has gone offline. Last recorded position: Mwanza depot. Sensor status unknown.",   time: "5 hrs ago",  unread: false },
  { id: 6, type: "success", icon: CheckCircle,    title: "Procurement PR-2026-001 Approved",        body: "Your request for 300L for Fleet Alpha via Total Energies has been approved by Amelia Cole.",          time: "Yesterday",  unread: false },
  { id: 7, type: "info",    icon: Fuel,           title: "Monthly Report Available",                body: "The May 2026 Fuel Consumption Summary is ready to export from the Reports section.",                 time: "Yesterday",  unread: false },
];

const typeStyle = {
  alert:   "border-l-4 border-l-destructive bg-destructive/5",
  warning: "border-l-4 border-l-warning bg-warning/5",
  success: "border-l-4 border-l-success bg-success/5",
  info:    "border-l-4 border-l-border bg-card",
};

const iconStyle = {
  alert:   "text-destructive",
  warning: "text-warning-foreground",
  success: "text-success",
  info:    "text-muted-foreground",
};

export default function Notifications() {
  const unread = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread alert${unread !== 1 ? "s" : ""} requiring attention`}
      />

      <Card>
        <CardHeader
          title="All Notifications"
          subtitle="System alerts, procurement updates, and operational events"
          action={
            <button className="text-xs text-primary hover:underline">Mark all as read</button>
          }
        />
        <div className="divide-y divide-border">
          {notifications.map(n => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/10",
                typeStyle[n.type]
              )}
            >
              <div className={cn("mt-0.5 shrink-0", iconStyle[n.type])}>
                <n.icon className="size-4.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {n.unread && <span className="size-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
              </div>

              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
