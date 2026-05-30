# FleetFuel Backend

This backend runs the Vehicle and Fleet Telemetry module with `bfast-function`.

## Prerequisites

- Node.js 20 or newer
- npm

## Install

```bash
cd Backend
npm ci
```

Use `npm install` instead of `npm ci` only when intentionally updating dependencies.

## Run Locally

Development server with file watching:

```bash
cd Backend
npm run start:dev
```

Start the production-style local server without file watching:

```bash
cd Backend
npm start
```

The backend listens on port `3003` by default. Override it with `PORT`:

```bash
cd Backend
PORT=4000 npm start
```

## Frontend Integration

The frontend expects this backend at `http://localhost:3003` by default. If you run the backend on another port or host, set `VITE_API_URL` in the frontend before starting it.

## Entrypoint and Discovery

The backend entrypoint is `Backend/index.mjs`. It starts `bfast-function` with local functions enabled and points BFast at:

```text
bfastJsonPath: Backend/bfast.json
functionsDirPath: Backend/VehicleAndFleetTelemetryModule/Presentation
assets: Backend/Assets
```

`functionsDirPath` is the important setting for endpoint discovery. BFast recursively scans that Presentation folder and loads endpoint descriptors from each controller module, so endpoint files do not need to be re-exported from `Presentation/index.mjs`.

Useful runtime endpoints:

```bash
curl http://localhost:3003/functions-health
curl "http://localhost:3003/functions-all"
curl "http://localhost:3003/functions-all?format=json"
```

Expected discovered application endpoints include:

```text
POST   /api/managers
POST   /api/fleets
PUT    /api/fleets/:id/name
POST   /api/vehicles
PUT    /api/vehicles/:id
POST   /api/vehicles/:id/fleet
DELETE /api/vehicles/:id
POST   /api/vehicles/:id/fuel-sensor
POST   /api/telemetry/readings
GET    /api/fleets/:fleetId/dashboard
```

## Run Tests

```bash
cd Backend
npm test
```

The current test suite verifies:

- BFast discovers endpoint modules directly from the Presentation folder.
- Each endpoint lives in its own module file.
- The in-memory backend flow persists fleet managers, fleets, vehicles, sensors, telemetry readings, and dashboard output.

## BFast Config

`Backend/bfast.json` controls function discovery ignore rules:

```json
{
  "ignore": [
    "**/node_modules/**",
    "**/specs/**",
    "**/*.specs.js",
    "**/*.specs.mjs"
  ]
}
```

Keep tests and support files outside endpoint descriptor exports, or add explicit ignore rules here when needed.

## Current Persistence

The infrastructure layer uses in-memory repositories that simulate the future PostgreSQL implementation. Data is reset when the Node process restarts.

The intended replacement point for PostgreSQL is:

```text
VehicleAndFleetTelemetryModule/Infrastructure/repositories/
```

Keep application services depending on repository interfaces and behavior so the persistence layer can be swapped without changing endpoint modules.
