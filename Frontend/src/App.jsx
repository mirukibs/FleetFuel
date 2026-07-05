import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AppShell } from "@/componets/layout/AppShell";
import { FleetFuelApi } from "@/lib/client";

// Pages
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Suppliers from "./pages/Suppliers";
import FleetCompanies from "./pages/FleetCompanies";
import Procurement from "@/pages/Procurement";

const AUTH_STORAGE_KEY = "fleetfuel.auth";

const roleRoutes = {
  fleet_company: ["dashboard", "vehicles", "fleet-companies", "procurement"],
  fuel_supplier: ["dashboard", "suppliers", "procurement"],
};

const defaultRouteByRole = {
  fleet_company: "dashboard",
  fuel_supplier: "dashboard",
};

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export default function App() {
  const [session, setSession] = useState(readStoredSession);
  const allowedRoutes = useMemo(() => roleRoutes[session?.user?.role] ?? [], [session]);
  const defaultRoute = defaultRouteByRole[session?.user?.role] ?? "dashboard";

  const handleAuthenticated = (nextSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const handleLogout = async () => {
    try {
      await FleetFuelApi.auth.logout();
    } catch {
      // Local sign-out should still complete if the session is already invalid.
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setSession(null);
    }
  };

  if (!session?.token || !session?.user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth onAuthenticated={handleAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/app/*"
          element={
            <AppShell user={session.user} onLogout={handleLogout}>
              <Routes>
                {allowedRoutes.includes("dashboard") && <Route path="dashboard" element={<Dashboard />} />}
                {allowedRoutes.includes("vehicles") && <Route path="vehicles" element={<Fleet />} />}
                {allowedRoutes.includes("suppliers") && <Route path="suppliers" element={<Suppliers />} />}
                {allowedRoutes.includes("fleet-companies") && <Route path="fleet-companies" element={<FleetCompanies />} />}
                {allowedRoutes.includes("procurement") && <Route path="procurement" element={<Procurement />} />}
                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
              </Routes>
            </AppShell>
          }
        />
        <Route path="/login" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
