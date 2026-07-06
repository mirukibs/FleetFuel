# Software Requirements Specification (SRS) - FleetFuel

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a comprehensive Software Requirements Specification (SRS) for the **FleetFuel** platform. This document outlines the functional and non-functional requirements, system architecture, and core business workflows bridging the gap between fleet management, real-time vehicle telemetry, and a specialized fuel procurement marketplace.

### 1.2 Scope
FleetFuel aims to solve the difficulty logistics companies face in monitoring real-time fuel consumption while providing an integrated mechanism to procure fuel from suppliers. The current Minimum Viable Product (MVP) scope includes:
- **In Scope:** 
  - Simulated fuel sensor telemetry integration to mock real-time vehicle fuel tracking.
  - A dual-sided marketplace facilitating interaction between Fleet Companies (buyers) and Fuel Suppliers (sellers).
  - An immutable, abstract financial ledger managing logical fuel balances (`liters`).
  - Strict single-tenant isolation separating data across different companies and suppliers.
- **Out of Scope:** 
  - Actual physical fuel sensor hardware integrations (IoT edge devices).
  - Fiat currency payment gateways and complex billing/invoicing systems.
  - Granular matrix-based authorization (e.g., custom roles within a single fleet company).

## 2. Overall Description

### 2.1 Product Perspective
FleetFuel is built as a full-stack web application. 
- The **Backend** is designed as a Modular Monolith adopting Domain-Driven Design (DDD) principles. It is built using Node.js and the `bfast` routing framework, employing in-memory databases for rapid prototyping.
- The **Frontend** is a React Single-Page Application (SPA) utilizing Vite, React Router, and a component library (e.g., shadcn/ui) to present distinct, role-based interfaces to end-users.

### 2.2 User Classes and Characteristics
- **Fleet Manager (Fleet Company):** Primary consumer. They need to monitor their fleet's vehicles, check fuel telemetry to prevent theft, and interact with the procurement marketplace to purchase fuel for their logical account.
- **Fuel Supplier:** Marketplace vendor. They need to manage their company profile, publish fuel offers (price, quantity, fuel type), and approve/reject procurement requests submitted by Fleet Companies.

### 2.3 Operating Environment
- **Backend:** Node.js runtime environments (v18+).
- **Frontend:** Modern Web Browsers (Chrome, Firefox, Safari, Edge).
- **Communication:** RESTful HTTP API over standard web ports.

## 3. System Architecture

The application adopts a **Modular Monolith** architecture, compartmentalized into four distinct bounded contexts:

1. **AuthenticationModule**: Handles identity, credentials, and role assignments.
2. **FuelProcurementModule**: Manages the core marketplace logic and transaction negotiations.
3. **FuelTransactionModule**: The immutable ledger maintaining mathematical balances.
4. **VehicleAndFleetTelemetryModule**: Handles the fleet hierarchy, vehicle profiles, and telemetry ingestion.

Each module adheres to a strict **Layered Architecture**:
- **Domain Layer**: Houses Entities (Aggregates), Value Objects, Enums, and Repository Interfaces. Completely isolated from external technologies.
- **Application Layer**: Contains Application Services that orchestrate Use Cases by fetching entities, calling their domain logic, and persisting the results.
- **Infrastructure Layer**: Implements the repositories (currently using simulated `inMemoryDatabase.mjs`).
- **Presentation Layer**: Exposes the logic to the Frontend via REST API Controllers.

## 4. Functional Requirements (System Features)

### FR1: Authentication & Authorization
- **FR1.1 Registration**: The system must allow users to register with an email, password, and designated role (`FLEET_COMPANY` or `FUEL_SUPPLIER`).
- **FR1.2 Auto-Mapping (Single-Tenant)**: Upon registration, the system must automatically map the user to the correct tenant ID (their specific company or supplier profile), hiding `affiliatedServiceId` from the frontend UI.
- **FR1.3 Login & Session**: The system must authenticate credentials using hashed passwords and grant session tokens.
- **FR1.4 Role Retrieval**: The frontend must be able to securely request the active session to dynamically render the correct UI (Fleet Dashboard vs. Supplier Dashboard).

### FR2: Vehicle & Fleet Telemetry
- **FR2.1 Fleet Management**: Fleet Managers must be able to create, list, and manage logical fleets.
- **FR2.2 Vehicle CRUD**: The system must allow the registration of vehicles (specifying Make, Model, Year, Type, and License Plate) and assigning them to fleets.
- **FR2.3 Sensor Mounting**: Vehicles must be able to have logical Fuel Sensors mounted to them via serial numbers.
- **FR2.4 Telemetry Simulation**: A simulation engine must be able to POST real-time fuel readings (liters and timestamps) to specific vehicles.
- **FR2.5 Live Dashboard**: The system must aggregate telemetry data to present a live fuel efficiency dashboard for a fleet.

### FR3: Fuel Procurement Marketplace
- **FR3.1 Supplier Profile**: Fuel Suppliers must be able to manage their organizational profiles.
- **FR3.2 Fuel Offers**: Fuel Suppliers must be able to publish and update Fuel Offers indicating Fuel Type, Quantity Available, and Price Per Liter.
- **FR3.3 Marketplace Viewing**: Fleet Managers must be able to view a global list of available Fuel Suppliers and compare their active Fuel Offers.
- **FR3.4 Procurement Lifecycle**: 
  - Fleet Managers must be able to submit a `ProcurementRequest` for a specific volume of fuel.
  - The request must enter a `PENDING` state.
  - Fuel Suppliers must be able to `APPROVE` or `REJECT` the request.
  - Upon approval, the request enters the `FULFILLED` state.

### FR4: Fuel Transactions (Ledger)
- **FR4.1 Fuel Accounts**: The system must automatically manage a logical `FuelAccount` for every Fleet Company to track abstract fuel volume.
- **FR4.2 Immutable Ledger**: Every change in fuel balance must be recorded as an immutable `FuelTransaction`.
- **FR4.3 Procurement Deposit**: When a `ProcurementRequest` is FULFILLED in the Procurement Module, the exact volume of fuel must be `DEPOSIT`ed into the Fleet Company's Fuel Account.
- **FR4.4 Refueling Withdrawal**: When a physical vehicle simulates a refueling event at a station, the system must execute a `WITHDRAWAL` transaction against the company's Fuel Account.
- **FR4.5 Non-Negative Balances**: The system must prevent withdrawals that would result in a negative fuel balance.

### FR5: Frontend Interfaces
- **FR5.1 Role-Based Routing**: The React application must conditionally route users based on their authenticated role. Fleet Companies cannot access Supplier interfaces, and vice versa.
- **FR5.2 Fleet Company Views**: Must include a unified Dashboard, Fleet Management view, and a Marketplace (Procurement) view to browse suppliers.
- **FR5.3 Fuel Supplier Views**: Must include a Supplier Dashboard to manage incoming procurement requests and update fuel offers.
- **FR5.4 UI Components**: Must utilize standardized, accessible UI components (buttons, dialogs, data tables, forms) for a cohesive user experience.

## 5. Non-Functional Requirements

### 5.1 Security
- **Single-Tenant Data Scoping**: Business logic in the Application Layer must rigidly enforce that Fleet Companies only retrieve their own fleets, vehicles, and procurement requests. Fuel Suppliers must only retrieve their own offers and requests.
- **Password Security**: Passwords must never be stored in plain text. A robust hashing algorithm must be utilized via the `PasswordHasher` infrastructure service.

### 5.2 Performance & Reliability
- **Low-Latency Ingestion**: The telemetry `POST` endpoints must be optimized to handle frequent, rapid simulation requests without bottlenecking the main event loop.
- **Stateless Controllers**: Presentation controllers must remain entirely stateless, pushing all side effects to the Application and Infrastructure layers.

### 5.3 Software Quality Attributes
- **Modularity**: Modules must not directly reference each other's databases or internal entities. Inter-module communication must happen through explicitly defined Application Services or shared infrastructure dependency injection (e.g., injecting the procurement repository into auth for auto-mapping).
- **Maintainability (DDD)**: Code must reflect ubiquitous language. Domain entities (e.g., `Vehicle`, `ProcurementRequest`, `FuelAccount`) must own their internal state and validation rules. Application Services act strictly as orchestrators.
- **Testability**: The architecture must support dependency injection, allowing repositories to be swapped with mocks to ensure high-speed, isolated unit and integration testing without database overhead. All 36+ backend endpoints must pass automated tests using Node's native test runner, and the frontend components must pass UI rendering tests.
