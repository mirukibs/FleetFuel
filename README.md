# FleetFuel — Fleet Fuel Procurement OS (MVP)

FleetFuel is a **B2B web application** that centralizes fleet fuel management and procurement.  
It combines **fleet registration**, **supplier marketplace listings**, **procurement request → approval workflows**, and **reporting/export** into one interface.

This repository currently ships an **MVP/demo**: it uses **mock data + in-browser persistence** (LocalStorage) instead of a backend, so you can run it immediately and see the full UI/flows.

## What this project does

- **Fleet Management**
  - Register vehicles
  - Assign vehicles to fleets
  - Assign fuel sensors (simulated)
- **Supplier Marketplace**
  - Add suppliers and view supplier profiles
  - Request quotes (simulated)
- **Procurement**
  - Create procurement requests
  - Approve / reject requests
  - View full request details
- **Reports**
  - Schedule a report (simulated)
  - Filter reports
  - Export reports (CSV download)
- **Admin Panel**
  - Add managers
  - Create fleet groups
  - Remove fleets
- **Settings**
  - Theme toggle (dark/light)
  - Notification preferences (saved locally)

## Tech stack

- **React** + **Vite**
- **Tailwind CSS v4**
- **Radix UI** components
- **React Router**
- **Sonner** (toast notifications)

## Requirements (to run locally)

- **Node.js LTS** (recommended: Node 20+)
- **npm** (comes with Node)

## Install & run (Windows / PowerShell)

From the project folder:

```powershell
cd "c:\Users\hp\Pictures\HOTEL\FleetFuel"
npm install
npm run dev
```

Vite will print a URL like:

- `http://localhost:5173/` (or another port if taken)

Open it in your browser to view the output.

## Build & preview (optional)

```powershell
npm run build
npm run preview
```

## Data & persistence (important)

This MVP uses **LocalStorage** to simulate a real database:

- Vehicles: `fleetfuel.vehicles`
- Suppliers: `fleetfuel.suppliers`
- Procurement requests: `fleetfuel.procurement.requests`
- Reports: `fleetfuel.reports`
- Admin managers: `fleetfuel.admin.managers`
- Admin fleets: `fleetfuel.admin.fleets`
- Settings notification preferences: `fleetfuel.settings.notifications`

Storage helper:
- `src/lib/storage.js` (`useLocalStorageState`)

To reset the demo data:
- Clear site data in the browser devtools, or delete the keys above from LocalStorage.

## Project structure (high level)

- `src/pages/` — main screens (Fleet, Suppliers, Procurement, Reports, Admin, Settings, etc.)
- `src/componets/layout/` — App shell, Sidebar, Topbar
- `src/componets/ui/` — UI primitives (Radix wrappers)
- `src/componets/ui-kit/` — app-specific UI building blocks (KPI cards, sections)
- `src/lib/` — shared utilities (theme, storage, utils)

## Notes on the MVP scope

The business model references SaaS tiers, marketplace listing fees, commissions, and reporting access.  
In this repo, those are represented as **UI + simulated flows** (no payments, no real supplier billing, no hardware integrations).

## Common issues

- **Port already in use**
  - Vite automatically tries another port and prints the correct URL.

## Contributing

- Keep changes focused (small PRs are easier to review).
- Avoid backend/payment/ERP integrations in the MVP unless explicitly planned.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
