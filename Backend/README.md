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

## Start Locally

```bash
cd Backend
npm run start:dev
```

The local BFast runtime starts on port `3003`.

Useful runtime endpoints:

```bash
curl http://localhost:3003/functions-health
curl "http://localhost:3003/functions-all?format=json"
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

## Current Persistence

The infrastructure layer uses in-memory repositories that simulate the future PostgreSQL implementation. Data is reset when the Node process restarts.

The intended replacement point for PostgreSQL is:

```text
VehicleAndFleetTelemetryModule/Infrastructure/repositories/
```

Keep application services depending on repository interfaces/behavior so the persistence layer can be swapped without changing endpoint modules.
