# FleetFuel

FleetFuel is a split workspace with a backend API and a Vite frontend. The frontend now consumes the backend telemetry and fleet endpoints directly instead of relying on static demo state.

## Repo Layout

- `Backend/` - BFast function server for the Vehicle and Fleet Telemetry module
- `Frontend/` - React + Vite application
- `Docs/` - supporting documentation

## Quick Start

Run the backend first, then the frontend.

### 1. Backend

```bash
cd Backend
npm ci
npm run start:dev
```

The backend listens on port `3003` by default.

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:3003` for API requests. If your backend runs elsewhere, set `VITE_API_URL` before starting the frontend.

## Useful Commands

Backend:

```bash
cd Backend
npm test
```

Frontend:

```bash
cd Frontend
npm run build
npm run preview
```

## Backend API Surface

The backend currently exposes endpoints for:

- creating managers and fleets
- registering, updating, assigning, and deleting vehicles
- assigning fuel sensors
- submitting simulated telemetry readings
- fetching a fleet dashboard snapshot

## Notes

- The frontend uses `Frontend/src/lib/client.js` as the API client.
- The frontend build and backend tests are the fastest way to verify the workspace after changes.
