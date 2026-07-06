## The Infrastructure Layer

The **Infrastructure layer** handles the low-level details of data persistence for the Fuel Procurement module.

**Data Storage**
- `inMemoryDatabase.mjs`: Currently utilizes an in-memory data store structure to simulate database behavior, providing rapid prototyping and development without the overhead of spinning up a full database server.

**Repositories Implementations**
- Implements `FleetCompanyRepository`, `FuelSupplierRepository`, and `ProcurementRequestRepository` interfaces to perform in-memory persistence.

![alt text](Infrastructure.png)