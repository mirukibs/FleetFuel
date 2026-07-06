# FleetFuel Backend

This is the backend repository for the FleetFuel platform. It is built using Node.js and follows a modular, domain-driven design (DDD) layered architecture.

## Architecture Overview

The backend is built as a **Modular Monolith**. It is divided into four primary modules, each encapsulating its own domain logic:
1. **AuthenticationModule**: Manages user identity, registration, session handling, and role-based access.
2. **FuelProcurementModule**: Manages the marketplace interactions between Fleet Companies and Fuel Suppliers, including fuel offers and procurement requests.
3. **FuelTransactionModule**: The financial ledger that tracks fuel deposits (from procurement) and withdrawals (refueling simulations).
4. **VehicleAndFleetTelemetryModule**: Manages fleets, vehicles, sensors, and processes simulated real-time telemetry data.

Each module is internally structured into four layers:
- **Domain Layer**: Core business entities and rules.
- **Application Layer**: Orchestrates use cases and bridges the presentation with the domain.
- **Infrastructure Layer**: Data persistence and third-party integrations.
- **Presentation Layer**: Exposes REST API endpoints via `bfast`.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Setup and Installation

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

To start the backend server in development mode:

```bash
npm run start
```
*Note: The backend runs using the `bfast` framework, which automatically discovers and mounts endpoints from the respective presentation layers.*

## Running Tests

The backend utilizes Node.js's native test runner (`node --test`).

To execute the entire test suite across all modules:

```bash
npm test
```

## Documentation

Detailed architectural documentation, including PlantUML diagrams and layer explanations, can be found within the `README.md` files located in each module's directory:
- [Authentication Module Documentation](./AuthenticationModule/README.md)
- [Fuel Procurement Module Documentation](./FuelProcurementModule/README.md)
- [Fuel Transaction Module Documentation](./FuelTransactionModule/README.md)
- [Vehicle & Fleet Telemetry Module Documentation](./VehicleAndFleetTelemetryModule/README.md)
