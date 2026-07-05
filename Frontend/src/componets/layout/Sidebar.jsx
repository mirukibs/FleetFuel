import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Fuel, X, BarChart3, Settings, Store, ClipboardList, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { to: "/app/vehicles",      label: "Fleet",         icon: Truck },
  { to: "/app/suppliers",     label: "Suppliers",     icon: Store },
  { to: "/app/fleet-companies", label: "Fleet Companies", icon: Building2 },
  { to: "/app/procurement",   label: "Procurement",   icon: ClipboardList },
];

function NavItem({ item, onClose }) {
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon className={cn("size-4", isActive && "text-sidebar-primary")} />
            <span className="font-medium">{item.label}</span>
            {isActive && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
          </>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-elevated">
              <Fuel className="size-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">FleetFuel</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Procurement OS</div>
            </div>
          </NavLink>

          <button className="lg:hidden text-sidebar-foreground/70" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">Workspace</div>
            <ul className="space-y-1">
              {nav.map((item) => <NavItem key={item.to} item={item} onClose={onClose} />)}
            </ul>
          </div>

        </nav>

        {/* <div className="p-4 m-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
          <div className="text-xs font-semibold text-sidebar-accent-foreground">Enterprise plan</div>
          <div className="text-[11px] text-sidebar-foreground/65 mt-1">
            Unlimited vehicles and dedicated SLA.
          </div>
          <button className="mt-3 w-full text-xs font-medium py-1.5 rounded-md bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition">
            Manage plan
          </button>
        </div> */}
      </aside>
    </>
  );
}
