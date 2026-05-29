import { Settings as SettingsIcon, Bell, Shield, Palette, Database } from "lucide-react";
import { PageHeader, Card, CardHeader } from "@/componets/ui-kit/Section";
import { Button } from "@/componets/ui/button";
import { useTheme } from "@/lib/theme";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorageState } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componets/ui/dialog";

function Toggle({ enabled, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${enabled ? "bg-primary" : "bg-muted"}`}
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
    >
      <div className={`absolute top-0.5 size-4.5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  );
}

export default function Settings() {
  const { theme, toggle } = useTheme();
  const [prefs, setPrefs] = useLocalStorageState("fleetfuel.settings.notifications", {
    fuelTheft: true,
    lowFuel: true,
    approvals: true,
    supplierUpdates: false,
    monthlyReport: true,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your FleetFuel workspace preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader title="Notification Preferences" subtitle="Choose what triggers an alert" />
            <div className="divide-y divide-border">
              {[
                { key: "fuelTheft", label: "Fuel Theft Alerts",      desc: "Alert when fuel drops anomalously fast" },
                { key: "lowFuel", label: "Low Fuel Warnings",       desc: "Alert when vehicle drops below 20%" },
                { key: "approvals", label: "Procurement Approvals",   desc: "Notify on request status changes" },
                { key: "supplierUpdates", label: "Supplier Updates",        desc: "New suppliers and price changes" },
                { key: "monthlyReport", label: "Monthly Report Ready",    desc: "Alert when reports are generated" },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium">{n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.desc}</div>
                  </div>
                  <Toggle
                    enabled={Boolean(prefs[n.key])}
                    onToggle={() => {
                      setPrefs((p) => ({ ...p, [n.key]: !p[n.key] }));
                      toast.message(`${n.label}: ${!prefs[n.key] ? "On" : "Off"}`);
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader title="Appearance" subtitle="Theme and display preferences" />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Dark Mode</div>
                  <div className="text-xs text-muted-foreground">Toggle between light and dark theme</div>
                </div>
                <div onClick={toggle} className="cursor-pointer">
                  <Toggle enabled={theme === "dark"} onToggle={toggle} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Profile" subtitle="Your account details" />
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-border">
                <div className="size-16 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xl font-bold">
                  AC
                </div>
                <div className="text-center">
                  <div className="font-semibold">Amelia Cole</div>
                  <div className="text-xs text-muted-foreground">Fleet Operations · Admin</div>
                </div>
              </div>
              {[
                { label: "Email",        value: "amelia@fleetfuel.co" },
                { label: "Organization", value: "FleetFuel Procurement OS" },
                { label: "Role",         value: "System Administrator" },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{f.label}</div>
                  <div className="text-sm font-medium">{f.value}</div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={() => setProfileOpen(true)}>
                Edit Profile
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Subscription" subtitle="Current plan details" />
            <div className="p-5">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 mb-3">
                <div className="font-semibold text-sm text-primary">Enterprise Plan</div>
                <div className="text-xs text-muted-foreground mt-0.5">Renews June 1, 2026</div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setPlanOpen(true)}>
                Manage Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>MVP: profile editing is simulated and stored locally.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground py-2">
            Profile editing will be connected to authentication in the next sprint. For now, this confirms the button flow.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Manage Plan</DialogTitle>
            <DialogDescription>SaaS tiers scale by fleet size, registered vehicles, and reporting access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="font-semibold">Enterprise</div>
              <div className="text-xs text-muted-foreground mt-1">
                Unlimited vehicles • Full reporting • Export & reconciliation
              </div>
            </div>
            <Button
              onClick={() => {
                toast.success("Plan update simulated (MVP)");
                setPlanOpen(false);
              }}
            >
              Confirm Plan Settings
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
