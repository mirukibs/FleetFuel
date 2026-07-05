# FleetFuel Frontend

This is the React + Vite frontend for FleetFuel. It consumes the backend API exposed from `Backend/`.

## Prerequisites

- Node.js 20 or newer
- npm

## Install

```bash
cd Frontend
npm install
```

## Run Locally

Start the Vite dev server:

```bash
cd Frontend
npm run dev
```

The app defaults to `http://localhost:3003` for API requests through `Frontend/src/lib/client.js`.

If your backend is running on a different host or port, set `VITE_API_URL` before starting the frontend:

```bash
cd Frontend
VITE_API_URL=http://localhost:4000 npm run dev
```

## Build and Preview

```bash
cd Frontend
npm run build
npm run preview
```

## Notes

- The frontend build uses Vite.
- The API client lives in `src/lib/client.js`.
- The app expects the backend telemetry and fleet endpoints to be available before you use the dashboard and fleet pages.
