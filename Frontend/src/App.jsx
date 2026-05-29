import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/componets/layout/AppShell";

// Pages
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Suppliers from "@/pages/Suppliers";
import Procurement from "@/pages/Procurement";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import Notifications from "@/pages/Notifications";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/app/*"
          element={
            <AppShell>
              <Routes>
                <Route path="dashboard"     element={<Dashboard />} />
                <Route path="vehicles"      element={<Fleet />} />
                <Route path="suppliers"     element={<Suppliers />} />
                <Route path="procurement"   element={<Procurement />} />
                <Route path="analytics"     element={<Analytics />} />
                <Route path="reports"       element={<Reports />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="admin"         element={<Admin />} />
                <Route path="settings"      element={<Settings />} />
                <Route path="*"             element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
