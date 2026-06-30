import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/componets/layout/AppShell";

// Pages
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Admin from "@/pages/Admin";
import Suppliers from "./pages/Suppliers";
import FleetCompanies from "./pages/FleetCompanies";
import Procurement from "@/pages/Procurement";

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
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<Fleet />} />
                <Route path="suppliers" element={<Suppliers />} />
          <Route path="fleet-companies" element={<FleetCompanies />} />
                <Route path="procurement" element={<Procurement />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
